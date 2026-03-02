"use client";

const RISK_STYLES: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
  low:      { bg: "rgba(34,255,136,0.08)",  text: "#22FF88", border: "rgba(34,255,136,0.2)",  label: "LOW",      dot: "#22FF88" },
  moderate: { bg: "rgba(255,184,0,0.08)",   text: "#FFB800", border: "rgba(255,184,0,0.2)",   label: "MODERATE", dot: "#FFB800" },
  high:     { bg: "rgba(255,59,59,0.08)",   text: "#FF3B3B", border: "rgba(255,59,59,0.2)",   label: "HIGH",     dot: "#FF3B3B" },
  critical: { bg: "rgba(255,59,59,0.12)",   text: "#FF3B3B", border: "rgba(255,59,59,0.35)",  label: "CRITICAL", dot: "#FF3B3B" },
};

interface Props {
  level: string;
  label?: string;
}

export default function RiskBadge({ level, label }: Props) {
  const s = RISK_STYLES[level] ?? RISK_STYLES.moderate;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold px-2.5 py-1 rounded-[2px] tracking-[0.1em]"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {label ?? s.label}
    </span>
  );
}
