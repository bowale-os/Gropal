"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import Navigation from "@/components/Navigation";
import { CardSkeleton } from "@/components/SkeletonLoader";
import type { Squad } from "@/types";

const MARCUS_SQUAD_ID = "squad_grind_001";

const STAGE_COLORS: Record<string, string> = {
  "Income Initiate":          "#22FF88",
  "Credit Builder":           "#FF6B2B",
  "Stability Architect":      "#FFB800",
  "Wealth Foundation Builder":"#A78BFA",
  "Independent Operator":     "#F472B6",
};

export default function SquadPage() {
  const { squad, setSquad } = useGropalStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.getSquad(MARCUS_SQUAD_ID) as Squad;
      setSquad(res);
    } catch {} finally { setLoading(false); }
  }, [setSquad]);

  useEffect(() => { load(); }, [load]);

  const copyInvite = () => {
    if (!squad) return;
    navigator.clipboard.writeText(`Join my Fortify squad: ${squad.join_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-bg pb-24 px-4 pt-6">

      {/* Header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[0.18em] mb-1" style={{ color: "#3A3530" }}>ACCOUNTABILITY GRID</p>
        <h1 className="font-display font-bold text-2xl text-ink">Squad</h1>
        <p className="text-xs mt-0.5" style={{ color: "#6B6560" }}>Accountability without comparison.</p>
      </div>

      {loading ? (
        <> <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> </>
      ) : squad ? (
        <>
          {/* Squad card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card p-4 mb-4" style={{ borderTop: "2px solid #FF6B2B" }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-display font-bold text-lg text-ink">{squad.name}</p>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: "#6B6560" }}>
                  {squad.members.length} MEMBERS
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-2xl" style={{ color: "#FFD60A" }}>
                  {squad.weekly_xp.toLocaleString()}
                </p>
                <p className="font-mono text-[9px]" style={{ color: "#6B6560" }}>WEEKLY XP</p>
              </div>
            </div>
            <div className="px-3 py-2 rounded-[2px] flex items-center justify-between"
              style={{ background: "rgba(255,107,43,0.06)", border: "1px solid rgba(255,107,43,0.15)" }}>
              <span className="font-mono text-[10px]" style={{ color: "#6B6560" }}>
                TOP {100 - (squad.percentile ?? 72)}% OF SQUADS
              </span>
              <span className="font-mono font-bold text-sm" style={{ color: "#FF6B2B" }}>
                #{squad.percentile ?? 72}
              </span>
            </div>
          </motion.div>

          {/* Members */}
          <p className="font-mono text-[9px] tracking-[0.14em] mb-3" style={{ color: "#3A3530" }}>MEMBERS</p>
          <div className="space-y-2 mb-5">
            {squad.members.map((m, i) => {
              const stageColor = STAGE_COLORS[m.stage] ?? "#FF6B2B";
              return (
                <motion.div key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="card p-3 flex items-center gap-3"
                  style={{ borderLeft: `2px solid ${stageColor}` }}>
                  <div className="w-9 h-9 rounded-[2px] flex items-center justify-center font-display font-bold text-sm shrink-0"
                    style={{ background: `${stageColor}15`, color: stageColor }}>
                    {m.display_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-ink">{m.display_name}</p>
                      {m.recent_achievement && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-[2px] tracking-wide"
                          style={{ background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)", color: "#FF6B2B" }}>
                          {m.recent_achievement}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[9px] tracking-wide mt-0.5" style={{ color: stageColor }}>
                      {m.stage.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm" style={{ color: "#FFD60A" }}>+{m.weekly_xp} XP</p>
                    <p className="font-mono text-[9px] mt-0.5" style={{ color: "#6B6560" }}>{m.streak_days}d streak</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Invite */}
          <button onClick={copyInvite}
            className="w-full py-3.5 font-mono text-[11px] tracking-widest transition-all rounded-[3px]"
            style={{
              background: copied ? "rgba(34,255,136,0.08)" : "transparent",
              border: `1px solid ${copied ? "rgba(34,255,136,0.3)" : "#242424"}`,
              color: copied ? "#22FF88" : "#6B6560",
            }}>
            {copied ? "✓ COPIED TO CLIPBOARD" : `INVITE CODE: ${squad.join_code}`}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center mb-4 fox-float">
            <Image src="/fox-shield.png" alt="Fort" width={96} height={96} className="object-contain" />
          </div>
          <div className="card p-5 text-center">
            <p className="font-display font-bold text-base text-ink mb-2">Join a Squad</p>
            <p className="text-sm mb-4" style={{ color: "#6B6560" }}>Enter a code from a friend to join their squad.</p>
            <input
              className="w-full px-4 py-3 text-center font-mono text-xl tracking-[0.25em] outline-none rounded-[3px] mb-3 bg-bg"
              style={{ border: "1px solid #242424", color: "#F5F0E8" }}
              placeholder="XXXXXX"
              maxLength={6}
            />
            <button className="btn-primary w-full py-3 text-sm font-display font-bold">Join Squad →</button>
          </div>
          <div className="card p-5 text-center">
            <p className="font-display font-bold text-base text-ink mb-2">Create a Squad</p>
            <p className="text-sm mb-4" style={{ color: "#6B6560" }}>Start a squad and invite your people.</p>
            <button className="btn-ghost w-full py-3 text-sm">Create Squad</button>
          </div>
        </div>
      )}

      <Navigation />
    </main>
  );
}
