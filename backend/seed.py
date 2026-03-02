import uuid
from datetime import date
from sqlalchemy.orm import Session
from models.user import User
from models.goal import Goal
from models.habit import Habit
from models.squad import Squad, SquadMember
from models.xp_event import XPEvent


MARCUS_ID = "user_marcus_001"
SQUAD_ID = "squad_grind_001"


def seed_marcus(db: Session) -> None:
    if db.query(User).filter(User.id == MARCUS_ID).first():
        return

    marcus = User(
        id=MARCUS_ID,
        name="Marcus",
        age=23,
        location="Atlanta, GA",
        income_monthly=3200,
        income_frequency="biweekly",
        stage="Credit Builder",
        xp=340,
        xp_to_next=1160,
        streak_days=11,
        top_risk="high credit utilization",
        risk_overall="moderate",
        moves_total=47,
        moves_this_month=22,
        moves_on_goal=18,
        squad_id=SQUAD_ID,
    )
    db.add(marcus)

    goals = [
        Goal(
            id="goal_001",
            user_id=MARCUS_ID,
            name="Move Out",
            type="move_out",
            target_amount=4000,
            current_amount=1240,
            monthly_contribution=200,
            deadline=date(2026, 12, 1),
            status="on_track",
            days_behind=0,
            priority=1,
        ),
        Goal(
            id="goal_002",
            user_id=MARCUS_ID,
            name="Pay Off Credit Card",
            type="pay_off_debt",
            target_amount=1400,
            current_amount=560,
            monthly_contribution=160,
            deadline=date(2026, 9, 1),
            status="behind",
            days_behind=14,
            priority=2,
        ),
    ]
    db.add_all(goals)

    habits = [
        Habit(
            id="habit_001",
            user_id=MARCUS_ID,
            name="No-Spend Check-In",
            description="Review today's spending and flag one thing you could skip.",
            frequency="daily",
            duration_seconds=10,
            category="awareness",
            stage_required="Income Initiate",
            xp_reward=10,
            streak=11,
            is_active=True,
        ),
        Habit(
            id="habit_002",
            user_id=MARCUS_ID,
            name="Bill Forecast",
            description="Check what bills are due this week and confirm you have coverage.",
            frequency="twice_weekly",
            duration_seconds=30,
            category="planning",
            stage_required="Income Initiate",
            xp_reward=10,
            streak=8,
            is_active=True,
        ),
        Habit(
            id="habit_003",
            user_id=MARCUS_ID,
            name="One Thing I Learned",
            description="Name one financial concept or move you made today.",
            frequency="daily",
            duration_seconds=45,
            category="growth",
            stage_required="Income Initiate",
            xp_reward=10,
            streak=11,
            is_active=True,
        ),
        Habit(
            id="habit_004",
            user_id=MARCUS_ID,
            name="Credit Utilization Check",
            description="Open your card app and note your current balance vs limit.",
            frequency="weekly",
            duration_seconds=60,
            category="credit",
            stage_required="Credit Builder",
            xp_reward=10,
            streak=4,
            is_active=True,
        ),
        Habit(
            id="habit_005",
            user_id=MARCUS_ID,
            name="Emergency Fund Tracker",
            description="Check your emergency fund balance and set a micro-goal.",
            frequency="weekly",
            duration_seconds=30,
            category="savings",
            stage_required="Stability Architect",
            xp_reward=10,
            streak=0,
            is_active=False,
        ),
    ]
    db.add_all(habits)

    squad = Squad(
        id=SQUAD_ID,
        name="The Grind Squad",
        weekly_xp=840,
        join_code="GRIND6",
    )
    db.add(squad)

    members = [
        SquadMember(
            id="sm_001",
            squad_id=SQUAD_ID,
            user_id=MARCUS_ID,
            display_name="Marcus",
            stage="Credit Builder",
            streak_days=11,
            weekly_xp=210,
            recent_achievement="11-day streak",
        ),
        SquadMember(
            id="sm_002",
            squad_id=SQUAD_ID,
            user_id="user_002",
            display_name="Jade",
            stage="Stability Architect",
            streak_days=23,
            weekly_xp=310,
            recent_achievement="Goal completed",
        ),
        SquadMember(
            id="sm_003",
            squad_id=SQUAD_ID,
            user_id="user_003",
            display_name="Dev",
            stage="Credit Builder",
            streak_days=5,
            weekly_xp=130,
            recent_achievement=None,
        ),
        SquadMember(
            id="sm_004",
            squad_id=SQUAD_ID,
            user_id="user_004",
            display_name="Kezia",
            stage="Income Initiate",
            streak_days=14,
            weekly_xp=140,
            recent_achievement="14-day streak",
        ),
        SquadMember(
            id="sm_005",
            squad_id=SQUAD_ID,
            user_id="user_005",
            display_name="Theo",
            stage="Credit Builder",
            streak_days=7,
            weekly_xp=50,
            recent_achievement=None,
        ),
    ]
    db.add_all(members)

    xp_events = [
        XPEvent(id=str(uuid.uuid4()), user_id=MARCUS_ID, amount=10, reason="Habit completed", type="habit"),
        XPEvent(id=str(uuid.uuid4()), user_id=MARCUS_ID, amount=25, reason="Tap Check paused", type="tap_check"),
        XPEvent(id=str(uuid.uuid4()), user_id=MARCUS_ID, amount=20, reason="Goal contribution", type="goal"),
    ]
    db.add_all(xp_events)

    db.commit()
    print("✅ Seeded Marcus and demo data")
