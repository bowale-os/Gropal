import pytest
from services.gps_service import build_route, get_projected_completion, get_suggested_next_move
from models.goal import Goal
from models.user import User


def make_goal(current, target, monthly, status="on_track", days_behind=0):
    return Goal(
        id="g_test",
        user_id="u_test",
        name="Test Goal",
        type="move_out",
        target_amount=target,
        current_amount=current,
        monthly_contribution=monthly,
        status=status,
        days_behind=days_behind,
        priority=1,
    )


def make_user():
    return User(id="u_test", name="Test", age=22, income_monthly=3200, stage="Credit Builder")


def test_route_builds_correctly():
    goal = make_goal(current=0, target=1200, monthly=200)
    user = make_user()
    route = build_route(goal, user)
    assert len(route) == 6
    assert route[-1]["balance_after"] == pytest.approx(1200, abs=1)


def test_route_empty_when_no_contribution():
    goal = make_goal(current=0, target=1200, monthly=0)
    user = make_user()
    route = build_route(goal, user)
    assert route == []


def test_behind_goal_suggests_catch_up():
    goal = make_goal(current=500, target=1400, monthly=160, status="behind", days_behind=14)
    user = make_user()
    move = get_suggested_next_move(goal, user)
    assert move["xp_reward"] == 40
    assert move["type"] == "contribution"
