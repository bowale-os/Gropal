"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
    } catch {} finally { setLoading(false); }
  }, [userId, setGoals]);

  useEffect(() => { load(); }, [load]);

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.recalculateGoals(userId) as { goals: Goal[]; rebalance_summary?: string };
      setGoals(res.goals);
      setSummary(res.rebalance_summary ?? null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {} finally { setRecalculating(false); }
  };

  return (
    <main className="min-h-screen bg-bg pb-24 px-4 pt-6">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="font-mono text-[9px] tracking-[0.18em] mb-1" style={{ color: "#3A3530" }}>FINANCIAL GPS</p>
          <h1 className="font-display font-bold text-2xl text-ink">Your Routes</h1>
          {lastUpdated && (
            <p className="font-mono text-[10px] mt-0.5" style={{ color: "#6B6560" }}>
              Updated {lastUpdated}
            </p>
          )}
        </div>
        <button
          onClick={recalculate}
          disabled={recalculating}
          className="font-mono text-[10px] px-3 py-2 rounded-[2px] tracking-wider transition-all disabled:opacity-50"
          style={{
            background: "transparent",
            border: "1px solid #242424",
            color: recalculating ? "#FF6B2B" : "#6B6560",
          }}
        >
          {recalculating ? "RECALC…" : "↻ RECALC"}
        </button>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 rounded-[3px] text-sm"
          style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.2)", color: "#6B6560", borderLeft: "2px solid #FF6B2B" }}
        >
          {summary}
        </motion.div>
      )}

      {loading ? (
        <>
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </>
      ) : goals.length > 0 ? (
        <div>
          {goals.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <GoalCard goal={g} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4 fox-float">
            <Image src="/fox-chart.png" alt="Fort" width={96} height={96} className="object-contain" />
          </div>
          <p className="font-display font-bold text-base text-ink mb-2">No routes yet.</p>
          <p className="text-sm" style={{ color: "#6B6560" }}>Tell Fort what you&apos;re working toward.</p>
        </div>
      )}

      <Navigation />
    </main>
  );
}
