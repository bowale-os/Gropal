import pytest
from schemas.requests import TapCheckRequest
from services.tap_check_service import evaluate
from models.limit import SpendingLimit
import uuid


def test_intercept_fires_over_limit(db, marcus, marcus_goals):
    limit = SpendingLimit(
        id=str(uuid.uuid4()),
        user_id="user_marcus_001",
        category="food_delivery",
        amount=150,
        period="weekly",
        spent_this_period=140,
    )
    db.add(limit)
    db.commit()

    req = TapCheckRequest(user_id="user_marcus_001", merchant="DoorDash", amount=30, category="food_delivery")
    result = evaluate(req, db)
    assert result["should_intercept"] is True
    assert result["within_budget"] is False


def test_no_intercept_under_30_dollars(db, marcus, marcus_goals):
    req = TapCheckRequest(user_id="user_marcus_001", merchant="Corner Store", amount=25, category="groceries")
    result = evaluate(req, db)
    assert result["should_intercept"] is False


def test_goal_impact_calculated_correctly(db, marcus, marcus_goals):
    req = TapCheckRequest(user_id="user_marcus_001", merchant="Amazon", amount=200, category="other")
    result = evaluate(req, db)
    assert result["should_intercept"] is True
    goal_impact = result.get("goal_impact")
    assert goal_impact is not None
    assert goal_impact["days"] == pytest.approx(30, abs=5)


def test_alternatives_shown_over_500(db, marcus, marcus_goals):
    req = TapCheckRequest(user_id="user_marcus_001", merchant="CarMax", amount=600, category="transport")
    result = evaluate(req, db)
    assert result["should_intercept"] is True
    assert result["show_alternatives"] is True
