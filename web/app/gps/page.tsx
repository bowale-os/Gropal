"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import Navigation from "@/components/Navigation";
import GoalCard from "@/components/GoalCard";
import { GoalCardSkeleton } from "@/components/SkeletonLoader";
import type { Goal } from "@/types";

const MARCUS_ID = "user_marcus_001";

export default function GPSPage() {
  const { goals, setGoals } = useGropalStore();
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("fortifi_user_id") || localStorage.getItem("gropal_user_id") || MARCUS_ID
      : MARCUS_ID;

  const load = useCallback(async () => {
    try {
      const res = await api.getGoals(userId) as { goals: Goal[] };
      setGoals(res.goals);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {} finally {
      setLoading(false);
    }
  }, [userId, setGoals]);

  useEffect(() => { load(); }, [load]);

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.recalculateGoals(userId) as { goals: Goal[]; rebalance_summary?: string };
      setGoals(res.goals);
      setSummary(res.rebalance_summary ?? null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {} finally {
      setRecalculating(false);
    }
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-6" style={{ background: "#060D1A" }}>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEF4FF]">Your Routes</h1>
          {lastUpdated && <p className="text-xs text-[#7B9CC4]">Updated {lastUpdated}</p>}
        </div>
        <button
          onClick={recalculate}
          disabled={recalculating}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: "#1A2F50", color: "#2563EB" }}
        >
          {recalculating ? "Recalculating..." : "↻ Recalculate"}
        </button>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", color: "#7B9CC4" }}
        >
          {summary}
        </motion.div>
      )}

      {loading ? (
        <>
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </>
      ) : goals.length > 0 ? (
        goals.map((g) => <GoalCard key={g.id} goal={g} />)
      ) : (
        <div className="text-center py-16">
          <p className="text-[#7B9CC4] mb-2">No goals yet.</p>
          <p className="text-sm text-[#6B7280]">Add your first goal to start your GPS.</p>
        </div>
      )}

      <Navigation />
    </main>
  );
}
