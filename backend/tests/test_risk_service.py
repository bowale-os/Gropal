import pytest
from services.risk_service import build_risk_profile, get_stress_scenarios
from models.user import User
from models.goal import Goal


def make_user(top_risk=None, risk_overall="moderate", income=3200):
    return User(id="u1", name="Test", age=22, income_monthly=income, stage="Credit Builder", top_risk=top_risk, risk_overall=risk_overall)


def make_goal(monthly=200, status="on_track"):
    return Goal(id="g1", user_id="u1", name="Goal", type="move_out", target_amount=4000, current_amount=1000, monthly_contribution=monthly, status=status, days_behind=0, priority=1)


def test_high_risk_when_top_risk_present():
    user = make_user(top_risk="high credit utilization")
    goals = [make_goal()]
    profile = build_risk_profile(user, goals, [])
    assert profile["overall"] == "high"
    assert len(profile["risks"]) >= 1


def test_low_risk_with_clean_profile():
    user = make_user(top_risk=None, risk_overall="low", income=5000)
    goals = [make_goal(monthly=200)]
    profile = build_risk_profile(user, goals, [])
    assert profile["overall"] in ["low", "moderate"]


def test_stress_scenarios_return_three():
    user = make_user()
    goals = [make_goal()]
    scenarios = get_stress_scenarios(user, goals)
    assert len(scenarios) == 3
    for s in scenarios:
        assert "name" in s
        assert "dollar_impact" in s
        assert "severity" in s
