from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class SpendingLimit(Base):
    __tablename__ = "spending_limits"
    id                = Column(String, primary_key=True)
    user_id           = Column(String, index=True)
    category          = Column(String)
    amount            = Column(Float)
    period            = Column(String, default="weekly")
    spent_this_period = Column(Float, default=0)
    goal_linked       = Column(String, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())