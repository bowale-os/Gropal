from sqlalchemy import Column, String, Integer, Float, Date, DateTime
from sqlalchemy.sql import func
from database import Base

class Goal(Base):
    __tablename__ = "goals"
    id                   = Column(String, primary_key=True)
    user_id              = Column(String, index=True)
    name                 = Column(String)
    type                 = Column(String)
    target_amount        = Column(Float, default=0)
    current_amount       = Column(Float, default=0)
    monthly_contribution = Column(Float, default=0)
    deadline             = Column(Date, nullable=True)
    status               = Column(String, default="on_track")
    days_behind          = Column(Integer, default=0)
    priority             = Column(Integer, default=1)
    created_at           = Column(DateTime, server_default=func.now())
    completed_at         = Column(DateTime, nullable=True)