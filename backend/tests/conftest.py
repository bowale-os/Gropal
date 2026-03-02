import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import User, Goal, Habit, Transaction, SpendingLimit, XPEvent, Squad, SquadMember

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def marcus(db):
    user = User(
        id="user_marcus_001",
        name="Marcus",
        age=23,
        income_monthly=3200,
        income_frequency="biweekly",
        stage="Income Initiate",
        xp=0,
        xp_to_next=500,
        streak_days=11,
        top_risk="high credit utilization",
        risk_overall="moderate",
        moves_total=0,
        moves_this_month=0,
        moves_on_goal=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def marcus_goals(db, marcus):
    goals = [
        Goal(
            id="goal_001",
            user_id="user_marcus_001",
            name="Move Out",
            type="move_out",
            target_amount=4000,
            current_amount=1240,
            monthly_contribution=200,
            status="on_track",
            days_behind=0,
            priority=1,
        ),
        Goal(
            id="goal_002",
            user_id="user_marcus_001",
            name="Pay Off Credit Card",
            type="pay_off_debt",
            target_amount=1400,
            current_amount=560,
            monthly_contribution=160,
            status="behind",
            days_behind=14,
            priority=2,
        ),
    ]
    db.add_all(goals)
    db.commit()
    return goals
