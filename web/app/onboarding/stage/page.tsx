"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { STAGES, STAGE_XP } from "@/constants/stages";
import ProgressBar from "@/components/ProgressBar";
import RiskBadge from "@/components/RiskBadge";

const STARTER_HABITS = [
  { name: "No-Spend Check-In", desc: "Flag one thing you could skip today.", duration: "10s", xp: 10 },
  { name: "Bill Forecast", desc: "Check what bills are due this week.", duration: "30s", xp: 10 },
  { name: "One Win Today", desc: "Name one financial move you made.", duration: "45s", xp: 10 },
];

function StageRevealContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);

  const userId = params.get("userId") || "user_marcus_001";
  const stage = params.get("stage") || "Credit Builder";
  const topRisk = params.get("topRisk") || "high credit utilization";
  const riskLevel = params.get("riskLevel") || "moderate";

  const stageInfo = STAGES[stage] ?? STAGES["Credit Builder"];
  const xpNeeded = STAGE_XP[stage] ?? 500;

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.25 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

  return (
    <main className="min-h-screen bg-bg px-5 pt-8 pb-32 overflow-y-auto">
      {visible && (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto">

          {/* Stage unlock */}
          <motion.div variants={item} className="text-center mb-8">
            <p className="font-mono text-[9px] tracking-[0.2em] mb-4" style={{ color: "#3A3530" }}>
              STAGE UNLOCKED
            </p>
            <div className="relative inline-block mb-4">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ background: stageInfo.color }}
              />
              <div className="relative fox-float">
                <Image src="/fox-main.png" alt="Fort" width={100} height={100} className="object-contain" />
              </div>
            </div>
            <motion.div
              className="text-6xl mb-3 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ filter: `drop-shadow(0 0 16px ${stageInfo.color}80)` }}
            >
              {stageInfo.emoji}
            </motion.div>
            <h1 className="font-display font-bold text-3xl text-ink mb-2">{stageInfo.name}</h1>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#6B6560" }}>
              {stageInfo.description}
            </p>
          </motion.div>

          <motion.div variants={item} className="flex justify-center mb-6">
            <RiskBadge level={riskLevel} label={`Top risk: ${topRisk}`} />
          </motion.div>

          {/* XP bar */}
          <motion.div variants={item} className="card p-4 mb-5">
            <div className="flex justify-between font-mono text-[10px] mb-3" style={{ color: "#6B6560" }}>
              <span>XP PROGRESS</span>
              <span>0 / {xpNeeded} TO NEXT STAGE</span>
            </div>
            <ProgressBar value={0} max={xpNeeded} color="#FF6B2B" height="6px" />
            <p className="font-mono text-[10px] mt-2" style={{ color: "#3A3530" }}>
              Every habit, tap check, and goal move earns XP.
            </p>
          </motion.div>

          {/* Starter habits */}
          <motion.div variants={item} className="mb-8">
            <p className="font-mono text-[9px] tracking-[0.14em] mb-3" style={{ color: "#3A3530" }}>
              YOUR FIRST 3 BUILDS
            </p>
            <div className="space-y-2">
              {STARTER_HABITS.map((h, i) => (
                <motion.div
                  key={h.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.15 }}
                  className="card p-3 flex items-center gap-3"
                  style={{ borderLeft: "2px solid #FF6B2B" }}
                >
                  <div
                    className="w-9 h-9 rounded-[3px] flex items-center justify-center text-base shrink-0"
                    style={{ background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)" }}
                  >
                    {["✓", "◎", "◈"][i]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-ink">{h.name}</p>
                    <p className="text-xs truncate" style={{ color: "#6B6560" }}>{h.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-[9px]" style={{ color: "#6B6560" }}>{h.duration}</span>
                    <span className="font-mono text-[10px] font-semibold" style={{ color: "#FFD60A" }}>+{h.xp} XP</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.button
            variants={item}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (userId) localStorage.setItem("fortifi_user_id", userId);
              router.push("/dashboard");
            }}
            className="btn-primary w-full py-4 font-display font-bold text-base tracking-wide glow-primary"
          >
            Fortress set. Let&apos;s move →
          </motion.button>
        </motion.div>
      )}
    </main>
  );
}

export default function StageRevealPage() {
  return <Suspense><StageRevealContent /></Suspense>;
}
