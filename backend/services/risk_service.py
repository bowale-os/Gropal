from sqlalchemy.orm import Session
from models.user import User
from models.goal import Goal
from models.limit import SpendingLimit


def build_risk_profile(user: User, goals: list, limits: list) -> dict:
    risks = []

    if user.top_risk:
        risks.append({
            "name": user.top_risk,
            "level": "high",
            "description": f"Your top financial vulnerability right now.",
        })

    total_goal_monthly = sum(g.monthly_contribution or 0 for g in goals if g.status != "completed")
    if user.income_monthly and total_goal_monthly > user.income_monthly * 0.4:
        risks.append({
            "name": "goal overcommitment",
            "level": "moderate",
            "description": "Your goal contributions exceed 40% of take-home income.",
        })

    behind_goals = [g for g in goals if g.status == "behind"]
    if behind_goals:
        risks.append({
            "name": "goals falling behind",
            "level": "moderate",
            "description": f"{len(behind_goals)} goal(s) are behind schedule.",
        })

    has_critical = any(r["level"] == "high" for r in risks)
    overall = "high" if has_critical else ("moderate" if risks else "low")

    return {
        "overall": overall,
        "top_risk": user.top_risk or "none identified",
        "risks": risks,
    }


def get_stress_scenarios(user: User, goals: list) -> list[dict]:
    income = user.income_monthly or 3200
    total_goal_monthly = sum(g.monthly_contribution or 0 for g in goals if g.status != "completed")
    est_expenses = income - total_goal_monthly - 400
    monthly_surplus = income - est_expenses

    runaway_days = int((monthly_surplus * 3) / (est_expenses / 30)) if est_expenses > 0 else 30

    return [
        {
            "name": "ER Visit",
            "description": f"An unexpected ER visit averages $2,700. That's {round(2700 / max(monthly_surplus, 1), 1)} months of your surplus.",
            "dollar_impact": 2700,
            "goal_delay_months": round(2700 / max(total_goal_monthly, 200), 1),
            "severity": "high" if monthly_surplus < 2700 else "moderate",
        },
        {
            "name": "Job Loss",
            "description": f"Your current savings cover roughly {runaway_days} days of expenses without income.",
            "dollar_impact": est_expenses * 3,
            "goal_delay_months": 3.0,
            "severity": "high" if runaway_days < 60 else "moderate",
        },
        {
            "name": "Car Breakdown",
            "description": "An average car repair costs $500–$1,200. Without a buffer, that hits your goals directly.",
            "dollar_impact": 850,
            "goal_delay_months": round(850 / max(total_goal_monthly, 200), 1),
            "severity": "moderate",
        },
    ]
