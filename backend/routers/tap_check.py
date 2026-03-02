import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import TapCheckRequest, TapCheckResolve
from schemas.responses import TapCheckResponse, TapCheckResolveResponse, BudgetStatus, GoalImpact
from services import tap_check_service, xp_service
from models.transaction import Transaction
from models.user import User
from models.goal import Goal

router = APIRouter(prefix="/tap-check", tags=["tap-check"])


@router.post("", response_model=TapCheckResponse)
def tap_check(req: TapCheckRequest, db: Session = Depends(get_db)):
    result = tap_check_service.evaluate(req, db)
    return TapCheckResponse(
        should_intercept=result["should_intercept"],
        within_budget=result["within_budget"],
        show_alternatives=result["show_alternatives"],
        merchant=result["merchant"],
        amount=result["amount"],
        category=result["category"],
        budget_status=BudgetStatus(**result["budget_status"]) if result.get("budget_status") else None,
        goal_impact=GoalImpact(**result["goal_impact"]) if result.get("goal_impact") else None,
        message=result.get("message", ""),
    )


@router.post("/resolve", response_model=TapCheckResolveResponse)
def resolve(req: TapCheckResolve, db: Session = Depends(get_db)):
    xp_map = {
        "paused": "tap_check_pause",
        "adjusted": "tap_check_adjust",
        "proceeded": None,
    }
    event_type = xp_map.get(req.decision)
    xp_earned = 0
    if event_type:
        xp_earned = xp_service.award_xp(req.user_id, event_type, db)

    transaction = Transaction(
        id=req.transaction_id or str(uuid.uuid4()),
        user_id=req.user_id,
        amount=req.amount,
        merchant=req.merchant,
        category=req.category,
        was_intercepted=True,
        interception_result=req.decision,
        goal_impact_days=req.goal_impact_days,
        xp_earned=xp_earned,
    )
    db.add(transaction)

    if req.decision == "proceeded" and req.goal_impact_days > 0:
        top_goal = (
            db.query(Goal)
            .filter(Goal.user_id == req.user_id, Goal.status != "completed")
            .order_by(Goal.priority)
            .first()
        )
        if top_goal:
            top_goal.days_behind = (top_goal.days_behind or 0) + req.goal_impact_days
            if top_goal.days_behind > 7:
                top_goal.status = "behind"

    db.commit()

    user = db.query(User).filter(User.id == req.user_id).first()
    upgraded, new_stage = xp_service.check_stage_upgrade(user, db) if user else (False, None)

    messages = {
        "paused": f"Smart pause. +{xp_earned} XP earned.",
        "adjusted": f"Limit updated. +{xp_earned} XP earned.",
        "proceeded": "Transaction logged. Keep your goals in mind.",
    }

    return TapCheckResolveResponse(
        xp_earned=xp_earned,
        message=messages.get(req.decision, "Done."),
        goal_impact_days=req.goal_impact_days,
        new_xp_total=user.xp if user else 0,
        stage_upgraded=upgraded,
        new_stage=new_stage,
    )
