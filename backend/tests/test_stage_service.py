import pytest
from schemas.requests import OnboardingRequest, ExpensesInput, DebtInput
from services.stage_service import assign_stage, calculate_credit_utilization


def make_req(income, debts=None, goals=None, expenses=None):
    return OnboardingRequest(
        name="Test User",
        age=22,
        income_monthly=income,
        income_frequency="monthly",
        expenses=expenses or ExpensesInput(rent=800, utilities=100, groceries=300, transport=200),
        debts=debts or [],
        goals_input=goals or [],
    )


def test_income_initiate_assigned_correctly():
    debts = [
        DebtInput(name="Chase", type="credit_card", balance=1400, credit_limit=2000, minimum_payment=50, interest_rate=24.0)
    ]
    req = make_req(income=2000, debts=debts, goals=[])
    result = assign_stage(req)
    assert result["stage"] == "Income Initiate"
    assert result["utilization"] == pytest.approx(70.0)


def test_credit_builder_assigned_correctly():
    debts = [
        DebtInput(name="Chase", type="credit_card", balance=980, credit_limit=2000, minimum_payment=50, interest_rate=20.0)
    ]
    req = make_req(income=3200, debts=debts, goals=["move_out"])
    result = assign_stage(req)
    assert result["stage"] == "Credit Builder"
    assert result["utilization"] == pytest.approx(49.0)


def test_stage_upgrade_triggers_at_correct_xp():
    from models.user import User
    from services.xp_service import check_stage_upgrade
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from database import Base

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    user_no_upgrade = User(id="u1", name="Test", age=22, income_monthly=3000, stage="Income Initiate", xp=499, xp_to_next=1)
    db.add(user_no_upgrade)
    db.commit()
    upgraded, new_stage = check_stage_upgrade(user_no_upgrade, db)
    assert not upgraded
    assert new_stage is None

    user_upgrade = User(id="u2", name="Test2", age=22, income_monthly=3000, stage="Income Initiate", xp=500, xp_to_next=0)
    db.add(user_upgrade)
    db.commit()
    upgraded2, new_stage2 = check_stage_upgrade(user_upgrade, db)
    assert upgraded2
    assert new_stage2 == "Credit Builder"

    db.close()
    Base.metadata.drop_all(bind=engine)
