from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.responses import ProgressionResponse
from services.xp_service import STAGE_ORDER, STAGE_XP_REQUIREMENTS
from models.user import User

router = APIRouter(prefix="/progression", tags=["progression"])

UPGRADE_REQUIREMENTS = {
    "Income Initiate": ["Reach 500 XP", "Credit utilization < 60%", "Set at least 1 goal"],
    "Credit Builder": ["Reach 1,500 XP", "Credit utilization < 30%", "No critical risks"],
    "Stability Architect": ["Reach 3,500 XP", "Emergency fund ≥ 2 months"],
    "Wealth Foundation Builder": ["Reach 7,000 XP", "Emergency fund ≥ 4 months"],
    "Independent Operator": ["You've made it. Keep building."],
}


@router.get("/{user_id}", response_model=ProgressionResponse)
def get_progression(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    stage = user.stage or "Income Initiate"
    xp = user.xp or 0
    threshold = STAGE_XP_REQUIREMENTS.get(stage, 500)
    progress_pct = round(min(xp / threshold * 100, 100), 1) if threshold > 0 else 100.0

    current_idx = STAGE_ORDER.index(stage) if stage in STAGE_ORDER else 0
    next_stage = STAGE_ORDER[current_idx + 1] if current_idx < len(STAGE_ORDER) - 1 else None

    return ProgressionResponse(
        stage=stage,
        xp=xp,
        xp_to_next=user.xp_to_next or 0,
        progress_pct=progress_pct,
        streak_days=user.streak_days or 0,
        moves_total=user.moves_total or 0,
        moves_this_month=user.moves_this_month or 0,
        moves_on_goal=user.moves_on_goal or 0,
        next_stage=next_stage,
        upgrade_requirements=UPGRADE_REQUIREMENTS.get(stage, []),
    )
