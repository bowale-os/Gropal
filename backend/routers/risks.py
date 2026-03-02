from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.responses import RiskResponse, StressScenario
from services import risk_service
from models.user import User
from models.goal import Goal
from models.limit import SpendingLimit

router = APIRouter(prefix="/risks", tags=["risks"])


@router.get("/{user_id}", response_model=RiskResponse)
def get_risks(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    limits = db.query(SpendingLimit).filter(SpendingLimit.user_id == user_id).all()

    profile = risk_service.build_risk_profile(user, goals, limits)
    stress = risk_service.get_stress_scenarios(user, goals)

    return RiskResponse(
        overall=profile["overall"],
        top_risk=profile["top_risk"],
        risks=profile["risks"],
        stress_scenarios=[StressScenario(**s) for s in stress],
    )
