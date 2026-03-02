import uuid
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import SquadCreateRequest, SquadJoinRequest
from schemas.responses import SquadResponse, SquadMemberResponse
from services import xp_service
from models.squad import Squad, SquadMember
from models.user import User

router = APIRouter(prefix="/squad", tags=["squad"])

MOCK_PERCENTILES = [72, 61, 84, 55, 90, 78, 43]


def _build_squad_response(squad: Squad, members: list[SquadMember]) -> SquadResponse:
    member_responses = [
        SquadMemberResponse(
            id=m.id,
            display_name=m.display_name,
            stage=m.stage,
            streak_days=m.streak_days or 0,
            weekly_xp=m.weekly_xp or 0,
            recent_achievement=m.recent_achievement,
        )
        for m in members
    ]
    return SquadResponse(
        id=squad.id,
        name=squad.name,
        weekly_xp=squad.weekly_xp or 0,
        join_code=squad.join_code,
        members=member_responses,
        percentile=random.choice(MOCK_PERCENTILES),
    )


@router.get("/{squad_id}", response_model=SquadResponse)
def get_squad(squad_id: str, db: Session = Depends(get_db)):
    squad = db.query(Squad).filter(Squad.id == squad_id).first()
    if not squad:
        raise HTTPException(status_code=404, detail={"error": True, "message": "Squad not found", "code": "SQUAD_NOT_FOUND"})
    members = db.query(SquadMember).filter(SquadMember.squad_id == squad_id).all()
    squad.weekly_xp = sum(m.weekly_xp or 0 for m in members)
    db.commit()
    return _build_squad_response(squad, members)


@router.post("/create", response_model=SquadResponse)
def create_squad(req: SquadCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    join_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    squad = Squad(
        id=f"squad_{uuid.uuid4().hex[:8]}",
        name=req.squad_name,
        weekly_xp=0,
        join_code=join_code,
    )
    db.add(squad)

    member = SquadMember(
        id=str(uuid.uuid4()),
        squad_id=squad.id,
        user_id=req.user_id,
        display_name=req.display_name,
        stage=user.stage or "Income Initiate",
        streak_days=user.streak_days or 0,
        weekly_xp=0,
    )
    db.add(member)

    user.squad_id = squad.id
    db.commit()

    xp_service.award_xp(req.user_id, "squad_created", db)
    return _build_squad_response(squad, [member])


@router.post("/join", response_model=SquadResponse)
def join_squad(req: SquadJoinRequest, db: Session = Depends(get_db)):
    squad = db.query(Squad).filter(Squad.join_code == req.join_code.upper()).first()
    if not squad:
        raise HTTPException(status_code=404, detail={"error": True, "message": "Squad not found. Check the join code.", "code": "SQUAD_NOT_FOUND"})

    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    existing = db.query(SquadMember).filter(
        SquadMember.squad_id == squad.id, SquadMember.user_id == req.user_id
    ).first()
    if existing:
        members = db.query(SquadMember).filter(SquadMember.squad_id == squad.id).all()
        return _build_squad_response(squad, members)

    member = SquadMember(
        id=str(uuid.uuid4()),
        squad_id=squad.id,
        user_id=req.user_id,
        display_name=req.display_name,
        stage=user.stage or "Income Initiate",
        streak_days=user.streak_days or 0,
        weekly_xp=0,
    )
    db.add(member)
    user.squad_id = squad.id
    db.commit()

    xp_service.award_xp(req.user_id, "squad_joined", db)
    members = db.query(SquadMember).filter(SquadMember.squad_id == squad.id).all()
    return _build_squad_response(squad, members)
