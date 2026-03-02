import pytest
from services.xp_service import award_xp, XP_REWARDS


def test_habit_complete_awards_correct_xp(db, marcus):
    xp = award_xp("user_marcus_001", "habit_complete", db)
    assert xp == 10
    assert xp == XP_REWARDS["habit_complete"]


def test_tap_check_pause_awards_25_xp(db, marcus):
    xp = award_xp("user_marcus_001", "tap_check_pause", db)
    assert xp == 25
    assert xp == XP_REWARDS["tap_check_pause"]


def test_goal_completion_awards_500_xp(db, marcus):
    xp = award_xp("user_marcus_001", "goal_completed", db)
    assert xp == 500
    assert xp == XP_REWARDS["goal_completed"]
