# bowale-os/Gropal
## Product Requirements Document (PRD)

Gropal delivers a financial operating system embedded in payments, powered by
conversational AI, that intercepts spending decisions and dynamically routes
users toward goals.

---

## Overview

Gropal targets young adults building financial independence. It intercepts
payments via Apple Pay/Google Pay integrations, provides voice/text AI advice,
and offers a recalculating "Financial GPS" for goals. Core differentiator:
real-time decision support at the point of sale, not post-transaction tracking.

---

## Target Users

**Demographics:** Gen Z/young millennials (18–30), early-career professionals
in the Nashville/TN area — software engineers balancing university, fitness,
and projects.

**Pain points:** Impulsive spending derails goals (e.g., move-out, debt
payoff); apps feel passive; users need personalized, non-judgmental guidance.

**User journey:**
Stress-test onboarding → daily habits → payment checks → AI queries →
goal progress with social streaks

---

## Key Features

| Feature | Description | Priority |
|---|---|---|
| Payment Interception ("Tap Check") | Real-time notifications before purchase confirmation, showing goal impact/limits. Options: Proceed / Pause / Adjust. | High |
| Conversational AI ("Ask Gropal") | Natural language queries on affordability and simulations; factors in goals and risks. | High |
| Dynamic Goal Routing ("Financial GPS") | Optimized paths to goals; auto-recalculates on changes (e.g., new job). | High |
| Habit Engine ("Daily Builds") | Stage-based micro-habits (e.g., bill review); XP/streaks for engagement. | Medium |
| Smart Alternatives ("Better Yes") | For big spends, suggests downgrades/delays/restructures with real numbers. | High |
| Self-Set Limits ("Guardrails") | User-defined caps enforced at payment; override always available with context. | Medium |
| Social Progression ("Squad XP") | Groups share milestones/streaks (no balances); accountability without comparison. | Medium |
| Insurance Integration | Surfaces protection gaps in stress tests, AI responses, and stage unlocks. | Low |
| XP System / Stages / Risk Engine | Powers progression and risk tracking without exposing raw dashboards. | High |

---

## Technical Requirements

**Integrations**
- Plaid/Stripe for account linking
- Apple Pay/Google Pay APIs for payment interception (simulated for demo)

**AI**
- LLM (Claude) for conversations and simulations
- FastAPI backend for user data and Claude API calls

**Data**
- Secure storage — GDPR/CCPA compliant
- Anonymized social layer (no balances shared)

**Platforms**
- iOS, Android, web
- Hackathon demo: 6 screens via Expo Go

**Metrics**
- Retention (daily opens)
- Goal completion rate
- Override rates

---

## Non-Functional Requirements

| Requirement | Spec |
|---|---|
| Payment notification speed | < 2 seconds |
| AI response time | Real-time |
| Security | End-to-end encryption; no balance sharing |
| Voice input | Required |
| Dark mode | Required |

---

## MVP Scope

- Stress-test onboarding
- Tap Check simulation
- AI chat (Ask Gropal)
- Financial GPS view
- Daily Builds (habits)