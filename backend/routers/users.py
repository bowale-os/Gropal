from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.responses import UserResponse

router = APIRouter(prefix="/user", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})
    return UserResponse(
        id=user.id,
        name=user.name,
        age=user.age or 0,
        income_monthly=user.income_monthly or 0,
        stage=user.stage or "Income Initiate",
        xp=user.xp or 0,
        xp_to_next=user.xp_to_next or 500,
        streak_days=user.streak_days or 0,
        top_risk=user.top_risk or "none identified",
        risk_overall=user.risk_overall or "moderate",
        squad_id=user.squad_id,
        moves_total=user.moves_total or 0,
        moves_this_month=user.moves_this_month or 0,
        moves_on_goal=user.moves_on_goal or 0,
    )
