import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import OnboardingRequest
from schemas.responses import OnboardingResponse, StressScenario
from models.user import User
from models.goal import Goal
from models.habit import Habit
from models.xp_event import XPEvent
from services import stage_service, claude_service

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("", response_model=OnboardingResponse)
def onboard(req: OnboardingRequest, db: Session = Depends(get_db)):
    profile = stage_service.assign_stage(req)

    claude_result = claude_service.assign_stage_via_claude({
        "income_monthly": req.income_monthly,
        "income_frequency": req.income_frequency,
        "total_expenses": profile["total_expenses"],
        "monthly_surplus": profile["monthly_surplus"],
        "credit_utilization": profile["utilization"],
        "debt_to_income": profile["debt_to_income"],
        "goals": req.goals_input,
    })

    stage = claude_result["stage"] if claude_result else profile["stage"]
    top_risk = profile["top_risk"]
    risk_level = profile["risk_level"]

    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = User(
        id=user_id,
        name=req.name,
        age=req.age,
        income_monthly=req.income_monthly,
        income_frequency=req.income_frequency,
        stage=stage,
        xp=0,
        xp_to_next=500,
        streak_days=0,
        top_risk=top_risk,
        risk_overall=risk_level,
    )
    db.add(user)

    goals = []
    # Map whatever the user typed into concrete goal types + names
    # so free-text like "move out" or "pay off debt" still creates goals.
    goal_names = {
        "move_out": "Move Out",
        "pay_off_debt": "Pay Off Debt",
        "emergency_fund": "Emergency Fund",
        "save_for_something": "Savings Goal",
        "start_investing": "Investment Fund",
    }
    target_amounts = {
        "move_out": 4000,
        "pay_off_debt": sum(d.balance for d in req.debts) if req.debts else 1500,
        "emergency_fund": max(req.income_monthly * 3, 1000),
        "save_for_something": 2000,
        "start_investing": 1000,
    }

    for raw in req.goals_input[:2]:
        text = (raw or "").strip()
        lower = text.lower()

        if text in goal_names:
            goal_type = text
        elif "move out" in lower or "move-out" in lower or "apartment" in lower:
            goal_type = "move_out"
        elif "debt" in lower or "credit card" in lower or "card" in lower:
            goal_type = "pay_off_debt"
        elif "emergency" in lower or "rainy day" in lower or "safety net" in lower:
            goal_type = "emergency_fund"
        elif "invest" in lower or "roth" in lower or "401k" in lower:
            goal_type = "start_investing"
        else:
            goal_type = "save_for_something"

        display_name = goal_names.get(goal_type, text or "My Goal")
        target_amount = target_amounts.get(goal_type, 2000)

        goal = Goal(
            id=f"goal_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            name=display_name,
            type=goal_type,
            target_amount=target_amount,
            current_amount=0,
            monthly_contribution=max(round(profile["monthly_surplus"] * 0.4, 2), 0),
            status="on_track",
            days_behind=0,
            priority=req.goals_input.index(raw) + 1 if raw in req.goals_input else 1,
        )
        goals.append(goal)
        db.add(goal)

    default_habits = stage_service.get_default_habits(stage)
    for i, h in enumerate(default_habits):
        habit = Habit(
            id=f"habit_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            name=h["name"],
            description=h["description"],
            frequency="daily",
            duration_seconds=h["duration_seconds"],
            category="awareness",
            stage_required=h["stage_required"],
            xp_reward=h["xp_reward"],
            streak=0,
            is_active=True,
        )
        db.add(habit)

    db.commit()

    stress = stage_service.get_stress_scenarios(profile)
    stress_scenarios = [
        StressScenario(
            name=s["name"],
            description=s["description"],
            dollar_impact=s["dollar_impact"],
            goal_delay_months=s["goal_delay_months"],
            severity=s["severity"],
        )
        for s in stress
    ]

    return OnboardingResponse(
        user_id=user_id,
        assigned_stage=stage,
        top_risk=top_risk,
        risk_level=risk_level,
        risks=[r["name"] for r in profile["risks"]],
        recommended_goal=stage_service.get_recommended_goal(req.goals_input, stage),
        starting_xp=0,
        first_habits=default_habits,
        stress_test_summary=stress_scenarios,
    )
