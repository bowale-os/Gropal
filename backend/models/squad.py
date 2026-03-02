from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from database import Base

class Squad(Base):
    __tablename__ = "squads"
    id         = Column(String, primary_key=True)
    name       = Column(String)
    weekly_xp  = Column(Integer, default=0)
    join_code  = Column(String, unique=True)
    created_at = Column(DateTime, server_default=func.now())

class SquadMember(Base):
    __tablename__ = "squad_members"
    id                 = Column(String, primary_key=True)
    squad_id           = Column(String, index=True)
    user_id            = Column(String, index=True)
    display_name       = Column(String)
    stage              = Column(String)
    streak_days        = Column(Integer, default=0)
    weekly_xp          = Column(Integer, default=0)
    recent_achievement = Column(String, nullable=True)
    # NEVER add balance, income, or debt fields here