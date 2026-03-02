from sqlalchemy.orm import Session
from models.user import User
from models.goal import Goal
from models.limit import SpendingLimit
from schemas.requests import TapCheckRequest


def evaluate(req: TapCheckRequest, db: Session) -> dict:
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        return _no_intercept(req, "User not found")

    limits = db.query(SpendingLimit).filter(SpendingLimit.user_id == req.user_id).all()
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == req.user_id, Goal.status != "completed")
        .order_by(Goal.priority)
        .all()
    )

    category_limit = next(
        (l for l in limits if l.category.lower() == req.category.lower()), None
    )
    within_budget = True
    budget_status = None

    if category_limit:
        spent = category_limit.spent_this_period or 0
        remaining = (category_limit.amount or 0) - spent
        within_budget = req.amount <= remaining
        budget_status = {
            "limit": category_limit.amount,
            "spent": spent,
            "remaining": remaining,
            "period": category_limit.period,
        }

    goal_impact = None
    top_goal = goals[0] if goals else None
    goal_impact_days = 0
    if top_goal and (top_goal.monthly_contribution or 0) > 0:
        daily_rate = (top_goal.monthly_contribution or 200) / 30
        goal_impact_days = round(req.amount / daily_rate)
        goal_impact = {
            "days": goal_impact_days,
            "goal_name": top_goal.name,
            "goal_id": top_goal.id,
        }

    should_intercept = (
        not within_budget
        or req.amount > 200
        or goal_impact_days > 3
    )
    if req.amount < 30 and within_budget and goal_impact_days <= 2:
        should_intercept = False

    show_alternatives = req.amount > 500

    if not should_intercept:
        return {
            "should_intercept": False,
            "within_budget": within_budget,
            "show_alternatives": False,
            "merchant": req.merchant,
            "amount": req.amount,
            "category": req.category,
            "message": "Within budget. No goal impact.",
        }

    return {
        "should_intercept": True,
        "within_budget": within_budget,
        "show_alternatives": show_alternatives,
        "merchant": req.merchant,
        "amount": req.amount,
        "category": req.category,
        "budget_status": budget_status,
        "goal_impact": goal_impact,
        "message": _build_message(req, within_budget, goal_impact_days, show_alternatives),
    }


def _no_intercept(req: TapCheckRequest, reason: str) -> dict:
    return {
        "should_intercept": False,
        "within_budget": True,
        "show_alternatives": False,
        "merchant": req.merchant,
        "amount": req.amount,
        "category": req.category,
        "message": "Good to go.",
    }


def _build_message(req: TapCheckRequest, within_budget: bool, goal_days: int, show_alt: bool) -> str:
    if show_alt:
        return f"This purchase pushes your top goal back {goal_days} days. See smarter options?"
    if not within_budget:
        return f"You're near your {req.category} limit. Pausing earns +25 XP."
    if goal_days > 3:
        return f"This shifts your goal back {goal_days} days. Want to pause and earn XP?"
    return "Heads up — this is a bigger purchase. Proceed or pause?"
