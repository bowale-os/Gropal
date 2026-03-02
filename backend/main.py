from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal, Base
from models import User, Goal, Habit, Transaction, SpendingLimit, XPEvent, Squad, SquadMember

from routers import onboarding, users, goals, tap_check, alternatives, ask, habits, limits, squad, progression, risks


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from seed import seed_marcus
        seed_marcus(db)
    finally:
        db.close()
    yield


app = FastAPI(title="FortiFi API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(tap_check.router)
app.include_router(alternatives.router)
app.include_router(ask.router)
app.include_router(habits.router)
app.include_router(limits.router)
app.include_router(squad.router)
app.include_router(progression.router)
app.include_router(risks.router)


@app.get("/")
def root():
    return {"status": "ok", "app": "FortiFi", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
