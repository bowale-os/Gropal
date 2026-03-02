"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Goal } from "@/types";
import ProgressBar from "./ProgressBar";
import XPBadge from "./XPBadge";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  on_track: { label: "On Track ✓", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  behind: { label: "Behind ⚠️", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  completed: { label: "Completed 🎉", color: "#60A5FA", bg: "rgba(37,99,235,0.12)" },
  paused: { label: "Paused", color: "#7B9CC4", bg: "rgba(123,156,196,0.1)" },
};

interface Props {
  goal: Goal;
  onContribute?: (goal: Goal) => void;
}

export default function GoalCard({ goal, onContribute }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[goal.status] ?? STATUS_STYLES.on_track;
  const progress = goal.progress_pct ?? Math.round((goal.current_amount / Math.max(goal.target_amount, 1)) * 100);
  const progressColor = goal.status === "behind" ? "#F59E0B" : "#2563EB";

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden mb-3 cursor-pointer"
      style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold" style={{ color: "#EEF4FF" }}>{goal.name}</h3>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
        </div>

        <ProgressBar value={progress} max={100} color={progressColor} height="6px" />

        <div className="flex justify-between mt-2 text-xs" style={{ color: "#7B9CC4" }}>
          <span>${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}</span>
          <span>{progress}%</span>
        </div>

        {goal.status === "behind" && (goal.days_behind ?? 0) > 0 && (
          <p className="text-xs mt-2" style={{ color: "#F59E0B" }}>
            {goal.days_behind} days behind schedule
          </p>
        )}

        {goal.projected_completion && (
          <p className="text-xs mt-1" style={{ color: "#7B9CC4" }}>
            Projected: {goal.projected_completion}
          </p>
        )}

        <div className="flex justify-end mt-1">
          <span className="text-xs" style={{ color: "#7B9CC4" }}>{expanded ? "▲ Less" : "▼ More"}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ borderTop: "1px solid #1A2F50" }}
          >
            <div className="p-5 pt-4">
              {goal.suggested_next_move && (
                <div
                  className="rounded-xl p-4 mb-4 flex items-start justify-between gap-3"
                  style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}
                >
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "#EEF4FF" }}>Suggested Move</p>
                    <p className="text-xs" style={{ color: "#7B9CC4" }}>{goal.suggested_next_move.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <XPBadge xp={goal.suggested_next_move.xp_reward} />
                    {onContribute && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onContribute(goal); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
                        style={{ background: "#2563EB", color: "#fff" }}
                      >
                        Do this
                      </button>
                    )}
                  </div>
                </div>
              )}

              {goal.route && goal.route.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#7B9CC4" }}>Route</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {goal.route.slice(0, 6).map((step) => (
                      <div key={step.month} className="flex items-center gap-3 text-xs">
                        <span
                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[10px]"
                          style={{ background: "#1A2F50", color: "#60A5FA" }}
                        >
                          M{step.month}
                        </span>
                        <span className="flex-1" style={{ color: "#7B9CC4" }}>{step.action}</span>
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
