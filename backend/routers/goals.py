import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.goal import Goal
from models.user import User
from schemas.requests import GoalCreateRequest
from schemas.responses import GoalResponse, GoalsResponse, RouteStep, SuggestedMove
from services import gps_service

router = APIRouter(prefix="/goals", tags=["goals"])


def _build_goal_response(goal: Goal, user: User) -> GoalResponse:
    progress_pct = round((goal.current_amount or 0) / max(goal.target_amount or 1, 1) * 100, 1)
    route = gps_service.build_route(goal, user)
    suggested = gps_service.get_suggested_next_move(goal, user)
    projected = gps_service.get_projected_completion(goal)
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        type=goal.type,
        target_amount=goal.target_amount or 0,
        current_amount=goal.current_amount or 0,
        monthly_contribution=goal.monthly_contribution or 0,
        deadline=str(goal.deadline) if goal.deadline else None,
        status=goal.status or "on_track",
        days_behind=goal.days_behind or 0,
        priority=goal.priority or 1,
        progress_pct=progress_pct,
        route=[RouteStep(**r) for r in route],
        suggested_next_move=SuggestedMove(**suggested) if suggested else None,
        projected_completion=projected,
    )


@router.get("/{user_id}", response_model=GoalsResponse)
def get_goals(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})
    goals = db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.priority).all()
    return GoalsResponse(goals=[_build_goal_response(g, user) for g in goals])


@router.post("/{user_id}", response_model=GoalResponse)
def create_goal(user_id: str, req: GoalCreateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})
    goal = Goal(
        id=f"goal_{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        name=req.name,
        type=req.type,
        target_amount=req.target_amount,
        current_amount=0,
        monthly_contribution=req.monthly_contribution or round(req.target_amount / 12, 2),
        status="on_track",
        days_behind=0,
        priority=req.priority,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _build_goal_response(goal, user)


@router.post("/{user_id}/recalculate", response_model=GoalsResponse)
def recalculate(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})
    goals, summary, tradeoffs = gps_service.recalculate_all_goals(user_id, db)
    return GoalsResponse(
        goals=[_build_goal_response(g, user) for g in goals],
        rebalance_summary=summary,
        tradeoffs=tradeoffs,
    )
