from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import AskRequest
from schemas.responses import AskResponse, SuggestedAction
from services import claude_service, xp_service, rate_limiter
from models.user import User
from models.goal import Goal

router = APIRouter(prefix="/ask", tags=["ask"])


@router.post("", response_model=AskResponse)
def ask(req: AskRequest, db: Session = Depends(get_db)):
    if not rate_limiter.check_rate_limit(req.user_id):
        raise HTTPException(
            status_code=429,
            detail={"error": True, "message": "Rate limit reached. Try again in an hour.", "code": "RATE_LIMIT"},
        )

    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    goals = db.query(Goal).filter(Goal.user_id == req.user_id).all()

    user_profile = {
        "name": user.name,
        "age": user.age,
        "income_monthly": user.income_monthly,
        "stage": user.stage,
        "xp": user.xp,
        "streak_days": user.streak_days,
        "top_risk": user.top_risk,
        "risk_overall": user.risk_overall,
        "goals": [
            {
                "name": g.name,
                "type": g.type,
                "target": g.target_amount,
                "current": g.current_amount,
                "monthly_contribution": g.monthly_contribution,
                "status": g.status,
                "days_behind": g.days_behind,
            }
            for g in goals
        ],
    }

    trimmed_history = req.conversation_history[-10:]
    response_text = claude_service.ask(user_profile, req.message, trimmed_history)

    xp_earned = xp_service.award_xp(req.user_id, "ai_engagement", db)

    suggested_actions = claude_service.parse_suggested_actions(response_text)

    return AskResponse(
        response=response_text,
        xp_earned=xp_earned,
        suggested_actions=[SuggestedAction(**a) for a in suggested_actions],
    )
