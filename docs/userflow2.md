
## 7. Daily Builds Flow

### Entry Point
User taps Builds tab from bottom navigation.

---

### 7.1 — Builds Screen Load
```
User sees:

Streak Section:
- 🔥 11 flame icon
- "11-day streak"
- "3 days from your 14-day milestone"
- Weekly dots: ●●●●●●○ (6 filled, 1 empty = today not yet done)

Today's Builds (2–3 cards):

Habit Card 1 — No-Spend Check-In:
- Category icon: 💰
- "No-Spend Check-In"
- "10 seconds · Daily"
- XP badge: "+10 XP"
- Complete button (unfilled circle)

Habit Card 2 — Bill Forecast:
- Category icon: 📋
- "Bill Forecast"
- "30 seconds · Due today"
- XP badge: "+15 XP"
- Complete button

Habit Card 3 — One Thing I Learned:
- Category icon: 💡
- Today's concept: "What is credit utilization and why does 30% matter?"
- "45 seconds · Daily"
- XP badge: "+8 XP"
- Complete button

Locked Section (below active habits):
- "Unlocks at Stability Architect:"
- Greyed out habit cards showing what's coming
```

---

### 7.2 — Complete a Habit
```
User taps complete button on "No-Spend Check-In"

For check-in type habits:
→ Quick prompt: "Was today a no-spend day?"
  [Yes ✓]  [No ✗]
→ Either answer counts as complete (honesty, not judgment)
→ Checkmark animates into circle
→ XP toast: "+10 XP"
→ Streak dot fills for today

For forecast type habits:
→ Expand to show upcoming bills:
  March 5: Netflix $16
  March 7: Phone $45
  March 10: Credit card minimum $35
→ "Got it" button → marked complete → +15 XP

For education type habits:
→ Expand to show concept card:
  "Credit utilization = balance ÷ limit.
   Yours is 70%. Above 30% starts hurting your score.
   Above 70% hurts it a lot. Paying $200 brings yours to 52%."
→ "Learned it" button → +8 XP
```

---

### 7.3 — All Habits Completed
```
User completes final habit for the day

Celebration animation:
- All habit cards show green checkmarks
- Streak counter increments: 11 → 12
- "All builds complete today 🎉"
- Total XP earned today: "+33 XP"

If streak milestone hit (7, 14, 30 days):
→ Full-screen milestone celebration
→ Bonus XP awarded
→ Squad notification sent: "Marcus hit a [X]-day streak 🔥"
→ New habits may unlock (if stage changed)
```

---

### 7.4 — Missed Day
```
User opens Builds the day after missing a check-in

Streak resets to 0

Notification tone: supportive, not punishing:
"Streak reset. It happens. Start a new one today — 
 users who restart within 24 hours build longer
 streaks than users who never miss."

[Start fresh today] → habits shown as normal
Yesterday's dots shown in grey (missed)
```

---

## 8. Squad Flow

### Entry Point
User taps Squad tab from bottom navigation.

---

### 8.1 — No Squad State
```
User sees:
- "Financial growth is faster with people you trust."
- Two cards:
  [Create a Squad] — start one with your name
  [Join a Squad] — enter a code from a friend
```

---

### 8.2 — Create a Squad
```
User taps "Create a Squad"
→ Input: Squad name
→ User confirms

Squad created:
- 6-character join code generated: "GRP-4X9"
- Share sheet opens: "Invite your friends"
  Copy link / iMessage / WhatsApp options

User returns to Squad screen:
- Squad feed shows only their activity for now
- "Waiting for friends to join" placeholder
- Join code shown at top: "Share GRP-4X9 to invite friends"

+25 XP for creating squad
```

---

### 8.3 — Join a Squad
```
User taps "Join a Squad"
→ Input: 6-character code
→ POST /squad/join fires

On success:
→ Squad feed loads with existing members
→ +25 XP
→ Squad notification to existing members:
  "Marcus joined the squad 👋"

On invalid code:
→ "That code doesn't match any squad. Check with your friend."
```

---

### 8.4 — Squad Feed
```
User sees scrollable feed:

Active Challenge Card:
"Emergency Fund Sprint 🏆"
"3 of 5 members on track · Ends Friday"
Progress bar: 60% filled

Member List:
Marcus (you) — Credit Builder · 🔥11 days · 85 XP this week
Amaya — Credit Builder · 🔥15 days · 110 XP · "15-day streak 🔥"
Jordan — Stability Architect · 🔥3 days · 60 XP · "Hit Stability Architect 🎯"
Dre — Income Initiate · 🔥7 days · 55 XP · "7-day streak 💪"
Taylor — Credit Builder · 🔥2 days · 30 XP

Weekly Squad Stats:
"340 XP earned this week · Top 20% of all squads"

NEVER SHOWN: balances, income, debt amounts, specific purchases
```

---

### 8.5 — Friend Levels Up
```
Jordan advances to Stability Architect

User sees push notification:
"Jordan just hit Stability Architect 🎯 — your squad is moving"

In squad feed:
New entry at top:
"Jordan hit Stability Architect 🎯 · Just now"

User taps entry:
→ "Stability Architect means Jordan has consistent income
   and is building their emergency fund. 160 XP to go
   until you're there too."
→ CTA: "See what unlocks at Stability Architect" 
→ Opens stage unlock preview
```

---

## 9. Stage Progression Flow

### Entry Point
User earns enough XP to trigger a stage upgrade.

---

### 9.1 — Stage Upgrade Detected
```
XP event pushes user over stage threshold

Regardless of which screen they're on:
→ Full-screen overlay interrupts
→ Confetti animation
→ "You've leveled up."
→ New stage name reveals with glow effect
→ "+[X] XP earned this month"

What unlocks reveals one by one:
- New feature 1 (e.g. Smart Alternatives)
- New habit assigned
- Insurance insight for this stage
- New goal type available (if applicable)

CTA: "See what's new"
→ Navigate to updated GPS + Builds with new content highlighted
```

---

### 9.2 — Stage Regression (Edge Case)
```
User's financial situation deteriorates significantly
(e.g. new high debt, lost income)

Gropal does NOT demote the stage.
Instead: risk level increases, top risk updates,
suggested moves shift toward the new risk.

Messaging stays constructive:
"Your credit utilization spiked this month.
 Your routes have been adjusted to address this first."

Never: "You've been demoted" or negative framing.
```

---

## 10. Spending Limits Flow

### Entry Point
User sets a limit from the Tap Check "Adjust" option, or from Settings.

---

### 10.1 — Set a Limit
```
SpendingLimitSetter modal opens

User sees:
- Category selector (pre-filled if from Tap Check)
- Current spending this period shown:
  "You've spent $140 on food delivery this week"
- Limit amount input
- Period selector: Daily / Weekly / Monthly
- Goal link shown: "This limit protects your Move-Out Goal"
- Preview: "At this limit, you'll have $X more toward your goal per month"

User sets limit → saves

Confirmation:
"Limit set. We'll catch you before you hit it."
+30 XP
```

---

### 10.2 — Limit Approaching (80% Spent)
```
User spends 80% of their food delivery weekly limit

Push notification:
"Heads up — you've used $120 of your $150 food limit this week.
 $30 remaining."

No modal, no friction — just awareness.
```

---

### 10.3 — Limit Hit
```
Next food delivery purchase triggers Tap Check:

"You're $10 from your self-set food limit this week.
 You set this limit to protect your Move-Out Goal.
 Override / Wait until Monday?"

Override: payment proceeds, limit technically exceeded,
logged as override. No XP.

Wait: modal dismisses. +15 XP for honoring the limit.
```

---

### 10.4 — Limit Resets
```
Every Monday at midnight: weekly limits reset
First day of month: monthly limits reset
Every day at midnight: daily limits reset

Silent reset — no notification
User sees fresh progress bar next time they open the app
```

---

## 11. Insurance Flow

### Entry Point
Insurance surfaces through existing flows — never as a standalone screen.

---

### 11.1 — Stress Test Insurance Flag
```
During onboarding stress test (Step 1.5):

ER Visit scenario fires:
"A single ER visit without health coverage costs $2,700+.
 That eliminates your emergency fund and pushes your
 Move-Out Goal back 5 months."
"Protection gap: HIGH"

Shown alongside other risk factors — not as a product pitch.
User sees insurance the same way they see credit utilization:
as a risk that affects their goals.
```

---

### 11.2 — Stage Unlock Insurance Insight
```
User advances to Stability Architect stage

Among the stage unlocks:
"You're building assets now. A $15/month renters policy
 protects everything you own — including outside your apartment.
 Without it, one theft sets your emergency fund back to zero."

30-second insight card, not a course.
[Learn more]  [Dismiss]

If user taps Learn more:
→ Shows: real cost vs perceived cost comparison
  "Most people think renters insurance costs $50+/month.
   Average actual cost: $14/month."
→ Action chip: [See how it fits my budget]
  → GPS simulation: adding $14/month, goal impact shown
```

---

### 11.3 — AI Insurance Question
```
User asks Gropal: "Do I need life insurance?"

Response uses their actual profile:
"At 23 with no dependents and no co-signed debt, life insurance
 isn't your top priority right now. But if someone co-signed
 your student loans, a $100K term policy runs about $10/month
 and protects them if something happens to you. Do you have
 any co-signed debt?"

Conversational, contextual, never a sales pitch.
```

---

### 11.4 — Smart Alternatives Insurance Inclusion
```
User is buying a $16,000 car

Alternative B includes insurance:
"Buy the $12,000 option. Use the $80/month savings to cover
 full auto + renters insurance. You're protected and your
 goal stays on track."

Insurance framed as part of a smarter financial decision —
not as an add-on.
```

---

## 12. Error & Edge Case Flows

---

### 12.1 — No Internet Connection
```
User opens app with no connection

Cached data shown (last known state)
Banner at top: "You're offline — showing last known data"
All API calls queued locally
Actions that require backend (habit complete, contributions):
→ "This will sync when you're back online"
→ Optimistic UI update immediately
→ Actual sync on reconnect
```

---

### 12.2 — Claude API Down
```
User sends message in Ask Gropal

Typing indicator shows for 6 seconds
No response arrives

Fallback shown:
"I'm having trouble connecting right now.
 Try again in a moment."
[Retry]

Retry button re-sends the same message
If still failing: "Still having issues. Try again later."
Chat history preserved — message not lost
```

---

### 12.3 — Goal Becomes Impossible
```
User's expenses increase, making goal mathematically unreachable
by original deadline

GPS detects: monthly surplus < required monthly contribution

Gropal sends notification:
"Your Move-Out Goal needs attention. With your current
 expenses, the December deadline isn't reachable.
 Want to adjust the timeline or find budget to free up?"

[Adjust Timeline]  [Find Budget]  [Ask Gropal]

Adjust Timeline: date picker, GPS recalculates
Find Budget: shows expense categories sorted by reduction potential
Ask Gropal: opens chat pre-filled with "Help me get Move-Out back on track"
```

---

### 12.4 — Two Goals Conflict
```
User adds a new goal that conflicts with existing one

Conflict detected during recalculate:
"Adding 'Save for Car' means your Move-Out Goal shifts
 from December to March. Here's the tradeoff:"

Visual: two timelines shown side by side
Before / After comparison

Options:
[Prioritize Move-Out] — car goal gets lower allocation
[Split evenly] — both delayed moderately
[Prioritize Car] — move-out delayed more
[Remove new goal] — go back

User choice saved as priority setting
GPS routes recalculated accordingly
```

---

### 12.5 — User Gets a Raise
```
User updates income in profile (or Plaid detects new deposit amount)

Gropal notification:
"Looks like your income changed. Want to update your routes?"
[Yes, recalculate]  [Not now]

On Yes:
→ POST /goals/recalculate with new income
→ Results shown:
  "Your raise adds $400/month. Move-Out Goal moves 3 months earlier.
   Investing goal now unlocked."
→ GPS updates with celebration animation
→ New suggested move: "Put $200 of your raise toward Move-Out
   and $200 toward your card. Both goals accelerate."
```

---

### 12.6 — First Paycheck Arrives
```
Plaid (or manual update) detects new income deposit

Gropal notification:
"Paycheck landed 💰 Here's your move."

Home screen shows priority action card:
"$60 to credit card now — this is the single biggest thing
 slowing your Move-Out Goal. Do it before anything else."

[Do this now]  [See why]

See why → explanation:
"Your credit utilization is at 70%. Paying $60 drops it to
 67% and earns 20 XP. More importantly, it builds the habit
 of paying yourself first."
```