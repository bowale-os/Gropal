"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TapCheckResponse } from "@/types";
import ProgressBar from "./ProgressBar";

interface Props {
  result: TapCheckResponse;
  onPause: () => void;
  onProceed: () => void;
  onAdjust: () => void;
  onClose: () => void;
}

export default function TapCheckModal({ result, onPause, onProceed, onAdjust, onClose }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!result.show_alternatives) return;
    setCountdown(8);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) { clearInterval(interval); return null; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result.show_alternatives]);

  const budgetPct = result.budget_status
    ? (result.budget_status.spent / result.budget_status.limit) * 100
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg overflow-hidden"
          style={{
            background: "#0E0E0E",
            borderTop: "1px solid #FF6B2B",
            borderLeft: "1px solid #242424",
            borderRight: "1px solid #242424",
            borderRadius: "4px 4px 0 0",
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          {/* Top orange line */}
          <div className="h-[2px] bg-primary w-full" />

          <div className="p-5">
            {/* Drag handle */}
            <div className="w-8 h-[3px] rounded-full mx-auto mb-5" style={{ background: "#2E2A26" }} />

            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-[3px] flex items-center justify-center text-lg shrink-0"
                style={{ background: "#161616", border: "1px solid #242424" }}
              >
                💳
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[9px] tracking-[0.14em] mb-1" style={{ color: "#6B6560" }}>
                  INTERCEPTED
                </p>
                <p className="font-display font-bold text-ink text-base truncate">{result.merchant}</p>
                <p className="font-mono text-2xl font-bold" style={{ color: "#FF3B3B" }}>
                  ${result.amount.toLocaleString()}
                </p>
              </div>
              <span
                className="font-mono text-[9px] px-2 py-1 rounded-[2px] tracking-[0.1em] shrink-0"
                style={{ background: "#161616", border: "1px solid #242424", color: "#6B6560" }}
              >
                {result.category.toUpperCase()}
              </span>
            </div>

            {result.budget_status && (
              <div className="mb-4 p-3 rounded-[3px]" style={{ background: "#0A0A0A", border: "1px solid #242424" }}>
                <div className="flex justify-between font-mono text-[10px] mb-2">
                  <span style={{ color: "#6B6560" }}>{result.budget_status.period.toUpperCase()} LIMIT</span>
                  <span style={{ color: budgetPct >= 90 ? "#FF3B3B" : "#FFB800" }}>
                    ${result.budget_status.spent} / ${result.budget_status.limit}
                  </span>
                </div>
                <ProgressBar
                  value={budgetPct}
                  max={100}
                  color={budgetPct >= 90 ? "#FF3B3B" : "#FFB800"}
                  height="4px"
                />
                <p className="font-mono text-[10px] mt-2" style={{ color: "#6B6560" }}>
                  ${result.budget_status.remaining.toFixed(0)} left this {result.budget_status.period}
                </p>
              </div>
            )}

            {result.goal_impact && (
              <div
                className="mb-5 p-3 rounded-[3px] flex items-center gap-2"
                style={{ background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)" }}
              >
                <span className="text-base">📅</span>
                <p className="font-mono text-[11px]" style={{ color: "#FF3B3B" }}>
                  <span className="font-bold">{result.goal_impact.goal_name}</span> shifts back{" "}
                  <span className="font-bold">{result.goal_impact.days} days</span>
                </p>
              </div>
            )}

            {result.show_alternatives ? (
              <div className="space-y-2">
                <button
                  onClick={onProceed}
                  className="btn-primary w-full py-4 text-sm font-display font-bold tracking-wide glow-primary"
                >
                  See Smarter Options →
                </button>
                <button
                  onClick={onPause}
                  className="btn-ghost w-full py-3 text-sm"
                >
                  Pause — I&apos;ll think (+25 XP)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onPause}
                  className="py-4 flex flex-col items-center gap-1 transition-all rounded-[3px]"
                  style={{ background: "rgba(34,255,136,0.06)", border: "1px solid rgba(34,255,136,0.2)", color: "#22FF88" }}
                >
                  <span className="font-mono text-base">⏸</span>
                  <span className="font-display font-bold text-xs">Pause</span>
                  <span className="font-mono text-[9px] text-ink-muted">+25 XP</span>
                </button>
                <button
                  onClick={onProceed}
                  className="py-4 flex flex-col items-center gap-1 transition-all rounded-[3px]"
                  style={{ background: "#161616", border: "1px solid #242424", color: "#6B6560" }}
                >
                  <span className="font-mono text-base">▶</span>
                  <span className="font-display font-bold text-xs" style={{ color: "#F5F0E8" }}>Proceed</span>
                  {countdown !== null && (
                    <span className="font-mono text-[9px]">auto {countdown}s</span>
                  )}
                </button>
                <button
                  onClick={onAdjust}
                  className="py-4 flex flex-col items-center gap-1 transition-all rounded-[3px]"
                  style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.2)", color: "#FFB800" }}
                >
                  <span className="font-mono text-base">⚙</span>
                  <span className="font-display font-bold text-xs">Adjust</span>
                  <span className="font-mono text-[9px] text-ink-muted">+20 XP</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
