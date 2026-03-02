from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id               = Column(String, primary_key=True)
    name             = Column(String)
    age              = Column(Integer)
    location         = Column(String)
    income_monthly   = Column(Float, default=0)
    income_frequency = Column(String, default="biweekly")
    stage            = Column(String, default="Income Initiate")
    xp               = Column(Integer, default=0)
    xp_to_next       = Column(Integer, default=500)
    streak_days      = Column(Integer, default=0)
    top_risk         = Column(String)
    risk_overall     = Column(String, default="moderate")
    moves_total      = Column(Integer, default=0)
    moves_this_month = Column(Integer, default=0)
    moves_on_goal    = Column(Integer, default=0)
    squad_id         = Column(String, nullable=True)
    created_at       = Column(DateTime, server_default=func.now())