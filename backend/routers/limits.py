import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.requests import LimitCreateRequest
from schemas.responses import LimitResponse
from models.limit import SpendingLimit

router = APIRouter(prefix="/limits", tags=["limits"])


@router.get("/{user_id}")
def get_limits(user_id: str, db: Session = Depends(get_db)):
    limits = db.query(SpendingLimit).filter(SpendingLimit.user_id == user_id).all()
    return [
        LimitResponse(
            id=l.id,
            category=l.category,
            amount=l.amount,
            period=l.period,
            spent_this_period=l.spent_this_period or 0,
            remaining=max(0, (l.amount or 0) - (l.spent_this_period or 0)),
            goal_linked=l.goal_linked,
        )
        for l in limits
    ]


@router.post("/{user_id}", response_model=LimitResponse)
def create_limit(user_id: str, req: LimitCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(SpendingLimit).filter(
        SpendingLimit.user_id == user_id,
        SpendingLimit.category == req.category,
        SpendingLimit.period == req.period,
    ).first()
    if existing:
        existing.amount = req.amount
        existing.goal_linked = req.goal_linked
        db.commit()
        db.refresh(existing)
        limit = existing
    else:
        limit = SpendingLimit(
            id=str(uuid.uuid4()),
            user_id=user_id,
            category=req.category,
            amount=req.amount,
            period=req.period,
            spent_this_period=0,
            goal_linked=req.goal_linked,
        )
        db.add(limit)
        db.commit()
        db.refresh(limit)
    return LimitResponse(
        id=limit.id,
        category=limit.category,
        amount=limit.amount,
        period=limit.period,
        spent_this_period=limit.spent_this_period or 0,
        remaining=max(0, (limit.amount or 0) - (limit.spent_this_period or 0)),
        goal_linked=limit.goal_linked,
    )


@router.delete("/{user_id}/{limit_id}")
def delete_limit(user_id: str, limit_id: str, db: Session = Depends(get_db)):
    limit = db.query(SpendingLimit).filter(
        SpendingLimit.id == limit_id, SpendingLimit.user_id == user_id
    ).first()
    if not limit:
        raise HTTPException(status_code=404, detail={"error": True, "message": "Limit not found", "code": "LIMIT_NOT_FOUND"})
    db.delete(limit)
    db.commit()
    return {"error": False, "message": "Limit deleted."}
