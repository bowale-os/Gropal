# Testing Strategy
`bowale-os/Gropal`

---

## Framework

| Layer | Tool |
|---|---|
| Backend | `pytest` + `httpx` (async endpoint testing) |
| Frontend | `jest` + `@testing-library/react-native` |
| E2E | Detox — post-hackathon only, skip for demo |

---

## Coverage Requirements

| Phase | Requirement |
|---|---|
| Hackathon | Critical paths only — stage assignment, XP calc, tap check logic, goal impact calc |
| Post-hackathon | 70% minimum coverage on all backend services |

---

## Required Tests (Hackathon Non-Negotiable)
```python
# test_stage_service.py
test_income_initiate_assigned_correctly()
test_credit_builder_assigned_correctly()
test_stage_upgrade_triggers_at_correct_xp()

# test_xp_service.py
test_habit_complete_awards_correct_xp()
test_tap_check_pause_awards_25_xp()
test_goal_completion_awards_500_xp()

# test_tap_check.py
test_intercept_fires_over_limit()
test_no_intercept_under_30_dollars()
test_goal_impact_calculated_correctly()
test_alternatives_shown_over_500()
```

---

## Mocking Rules

- Mock Claude API in all tests — never hit the real API in the test suite
- Mock Plaid in all tests
- Use a fresh in-memory SQLite DB for each test run