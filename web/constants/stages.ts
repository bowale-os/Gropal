export interface StageInfo {
  name: string;
  emoji: string;
  description: string;
  color: string;
  xp_required: number;
}

export const STAGES: Record<string, StageInfo> = {
  "Income Initiate": {
    name: "Income Initiate",
    emoji: "🌱",
    description: "You're starting your financial journey. Every dollar you track builds the foundation for everything that follows.",
    color: "#22C55E",
    xp_required: 0,
  },
  "Credit Builder": {
    name: "Credit Builder",
    emoji: "⚡",
    description: "You've got income and you're managing debt. Now it's about building the habits that compound over time.",
    color: "#2563EB",
    xp_required: 500,
  },
  "Stability Architect": {
    name: "Stability Architect",
    emoji: "🏗️",
    description: "Your credit is healthy and your habits are locked in. Now you're engineering real financial stability.",
    color: "#F59E0B",
    xp_required: 1500,
  },
  "Wealth Foundation Builder": {
    name: "Wealth Foundation Builder",
    emoji: "💎",
    description: "You've built stability. Now you're laying the foundation for wealth that grows while you sleep.",
    color: "#8B5CF6",
    xp_required: 3500,
  },
  "Independent Operator": {
    name: "Independent Operator",
    emoji: "🚀",
    description: "You operate independently of financial stress. Your money works for you around the clock.",
    color: "#EC4899",
    xp_required: 7000,
  },
};

export const STAGE_XP: Record<string, number> = {
  "Income Initiate": 500,
  "Credit Builder": 1500,
  "Stability Architect": 3500,
  "Wealth Foundation Builder": 7000,
  "Independent Operator": 0,
};
