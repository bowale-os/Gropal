from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id                  = Column(String, primary_key=True)
    user_id             = Column(String, index=True)
    amount              = Column(Float)
    merchant            = Column(String)
    category            = Column(String)
    was_intercepted     = Column(Boolean, default=False)
    interception_result = Column(String, nullable=True)
    goal_impact_days    = Column(Integer, default=0)
    xp_earned           = Column(Integer, default=0)
    timestamp           = Column(DateTime, server_default=func.now())