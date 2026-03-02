"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import type { TapCheckResponse } from "@/types";
import Navigation from "@/components/Navigation";
import GoalCard from "@/components/GoalCard";
import TapCheckModal from "@/components/TapCheckModal";
import ProgressBar from "@/components/ProgressBar";
import { GoalCardSkeleton, Skeleton } from "@/components/SkeletonLoader";
import { STAGES, STAGE_XP } from "@/constants/stages";

const MARCUS_ID = "user_marcus_001";

const TAP_SCENARIOS = [
  { merchant: "DoorDash", amount: 30, category: "food_delivery" },
  { merchant: "ZARA", amount: 120, category: "clothing" },
  { merchant: "CarMax", amount: 18000, category: "transport" },
  { merchant: "Amazon", amount: 250, category: "other" },
];

const QUICK_QUESTIONS = ["Can I afford this?", "How am I doing?", "What should I focus on?"];

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
  return `${time}, ${name}`;
}

function AskFortVoiceCard() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [noVoice, setNoVoice] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startVoice = useCallback(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
        : null;
    if (!SR) { setNoVoice(true); router.push("/ask"); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map((res) => res[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) { setIsListening(false); router.push(`/ask?q=${encodeURIComponent(t)}`); }
    };
    r.onerror = () => { setIsListening(false); setTranscript(""); };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start(); setIsListening(true); setTranscript("");
  }, [router]);

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const MIC_SIZE = 72;

  return (
    <div className="card p-4" style={{ borderColor: "rgba(255,107,43,0.2)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[2px] overflow-hidden flex items-center justify-center"
            style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)" }}>
            <Image src="/fox.png" alt="Fort" width={22} height={22} className="object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-ink">Ask Fort</span>
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-[2px]"
          style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)", color: "#FF6B2B" }}>
          AI
        </span>
      </div>

      <div className="flex flex-col items-center py-3">
        <div className="relative flex items-center justify-center mb-4">
          {isListening && (
            <>
              <span className="sonar-ring sonar-ring-1" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
              <span className="sonar-ring sonar-ring-2" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
              <span className="sonar-ring sonar-ring-3" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
            </>
          )}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={isListening ? stopVoice : startVoice}
            className={`relative z-10 rounded-full flex items-center justify-center text-2xl transition-all ${!isListening ? "mic-idle" : ""}`}
            style={{
              width: MIC_SIZE, height: MIC_SIZE,
              background: isListening ? "rgba(255,59,59,0.12)" : "rgba(255,107,43,0.1)",
              border: isListening ? "2px solid rgba(255,59,59,0.4)" : "2px solid rgba(255,107,43,0.3)",
            }}
          >
            {isListening ? "⏹" : "🎤"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div key="l" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <p className="font-mono text-[11px] tracking-widest mb-1" style={{ color: "#FF3B3B" }}>LISTENING</p>
              {transcript && <p className="text-xs italic max-w-[200px] transcript-in" style={{ color: "#6B6560" }}>&ldquo;{transcript}&rdquo;</p>}
            </motion.div>
          ) : (
            <motion.p key="i" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="font-mono text-[11px] tracking-widest" style={{ color: "#6B6560" }}>
              {noVoice ? "TAP TO CHAT" : "TAP TO SPEAK"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {!isListening && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => router.push(`/ask?q=${encodeURIComponent(q)}`)}
              className="font-mono text-[10px] px-3 py-1.5 rounded-[2px] transition-all hover:border-primary hover:text-primary"
              style={{ background: "transparent", border: "1px solid #242424", color: "#6B6560" }}>
              {q}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, goals, setUser, setGoals } = useGropalStore();
  const [loading, setLoading] = useState(true);
  const [xpToast, setXpToast] = useState<{ amount: number; message: string } | null>(null);
  const [tapScenarioOpen, setTapScenarioOpen] = useState(false);
  const [tapCheckResult, setTapCheckResult] = useState<TapCheckResponse | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<(typeof TAP_SCENARIOS)[0] | null>(null);
  const [tapLoading, setTapLoading] = useState(false);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("fortifi_user_id") || localStorage.getItem("gropal_user_id") || MARCUS_ID
      : MARCUS_ID;

  const load = useCallback(async () => {
    try {
      const [u, g] = await Promise.all([
        api.getUser(userId) as Promise<Parameters<typeof setUser>[0]>,
        api.getGoals(userId) as Promise<{ goals: Parameters<typeof setGoals>[0] }>,
      ]);
      setUser(u); setGoals(g.goals);
    } catch {}
    finally { setLoading(false); }
  }, [userId, setUser, setGoals]);

  useEffect(() => { load(); }, [load]);

  const showToast = (amount: number, message: string) => {
    setXpToast({ amount, message });
    setTimeout(() => setXpToast(null), 3000);
  };

  const handleTapScenario = async (scenario: (typeof TAP_SCENARIOS)[0]) => {
    setSelectedScenario(scenario); setTapScenarioOpen(false); setTapLoading(true);
    try {
      const result = await api.tapCheck({ user_id: userId, ...scenario }) as TapCheckResponse;
      if (!result.should_intercept) showToast(0, "✓ Within budget. No goal impact.");
      else setTapCheckResult(result);
    } catch { showToast(0, "Tap Check unavailable."); }
    finally { setTapLoading(false); }
  };

  const handlePause = async () => {
    if (!tapCheckResult) return;
    try {
      const res = await api.tapCheckResolve({
        user_id: userId, transaction_id: `tx_${Date.now()}`, decision: "paused",
        merchant: tapCheckResult.merchant, amount: tapCheckResult.amount,
        category: tapCheckResult.category, goal_impact_days: tapCheckResult.goal_impact?.days ?? 0,
      }) as { xp_earned: number };
      setTapCheckResult(null); showToast(res.xp_earned, `Smart pause. +${res.xp_earned} XP`);
    } catch { setTapCheckResult(null); }
  };

  const handleProceed = async () => {
    if (!tapCheckResult) return;
    if (tapCheckResult.show_alternatives) {
      router.push(`/alternatives?merchant=${encodeURIComponent(tapCheckResult.merchant)}&amount=${tapCheckResult.amount}&category=${tapCheckResult.category}&userId=${userId}`);
      setTapCheckResult(null); return;
    }
    try { await api.tapCheckResolve({ user_id: userId, transaction_id: `tx_${Date.now()}`, decision: "proceeded", merchant: tapCheckResult.merchant, amount: tapCheckResult.amount, category: tapCheckResult.category, goal_impact_days: tapCheckResult.goal_impact?.days ?? 0 }); } catch {}
    setTapCheckResult(null);
  };

  const handleAdjust = async () => {
    if (!tapCheckResult) return;
    try {
      const res = await api.tapCheckResolve({ user_id: userId, transaction_id: `tx_${Date.now()}`, decision: "adjusted", merchant: tapCheckResult.merchant, amount: tapCheckResult.amount, category: tapCheckResult.category, goal_impact_days: 0 }) as { xp_earned: number };
      setTapCheckResult(null); showToast(res.xp_earned, `Limit updated. +${res.xp_earned} XP`);
    } catch { setTapCheckResult(null); }
  };

  const stageInfo = STAGES[user?.stage ?? "Credit Builder"] ?? STAGES["Credit Builder"];
  const xpTotal = STAGE_XP[user?.stage ?? "Credit Builder"] ?? 500;
  const xpPct = user ? Math.min((user.xp / xpTotal) * 100, 100) : 0;

  return (
    <main className="min-h-screen bg-bg pb-24 px-4 pt-6">

      {/* XP Toast */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 left-4 right-4 z-50 px-4 py-3 flex items-center gap-3 rounded-[3px]"
            style={{ background: "#0E0E0E", border: "1px solid rgba(34,255,136,0.3)", borderLeft: "3px solid #22FF88" }}
          >
            <span className="font-mono text-lg" style={{ color: "#FFD60A" }}>▲</span>
            <span className="font-display font-bold text-sm text-ink">{xpToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 mb-1" />
          <Skeleton className="h-3 w-24 mb-5" />
          <Skeleton className="h-24" />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      ) : (
        <>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] tracking-[0.18em] mb-1" style={{ color: "#3A3530" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()}
                </p>
                <h1 className="font-display font-bold text-2xl text-ink">
                  {user ? getGreeting(user.name) : "Good morning"}
                </h1>
              </div>
              <Image src="/fox-main.png" alt="Fort" width={44} height={44} className="object-contain" />
            </div>
          </motion.div>

          {/* Stage + Streak row */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="grid grid-cols-2 gap-3 mb-4"
            >
              {/* Stage */}
              <div className="card p-3" style={{ borderLeft: `2px solid ${stageInfo.color}` }}>
                <p className="font-mono text-[8px] tracking-widest mb-1" style={{ color: "#3A3530" }}>STAGE</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{stageInfo.emoji}</span>
                  <p className="font-display font-bold text-xs text-ink leading-tight truncate">{user.stage}</p>
                </div>
                <ProgressBar value={xpPct} max={100} color={stageInfo.color} height="3px" />
                <p className="font-mono text-[9px] mt-1" style={{ color: "#6B6560" }}>{user.xp_to_next} XP left</p>
              </div>
              {/* Streak */}
              <div className="card p-3" style={{ borderLeft: "2px solid #FFD60A" }}>
                <p className="font-mono text-[8px] tracking-widest mb-1" style={{ color: "#3A3530" }}>STREAK</p>
                <p className="font-display font-bold text-2xl" style={{ color: "#FFD60A" }}>{user.streak_days}d</p>
                <p className="font-mono text-[9px] mt-1" style={{ color: "#6B6560" }}>
                  {user.streak_days < 14 ? `${14 - user.streak_days}d to milestone` : "Top 20% 🏆"}
                </p>
              </div>
            </motion.div>
          )}

          {/* XP total */}
          {user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
              className="flex items-center justify-between px-4 py-2 mb-5 rounded-[3px]"
              style={{ background: "rgba(255,214,10,0.06)", border: "1px solid rgba(255,214,10,0.15)" }}>
              <span className="font-mono text-[10px] tracking-widest" style={{ color: "#6B6560" }}>TOTAL XP</span>
              <span className="font-mono font-bold text-lg" style={{ color: "#FFD60A" }}>{user.xp.toLocaleString()}</span>
            </motion.div>
          )}

          {/* Goals */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-mono text-[9px] tracking-[0.14em]" style={{ color: "#3A3530" }}>ACTIVE ROUTES</p>
              {goals.length > 0 && (
                <button onClick={() => router.push("/gps")} className="font-mono text-[9px] tracking-widest transition-colors hover:text-primary" style={{ color: "#6B6560" }}>
                  ALL →
                </button>
              )}
            </div>
            {goals.length > 0 ? (
              goals.slice(0, 2).map((goal) => <GoalCard key={goal.id} goal={goal} />)
            ) : (
              <div className="card p-5 text-center">
                <div className="flex justify-center mb-3 fox-float">
                  <Image src="/fox-chart.png" alt="Fort" width={72} height={72} className="object-contain" />
                </div>
                <h3 className="font-display font-bold text-base text-ink mb-1">No routes yet</h3>
                <p className="text-xs mb-4" style={{ color: "#6B6560" }}>Tell me your goal — I&apos;ll build you a route.</p>
                <button onClick={() => router.push("/gps")} className="btn-primary w-full py-3 text-sm font-display font-bold">
                  Build your first route →
                </button>
              </div>
            )}
          </motion.div>

          {/* Ask Fort */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mt-4">
            <AskFortVoiceCard />
          </motion.div>
        </>
      )}

      {/* Tap to Pay FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTapScenarioOpen(true)}
        disabled={tapLoading}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-[3px] flex items-center justify-center text-xl shadow-2xl transition-all glow-primary disabled:opacity-50"
        style={{ background: "#FF6B2B", color: "#080808", zIndex: 40 }}
        title="Simulate tap to pay"
      >
        {tapLoading ? "…" : "💳"}
      </motion.button>

      {/* Tap scenario picker */}
      <AnimatePresence>
        {tapScenarioOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTapScenarioOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg p-5"
              style={{ background: "#0E0E0E", borderTop: "2px solid #FF6B2B", borderLeft: "1px solid #242424", borderRight: "1px solid #242424", borderRadius: "4px 4px 0 0" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div className="w-6 h-[3px] rounded-full mx-auto mb-4" style={{ background: "#2E2A26" }} />
              <p className="font-mono text-[9px] tracking-[0.16em] mb-4" style={{ color: "#6B6560" }}>
                PICK A TAP SCENARIO
              </p>
              <div className="space-y-2">
                {TAP_SCENARIOS.map((s) => (
                  <button key={s.merchant} onClick={() => handleTapScenario(s)}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-[3px] transition-all hover:border-border-warm"
                    style={{ background: "#080808", border: "1px solid #242424" }}>
                    <div className="text-left">
                      <p className="font-display font-semibold text-sm text-ink">{s.merchant}</p>
                      <p className="font-mono text-[9px] tracking-wider mt-0.5" style={{ color: "#6B6560" }}>
                        {s.category.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-base" style={{ color: s.amount > 500 ? "#FF3B3B" : "#F5F0E8" }}>
                      ${s.amount.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {tapCheckResult && (
        <TapCheckModal result={tapCheckResult} onPause={handlePause} onProceed={handleProceed}
          onAdjust={handleAdjust} onClose={() => setTapCheckResult(null)} />
      )}

      <Navigation />
    </main>
  );
}
