# Gropal — Complete User Flow Documentation

---

## Flow Index

- [Onboarding Flow](#1-onboarding-flow)
- [Home Dashboard Flow](#2-home-dashboard-flow)
- [Payment Interception Flow](#3-payment-interception-flow)
- [Smart Alternatives Flow](#4-smart-alternatives-flow)
- [Financial GPS Flow](#5-financial-gps-flow)
- [Ask Gropal Flow](#6-ask-gropal-flow)
- [Daily Builds Flow](#7-daily-builds-flow)
- [Squad Flow](#8-squad-flow)
- [Stage Progression Flow](#9-stage-progression-flow)
- [Spending Limits Flow](#10-spending-limits-flow)
- [Insurance Flow](#11-insurance-flow)
- [Error & Edge Case Flows](#12-error--edge-case-flows)

---

## 1. Onboarding Flow

### Entry Point
User downloads app or visits web URL for the first time. No account exists.

---

### Step 1.1 — Welcome Screen
```
User sees:
- Gropal logo + tagline: "Your financial OS"
- Single CTA: "See how your money holds up"
- No sign-up form — just one button

User taps CTA
→ Navigate to Stress Test
```

---

### Step 1.2 — Stress Test: Income Input
```
User sees:
- Headline: "First — how much do you bring home?"
- Subtext: "After taxes. What actually hits your account."
- Monthly income input (number pad)
- Pay frequency selector: Weekly / Biweekly / Monthly
- Progress indicator: Step 1 of 3

Validation:
- Income must be > 0
- Income must be a number
- If user enters 0 → show: "Enter your actual take-home. This stays private."

User fills in income → taps Next
→ Navigate to Expenses Input
```

---

### Step 1.3 — Stress Test: Expenses Input
```
User sees:
- Headline: "What goes out every month?"
- Category sliders with preset values:
  Rent/Mortgage, Utilities, Groceries, Transport,
  Subscriptions, Food Delivery, Dining, Entertainment,
  Clothing, Other
- Each slider pre-filled with national average for that category
- Running total at bottom: "Total expenses: $X / month"
- Remaining income shown: "You keep: $Y / month"

User adjusts sliders → taps Next
→ Navigate to Debts Input
```

---

### Step 1.4 — Stress Test: Debts Input
```
User sees:
- Headline: "Any debt? Credit cards, loans, anything."
- "Add Debt" button
- Each debt card has:
  Name (e.g. "Chase Card")
  Type: Credit Card / Student Loan / Auto / Personal / Medical
  Balance ($)
  Credit Limit ($ — for credit cards only)
  Minimum Payment ($)
  Interest Rate (%)
- "Skip — I have no debt" option

User adds debts (or skips) → taps "Run My Stress Test"
→ API call: POST /onboarding
→ Show loading state: "Calculating your financial picture..."
→ Navigate to Stress Test Results
```

---

### Step 1.5 — Stress Test Results
```
User sees animated sequence (3 scenarios, one at a time):

Scenario 1 — ER Visit:
Red flash animation
"An unexpected ER visit costs $2,700 on average."
"Without coverage, that wipes your savings and pushes
 your goals back [X] months."
[pause 2 seconds]

Scenario 2 — Job Loss:
Orange flash animation
"If you lost your job today, your current savings
 cover [X] days of expenses."
[pause 2 seconds]

Scenario 3 — Credit Spike:
Yellow flash animation
"Your credit utilization is at [X]%.
 Above 70% actively hurts your credit score."
[pause 2 seconds]

Final reveal:
Overall risk badge: LOW / MODERATE / HIGH / CRITICAL
Top risk highlighted in red
"Here's where you actually stand."

CTA: "Set your first goal →"
→ Navigate to Goal Setter
```

---

### Step 1.6 — Goal Setter
```
User sees:
- Headline: "What's the one thing you're working toward?"
- Goal type cards (pick one):
  🏠 Move Out
  💳 Pay Off Debt
  🛡️ Build Emergency Fund
  🎯 Save for Something
  📈 Start Investing

User picks a goal type
→ Show goal details inputs:
  Target amount ($) — pre-filled with smart suggestion
  Deadline — date picker
  "How did we calculate this?" expandable explainer

User confirms → sees:
"To hit this by [date], you'd contribute $[X]/month.
 That's [Y]% of what you keep after expenses."

If Y > 30%: show warning: "That's aggressive. Want us to
 adjust the timeline?"
  → Yes: extend deadline by 3 months, recalculate
  → No: keep as is

CTA: "Let's go →"
→ API saves goal
→ Navigate to Stage Reveal
```

---

### Step 1.7 — Stage Reveal
```
User sees animated reveal sequence:

1. Dark screen → stage icon fades in with glow effect
2. Stage name appears: "Credit Builder"
3. Subtext: "You've got income and you're managing debt.
   Now it's about building the habits that compound."
4. Top risk badge slides in: "⚠️ High Credit Utilization"
5. First 3 habits appear as cards, staggered entrance:
   - No-Spend Check-In (10 sec daily)
   - Bill Forecast (30 sec, twice weekly)
   - One Thing I Learned (45 sec daily)
6. XP progress ring: 0 / 500 to next stage
7. CTA: "Your GPS is set. Let's move." 

User taps CTA
→ onboarding_complete flag set in local storage
→ Navigate to Home Dashboard
→ First-time tooltip overlay shown on Home
```

---

### Onboarding Edge Cases

```
User closes app mid-onboarding:
→ Progress saved locally
→ On reopen: "Pick up where you left off?" 
  Yes → resume at last step
  No → restart from beginning

User has no debt:
→ Skip debt step entirely
→ Stage assignment uses income + expenses only

User has no income yet:
→ Assign "Dependent Explorer" stage
→ Show: "Once you have income, your GPS will activate."
→ Limited feature set until income added

User enters unrealistic numbers (e.g. $50,000/month income):
→ No validation block — accept all inputs
→ Stage assignment handles edge cases

API failure during onboarding:
→ Show: "Having trouble connecting. Try again."
→ Retry button
→ Local data preserved — don't make user re-enter
```

---

## 2. Home Dashboard Flow

### Entry Point
User opens app. Onboarding complete. Lands on Home tab.

---

### 2.1 — First Open (Post-Onboarding)
```
User sees tooltip overlay:
- Tap Check explained: "We'll catch you before money leaves"
- GPS explained: "Your routes to every goal, live"
- Builds explained: "Daily habits that compound"
- Squad explained: "Do it with people you trust"

Overlay dismissed by tapping anywhere
→ Normal Home screen loads
```

---

### 2.2 — Normal Home Load
```
User sees (skeleton loaders while data fetches):

Top section:
- "Good morning, Marcus" (time-aware greeting)
- Today's date

Suggested Move Card (most prominent):
- Action: "Pay $200 toward your credit card today"
- Impact: "Gets Goal 2 back on schedule"
- XP reward badge: "+40 XP"
- "Do this now" button

Goal Summary (2 cards):
- Move Out: progress bar 31%, "On track ✓", "Dec 2025"
- Pay Off Card: progress bar 40%, "14 days behind ⚠️"

Recent XP Feed (last 3 events):
- "Habit completed +10 XP · 2h ago"
- "Tap Check paused +25 XP · Yesterday"
- "Goal contribution +20 XP · 2 days ago"

Streak Status:
- 🔥 11-day streak
- "3 days from your 14-day milestone"

Bottom: Tab navigation
```

---

### 2.3 — Suggested Move Interaction
```
User taps "Do this now" on suggested move card

If move type = goal contribution:
→ Open ContributionModal
→ Show goal name + current progress
→ Pre-fill suggested amount
→ User confirms → POST /goals/{userId}/recalculate
→ XP earned toast → goal card updates

If move type = habit:
→ Navigate to Builds tab, scroll to that habit

If move type = limit setting:
→ Open SpendingLimitSetter modal
```

---

### 2.4 — Weekly Pulse (Every Monday)
```
User opens app on Monday morning
→ Weekly pulse card appears at top of Home:

"Last week: 22 moves made, 18 pointed at goals.
 Your top risk dropped from high to moderate.
 Move-Out Goal is 3 weeks closer than projected."

User can dismiss or tap "See full breakdown"
→ Navigate to Progression detail sheet
```

---

## 3. Payment Interception Flow

### Entry Point
User initiates a payment via the simulated "Tap to Pay" button.

---

### 3.1 — Payment Initiated
```
User taps "Tap to Pay" floating button on Home
→ Show merchant/scenario selector:
  - DoorDash $30 (food delivery)
  - ZARA $120 (clothing)
  - CarMax $18,000 (transport)
  - Custom amount input

User selects scenario
→ POST /tap-check fires
→ Loading: brief spinner (< 300ms target)
```

---

### 3.2 — Tap Check: Within Budget
```
API returns: should_intercept = false

User sees brief confirmation toast (no modal):
"✓ Within budget. No goal impact."
Green flash on screen for 1.5 seconds
→ Payment proceeds
→ Transaction logged
→ No XP (no friction avoided)
```

---

### 3.3 — Tap Check: Over Limit
```
API returns: should_intercept = true, within_budget = false

TapCheck Modal slides up:

Header:
- Merchant icon + name: "DoorDash"
- Amount: "$30"
- Category badge: "Food Delivery"

Budget Status Bar:
- "Weekly food delivery limit: $150"
- Progress bar: filled to $140/$150 (93%)
- "You're $10 from your limit this week"
- Bar shown in amber

Goal Impact:
- "Move-Out Goal shifts back 2 days"
- Small calendar showing current vs new projected date

Three buttons:
[Pause — recommended]  [Proceed]  [Adjust]

User taps Pause:
→ Modal dismisses with spring animation
→ Toast: "Smart pause. +25 XP"
→ XP counter on Home updates
→ Streak check: did this maintain streak?
→ Transaction logged as "paused"

User taps Proceed:
→ If amount < $500: modal dismisses, payment goes through
  Transaction logged as "proceeded", 0 XP
→ If amount > $500: navigate to Smart Alternatives

User taps Adjust:
→ SpendingLimitSetter modal opens inline
→ User sets new limit or adjusts period
→ On save: return to Tap Check modal with updated context
→ +20 XP for adjusting
```

---

### 3.4 — Tap Check: Large Purchase (> $500)
```
API returns: show_alternatives = true

TapCheck Modal shows with additional warning:

Impact statement in red:
"⚠️ This pushes your Move-Out Goal back 8 months"

Buttons:
[See Smarter Options]  [Proceed Anyway]

User taps "See Smarter Options"
→ Navigate to Smart Alternatives screen

User taps "Proceed Anyway"
→ Confirmation dialog:
  "This will delay your Move-Out Goal to August 2026.
   Are you sure?"
  [Yes, proceed]  [No, go back]
→ If confirmed: log transaction, 0 XP
→ If cancelled: return to Tap Check modal
```

---

### 3.5 — Recurring Transaction Suppression
```
Same merchant + similar amount detected 3+ times:

Lighter intercept shown (banner, not full modal):
"DoorDash again — $32. Still within your weekly limit. ✓"

Banner auto-dismisses after 3 seconds
User can tap banner to see full Tap Check if desired
```

---

### 3.6 — Tap Check Auto-Dismiss
```
User sees Tap Check modal but takes no action for 8 seconds
→ Countdown shown on Proceed button: "Proceeding in 5..."
→ At 0: payment proceeds automatically
→ Transaction logged as "proceeded" (timeout)
→ No XP awarded
```

---

## 4. Smart Alternatives Flow

### Entry Point
Large purchase (> $500) flagged by Tap Check. User taps "See Smarter Options."

---

### 4.1 — Alternatives Screen Load
```
User sees loading state:
"Finding smarter paths to the same outcome..."
(< 5 second target for Claude response)

Screen loads:

Top section:
- Original purchase: "CarMax · $18,000"
- Impact statement: "This pushes Move-Out back 8 months"
  Shown in red with calendar visualization

Below: 3 Alternative Cards + 1 Proceed Card
```

---

### 4.2 — Alternative Cards
```
Each card shows:
- Emoji + label (e.g. "🅰️ Downgrade Option")
- Specific description with real numbers
- Goal impact badge: "3 months delay" (green if better than original)
- Monthly cost if applicable
- "Choose This Path" button

Card A — Downgrade Option:
"A $12,000 certified pre-owned vehicle meets the same need.
 Goal impact drops from 8 months to 3 months."
[Choose This Path]

Card B — Delay + Save Route:
"Save $400/month for 5 months, put 15% down.
 Your other goals stay on track. Monthly payment drops $120."
[Choose This Path]

Card C — Restructure Route:
"Pause investing for 4 months, redirect to car fund.
 Net delay on investment goal: 4 months. Car: no delay."
[Choose This Path]

Card D — Proceed Anyway (subdued styling):
"Full autonomy. Original purchase, original impact."
[Proceed Anyway]
```

---

### 4.3 — User Selects Alternative
```
User taps "Choose This Path" on Card B (Delay + Save):

→ POST /alternatives/select fires
→ Loading: "Updating your GPS routes..."

Confirmation screen:
- "Save Route Activated"
- What changed: "$400/month redirected to Car Fund for 5 months"
- New goal added: "Car Fund — $2,000 in 5 months"
- Goals that shifted: shown with before/after timelines
- XP earned: "+50 XP"

CTA: "See Updated GPS"
→ Navigate to GPS screen
→ GPS shows recalculated routes with Car Fund as new goal
```

---

### 4.4 — User Selects Proceed Anyway
```
User taps "Proceed Anyway"

Confirmation dialog:
"This will delay your Move-Out Goal to August 2026.
 Your top risk will increase to HIGH.
 You can always come back and adjust your routes."

[I understand, proceed]  [Go back]

If confirmed:
→ Transaction logged
→ Goals updated with impact applied
→ Navigate to GPS showing updated (delayed) routes
→ Risk badge updates to HIGH
→ 0 XP
→ Toast: "Routes updated to reflect this purchase."
```

---

### 4.5 — Claude API Failure During Alternatives
```
Claude fails to respond in time

User sees fallback alternatives (generic but functional):
Card A: "Consider a less expensive option in the same category"
Card B: "Save for 3–6 months before making this purchase"
Card C: "Adjust your goal timeline to accommodate this expense"

Small notice at bottom:
"These suggestions are general — your personalized options
 will be available in a moment."

Retry button shown
```

---

## 5. Financial GPS Flow

### Entry Point
User taps GPS tab from bottom navigation.

---

### 5.1 — GPS Screen Load
```
User sees:

Header:
- "Your Routes" title
- "Recalculate" button (top right)
- Last recalculated: "Updated 2 hours ago"

Goal Cards (stacked, scrollable):

Goal 1 — Move Out (expanded by default):
- Progress bar: 31% filled, green
- Status badge: "On Track ✓"
- Projected date: "December 2025"
- Days ahead: "3 weeks ahead of schedule"
- Suggested Next Move:
  "Contribute $200 this week → keeps you on track. +20 XP"
- Route Steps (collapsed by default):
  Month 1: "Contribute $200 → Balance: $1,440"
  Month 2: "Contribute $200 → Balance: $1,640"
  [Show all 9 months]

Goal 2 — Pay Off Credit Card:
- Progress bar: 40% filled, amber
- Status badge: "14 Days Behind ⚠️"
- Projected date: "October 2025 (was September)"
- Suggested Next Move:
  "Redirect $40 from discretionary this week → back on track. +40 XP"

Goal 3 — Start Investing (locked):
- Greyed out
- "Unlocks at Stability Architect stage"
- "You're 160 XP away"

[+ Add Goal] button at bottom
```

---

### 5.2 — Expand / Collapse Goal Card
```
User taps goal card header
→ Card expands with smooth height animation
→ Route steps visible
→ Suggested next move shown as action button

User taps route step
→ Explanation sheet slides up:
  "In Month 3, contributing $200 brings your total to $1,840.
   At this rate you'll hit your $4,000 target in December."
  [Close]
```

---

### 5.3 — Recalculate Routes
```
User taps "Recalculate" button

Loading state:
"Recalculating all routes..."
Progress indicator on each goal card

API response arrives:

If nothing changed:
→ "Routes are up to date. You're on track." toast

If something improved:
→ "Your raise added $400/month. Move-Out Goal moved 3 months earlier."
→ Goals update with animation (progress bars fill/adjust)

If conflict detected:
→ Tradeoff card appears:
  "Accelerating credit card payoff delays Move-Out by 6 weeks.
   Which matters more right now?"
  [Prioritize Credit Card]  [Prioritize Move-Out]
→ User choice saved as priority setting
→ Routes recalculated with new priority
```

---

### 5.4 — Add New Goal
```
User taps "+ Add Goal"
→ GoalSetter modal opens (same as onboarding step 1.6)

After goal created:
→ POST /goals fires
→ Recalculate all routes
→ If new goal conflicts with existing goals:
  Tradeoff card shown:
  "Adding this goal shifts your Move-Out deadline by 2 months.
   Still want to add it?"
  [Yes, add it]  [Adjust timeline]  [Cancel]

New goal card animates into GPS list
```

---

### 5.5 — Goal Completed
```
API detects goal.current_amount >= goal.target_amount

Full-screen celebration:
- Confetti animation
- "Move-Out Goal Complete! 🎉"
- XP earned: "+500 XP"
- Stage check: did this trigger a stage upgrade?

If stage upgrade triggered:
→ Navigate to Stage Reveal screen (new stage)

If no stage upgrade:
→ "What's next?" prompt
→ Shows 2 suggested next goals based on current stage
→ User picks one → GoalSetter opens pre-filled
→ Or dismisses and returns to GPS
```

---

## 6. Ask Gropal Flow

### Entry Point
User taps Ask tab from bottom navigation.

---

### 6.1 — First Open
```
User sees empty chat state:
- Gropal avatar (G logo)
- "Ask me anything about your money."
- 3 suggested prompt chips:
  "Can I afford this?"
  "How am I doing?"
  "Should I pay off debt or save?"
- Text input + mic button at bottom
```

---

### 6.2 — Text Query
```
User types: "Can I afford concert tickets this weekend?"
User taps Send

→ User message appears (right-aligned, purple)
→ Typing indicator appears immediately (3 animated dots)
→ POST /ask fires with full user profile as context

Response arrives (target < 4 seconds):
Gropal message appears (left-aligned, dark card):
"Based on your current cash flow, you have $340 left in
 discretionary this month. Tickets under $80 won't affect
 your Move-Out Goal. Over $80 shifts it back 3 days.
 What's the ticket price?"

User types: "$65"
→ Second response:
  "You're good. $65 keeps you within budget and your
   Move-Out Goal stays on track. Enjoy the show."
  
Action chip appears below response:
[Log this purchase] → taps → opens Tap Check simulation for $65
```

---

### 6.3 — Voice Query
```
User taps mic button
→ Mic activates (pulse animation)
→ User speaks: "How am I doing this month?"
→ Live transcript appears in input field as user speaks
→ User stops speaking → auto-send after 1.5s silence
→ OR user taps send manually

Same flow as text query from here
```

---

### 6.4 — Simulation Request
```
User asks: "What if I contribute $100 more per month to my credit card?"

Gropal response includes simulation:
"Nice move. Adding $100/month to your credit card:
 • Payoff date: July (was October) — 3 months earlier
 • Interest saved: ~$180
 • Move-Out Goal: unaffected
 • Credit utilization drops to 42% within 60 days"

Visualization card appears below text:
Before/After timeline showing both goals

Action chips:
[Apply this to my GPS]  [Show me how]

User taps "Apply this to my GPS":
→ POST /goals/{userId}/recalculate with updated contribution
→ Navigate to GPS showing updated routes
→ +20 XP
```

---

### 6.5 — Insurance Question
```
User asks: "How much does renters insurance actually cost?"

Gropal response:
"A lot less than most people think. For your area and
 a typical apartment, you're looking at $12–$18/month.
 That covers your laptop, phone, and everything you own —
 even if it's stolen outside your apartment.
 Without it, one theft sets your emergency fund back to zero."

Action chip: [See how it fits my budget]
→ Shows: "At $15/month, your Move-Out Goal shifts back 1 day.
  Your risk score drops from MODERATE to LOW."

Second action chip: [Find a plan]
→ Opens insurance partner link (future feature)
→ For now: shows average cost comparison
```

---

### 6.6 — Conversation History
```
Chat history persists for the session.
On app close and reopen: last 10 messages shown.
"Clear conversation" option in top right menu.

If history gets long (> 10 messages):
→ Older messages collapsed behind "Load earlier" button
→ Only last 10 sent to API (token management)
```

---
