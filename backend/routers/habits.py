from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.responses import HabitsResponse, HabitCompleteResponse, HabitResponse
from services import habit_service, xp_service
from models.user import User
from models.habit import Habit

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("/{user_id}", response_model=HabitsResponse)
def get_habits(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    habits, streak_message = habit_service.get_habits_for_user(user, db)

    habit_responses = [
        HabitResponse(
            id=h.id,
            name=h.name,
            description=h.description,
            frequency=h.frequency,
            duration_seconds=h.duration_seconds or 30,
            category=h.category,
            stage_required=h.stage_required,
            xp_reward=h.xp_reward or 10,
            streak=h.streak or 0,
            is_active=h.is_active,
            completed_today=habit_service.is_completed_today(h),
        )
        for h in habits
    ]

    return HabitsResponse(
        habits=habit_responses,
        streak_days=user.streak_days or 0,
        streak_message=streak_message,
    )


@router.post("/{user_id}/{habit_id}/complete", response_model=HabitCompleteResponse)
def complete_habit(user_id: str, habit_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "User not found", "code": "USER_NOT_FOUND"})

    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail={"error": True, "message": "Habit not found", "code": "HABIT_NOT_FOUND"})

    if habit_service.is_completed_today(habit):
        return HabitCompleteResponse(
            xp_earned=0,
            streak_days=user.streak_days or 0,
            streak_message="Already completed today. Come back tomorrow!",
        )

    xp_from_habit, milestone_hit, milestone = habit_service.complete_habit(habit, user, db)
    xp_service.award_xp(user_id, "habit_complete", db)
    if milestone_hit:
        bonus_map = {"7-day streak": "streak_7_day", "14-day streak": "streak_14_day"}
        event = bonus_map.get(milestone or "", None)
        if event:
            xp_service.award_xp(user_id, event, db)

    db.refresh(user)
    upgraded, new_stage = xp_service.check_stage_upgrade(user, db)
    streak_msg = habit_service._streak_message(user.streak_days or 0)

    return HabitCompleteResponse(
        xp_earned=xp_from_habit,
        streak_days=user.streak_days or 0,
        streak_message=streak_msg,
        milestone_reached=milestone,
        stage_upgraded=upgraded,
        new_stage=new_stage,
    )
