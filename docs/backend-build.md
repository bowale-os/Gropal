# Gropal — Backend Build Plan & Claude Prompt

---

## Overview

Single FastAPI backend serving both the web and app frontend. All business logic lives here. Claude API calls, XP calculations, stage assignment, goal routing, risk scoring — none of this touches the frontend.

---

## Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | FastAPI | 0.111+ |
| Language | Python | 3.11 |
| ORM | SQLAlchemy | 2.x |
| Validation | Pydantic | v2 |
| Database (dev) | SQLite | — |
| Database (prod) | PostgreSQL | 15+ |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Server | Uvicorn | latest |
| Migrations | Alembic | post-hackathon |
| Deployment | Railway | — |

---

## Folder Structure

```
/backend
  main.py                    ← FastAPI app init, route registration, CORS
  database.py                ← SQLAlchemy engine, session, Base
  config.py                  ← env vars via python-dotenv
  seed.py                    ← seeds mock Marcus data on startup

  /routers
    onboarding.py            ← POST /onboarding
    users.py                 ← GET/PATCH /user
    goals.py                 ← GET/POST/PATCH /goals + /recalculate
    tap_check.py             ← POST /tap-check + /tap-check/resolve
    alternatives.py          ← POST /alternatives + /alternatives/select
    ask.py                   ← POST /ask
    habits.py                ← GET /habits + POST /complete
    limits.py                ← GET/POST/DELETE /limits
    squad.py                 ← GET /squad + POST /join + /create
    progression.py           ← GET /progression
    risks.py                 ← GET /risks

  /models
    user.py                  ← SQLAlchemy User model
    goal.py                  ← SQLAlchemy Goal model
    transaction.py           ← SQLAlchemy Transaction model
    habit.py                 ← SQLAlchemy Habit model
    limit.py                 ← SQLAlchemy SpendingLimit model
    squad.py                 ← SQLAlchemy Squad + SquadMember models
    xp_event.py              ← SQLAlchemy XPEvent model

  /services
    stage_service.py         ← stage assignment + upgrade logic
    xp_service.py            ← all XP calculations
    risk_service.py          ← risk scoring engine
    gps_service.py           ← goal routing + next move suggestion
    claude_service.py        ← all Claude API calls + fallbacks
    tap_check_service.py     ← intercept decision logic
    habit_service.py         ← habit assignment + streak logic

  /schemas
    requests.py              ← all Pydantic request models
    responses.py             ← all Pydantic response models

  /tests
    test_stage_service.py
    test_xp_service.py
    test_tap_check.py
    test_goal_service.py
    test_risk_service.py

  .env                       ← never commit this
  .env.example               ← commit this
  requirements.txt           ← exact pinned versions
  railway.json               ← Railway deployment config
```

---

## Environment Variables

```bash
# .env.example — commit this file, never .env

ANTHROPIC_API_KEY=           # get from console.anthropic.com
PLAID_CLIENT_ID=             # get from plaid.com dashboard
PLAID_SECRET=                # sandbox secret
DATABASE_URL=                # sqlite:///./gropal.db (dev)
                             # postgresql://... (prod)
SECRET_KEY=                  # random 32-char string
ENVIRONMENT=                 # development | production
CLAUDE_RATE_LIMIT_PER_HOUR=20
```

---

## Database Models

```python
# All models inherit from Base in database.py
# Every table has user_id indexed for fast lookups

# Key relationships:
# User → has many Goals
# User → has many Habits
# User → has many Transactions
# User → has many SpendingLimits
# User → has many XPEvents
# User → belongs to Squad (optional)
# Squad → has many SquadMembers
```

---

## Service Layer Rules

Every piece of business logic lives in `/services`. Routers only do three things: validate input, call a service, return the response.

```python
# CORRECT — thin router
@router.post("/tap-check")
async def tap_check(request: TapCheckRequest, db: Session = Depends(get_db)):
    result = tap_check_service.evaluate(request, db)
    return result

# WRONG — fat router with logic inside
@router.post("/tap-check")
async def tap_check(request: TapCheckRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()
    limit = db.query(SpendingLimit).filter(...).first()
    if request.amount > limit.amount:  # ← this belongs in a service
        ...
```

---

## Claude Service — All AI Calls

```python
# /services/claude_service.py
# All Claude API calls live here. Never call Anthropic from a router.

import anthropic
from config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

FALLBACK_ASK = "I'm having trouble connecting right now. Try asking again in a moment."

def ask(user_profile: dict, message: str, history: list) -> str:
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=f"""You are Gropal, a personal financial advisor for young adults.
User profile: {user_profile}
Respond conversationally in plain language.
Always tie advice to their specific goals and numbers.
Never give generic tips.
Keep responses under 100 words unless a simulation is requested.""",
            messages=history + [{"role": "user", "content": message}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"Claude API error: {e}")
        return FALLBACK_ASK


def generate_alternatives(user_profile: dict, amount: float, category: str) -> list:
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system="""You generate financial alternatives as JSON only.
No preamble. No explanation. No markdown. Return only valid JSON.""",
            messages=[{
                "role": "user",
                "content": f"""User profile: {user_profile}
The user wants to spend ${amount} on {category}.
Generate exactly 3 alternatives as a JSON array.
Each object must have: id (A/B/C), label, description, goal_impact_months, monthly_cost, action, emoji.
Use their actual income, savings rate, and goal timelines. Real numbers only."""
            }]
        )
        import json
        text = response.content[0].text.strip()
        return json.loads(text)
    except Exception as e:
        print(f"Claude alternatives error: {e}")
        return get_fallback_alternatives(amount, category)


def assign_stage(financial_profile: dict) -> dict:
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system="""You assign financial stages as JSON only. No other text.""",
            messages=[{
                "role": "user",
                "content": f"""Given this financial profile: {financial_profile}
Assign a stage from: Income Initiate, Credit Builder, Stability Architect,
Wealth Foundation Builder, Independent Operator.
Return JSON: {{ stage, top_risk, risk_level, stress_test_summary, recommended_goal }}"""
            }]
        )
        import json
        return json.loads(response.content[0].text.strip())
    except Exception as e:
        print(f"Claude stage error: {e}")
        return get_fallback_stage(financial_profile)
```

---

## Rate Limiting

```python
# Simple in-memory rate limiter for Claude endpoints
# /services/rate_limiter.py

from collections import defaultdict
from datetime import datetime, timedelta

call_log = defaultdict(list)

def check_rate_limit(user_id: str, limit: int = 20) -> bool:
    now = datetime.now()
    hour_ago = now - timedelta(hours=1)
    call_log[user_id] = [t for t in call_log[user_id] if t > hour_ago]
    if len(call_log[user_id]) >= limit:
        return False
    call_log[user_id].append(now)
    return True
```

---

## Seed Data

```python
# seed.py — runs on startup in development
# Seeds Marcus as the demo user so every screen has data immediately

def seed_marcus(db: Session):
    existing = db.query(User).filter(User.id == "user_marcus_001").first()
    if existing:
        return  # already seeded

    marcus = User(
        id="user_marcus_001",
        name="Marcus",
        age=23,
        income_monthly=3200,
        stage="Credit Builder",
        xp=340,
        streak_days=11,
        top_risk="high credit utilization",
        risk_overall="moderate"
    )
    db.add(marcus)

    goals = [
        Goal(id="goal_001", user_id="user_marcus_001", name="Move Out",
             type="move_out", target_amount=4000, current_amount=1240,
             monthly_contribution=200, status="on_track", priority=1),
        Goal(id="goal_002", user_id="user_marcus_001", name="Pay Off Credit Card",
             type="pay_off_debt", target_amount=1400, current_amount=560,
             monthly_contribution=160, status="behind", days_behind=14, priority=2)
    ]
    db.add_all(goals)
    db.commit()
```

---

## The Master Claude Prompt

Paste this at the start of every backend session.

```
You are building the FastAPI backend for Gropal — a financial OS for
18–25 year olds. The frontend (Next.js web + React Native app) is already
built and consuming these endpoints.

---

STACK (locked, no deviations):
- FastAPI 0.111+
- Python 3.11
- SQLAlchemy 2.x (ORM only — no raw SQL ever)
- Pydantic v2 (all request/response validation)
- SQLite for dev, PostgreSQL for prod
- Anthropic Claude API (claude-sonnet-4-20250514)
- Uvicorn server

---

FOLDER STRUCTURE (already established — place files here exactly):
/routers     ← thin route handlers only, no business logic
/models      ← SQLAlchemy table definitions
/services    ← all business logic, XP calc, stage assignment, Claude calls
/schemas     ← Pydantic request + response models
/tests       ← pytest test files

---

RULES (never break these):
- No raw SQL — SQLAlchemy ORM only
- No business logic in routers — services only
- No Claude API calls from routers — claude_service.py only
- All Claude calls have try/except with fallback responses
- Squad endpoints never serialize balance, income, or debt amounts
- Every endpoint validates input with Pydantic before touching the DB
- Rate limit: 20 Claude calls per user per hour
- All errors return: { error, message, field, code }

---

STAGE LOGIC (use exactly):
Income Initiate → Credit Builder: XP ≥ 500, utilization < 60%, 1+ goal set
Credit Builder → Stability Architect: XP ≥ 1500, utilization < 30%, no critical risks
Stability Architect → Wealth Foundation Builder: XP ≥ 3500, emergency fund ≥ 2 months
Wealth Foundation Builder → Independent Operator: XP ≥ 7000, emergency fund ≥ 4 months

---

XP RULES (use exactly):
Habit complete: 10 XP
Tap Check pause: 25 XP
Tap Check adjust: 20 XP
Smart Alternative chosen: 50 XP
Goal contribution: 20 XP
Behind goal back on track: 40 XP
Goal completed: 500 XP
Risk factor drops a level: 50–100 XP
7-day streak bonus: 50 XP
14-day streak bonus: 100 XP

---

TAP CHECK INTERCEPT RULES:
Intercept if: over category limit OR over overall limit OR amount > $200 OR goal impact > 3 days
Do NOT intercept if: within all limits AND goal impact 0–2 days AND amount < $30
Always show alternatives if: amount > $500

---

MOCK USER (Marcus — already seeded in DB):
{
  "id": "user_marcus_001",
  "name": "Marcus",
  "age": 23,
  "income_monthly": 3200,
  "stage": "Credit Builder",
  "xp": 340,
  "top_risk": "high credit utilization",
  "goals": [
    { "id": "goal_001", "name": "Move Out", "target": 4000, "current": 1240, "status": "on_track" },
    { "id": "goal_002", "name": "Pay Off Credit Card", "target": 1400, "current": 560, "status": "behind" }
  ]
}

---

TASK:
[PASTE YOUR SPECIFIC PHASE TASK HERE]

Output: complete working code for every file needed.
No placeholders. No "# implement this later".
Every endpoint tested against Marcus's mock data.
```

---

## Phase-Specific Task Inserts

---

**Phase 1 — Project Setup**
```
Set up the FastAPI project from scratch.

Create:
- main.py: FastAPI app, CORS middleware (allow all origins for dev),
  register all routers, run seed.py on startup in development
- database.py: SQLAlchemy engine from DATABASE_URL env var,
  SessionLocal, Base, get_db dependency
- config.py: load all env vars with python-dotenv, expose as
  settings object with type annotations
- requirements.txt: pin exact versions for all approved packages
- .env.example: all required env vars with comments
- railway.json: Railway deployment config

Return a working app where GET / returns:
{ "status": "ok", "app": "Gropal", "version": "1.0.0" }
```

---

**Phase 2 — Models**
```
Build all SQLAlchemy models in /models.

Create one file per model:
- user.py: User (id, name, age, income_monthly, income_frequency,
  stage, xp, streak_days, top_risk, risk_overall, squad_id, created_at)
- goal.py: Goal (id, user_id, name, type, target_amount, current_amount,
  monthly_contribution, deadline, status, days_behind, priority, created_at)
- transaction.py: Transaction (id, user_id, amount, merchant, category,
  timestamp, was_intercepted, interception_result, goal_impact_days, xp_earned)
- habit.py: Habit (id, user_id, name, description, frequency,
  duration_seconds, category, stage_required, xp_reward, streak,
  last_completed, is_active)
- limit.py: SpendingLimit (id, user_id, category, amount, period,
  spent_this_period, goal_linked, created_at)
- xp_event.py: XPEvent (id, user_id, amount, reason, type, timestamp, goal_id)
- squad.py: Squad (id, name, weekly_xp) + SquadMember (squad_id, user_id,
  display_name, stage, streak_days, weekly_xp, recent_achievement)

Index user_id on every table that has it.
Create all tables in main.py on startup: Base.metadata.create_all(bind=engine)
```

---

**Phase 3 — Onboarding Endpoint**
```
Build POST /onboarding in /routers/onboarding.py.

Request body: name, age, income_monthly, income_frequency, expenses (object),
debts (array), goals_input (array of goal type strings)

Logic (in /services/stage_service.py):
1. Calculate total monthly expenses
2. Calculate debt-to-income ratio
3. Calculate credit utilization for each credit card debt
4. Run stage assignment logic (rules in the master prompt above)
5. Identify top risk factor
6. Generate stress test summary via claude_service.assign_stage()
7. Create recommended first goal based on goals_input and financial profile
8. Create the User record in DB
9. Create initial Goal records
10. Assign default habits for the assigned stage
11. Seed initial XPEvent (0 XP, "onboarding_complete")

Response: user_id, assigned_stage, top_risk, risk_level, risks array,
recommended_goal, starting_xp, first_habits, stress_test_summary
```

---

**Phase 4 — Tap Check Endpoint**
```
Build POST /tap-check and POST /tap-check/resolve.

POST /tap-check logic (in /services/tap_check_service.py):
1. Load user from DB (with goals and limits)
2. Check if transaction exceeds any category limit
3. Check if transaction exceeds overall limit
4. Calculate goal impact in days using:
   days_delayed = round(amount / (top_goal.monthly_contribution / 30))
5. Apply intercept decision rules (in master prompt)
6. Build and return TapCheckResponse

POST /tap-check/resolve:
1. Log the Transaction to DB
2. If decision == "paused": award 25 XP via xp_service
3. If decision == "adjusted": award 20 XP
4. If decision == "proceeded": award 0 XP
5. Update goal impact (shift deadline if proceeded)
6. Check for stage upgrade
7. Return xp_earned, message, goal_impact_days
```

---

**Phase 5 — Smart Alternatives Endpoint**
```
Build POST /alternatives and POST /alternatives/select.

POST /alternatives:
1. Check rate limit for this user (20 Claude calls/hour)
2. Load full user profile from DB
3. Calculate original goal impact in months
4. Call claude_service.generate_alternatives(user_profile, amount, category)
5. Parse JSON response into Alternative objects
6. Always append Alternative D (Proceed Anyway) manually — never from Claude
7. Return AlternativesResponse

POST /alternatives/select:
1. Load user and goals from DB
2. Apply the selected alternative's effect to goal timelines
3. If alternative has monthly_cost: create a new SpendingLimit
4. Award 50 XP via xp_service
5. Call gps_service.recalculate_all_goals(user_id)
6. Return updated goals + xp_earned + message
```

---

**Phase 6 — Ask Gropal Endpoint**
```
Build POST /ask in /routers/ask.py.

Logic:
1. Check rate limit (20 Claude calls/hour per user)
2. Load full user profile from DB (user + goals + risks + habits + progression)
3. Serialize profile to dict (exclude sensitive squad member financial data)
4. Trim conversation history to last 10 messages to avoid token overflow
5. Call claude_service.ask(user_profile, message, trimmed_history)
6. Award 5 XP for engaging with AI
7. Parse response for any suggested actions (look for keywords:
   "contribute", "pay", "save", "set a limit") and return as action chips
8. Return response text + suggested_actions + xp_earned

Fallback: if Claude fails, return FALLBACK_ASK message.
Never let a Claude failure return a 500 to the client.
```

---

**Phase 7 — Goals & GPS Endpoints**
```
Build all goal endpoints in /routers/goals.py.

GET /goals/{user_id}:
1. Load all active goals for user
2. For each goal, call gps_service.build_route(goal, user)
   Route = array of monthly steps: { month, action, balance_after }
3. Call gps_service.get_suggested_next_move(goal, user)
4. Return goals array with route and suggested_next_move attached

POST /goals/{user_id}/recalculate:
Logic in gps_service.recalculate_all_goals(user_id):
1. Load all active goals sorted by priority
2. For each goal, recalculate monthly_contribution based on
   available income (income - expenses - other goal contributions)
3. Update projected completion dates
4. Identify conflicts (goals competing for same dollars)
5. Generate tradeoff summary
6. Save updated goals to DB
7. Return updated goals + rebalance_summary + tradeoffs

POST /goals/{user_id}:
1. Validate goal type, target_amount, deadline
2. Create Goal record
3. Trigger recalculate_all_goals to rebalance existing goals
4. Return new goal with route
```

---

**Phase 8 — Habits Endpoints**
```
Build habit endpoints in /routers/habits.py.

GET /habits/{user_id}:
1. Load active habits for user's current stage
2. Calculate which habits are due today based on frequency
3. Return habits + streak_days + streak_message

Logic for streak_message (in habit_service.py):
- streak < 7: "Keep going — {7 - streak} days to your first milestone"
- streak == 7: "7-day streak! Users who reach 14 are 3x more likely to hit their first goal"
- streak 8–13: "{streak} days straight. {14 - streak} days to the 14-day milestone"
- streak >= 14: "{streak}-day streak. You're in the top 20% of Gropal users"

POST /habits/{user_id}/{habit_id}/complete:
1. Load habit, verify it belongs to this user
2. Verify not already completed today (check last_completed date)
3. Update habit: streak + 1, last_completed = now
4. Award XP via xp_service (habit base XP)
5. Check streak milestones (7, 14, 30 days) → award bonus XP
6. Check for stage upgrade
7. Return xp_earned + streak_days + updated habit
```

---

**Phase 9 — Squad Endpoints**
```
Build squad endpoints in /routers/squad.py.

CRITICAL RULE: Never return balance, income, or debt amounts from
any squad endpoint. Enforce at the serializer level.

GET /squad/{squad_id}:
1. Load squad with all members
2. For each member, serialize ONLY:
   display_name, stage, streak_days, weekly_xp, recent_achievement
3. Calculate squad weekly XP total
4. Calculate percentile rank (mock: compare to hardcoded distribution)
5. Return Squad object

POST /squad/create:
1. Create Squad record
2. Add creator as first SquadMember
3. Generate 6-character join code (store on Squad)
4. Award 25 XP to creator
5. Return Squad with join_code

POST /squad/join:
1. Find Squad by join_code
2. Add user as SquadMember
3. Award 25 XP
4. Notify existing members (mock: just log it)
5. Return updated Squad
```

---

**Phase 10 — Tests**
```
Write all required tests in /tests.

test_stage_service.py:
- test_income_initiate_assigned_correctly: income=2000, utilization=75% → Income Initiate
- test_credit_builder_assigned_correctly: income=3200, utilization=70% → Credit Builder
- test_stage_upgrade_triggers_at_correct_xp: user at 499 XP → no upgrade, 500 XP → upgrade

test_xp_service.py:
- test_habit_complete_awards_correct_xp: complete habit → 10 XP
- test_tap_check_pause_awards_25_xp: pause decision → 25 XP
- test_goal_completion_awards_500_xp: goal marked complete → 500 XP

test_tap_check.py:
- test_intercept_fires_over_limit: amount puts user over category limit → intercept = True
- test_no_intercept_under_30_dollars: $25 purchase, no limits → intercept = False
- test_goal_impact_calculated_correctly: $200 purchase, $200/month contribution → 30 days impact
- test_alternatives_shown_over_500: $600 purchase → show_alternatives = True

Use fresh in-memory SQLite for each test.
Mock all Claude API calls — never hit the real API.
Mock all Plaid calls.
```