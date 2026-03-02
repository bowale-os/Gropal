"use client";

const RISK_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: "rgba(34,197,94,0.12)", text: "#22C55E", border: "rgba(34,197,94,0.3)", label: "LOW" },
  moderate: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", border: "rgba(245,158,11,0.3)", label: "MODERATE" },
  high: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", border: "rgba(239,68,68,0.3)", label: "HIGH" },
  critical: { bg: "rgba(220,38,38,0.15)", text: "#DC2626", border: "rgba(220,38,38,0.4)", label: "CRITICAL" },
};

interface Props {
  level: string;
  label?: string;
}

export default function RiskBadge({ level, label }: Props) {
  const s = RISK_STYLES[level] ?? RISK_STYLES.moderate;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-xs font-bold px-3 py-1"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      ⚠️ {label ?? s.label}
    </span>
  );
}
