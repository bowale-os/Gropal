from datetime import date, timedelta
from sqlalchemy.orm import Session
from models.goal import Goal
from models.user import User


def build_route(goal: Goal, user: User) -> list[dict]:
    remaining = (goal.target_amount or 0) - (goal.current_amount or 0)
    monthly = goal.monthly_contribution or 200
    if monthly <= 0:
        return []

    months_needed = int(remaining / monthly) + (1 if remaining % monthly > 0 else 0)
    route = []
    balance = goal.current_amount or 0

    for month in range(1, min(months_needed + 1, 25)):
        balance += monthly
        balance = min(balance, goal.target_amount or balance)
        route.append({
            "month": month,
            "action": f"Contribute ${monthly:.0f} → Balance: ${balance:,.0f}",
            "balance_after": round(balance, 2),
        })
        if balance >= (goal.target_amount or 0):
            break

    return route


def get_suggested_next_move(goal: Goal, user: User) -> dict:
    if goal.status == "behind":
        catch_up = round((goal.monthly_contribution or 200) * 0.2, 2)
        return {
            "text": f"Redirect ${catch_up:.0f} from discretionary this week to get back on track.",
            "amount": catch_up,
            "xp_reward": 40,
            "goal_id": goal.id,
            "type": "contribution",
        }
    return {
        "text": f"Contribute ${goal.monthly_contribution or 200:.0f} toward {goal.name} this week.",
        "amount": goal.monthly_contribution or 200,
        "xp_reward": 20,
        "goal_id": goal.id,
        "type": "contribution",
    }


def get_projected_completion(goal: Goal) -> str:
    remaining = (goal.target_amount or 0) - (goal.current_amount or 0)
    monthly = goal.monthly_contribution or 200
    if monthly <= 0 or remaining <= 0:
        return "Completed"
    months_needed = int(remaining / monthly) + (1 if remaining % monthly > 0 else 0)
    completion_date = date.today() + timedelta(days=months_needed * 30)
    return completion_date.strftime("%B %Y")


def recalculate_all_goals(user_id: str, db: Session) -> tuple[list[Goal], str, list[str]]:
    user = db.query(User).filter(User.id == user_id).first()
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id, Goal.status != "completed")
        .order_by(Goal.priority)
        .all()
    )
    if not user or not goals:
        return goals, "No active goals to recalculate.", []

    income = user.income_monthly or 3200
    est_expenses = income * 0.65
    available = income - est_expenses

    tradeoffs = []
    rebalance_summary = None

    total_allocated = sum(g.monthly_contribution or 0 for g in goals)
    if total_allocated > available * 0.8:
        rebalance_summary = f"Your goals need ${total_allocated:.0f}/month but you only have ${available:.0f} available. Consider adjusting timelines."
        tradeoffs.append(f"Accelerating one goal may delay others by 4–8 weeks.")

    for goal in goals:
        if goal.status == "behind" and (goal.days_behind or 0) > 7:
            goal.days_behind = max(0, (goal.days_behind or 0) - 1)
    db.commit()

    return goals, rebalance_summary or "Routes updated.", tradeoffs
