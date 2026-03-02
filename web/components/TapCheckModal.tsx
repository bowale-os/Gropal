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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          <div className="p-6">
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#1A2F50" }} />

            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#1A2F50" }}
              >
                💳
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ color: "#EEF4FF" }}>{result.merchant}</p>
                <p className="text-2xl font-bold" style={{ color: "#EF4444" }}>
                  ${result.amount.toLocaleString()}
                </p>
              </div>
              <span
                className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(123,156,196,0.1)", color: "#7B9CC4" }}
              >
                {result.category}
              </span>
            </div>

            {result.budget_status && (
              <div className="mb-4 p-4 rounded-2xl" style={{ background: "#060D1A" }}>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#7B9CC4" }}>{result.budget_status.period} {result.category} limit</span>
                  <span className="font-semibold" style={{ color: budgetPct >= 90 ? "#EF4444" : "#F59E0B" }}>
                    ${result.budget_status.spent} / ${result.budget_status.limit}
                  </span>
                </div>
                <ProgressBar
                  value={budgetPct}
                  max={100}
                  color={budgetPct >= 90 ? "#EF4444" : "#F59E0B"}
                  height="6px"
                />
                <p className="text-xs mt-2" style={{ color: "#7B9CC4" }}>
                  ${result.budget_status.remaining.toFixed(0)} remaining this {result.budget_status.period}
                </p>
              </div>
            )}

            {result.goal_impact && (
              <div
                className="mb-5 p-3 rounded-xl flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <span>📅</span>
                <p className="text-sm" style={{ color: "#EF4444" }}>
                  <span className="font-semibold">{result.goal_impact.goal_name}</span> shifts back{" "}
                  <span className="font-bold">{result.goal_impact.days} days</span>
                </p>
              </div>
            )}

            {result.show_alternatives ? (
              <div className="space-y-3">
                <button
                  onClick={onProceed}
                  className="w-full py-4 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 glow-primary"
                  style={{ background: "#2563EB", color: "#fff" }}
                >
                  See Smarter Options ✨
                </button>
                <button
                  onClick={onPause}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: "#1A2F50", color: "#7B9CC4", border: "1px solid #1A2F50" }}
                >
                  Pause — I&apos;ll think about it (+25 XP)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onPause}
                  className="py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 transition-all hover:opacity-90"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <span className="text-lg">⏸️</span>
                  <span>Pause</span>
                  <span className="text-[10px]">+25 XP</span>
                </button>
                <button
                  onClick={onProceed}
                  className="py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 transition-all hover:opacity-90"
                  style={{ background: "#1A2F50", color: "#7B9CC4" }}
                >
                  <span className="text-lg">▶️</span>
                  <span>Proceed</span>
                  {countdown !== null && (
                    <span className="text-[10px]">auto in {countdown}s</span>
                  )}
                </button>
                <button
                  onClick={onAdjust}
                  className="py-4 rounded-2xl font-semibold text-sm flex flex-col items-center gap-1 transition-all hover:opacity-90"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <span className="text-lg">⚙️</span>
                  <span>Adjust</span>
                  <span className="text-[10px]">+20 XP</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
