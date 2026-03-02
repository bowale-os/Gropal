from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import AlternativesRequest, AlternativeSelect
from schemas.responses import AlternativesResponse, AlternativeSelectResponse, Alternative, GoalResponse, RouteStep, SuggestedMove
from services import claude_service, xp_service, gps_service, rate_limiter
from models.user import User
from models.goal import Goal
from models.limit import SpendingLimit
import uuid

router = APIRouter(prefix="/alternatives", tags=["alternatives"])

PROCEED_ANYWAY = Alternative(
    id="D",
    label="Proceed Anyway",
    description="Full autonomy. Original purchase, original impact on your goals.",
    goal_impact_months=8.0,
    monthly_cost=None,
    action="proceed",
    emoji="⚠️",
)


@router.post("", response_model=AlternativesResponse)
def get_alternatives(req: AlternativesRequest, db: Session = Depends(get_db)):
    if not rate_limiter.check_rate_limit(req.user_id):
        raise HTTPException(
            status_code=429,
            detail={"error": True, "message": "Rate limit reached. Try again in an hour.", "code": "RATE_LIMIT"},
        )

    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    goals = db.query(Goal).filter(Goal.user_id == req.user_id, Goal.status != "completed").all()
    top_goal = goals[0] if goals else None
    original_impact_months = 0.0
    if top_goal and (top_goal.monthly_contribution or 0) > 0:
        original_impact_months = round(req.amount / (top_goal.monthly_contribution or 200), 1)

    user_profile = {
        "name": user.name,
        "income_monthly": user.income_monthly,
        "stage": user.stage,
        "goals": [{"name": g.name, "target": g.target_amount, "monthly": g.monthly_contribution} for g in goals],
    }
    raw_alternatives = claude_service.generate_alternatives(user_profile, req.amount, req.category)

    alternatives = []
    for a in raw_alternatives:
        alternatives.append(Alternative(
            id=a.get("id", "A"),
            label=a.get("label", "Alternative"),
            description=a.get("description", ""),
            goal_impact_months=float(a.get("goal_impact_months", 0)),
            monthly_cost=a.get("monthly_cost"),
            action=a.get("action", ""),
            emoji=a.get("emoji", "💡"),
        ))
    alternatives.append(PROCEED_ANYWAY)

    return AlternativesResponse(
        alternatives=alternatives,
        original_impact_months=original_impact_months,
        merchant=req.merchant,
        amount=req.amount,
    )


@router.post("/select", response_model=AlternativeSelectResponse)
def select_alternative(req: AlternativeSelect, db: Session = Depends(get_db)):
    xp_earned = xp_service.award_xp(req.user_id, "smart_alternative_chosen", db) if req.alternative_id != "D" else 0

    if req.monthly_cost and req.alternative_id != "D":
        limit = SpendingLimit(
            id=str(uuid.uuid4()),
            user_id=req.user_id,
            category=req.category,
            amount=req.monthly_cost,
            period="monthly",
            spent_this_period=0,
        )
        db.add(limit)
        db.commit()

    goals, _, _ = gps_service.recalculate_all_goals(req.user_id, db)

    user = db.query(User).filter(User.id == req.user_id).first()

    def _build(g: Goal) -> GoalResponse:
        progress_pct = round((g.current_amount or 0) / max(g.target_amount or 1, 1) * 100, 1)
        route = gps_service.build_route(g, user)
        suggested = gps_service.get_suggested_next_move(g, user)
        return GoalResponse(
            id=g.id, user_id=g.user_id, name=g.name, type=g.type,
            target_amount=g.target_amount or 0, current_amount=g.current_amount or 0,
            monthly_contribution=g.monthly_contribution or 0,
            deadline=str(g.deadline) if g.deadline else None,
            status=g.status or "on_track", days_behind=g.days_behind or 0,
            priority=g.priority or 1, progress_pct=progress_pct,
            route=[RouteStep(**r) for r in route],
            suggested_next_move=SuggestedMove(**suggested) if suggested else None,
            projected_completion=gps_service.get_projected_completion(g),
        )

    messages = {
        "D": "Transaction logged. Your GPS has been updated to reflect this purchase.",
    }
    message = messages.get(req.alternative_id, f"'{req.alternative_label}' activated. +{xp_earned} XP. Your GPS routes have been updated.")

    return AlternativeSelectResponse(
        xp_earned=xp_earned,
        message=message,
        updated_goals=[_build(g) for g in goals],
    )
