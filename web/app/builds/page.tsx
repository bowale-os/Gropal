"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import Navigation from "@/components/Navigation";
import XPBadge from "@/components/XPBadge";
import { CardSkeleton } from "@/components/SkeletonLoader";
import type { Habit } from "@/types";

const MARCUS_ID = "user_marcus_001";

const CATEGORY_ICONS: Record<string, string> = {
  awareness: "◎",
  planning: "▦",
  growth: "△",
  credit: "◈",
  savings: "◉",
  default: "▲",
};

export default function BuildsPage() {
  const { habits, setHabits, completeHabit } = useGropalStore();
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [streakMessage, setStreakMessage] = useState("");
  const [xpToast, setXpToast] = useState<{ xp: number; name: string } | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("fortifi_user_id") || localStorage.getItem("gropal_user_id") || MARCUS_ID
      : MARCUS_ID;

  const load = useCallback(async () => {
    try {
      const res = await api.getHabits(userId) as { habits: Habit[]; streak_days: number; streak_message: string };
      setHabits(res.habits); setStreakDays(res.streak_days); setStreakMessage(res.streak_message);
    } catch {} finally { setLoading(false); }
  }, [userId, setHabits]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (habit: Habit) => {
    if (habit.completed_today || completing) return;
    setCompleting(habit.id);
    try {
      const res = await api.completeHabit(userId, habit.id) as { xp_earned: number };
      completeHabit(habit.id);
      if (res.xp_earned > 0) { setXpToast({ xp: res.xp_earned, name: habit.name }); setTimeout(() => setXpToast(null), 2500); }
    } catch {} finally { setCompleting(null); }
  };

  const activeHabits = habits.filter((h) => h.is_active);
  const lockedHabits = habits.filter((h) => !h.is_active);
  const allDoneToday = activeHabits.length > 0 && activeHabits.every((h) => h.completed_today);

  return (
    <main className="min-h-screen bg-bg pb-24 px-4 pt-6">

      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 left-4 right-4 z-50 px-4 py-3 flex items-center gap-3 rounded-[3px]"
            style={{ background: "#0E0E0E", border: "1px solid rgba(34,255,136,0.3)", borderLeft: "3px solid #22FF88" }}
          >
            <span className="font-mono font-bold" style={{ color: "#FFD60A" }}>▲</span>
            <span className="font-display font-bold text-sm text-ink">{xpToast.name} — +{xpToast.xp} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[0.18em] mb-1" style={{ color: "#3A3530" }}>HABIT SYSTEM</p>
        <h1 className="font-display font-bold text-2xl text-ink">Daily Builds</h1>
        <p className="text-xs mt-0.5" style={{ color: "#6B6560" }}>Small habits that compound over time.</p>
      </div>

      {/* Streak */}
      <div className="card p-4 mb-4 flex items-center gap-4" style={{ borderLeft: "2px solid #FFD60A" }}>
        <div>
          <p className="font-mono text-[9px] tracking-widest mb-1" style={{ color: "#3A3530" }}>CURRENT STREAK</p>
          <p className="font-display font-bold text-3xl" style={{ color: "#FFD60A" }}>{streakDays}d</p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "#6B6560" }}>{streakMessage || "Keep it up"}</p>
        </div>
        <div className="ml-auto text-4xl" style={{ filter: "drop-shadow(0 0 12px rgba(255,214,10,0.4))" }}>
          {streakDays > 0 ? "🔥" : "◎"}
        </div>
      </div>

      {allDoneToday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 mb-4 text-center rounded-[3px]"
          style={{ background: "rgba(34,255,136,0.06)", border: "1px solid rgba(34,255,136,0.2)" }}
        >
          <p className="font-display font-bold text-base" style={{ color: "#22FF88" }}>All done for today</p>
          <p className="font-mono text-[10px] mt-1" style={{ color: "#6B6560" }}>Come back tomorrow to keep the streak.</p>
        </motion.div>
      )}

      {loading ? (
        <> <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> </>
      ) : (
        <>
          {activeHabits.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-[9px] tracking-[0.14em] mb-3" style={{ color: "#3A3530" }}>TODAY&apos;S BUILDS</p>
              <div className="space-y-2">
                {activeHabits.map((h) => (
                  <motion.div
                    key={h.id} layout
                    className="overflow-hidden rounded-[4px]"
                    style={{
                      background: h.completed_today ? "rgba(34,255,136,0.04)" : "#0E0E0E",
                      border: `1px solid ${h.completed_today ? "rgba(34,255,136,0.15)" : "#242424"}`,
                      borderLeft: `2px solid ${h.completed_today ? "#22FF88" : "#FF6B2B"}`,
                    }}
                  >
                    <div className="p-3 flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-[2px] flex items-center justify-center font-mono font-bold text-base shrink-0"
                        style={{
                          background: h.completed_today ? "rgba(34,255,136,0.1)" : "rgba(255,107,43,0.08)",
                          color: h.completed_today ? "#22FF88" : "#FF6B2B",
                          border: `1px solid ${h.completed_today ? "rgba(34,255,136,0.2)" : "rgba(255,107,43,0.15)"}`,
                        }}
                      >
                        {CATEGORY_ICONS[h.category] ?? CATEGORY_ICONS.default}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-ink">{h.name}</p>
                        <p className="text-xs truncate" style={{ color: "#6B6560" }}>{h.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[9px]" style={{ color: "#6B6560" }}>{h.duration_seconds}s</span>
                          <span style={{ color: "#3A3530" }}>·</span>
                          <span className="font-mono text-[9px]" style={{ color: "#6B6560" }}>
                            {h.streak}d streak
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <XPBadge xp={h.xp_reward} />
                        <button
                          onClick={() => handleComplete(h)}
                          disabled={h.completed_today || completing === h.id}
                          className="w-8 h-8 rounded-[2px] flex items-center justify-center font-mono font-bold text-sm transition-all"
                          style={
                            h.completed_today
                              ? { background: "rgba(34,255,136,0.12)", color: "#22FF88", cursor: "default" }
                              : { background: "#FF6B2B", color: "#080808" }
                          }
                        >
                          {completing === h.id ? "…" : h.completed_today ? "✓" : "→"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lockedHabits.length > 0 && (
            <div>
              <p className="font-mono text-[9px] tracking-[0.14em] mb-3" style={{ color: "#3A3530" }}>LOCKED</p>
              <div className="space-y-2">
                {lockedHabits.map((h) => (
                  <div key={h.id} className="card p-3 flex items-center gap-3 opacity-30">
                    <span className="font-mono text-sm" style={{ color: "#6B6560" }}>⊘</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-sm text-ink">{h.name}</p>
                      <p className="font-mono text-[9px] tracking-wide mt-0.5" style={{ color: "#6B6560" }}>
                        UNLOCKS AT {h.stage_required.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Navigation />
    </main>
  );
}
