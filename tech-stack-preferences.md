# Tech Stack Lock-In
`bowale-os/Gropal`

> Locked. No alternatives. No "I think X might be better."

---

## Approved Stack

| Layer | Choice | Version |
|---|---|---|
| Mobile framework | React Native + Expo | SDK 51 |
| Language (frontend) | TypeScript | 5.x |
| State management | Zustand | 4.x |
| Navigation | Expo Router | v3 |
| Styling | NativeWind (Tailwind for RN) | 4.x |
| API framework | FastAPI | 0.111+ |
| Language (backend) | Python | 3.11 |
| ORM | SQLAlchemy | 2.x |
| Database (dev) | SQLite | — |
| Database (prod) | PostgreSQL | 15+ |
| Validation (backend) | Pydantic | v2 |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Bank data | Plaid (sandbox) | — |
| Voice input | expo-speech-recognition | latest |
| Notifications | expo-notifications | latest |
| HTTP client (frontend) | fetch (native) | — |
| Deployment (backend) | Railway | — |
| Deployment (frontend) | Expo Go (demo) / EAS (prod) | — |

---

## What Is Banned

| Banned | Use Instead |
|---|---|
| `Redux` | `Zustand` |
| `Axios` | Native `fetch` |
| `Moment.js` | `date-fns` or native `Intl` |
| Class components | Hooks only |
| Any CSS-in-JS library | `NativeWind` |
| `Mongoose` / any NoSQL ORM | `SQLAlchemy` |
| `Express` / any Node backend | `FastAPI` |