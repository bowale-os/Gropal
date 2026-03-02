from pydantic import BaseModel
from typing import Optional, List, Any


class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    field: Optional[str] = None
    code: Optional[str] = None


class StressScenario(BaseModel):
    name: str
    description: str
    dollar_impact: float
    goal_delay_months: float
    severity: str  # low | moderate | high | critical


class OnboardingResponse(BaseModel):
    user_id: str
    assigned_stage: str
    top_risk: str
    risk_level: str
    risks: List[str]
    recommended_goal: str
    starting_xp: int
    first_habits: List[dict]
    stress_test_summary: List[StressScenario]


class RouteStep(BaseModel):
    month: int
    action: str
    balance_after: float


class SuggestedMove(BaseModel):
    text: str
    amount: Optional[float] = None
    xp_reward: int
    goal_id: Optional[str] = None
    type: str


class GoalResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    target_amount: float
    current_amount: float
    monthly_contribution: float
    deadline: Optional[str] = None
    status: str
    days_behind: int
    priority: int
    progress_pct: float
    route: List[RouteStep] = []
    suggested_next_move: Optional[SuggestedMove] = None
    projected_completion: Optional[str] = None


class GoalsResponse(BaseModel):
    goals: List[GoalResponse]
    rebalance_summary: Optional[str] = None
    tradeoffs: List[str] = []


class UserResponse(BaseModel):
    id: str
    name: str
    age: int
    income_monthly: float
    stage: str
    xp: int
    xp_to_next: int
    streak_days: int
    top_risk: str
    risk_overall: str
    squad_id: Optional[str] = None
    moves_total: int
    moves_this_month: int
    moves_on_goal: int


class BudgetStatus(BaseModel):
    limit: float
    spent: float
    remaining: float
    period: str


class GoalImpact(BaseModel):
    days: int
    goal_name: str
    goal_id: str


class TapCheckResponse(BaseModel):
    should_intercept: bool
    within_budget: bool
    show_alternatives: bool
    merchant: str
    amount: float
    category: str
    budget_status: Optional[BudgetStatus] = None
    goal_impact: Optional[GoalImpact] = None
    message: str


class TapCheckResolveResponse(BaseModel):
    xp_earned: int
    message: str
    goal_impact_days: int
    new_xp_total: int
    stage_upgraded: bool = False
    new_stage: Optional[str] = None


class Alternative(BaseModel):
    id: str
    label: str
    description: str
    goal_impact_months: float
    monthly_cost: Optional[float] = None
    action: str
    emoji: str


class AlternativesResponse(BaseModel):
    alternatives: List[Alternative]
    original_impact_months: float
    merchant: str
    amount: float


class AlternativeSelectResponse(BaseModel):
    xp_earned: int
    message: str
    updated_goals: List[GoalResponse]
    new_goal_added: Optional[str] = None


class SuggestedAction(BaseModel):
    label: str
    action: str


class AskResponse(BaseModel):
    response: str
    xp_earned: int
    suggested_actions: List[SuggestedAction] = []


class HabitResponse(BaseModel):
    id: str
    name: str
    description: str
    frequency: str
    duration_seconds: int
    category: str
    stage_required: str
    xp_reward: int
    streak: int
    is_active: bool
    completed_today: bool


class HabitsResponse(BaseModel):
    habits: List[HabitResponse]
    streak_days: int
    streak_message: str


class HabitCompleteResponse(BaseModel):
    xp_earned: int
    streak_days: int
    streak_message: str
    milestone_reached: Optional[str] = None
    stage_upgraded: bool = False
    new_stage: Optional[str] = None


class SquadMemberResponse(BaseModel):
    id: str
    display_name: str
    stage: str
    streak_days: int
    weekly_xp: int
    recent_achievement: Optional[str] = None


class SquadResponse(BaseModel):
    id: str
    name: str
    weekly_xp: int
    join_code: str
    members: List[SquadMemberResponse]
    percentile: int


class ProgressionResponse(BaseModel):
    stage: str
    xp: int
    xp_to_next: int
    progress_pct: float
    streak_days: int
    moves_total: int
    moves_this_month: int
    moves_on_goal: int
    next_stage: Optional[str] = None
    upgrade_requirements: List[str] = []


class RiskResponse(BaseModel):
    overall: str
    top_risk: str
    risks: List[dict]
    stress_scenarios: List[StressScenario]


class LimitResponse(BaseModel):
    id: str
    category: str
    amount: float
    period: str
    spent_this_period: float
    remaining: float
    goal_linked: Optional[str] = None
