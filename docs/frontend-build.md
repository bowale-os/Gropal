# Gropal — Frontend Build Plan & Claude Prompt

---

## Overview

Two frontends, one backend. The web frontend is for the hackathon demo (judges see this). The app frontend is the real product (React Native + Expo). Both consume the same FastAPI backend and share the same Zustand store logic where possible.

---

## Frontend Stack

| | Web | App |
|---|---|---|
| Framework | Next.js 14 | React Native + Expo SDK 51 |
| Language | TypeScript 5.x | TypeScript 5.x |
| Styling | Tailwind CSS | NativeWind 4.x |
| State | Zustand 4.x | Zustand 4.x |
| Navigation | Next.js App Router | Expo Router v3 |
| HTTP | Native fetch | Native fetch |
| Voice | Web Speech API | expo-speech-recognition |
| Animations | Framer Motion | react-native-reanimated |
| Deployment | Vercel | Expo Go (demo) / EAS (prod) |

---

## Folder Structure

```
/gropal
  /web                          ← Next.js app
    /app
      /onboarding
        page.tsx                ← StressTest + GoalSetter + StageReveal
      /dashboard
        page.tsx                ← Home
      /gps
        page.tsx                ← Financial GPS
      /ask
        page.tsx                ← AI Chat
      /builds
        page.tsx                ← Habits
      /squad
        page.tsx                ← Social
    /components
      GoalCard.tsx
      HabitCard.tsx
      TapCheckModal.tsx
      AlternativeCard.tsx
      ChatBubble.tsx
      XPBadge.tsx
      RiskBadge.tsx
      ProgressBar.tsx
      StageCard.tsx
    /store
      index.ts                  ← Zustand store (shared logic)
    /services
      api.ts                    ← all fetch calls to FastAPI
    /constants
      colors.ts
      stages.ts
      categories.ts

  /app                          ← React Native + Expo app
    /screens
      StressTest.tsx
      GoalSetter.tsx
      StageReveal.tsx
      Home.tsx
      GPS.tsx
      Ask.tsx
      Builds.tsx
      Squad.tsx
    /components                 ← same components, RN versions
      GoalCard.tsx
      HabitCard.tsx
      TapCheckModal.tsx
      AlternativeCard.tsx
      ChatBubble.tsx
      XPBadge.tsx
      RiskBadge.tsx
      ProgressBar.tsx
    /store
      index.ts                  ← same Zustand store
    /services
      api.ts                    ← same API calls
    /constants
      colors.ts
      stages.ts
      categories.ts
```

---

## Shared API Service

Both frontends use the same `api.ts` file with different base URLs. This is the single source of truth for all backend calls.

```typescript
// /services/api.ts
// Used by both web and app — change BASE_URL per environment

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {

  // Onboarding
  onboard: (data: OnboardingInput) =>
    fetch(`${BASE_URL}/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // User
  getUser: (userId: string) =>
    fetch(`${BASE_URL}/user/${userId}`).then(r => r.json()),

  // Goals
  getGoals: (userId: string) =>
    fetch(`${BASE_URL}/goals/${userId}`).then(r => r.json()),

  recalculateGoals: (userId: string) =>
    fetch(`${BASE_URL}/goals/${userId}/recalculate`, {
      method: "POST"
    }).then(r => r.json()),

  // Tap Check
  tapCheck: (data: TapCheckRequest) =>
    fetch(`${BASE_URL}/tap-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  tapCheckResolve: (data: TapCheckResolve) =>
    fetch(`${BASE_URL}/tap-check/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Smart Alternatives
  getAlternatives: (data: AlternativesRequest) =>
    fetch(`${BASE_URL}/alternatives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  selectAlternative: (data: AlternativeSelect) =>
    fetch(`${BASE_URL}/alternatives/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Ask Gropal
  ask: (userId: string, message: string, history: ChatMessage[]) =>
    fetch(`${BASE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message, conversation_history: history })
    }).then(r => r.json()),

  // Habits
  getHabits: (userId: string) =>
    fetch(`${BASE_URL}/habits/${userId}`).then(r => r.json()),

  completeHabit: (userId: string, habitId: string) =>
    fetch(`${BASE_URL}/habits/${userId}/${habitId}/complete`, {
      method: "POST"
    }).then(r => r.json()),

  // Squad
  getSquad: (squadId: string) =>
    fetch(`${BASE_URL}/squad/${squadId}`).then(r => r.json()),

  // Progression
  getProgression: (userId: string) =>
    fetch(`${BASE_URL}/progression/${userId}`).then(r => r.json()),
};
```

---

## Shared Zustand Store

```typescript
// /store/index.ts
// Identical in both web and app

import { create } from "zustand";

interface GropalStore {
  user: User | null;
  goals: Goal[];
  habits: Habit[];
  squad: Squad | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  activeModal: string | null;

  setUser: (user: User) => void;
  setGoals: (goals: Goal[]) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  setHabits: (habits: Habit[]) => void;
  completeHabit: (id: string) => void;
  setSquad: (squad: Squad) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setLoading: (val: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useGropalStore = create<GropalStore>((set) => ({
  user: null,
  goals: [],
  habits: [],
  squad: null,
  chatHistory: [],
  isLoading: false,
  activeModal: null,

  setUser: (user) => set({ user }),
  setGoals: (goals) => set({ goals }),
  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
  })),
  setHabits: (habits) => set({ habits }),
  completeHabit: (id) => set((state) => ({
    habits: state.habits.map(h =>
      h.id === id ? { ...h, streak: h.streak + 1, last_completed: new Date().toISOString() } : h
    )
  })),
  setSquad: (squad) => set({ squad }),
  addChatMessage: (msg) => set((state) => ({
    chatHistory: [...state.chatHistory, msg]
  })),
  clearChat: () => set({ chatHistory: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setActiveModal: (activeModal) => set({ activeModal }),
}));
```

---

## Build Phases

### Phase 1 — Web (Hackathon Demo)
Build the 6 demo screens as a Next.js web app. This is what judges see. Fast to build, easy to share via Vercel URL.

### Phase 2 — App (Real Product)
Port each screen to React Native. Same store, same API service, same logic — just different UI primitives (View instead of div, Text instead of p).

---

## The Master Claude Prompt

Paste this at the start of every frontend session. Drop in the phase task at the bottom.

```
You are building the frontend for Gropal — a financial OS for 18–25 year olds.

---

STACK (locked, no deviations):
- Web: Next.js 14, TypeScript, Tailwind CSS, Zustand, Framer Motion
- App: React Native + Expo SDK 51, TypeScript, NativeWind, Zustand, Reanimated
- HTTP: native fetch only (no Axios)
- No class components — hooks only
- No CSS-in-JS

---

BACKEND (already built, FastAPI on localhost:8000):
All endpoints are documented in the API contract. Use the shared api.ts
service for every call. Never call the backend directly from a component —
always go through api.ts.

---

USER PROFILE (mock data for all screens — use this to seed):
{
  "id": "user_marcus_001",
  "name": "Marcus",
  "age": 23,
  "progression": {
    "stage": "Credit Builder",
    "xp": 340,
    "xp_to_next": 160,
    "moves_this_month": 22,
    "moves_on_goal": 18
  },
  "risks": {
    "overall": "moderate",
    "top_risk": "high credit utilization"
  },
  "goals": [
    { "id": "goal_001", "name": "Move Out", "type": "move_out", "target_amount": 4000, "current_amount": 1240, "status": "on_track", "priority": 1 },
    { "id": "goal_002", "name": "Pay Off Credit Card", "type": "pay_off_debt", "target_amount": 1400, "current_amount": 560, "status": "behind", "days_behind": 14, "priority": 2 }
  ],
  "social": { "squad_id": "squad_001", "streak_days": 11 }
}

---

DESIGN RULES:
- Dark background: #0A0A0F
- Primary accent: #6C63FF (purple)
- Success: #22C55E (green)
- Warning: #F59E0B (amber)
- Danger: #EF4444 (red)
- Text primary: #F7F7F7
- Text muted: #9CA3AF
- Card background: #13131A
- Border: #1F1F2E
- Font: Inter (web), System font (app)
- Border radius: 16px on cards, 12px on buttons
- No sharp corners anywhere
- Every screen has a dark gradient background
- XP and stage feel like a game — use badges, glows, progress rings
- Never show raw numbers without context labels

---

COMPONENT RULES:
- Every component in its own file
- No component over 150 lines — extract sub-components
- No business logic in components — call api.ts, update Zustand, render result
- Every API call has a loading state and error state
- Use skeleton loaders, not spinners
- Framer Motion for all transitions (web) / Reanimated (app)

---

SHARED FILES (use these exactly, do not recreate):
- /store/index.ts — Zustand store (already defined)
- /services/api.ts — all API calls (already defined)
- /constants/colors.ts — color tokens (already defined)

---

TASK:
[PASTE YOUR SPECIFIC PHASE TASK HERE]

Output: complete working code for every file needed.
No placeholders. No "// implement this later".
Every component renders real data from the mock user above.
```

---

## Phase-Specific Task Inserts

Drop these into the TASK section of the master prompt one at a time.

---

**Phase 1 — Stress Test Screen**
```
Build the StressTest screen (web: /onboarding, app: StressTest.tsx).

The screen has 3 steps:
1. Income input — monthly take-home, frequency selector
2. Expenses input — sliders for each category with preset values
3. Debts input — add debt cards (name, balance, limit, minimum payment)

After step 3, show a "Run Stress Test" button.
On click, call POST /onboarding with the collected data.
Show 3 animated "break scenarios" with the response:
- ER visit scenario
- Job loss scenario  
- Car breakdown scenario
Each scenario flashes red with the dollar impact and goal delay.
End with overall risk level badge.
CTA: "See Your Stage" → navigate to StageReveal.
```

---

**Phase 2 — Stage Reveal Screen**
```
Build the StageReveal screen (web: /onboarding/stage, app: StageReveal.tsx).

Shows:
- Large stage name with animated entrance (fade + scale)
- Stage icon (use emoji for now)
- 2-sentence description of what this stage means
- Top risk highlighted in a red badge
- First 3 habits as cards with name, duration, XP reward
- XP progress ring showing 0/500 to next stage
- CTA button: "Your GPS is set. Let's move." → navigate to Dashboard/Home

Seed with mock user data. Animate each element in with staggered delay.
```

---

**Phase 3 — Home / Dashboard Screen**
```
Build the Home screen (web: /dashboard, app: Home.tsx).

Shows:
- Greeting: "Good morning, Marcus" with current date
- Today's suggested move as a highlighted action card
  (action text, dollar amount, XP reward, goal it affects)
- Active goals summary: 2 goal cards with progress bars,
  status badge (on track / behind), days ahead or behind
- Recent XP events: last 3 as a feed (reason + XP amount + timestamp)
- Streak status: days count + motivational message

All data loaded from Zustand store (seeded with mock user).
Skeleton loaders while data loads.
```

---

**Phase 4 — Financial GPS Screen**
```
Build the GPS screen (web: /gps, app: GPS.tsx).

Shows:
- All active goals as expandable cards
- Each card (collapsed): name, progress bar, % complete, status badge
- Each card (expanded): route steps by month, suggested next move,
  projected completion date, days ahead/behind
- "Recalculate Routes" button at top → calls POST /goals/{userId}/recalculate
  → shows loading state → updates all cards
- "Add Goal" button → opens a modal with goal type selector,
  target amount input, deadline picker

Animate card expand/collapse with smooth height transition.
```

---

**Phase 5 — Tap Check Modal + Simulation**
```
Build the TapCheck simulation (web: floating button + modal, app: modal overlay).

Add a floating "Tap to Pay" button on the Home screen.
Clicking it opens a merchant/amount selector (use mock scenarios from mock data file).
On confirm, call POST /tap-check with the selected scenario.
Show the TapCheck modal with:
- Merchant name, amount, category icon
- Budget status bar (spent vs limit, color coded)
- Goal impact: "Your Move-Out Goal shifts back X days"
- Three buttons: Proceed / Pause / Adjust
- If amount > $500, Proceed shows a warning: "This will open Smart Alternatives"

On Pause: dismiss modal, show XP earned toast (+25 XP), update store.
On Proceed (>$500): navigate to Smart Alternatives screen.
On Adjust: open SpendingLimitSetter modal inline.
```

---

**Phase 6 — Smart Alternatives Screen**
```
Build the SmartAlternatives screen (web: /alternatives, app: SmartAlternatives.tsx).

Shows at top:
- Original purchase summary (merchant, amount)
- Impact statement in red: "This pushes Move-Out back 8 months"

Below: 3 alternative cards (A, B, C) + 1 proceed card (D)
Each card shows:
- Emoji + label
- Description with specific numbers
- Goal impact in months (green if better than original, red if same/worse)
- Monthly cost if applicable
- "Choose This Path" button

On selection: call POST /alternatives/select → show GPS recalculating
animation → navigate to GPS screen with updated routes.
D (Proceed Anyway): show confirmation dialog first.
```

---

**Phase 7 — Ask Gropal Chat Screen**
```
Build the Ask screen (web: /ask, app: Ask.tsx).

Chat interface:
- Messages rendered from bottom up
- User messages: right-aligned, purple background
- Gropal messages: left-aligned, dark card background
- Gropal avatar: small G logo or emoji
- Typing indicator (3 animated dots) while waiting for response

Input area:
- Text input + send button
- Mic button → triggers Web Speech API (web) or expo-speech-recognition (app)
- Voice input shows live transcript in input field

On send:
- Add user message to chatHistory in Zustand
- Call POST /ask with message + full conversation history
- Show typing indicator
- On response: add to chatHistory, scroll to bottom
- If response contains suggested actions, render as tappable chips below message

Suggested prompts shown when chat is empty:
- "Can I afford this?"
- "How am I doing?"
- "Should I pay off debt or save?"
```

---

**Phase 8 — Daily Builds Screen**
```
Build the Builds screen (web: /builds, app: Builds.tsx).

Shows:
- Streak counter at top with flame emoji, day count,
  milestone message ("11 days — 3 days from the 14-day milestone")
- Weekly completion dots (7 dots, filled = completed that day)
- Today's active habits as cards:
  - Habit name + category icon
  - Duration badge ("10 sec", "30 sec")
  - XP reward badge
  - Complete button → calls POST /habits/{userId}/{habitId}/complete
    → checkbox animates → XP toast → streak updates
- Locked habits section (greyed out, shows unlock stage)

Completing all habits today triggers a celebration animation.
```

---

**Phase 9 — Squad Screen**
```
Build the Squad screen (web: /squad, app: Squad.tsx).

Shows:
- Squad name + weekly XP total + percentile ranking badge
- Active challenge card: name, progress (X/5 members on track),
  ends date, animated progress bar
- Member feed — scrollable list:
  Each member: display name, stage badge, streak count,
  recent achievement (if any), weekly XP
  Never show balance, income, or debt amounts
- "Invite Friend" button → copies invite link to clipboard

If no squad: show "Join a Squad" and "Create a Squad" cards.
Seed with mock squad data (The Grind Squad, 5 members).
```