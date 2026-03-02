export const COLORS = {
  background: "#060D1A",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  textPrimary: "#EEF4FF",
  textMuted: "#7B9CC4",
  card: "#0C1829",
  border: "#1A2F50",
} as const;

export const RISK_COLORS: Record<string, string> = {
  low: "#22C55E",
  moderate: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
};

export const STATUS_COLORS: Record<string, string> = {
  on_track: "#22C55E",
  behind: "#F59E0B",
  completed: "#2563EB",
  paused: "#7B9CC4",
};
