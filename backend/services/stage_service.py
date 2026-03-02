from schemas.requests import OnboardingRequest, DebtInput

STAGE_ORDER = [
    "Income Initiate",
    "Credit Builder",
    "Stability Architect",
    "Wealth Foundation Builder",
    "Independent Operator",
]


def calculate_credit_utilization(debts: list[DebtInput]) -> float:
    credit_cards = [d for d in debts if d.type == "credit_card" and d.credit_limit]
    if not credit_cards:
        return 0.0
    total_balance = sum(d.balance for d in credit_cards)
    total_limit = sum(d.credit_limit for d in credit_cards if d.credit_limit)
    return (total_balance / total_limit * 100) if total_limit > 0 else 0.0


def calculate_total_expenses(expenses: object) -> float:
    return sum(
        getattr(expenses, field, 0) or 0
        for field in [
            "rent", "utilities", "groceries", "transport",
            "subscriptions", "food_delivery", "dining",
            "entertainment", "clothing", "other",
        ]
    )


def calculate_debt_to_income(debts: list[DebtInput], income_monthly: float) -> float:
    total_min_payments = sum(d.minimum_payment for d in debts)
    return (total_min_payments / income_monthly * 100) if income_monthly > 0 else 0.0


def assign_stage(req: OnboardingRequest) -> dict:
    utilization = calculate_credit_utilization(req.debts)
    total_expenses = calculate_total_expenses(req.expenses)
    debt_to_income = calculate_debt_to_income(req.debts, req.income_monthly)
    monthly_surplus = req.income_monthly - total_expenses

    risks = []
    if utilization >= 70:
        risks.append({"name": "high credit utilization", "level": "high", "pct": utilization})
    elif utilization >= 30:
        risks.append({"name": "moderate credit utilization", "level": "moderate", "pct": utilization})

    if debt_to_income >= 40:
        risks.append({"name": "high debt-to-income ratio", "level": "high", "pct": debt_to_income})
    elif debt_to_income >= 20:
        risks.append({"name": "moderate debt load", "level": "moderate", "pct": debt_to_income})

    if monthly_surplus < 200:
        risks.append({"name": "thin cash buffer", "level": "high", "pct": None})
    elif monthly_surplus < 500:
        risks.append({"name": "limited monthly surplus", "level": "moderate", "pct": None})

    has_emergency_fund = monthly_surplus > 800 and not risks
    has_critical_risk = any(r["level"] == "high" for r in risks)

    if has_emergency_fund and utilization < 30 and debt_to_income < 20:
        stage = "Stability Architect"
    elif utilization < 60 and len(req.goals_input) >= 1:
        stage = "Credit Builder"
    else:
        stage = "Income Initiate"

    top_risk = risks[0]["name"] if risks else "none identified"
    risk_level = "high" if has_critical_risk else ("moderate" if risks else "low")

    return {
        "stage": stage,
        "top_risk": top_risk,
        "risk_level": risk_level,
        "risks": risks,
        "utilization": utilization,
        "debt_to_income": debt_to_income,
        "monthly_surplus": monthly_surplus,
        "total_expenses": total_expenses,
    }


def get_stress_scenarios(financial_profile: dict) -> list[dict]:
    income = financial_profile.get("income_monthly", 3200)
    total_expenses = financial_profile.get("total_expenses", 2400)
    monthly_surplus = financial_profile.get("monthly_surplus", 800)

    runaway_days = int((monthly_surplus * 3) / (total_expenses / 30)) if total_expenses > 0 else 30
    utilization = financial_profile.get("utilization", 0)

    return [
        {
            "name": "ER Visit",
            "description": f"An unexpected ER visit averages $2,700. Without coverage, that wipes your surplus and pushes goals back.",
            "dollar_impact": 2700,
            "goal_delay_months": round(2700 / max(monthly_surplus, 1) * 1.2, 1),
            "severity": "high" if monthly_surplus < 2700 else "moderate",
        },
        {
            "name": "Job Loss",
            "description": f"If you lost your job today, your savings cover roughly {runaway_days} days of expenses.",
            "dollar_impact": total_expenses * 3,
            "goal_delay_months": 3.0,
            "severity": "high" if runaway_days < 60 else "moderate",
        },
        {
            "name": "Credit Spike",
            "description": f"Your credit utilization is at {utilization:.0f}%. Above 70% actively hurts your credit score and loan eligibility.",
            "dollar_impact": 0,
            "goal_delay_months": 0.5,
            "severity": "high" if utilization >= 70 else ("moderate" if utilization >= 30 else "low"),
        },
    ]


def get_recommended_goal(goals_input: list[str], stage: str) -> str:
    goal_map = {
        "move_out": "Build your Move-Out Fund",
        "pay_off_debt": "Pay Off Your Highest-Interest Debt",
        "emergency_fund": "Build a 3-Month Emergency Fund",
        "save_for_something": "Start a Targeted Savings Goal",
        "start_investing": "Open an Investment Account",
    }
    if goals_input:
        return goal_map.get(goals_input[0], "Set your first financial goal")
    stage_defaults = {
        "Income Initiate": "Build a 3-Month Emergency Fund",
        "Credit Builder": "Pay Off Your Highest-Interest Debt",
        "Stability Architect": "Build a 6-Month Emergency Fund",
    }
    return stage_defaults.get(stage, "Set your first financial goal")


def get_default_habits(stage: str) -> list[dict]:
    all_habits = [
        {"name": "No-Spend Check-In", "description": "Flag one thing you could skip today.", "duration_seconds": 10, "xp_reward": 10, "stage_required": "Income Initiate"},
        {"name": "Bill Forecast", "description": "Check what bills are due this week.", "duration_seconds": 30, "xp_reward": 10, "stage_required": "Income Initiate"},
        {"name": "One Thing I Learned", "description": "Name one financial move you made today.", "duration_seconds": 45, "xp_reward": 10, "stage_required": "Income Initiate"},
        {"name": "Credit Utilization Check", "description": "Note your current card balance vs limit.", "duration_seconds": 60, "xp_reward": 10, "stage_required": "Credit Builder"},
        {"name": "Emergency Fund Tracker", "description": "Check your emergency fund and set a micro-goal.", "duration_seconds": 30, "xp_reward": 10, "stage_required": "Stability Architect"},
    ]
    stage_idx = STAGE_ORDER.index(stage) if stage in STAGE_ORDER else 0
    eligible = [h for h in all_habits if STAGE_ORDER.index(h["stage_required"]) <= stage_idx]
    return eligible[:3]
