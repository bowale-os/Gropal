# Gropal — Dependency & Package Policy

> **Rule:** Every new package requires explicit approval before it is added
> to the project.

---

## Approval Criteria

A package must satisfy **all three** before it can be added:

| Check | Requirement |
|---|---|
| Downloads | > 500k weekly |
| Maintenance | Active commit in last 6 months |
| Security | No known CVEs |

---

## Approved Packages

### Frontend

| Package | Notes |
|---|---|
| `expo` + `expo-*` | All first-party Expo packages pre-cleared |
| `react-native` | Core framework |
| `zustand` | State management |
| `nativewind` | Tailwind for React Native |
| `expo-router` | Navigation |
| `@expo/vector-icons` | Icons |
| `date-fns` | Date handling |
| `react-native-reanimated` | Animations |
| `expo-secure-store` | Secure local storage |

### Backend

| Package | Notes |
|---|---|
| `fastapi` | API framework |
| `uvicorn` | ASGI server |
| `sqlalchemy` | ORM |
| `pydantic` | Validation |
| `anthropic` | Claude API client |
| `python-dotenv` | Env var loading |
| `httpx` | Async HTTP client |
| `alembic` | Migrations (post-hackathon) |

---

## Banned Packages

| Banned | Use Instead |
|---|---|
| `lodash` | Native JS methods |
| `moment` | `date-fns` |
| `request` / `node-fetch` | Native `fetch` |
| < 100k weekly downloads | Explicitly approved only |

---

## Version Pinning

- **Production deps:** exact versions only — no `^` or `~`
- **Dev deps:** `>=` allowed
- Pin in both `package.json` and `requirements.txt`