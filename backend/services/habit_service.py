from datetime import datetime, date
from sqlalchemy.orm import Session
from models.habit import Habit
from models.user import User

STAGE_ORDER = [
    "Income Initiate",
    "Credit Builder",
    "Stability Architect",
    "Wealth Foundation Builder",
    "Independent Operator",
]


def get_habits_for_user(user: User, db: Session) -> tuple[list[Habit], str]:
    stage_idx = STAGE_ORDER.index(user.stage) if user.stage in STAGE_ORDER else 0
    eligible_stages = STAGE_ORDER[: stage_idx + 1]

    habits = (
        db.query(Habit)
        .filter(Habit.user_id == user.id, Habit.stage_required.in_(eligible_stages))
        .all()
    )

    streak = user.streak_days or 0
    message = _streak_message(streak)
    return habits, message


def is_completed_today(habit: Habit) -> bool:
    if not habit.last_completed:
        return False
    last = habit.last_completed
    if isinstance(last, datetime):
        last = last.date()
    return last == date.today()


def complete_habit(habit: Habit, user: User, db: Session) -> tuple[int, bool, str | None]:
    if is_completed_today(habit):
        return 0, False, None

    habit.streak = (habit.streak or 0) + 1
    habit.last_completed = datetime.now()

    milestone = None
    bonus_xp = 0
    if habit.streak == 7:
        milestone = "7-day streak"
        bonus_xp = 50
    elif habit.streak == 14:
        milestone = "14-day streak"
        bonus_xp = 100
    elif habit.streak == 30:
        milestone = "30-day streak"
        bonus_xp = 150

    user.streak_days = max(user.streak_days or 0, habit.streak)
    db.commit()

    xp_earned = (habit.xp_reward or 10) + bonus_xp
    return xp_earned, milestone is not None, milestone


def _streak_message(streak: int) -> str:
    if streak < 7:
        return f"Keep going — {7 - streak} days to your first milestone."
    if streak == 7:
        return "7-day streak! Users who hit 14 are 3x more likely to reach their first goal."
    if streak < 14:
        return f"{streak} days straight. {14 - streak} days to the 14-day milestone."
    return f"{streak}-day streak. You're in the top 20% of FortiFi users."
