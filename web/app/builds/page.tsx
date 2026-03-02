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
  awareness: "👁️",
  planning: "📋",
  growth: "💡",
  credit: "💳",
  savings: "🏦",
  default: "⚡",
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
      setHabits(res.habits);
      setStreakDays(res.streak_days);
      setStreakMessage(res.streak_message);
    } catch {} finally {
      setLoading(false);
    }
  }, [userId, setHabits]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (habit: Habit) => {
    if (habit.completed_today || completing) return;
    setCompleting(habit.id);
    try {
      const res = await api.completeHabit(userId, habit.id) as { xp_earned: number };
      completeHabit(habit.id);
      if (res.xp_earned > 0) {
        setXpToast({ xp: res.xp_earned, name: habit.name });
        setTimeout(() => setXpToast(null), 2500);
      }
    } catch {} finally {
      setCompleting(null);
    }
  };

  const activeHabits = habits.filter((h) => h.is_active);
  const lockedHabits = habits.filter((h) => !h.is_active);
  const allDoneToday = activeHabits.length > 0 && activeHabits.every((h) => h.completed_today);

  return (
    <main className="min-h-screen pb-24 px-4 pt-6" style={{ background: "#060D1A" }}>
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-4 right-4 z-50 rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{ background: "#0C1829", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="text-xl">⚡</span>
            <span className="font-semibold text-[#EEF4FF]">{xpToast.name} — +{xpToast.xp} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold text-[#EEF4FF] mb-1">Daily Builds</h1>
      <p className="text-sm text-[#7B9CC4] mb-5">Small habits that compound over time.</p>

      <div
        className="rounded-2xl p-4 mb-5 flex items-center gap-4"
        style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
      >
        <span className="text-4xl">🔥</span>
        <div>
          <p className="text-2xl font-bold text-[#EEF4FF]">{streakDays}-day streak</p>
          <p className="text-xs text-[#7B9CC4]">{streakMessage}</p>
        </div>
      </div>

      {allDoneToday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 mb-5 text-center"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <p className="text-lg font-bold" style={{ color: "#22C55E" }}>🎉 All done for today!</p>
          <p className="text-xs text-[#7B9CC4] mt-1">Come back tomorrow to keep your streak alive.</p>
        </motion.div>
      )}

      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : (
        <>
          {activeHabits.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#7B9CC4] uppercase tracking-wide mb-3">Today&apos;s Builds</p>
              <div className="space-y-3">
                {activeHabits.map((h) => (
                  <motion.div
                    key={h.id}
                    layout
                    className="rounded-2xl p-4 flex items-center gap-4"
                    style={{
                      background: h.completed_today ? "rgba(34,197,94,0.05)" : "#0C1829",
                      border: `1px solid ${h.completed_today ? "rgba(34,197,94,0.2)" : "#1A2F50"}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: "#1A2F50" }}
                    >
                      {CATEGORY_ICONS[h.category] ?? CATEGORY_ICONS.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#EEF4FF] text-sm">{h.name}</p>
                      <p className="text-xs text-[#7B9CC4] truncate">{h.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#7B9CC4]">{h.duration_seconds}s</span>
                        <span className="text-xs text-[#7B9CC4]">·</span>
                        <span className="text-xs text-[#7B9CC4]">🔥 {h.streak} day streak</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <XPBadge xp={h.xp_reward} />
                      <button
                        onClick={() => handleComplete(h)}
                        disabled={h.completed_today || completing === h.id}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all disabled:cursor-default"
                        style={
                          h.completed_today
                            ? { background: "rgba(34,197,94,0.2)", color: "#22C55E" }
                            : { background: "#2563EB", color: "#fff" }
                        }
                      >
                        {completing === h.id ? "⏳" : h.completed_today ? "✓" : "→"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lockedHabits.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#7B9CC4] uppercase tracking-wide mb-3">Locked</p>
              <div className="space-y-2">
                {lockedHabits.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-2xl p-4 flex items-center gap-3 opacity-40"
                    style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
                  >
                    <span className="text-lg">🔒</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#EEF4FF] text-sm">{h.name}</p>
                      <p className="text-xs text-[#7B9CC4]">Unlocks at {h.stage_required}</p>
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
