"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Goal } from "@/types";
import ProgressBar from "./ProgressBar";
import XPBadge from "./XPBadge";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  on_track: { label: "ON TRACK",  color: "#22FF88", bg: "rgba(34,255,136,0.08)",  border: "rgba(34,255,136,0.2)" },
  behind:   { label: "BEHIND",    color: "#FFB800", bg: "rgba(255,184,0,0.08)",   border: "rgba(255,184,0,0.2)" },
  completed:{ label: "COMPLETE",  color: "#FF6B2B", bg: "rgba(255,107,43,0.08)",  border: "rgba(255,107,43,0.2)" },
  paused:   { label: "PAUSED",    color: "#6B6560", bg: "rgba(107,101,96,0.08)",  border: "rgba(107,101,96,0.2)" },
};

interface Props {
  goal: Goal;
  onContribute?: (goal: Goal) => void;
}

export default function GoalCard({ goal, onContribute }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[goal.status] ?? STATUS_STYLES.on_track;
  const progress = goal.progress_pct ?? Math.round((goal.current_amount / Math.max(goal.target_amount, 1)) * 100);
  const progressColor = goal.status === "behind" ? "#FFB800" : goal.status === "completed" ? "#22FF88" : "#FF6B2B";

  return (
    <motion.div
      layout
      className="overflow-hidden mb-3 cursor-pointer"
      style={{ background: "#0E0E0E", border: "1px solid #242424", borderRadius: "4px" }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left accent bar */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ background: progressColor }}
        />
        <div className="p-4 pl-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-display font-semibold text-ink text-sm leading-tight">{goal.name}</h3>
            <span
              className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-[2px] tracking-[0.1em] shrink-0 ml-2"
              style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>
          </div>

          <ProgressBar value={progress} max={100} color={progressColor} height="4px" />

          <div className="flex justify-between mt-2 font-mono text-[11px]" style={{ color: "#6B6560" }}>
            <span>${goal.current_amount.toLocaleString()}</span>
            <span>${goal.target_amount.toLocaleString()}</span>
          </div>

          {goal.status === "behind" && (goal.days_behind ?? 0) > 0 && (
            <p className="text-[11px] font-mono mt-2" style={{ color: "#FFB800" }}>
              ▼ {goal.days_behind}d behind schedule
            </p>
          )}

          <div className="flex justify-end mt-1.5">
            <span className="font-mono text-[9px] tracking-widest" style={{ color: "#3A3530" }}>
              {expanded ? "COLLAPSE ▲" : "EXPAND ▼"}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ borderTop: "1px solid #242424" }}
          >
            <div className="p-4 pl-5">
              {goal.suggested_next_move && (
                <div
                  className="p-3 mb-4 rounded-[3px]"
                  style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.15)" }}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-mono text-[9px] tracking-[0.12em] text-primary">SUGGESTED MOVE</p>
                    <XPBadge xp={goal.suggested_next_move.xp_reward} />
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed mb-3">
                    {goal.suggested_next_move.text}
                  </p>
                  {onContribute && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onContribute(goal); }}
                      className="btn-primary text-xs font-display font-bold px-4 py-2 w-full"
                    >
                      Execute →
                    </button>
                  )}
                </div>
              )}

              {goal.route && goal.route.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.12em] mb-2" style={{ color: "#3A3530" }}>ROUTE MAP</p>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {goal.route.slice(0, 6).map((step) => (
                      <div key={step.month} className="flex items-center gap-3 text-xs">
                        <span
                          className="shrink-0 w-6 h-6 flex items-center justify-center font-mono font-semibold text-[9px]"
                          style={{ background: "#161616", border: "1px solid #242424", borderRadius: "2px", color: "#FF6B2B" }}
                        >
                          {step.month}
                        </span>
                        <span className="flex-1 text-ink-muted">{step.action}</span>
                        <span className="font-mono text-[10px]" style={{ color: "#6B6560" }}>
                          ${step.balance_after.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
