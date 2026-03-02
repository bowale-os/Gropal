export interface User {
  id: string;
  name: string;
  age: number;
  income_monthly: number;
  stage: string;
  xp: number;
  xp_to_next: number;
  streak_days: number;
  top_risk: string;
  risk_overall: "low" | "moderate" | "high" | "critical";
  squad_id: string | null;
  moves_total: number;
  moves_this_month: number;
  moves_on_goal: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  type: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  deadline?: string;
  status: "on_track" | "behind" | "completed" | "paused";
  days_behind?: number;
  priority: number;
  progress_pct?: number;
  route?: RouteStep[];
  suggested_next_move?: SuggestedMove;
  projected_completion?: string;
}

export interface StressScenario {
  name: string;
  description: string;
  dollar_impact: number;
  goal_delay_months: number;
  severity: "low" | "moderate" | "high" | "critical";
}

export interface RouteStep {
  month: number;
  action: string;
  balance_after: number;
}

export interface SuggestedMove {
  text: string;
  amount?: number;
  xp_reward: number;
  goal_id?: string;
  type: "contribution" | "habit" | "limit";
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "twice_weekly";
  duration_seconds: number;
  category: string;
  stage_required: string;
  xp_reward: number;
  streak: number;
  last_completed?: string;
  is_active: boolean;
  completed_today?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  suggested_actions?: SuggestedAction[];
}

export interface SuggestedAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface Squad {
  id: string;
  name: string;
  weekly_xp: number;
  join_code: string;
  members: SquadMember[];
  percentile?: number;
}

export interface SquadMember {
  id: string;
  squad_id: string;
  user_id: string;
  display_name: string;
  stage: string;
  streak_days: number;
  weekly_xp: number;
  recent_achievement?: string;
}

export interface XPEvent {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  type: string;
  timestamp: string;
}

export interface Alternative {
  id: string;
  label: string;
  description: string;
  goal_impact_months: number;
  monthly_cost?: number;
  action: string;
  emoji: string;
}

export interface TapCheckResponse {
  should_intercept: boolean;
  within_budget: boolean;
  show_alternatives: boolean;
  merchant: string;
  amount: number;
  category: string;
  budget_status?: {
    limit: number;
    spent: number;
    remaining: number;
    period: string;
  };
  goal_impact?: {
    days: number;
    goal_name: string;
    goal_id: string;
  };
}

export type RiskLevel = "low" | "moderate" | "high" | "critical";
