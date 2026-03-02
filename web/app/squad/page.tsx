"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import Navigation from "@/components/Navigation";
import { CardSkeleton } from "@/components/SkeletonLoader";
import type { Squad } from "@/types";

const MARCUS_ID = "user_marcus_001";
const MARCUS_SQUAD_ID = "squad_grind_001";

const STAGE_COLORS: Record<string, string> = {
  "Income Initiate": "#22C55E",
  "Credit Builder": "#2563EB",
  "Stability Architect": "#F59E0B",
  "Wealth Foundation Builder": "#8B5CF6",
  "Independent Operator": "#EC4899",
};

export default function SquadPage() {
  const { squad, setSquad } = useGropalStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("fortifi_user_id") || localStorage.getItem("gropal_user_id") || MARCUS_ID
      : MARCUS_ID;

  const load = useCallback(async () => {
    try {
      const res = await api.getSquad(MARCUS_SQUAD_ID) as Squad;
      setSquad(res);
    } catch {} finally {
      setLoading(false);
    }
  }, [setSquad]);

  useEffect(() => { load(); }, [load]);

  const copyInvite = () => {
    if (!squad) return;
    navigator.clipboard.writeText(`Join my Gropal squad with code: ${squad.join_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-6" style={{ background: "#060D1A" }}>
      <h1 className="text-2xl font-bold text-[#EEF4FF] mb-1">Squad</h1>
      <p className="text-sm text-[#7B9CC4] mb-5">Accountability without comparison.</p>

      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : squad ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-4"
            style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg font-bold text-[#EEF4FF]">{squad.name}</h2>
                <p className="text-sm text-[#7B9CC4]">{squad.members.length} members</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: "#2563EB" }}>
                  {squad.weekly_xp.toLocaleString()}
                </p>
                <p className="text-xs text-[#7B9CC4]">weekly XP</p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
              style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}
            >
              <span className="text-xs text-[#7B9CC4]">Top {100 - (squad.percentile ?? 72)}% of squads this week</span>
              <span className="ml-auto font-bold text-xs" style={{ color: "#2563EB" }}>#{squad.percentile ?? 72}</span>
            </div>
          </motion.div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-[#7B9CC4] uppercase tracking-wide mb-3">Members</p>
            <div className="space-y-2">
              {squad.members.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: `${STAGE_COLORS[m.stage] ?? "#2563EB"}20`, color: STAGE_COLORS[m.stage] ?? "#2563EB" }}
                  >
                    {m.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#EEF4FF] text-sm">{m.display_name}</p>
                      {m.recent_achievement && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB" }}>
                          {m.recent_achievement}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: STAGE_COLORS[m.stage] ?? "#7B9CC4" }}>{m.stage}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#EEF4FF]">+{m.weekly_xp} XP</p>
                    <p className="text-xs text-[#7B9CC4]">🔥 {m.streak_days}d</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            onClick={copyInvite}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
            style={{ background: "#1A2F50", color: copied ? "#22C55E" : "#EEF4FF", border: "1px solid #1A2F50" }}
          >
            {copied ? "✓ Copied to clipboard!" : `Invite a friend — Code: ${squad.join_code}`}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl p-6 text-center" style={{ background: "#0C1829", border: "1px solid #1A2F50" }}>
            <p className="text-lg font-bold text-[#EEF4FF] mb-2">Join a Squad</p>
            <p className="text-sm text-[#7B9CC4] mb-4">Enter a code from a friend to join their squad.</p>
            <input
              className="w-full rounded-xl px-4 py-3 text-[#EEF4FF] outline-none text-center font-mono text-xl tracking-widest mb-3"
              style={{ background: "#060D1A", border: "1px solid #1A2F50" }}
              placeholder="ENTER CODE"
              maxLength={6}
            />
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#2563EB", color: "#fff" }}
            >
              Join Squad
            </button>
          </div>
          <div className="rounded-2xl p-6 text-center" style={{ background: "#0C1829", border: "1px solid #1A2F50" }}>
            <p className="text-base font-bold text-[#EEF4FF] mb-2">Create a Squad</p>
            <p className="text-sm text-[#7B9CC4] mb-4">Start a squad and invite your people.</p>
            <button
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#1A2F50", color: "#2563EB", border: "1px solid rgba(37,99,235,0.3)" }}
            >
              Create Squad
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </main>
  );
}
