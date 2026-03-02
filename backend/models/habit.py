from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Habit(Base):
    __tablename__ = "habits"
    id               = Column(String, primary_key=True)
    user_id          = Column(String, index=True)
    name             = Column(String)
    description      = Column(String)
    frequency        = Column(String, default="daily")
    duration_seconds = Column(Integer, default=30)
    category         = Column(String)
    stage_required   = Column(String, default="Income Initiate")
    xp_reward        = Column(Integer, default=10)
    streak           = Column(Integer, default=0)
    last_completed   = Column(DateTime, nullable=True)
    is_active        = Column(Boolean, default=True)
    created_at       = Column(DateTime, server_default=func.now())