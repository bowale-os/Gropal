from pydantic import BaseModel, Field
from typing import Optional, List


class DebtInput(BaseModel):
    name: str
    type: str  # credit_card | student_loan | auto | personal | medical
    balance: float
    credit_limit: Optional[float] = None
    minimum_payment: float
    interest_rate: float


class ExpensesInput(BaseModel):
    rent: float = 0
    utilities: float = 0
    groceries: float = 0
    transport: float = 0
    subscriptions: float = 0
    food_delivery: float = 0
    dining: float = 0
    entertainment: float = 0
    clothing: float = 0
    other: float = 0


class OnboardingRequest(BaseModel):
    name: str
    age: Optional[int] = None
    income_monthly: float = 0
    income_frequency: str = "biweekly"
    expenses: Optional[ExpensesInput] = None
    debts: List[DebtInput] = []
    goals_input: List[str] = []


class TapCheckRequest(BaseModel):
    user_id: str
    merchant: str
    amount: float = Field(gt=0)
    category: str


class TapCheckResolve(BaseModel):
    user_id: str
    transaction_id: Optional[str] = None
    decision: str  # paused | proceeded | adjusted
    merchant: str
    amount: float
    category: str
    goal_impact_days: int = 0


class AlternativesRequest(BaseModel):
    user_id: str
    merchant: str
    amount: float = Field(gt=0)
    category: str


class AlternativeSelect(BaseModel):
    user_id: str
    alternative_id: str  # A | B | C | D
    alternative_label: str
    original_amount: float
    category: str
    monthly_cost: Optional[float] = None
    goal_impact_months: float = 0


class AskRequest(BaseModel):
    user_id: str
    message: str
    conversation_history: List[dict] = []


class GoalCreateRequest(BaseModel):
    name: str
    type: str
    target_amount: float = Field(gt=0)
    deadline: Optional[str] = None
    monthly_contribution: Optional[float] = None
    priority: int = 1


class HabitCompleteRequest(BaseModel):
    pass


class LimitCreateRequest(BaseModel):
    category: str
    amount: float = Field(gt=0)
    period: str = "weekly"
    goal_linked: Optional[str] = None


class SquadCreateRequest(BaseModel):
    user_id: str
    squad_name: str
    display_name: str


class SquadJoinRequest(BaseModel):
    user_id: str
    join_code: str
    display_name: str
