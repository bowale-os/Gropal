import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models.user import User
from models.xp_event import XPEvent

XP_REWARDS = {
    "habit_complete": 10,
    "tap_check_pause": 25,
    "tap_check_adjust": 20,
    "smart_alternative_chosen": 50,
    "goal_contribution": 20,
    "goal_back_on_track": 40,
    "goal_completed": 500,
    "risk_drops_level": 75,
    "streak_7_day": 50,
    "streak_14_day": 100,
    "ai_engagement": 5,
    "onboarding_complete": 0,
    "squad_created": 25,
    "squad_joined": 25,
}

STAGE_XP_REQUIREMENTS = {
    "Income Initiate": 500,
    "Credit Builder": 1500,
    "Stability Architect": 3500,
    "Wealth Foundation Builder": 7000,
    "Independent Operator": 999999,
}

STAGE_ORDER = [
    "Income Initiate",
    "Credit Builder",
    "Stability Architect",
    "Wealth Foundation Builder",
    "Independent Operator",
]


def award_xp(user_id: str, event_type: str, db: Session, goal_id: str | None = None) -> int:
    amount = XP_REWARDS.get(event_type, 0)
    if amount == 0 and event_type != "onboarding_complete":
        return 0

    event = XPEvent(
        id=str(uuid.uuid4()),
        user_id=user_id,
        amount=amount,
        reason=event_type.replace("_", " ").title(),
        type=event_type,
        goal_id=goal_id,
        timestamp=datetime.now(),
    )
    db.add(event)

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.xp = (user.xp or 0) + amount
        user.moves_total = (user.moves_total or 0) + 1
        user.moves_this_month = (user.moves_this_month or 0) + 1
        if goal_id:
            user.moves_on_goal = (user.moves_on_goal or 0) + 1
        _recalculate_xp_to_next(user)

    db.commit()
    return amount


def check_stage_upgrade(user: User, db: Session) -> tuple[bool, str | None]:
    current_idx = STAGE_ORDER.index(user.stage) if user.stage in STAGE_ORDER else 0
    if current_idx >= len(STAGE_ORDER) - 1:
        return False, None

    next_stage = STAGE_ORDER[current_idx + 1]
    threshold = STAGE_XP_REQUIREMENTS.get(user.stage, 999999)

    if (user.xp or 0) >= threshold:
        user.stage = next_stage
        _recalculate_xp_to_next(user)
        db.commit()
        return True, next_stage

    return False, None


def _recalculate_xp_to_next(user: User) -> None:
    threshold = STAGE_XP_REQUIREMENTS.get(user.stage, 500)
    user.xp_to_next = max(0, threshold - (user.xp or 0))


def get_recent_xp_events(user_id: str, db: Session, limit: int = 10) -> list[XPEvent]:
    return (
        db.query(XPEvent)
        .filter(XPEvent.user_id == user_id)
        .order_by(XPEvent.timestamp.desc())
        .limit(limit)
        .all()
    )
