"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { STAGES, STAGE_XP } from "@/constants/stages";
import ProgressBar from "@/components/ProgressBar";
import RiskBadge from "@/components/RiskBadge";

const STARTER_HABITS = [
  { name: "No-Spend Check-In", desc: "Flag one thing you could skip today.", duration: "10 sec", xp: 10 },
  { name: "Bill Forecast", desc: "Check what bills are due this week.", duration: "30 sec", xp: 10 },
  { name: "One Thing I Learned", desc: "Name one financial move you made today.", duration: "45 sec", xp: 10 },
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

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.3 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main
      className="min-h-screen px-5 py-10 pb-32 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #060D1A 0%, #0A1628 100%)" }}
    >
      {visible && (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto">
          {/* Fort the Fox + stage emoji */}
          <motion.div variants={item} className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="fox-float">
                <Image src="/mascot.png" alt="Fort the Fox" width={72} height={72} />
              </div>
            </div>
            <motion.div
              className="text-7xl mb-4 inline-block"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 20px ${stageInfo.color}66)` }}
            >
              {stageInfo.emoji}
            </motion.div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: stageInfo.color }}>
              Your Stage
            </p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "#EEF4FF" }}>{stageInfo.name}</h1>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "#7B9CC4" }}>{stageInfo.description}</p>
          </motion.div>

          <motion.div variants={item} className="mb-6">
            <RiskBadge level={riskLevel} label={`Top risk: ${topRisk}`} />
          </motion.div>

          {/* XP progress */}
          <motion.div
            variants={item}
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
          >
            <div className="flex justify-between text-sm mb-3">
              <span style={{ color: "#7B9CC4" }}>XP Progress</span>
              <span className="font-semibold" style={{ color: "#EEF4FF" }}>0 / {xpNeeded} to next stage</span>
            </div>
            <ProgressBar value={0} max={xpNeeded} color="#2563EB" height="10px" />
            <p className="text-xs mt-2" style={{ color: "#7B9CC4" }}>
              Every habit, tap check, and goal move earns XP.
            </p>
          </motion.div>

          {/* Starter habits */}
          <motion.div variants={item} className="mb-8">
            <p className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "#7B9CC4" }}>
              Your First 3 Builds
            </p>
            <div className="space-y-3">
              {STARTER_HABITS.map((h, i) => (
                <motion.div
                  key={h.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.2 }}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: "rgba(37,99,235,0.12)" }}
                  >
                    {["✅", "📋", "💡"][i]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#EEF4FF" }}>{h.name}</p>
                    <p className="text-xs truncate" style={{ color: "#7B9CC4" }}>{h.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#1A2F50", color: "#7B9CC4" }}
                    >
                      {h.duration}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "#2563EB" }}>+{h.xp} XP</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.button
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (userId) {
                localStorage.setItem("fortifi_user_id", userId);
              }
              router.push("/dashboard");
            }}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all glow-primary"
            style={{ background: "#2563EB", color: "#fff" }}
          >
            Your fortress is set. Let&apos;s move. 🚀
          </motion.button>
        </motion.div>
      )}
    </main>
  );
}

export default function StageRevealPage() {
  return (
    <Suspense>
      <StageRevealContent />
    </Suspense>
  );
}
