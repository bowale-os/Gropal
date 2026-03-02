from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from database import Base

class XPEvent(Base):
    __tablename__ = "xp_events"
    id        = Column(String, primary_key=True)
    user_id   = Column(String, index=True)
    amount    = Column(Integer)
    reason    = Column(String)
    type      = Column(String)
    goal_id   = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())