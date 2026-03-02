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

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  return `Good ${time}, ${name} 👋`;
}

// ─── Ask Fort Voice Card ─────────────────────────────────────────────────────
// Voice-first: tap the mic → speak → navigates to /ask with transcript
const QUICK_QUESTIONS = [
  "Can I afford this?",
  "How am I doing?",
  "What should I focus on?",
];

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
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
            .webkitSpeechRecognition
        : null;

    if (!SR) {
      setNoVoice(true);
      router.push("/ask");
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results)
        .map((res) => res[0].transcript)
        .join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setIsListening(false);
        router.push(`/ask?q=${encodeURIComponent(t)}`);
      }
    };
    r.onerror = () => { setIsListening(false); setTranscript(""); };
    r.onend   = () => setIsListening(false);

    recognitionRef.current = r;
    r.start();
    setIsListening(true);
    setTranscript("");
  }, [router]);

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const MIC_SIZE = 80; // px — large for Fitts's Law

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(145deg, #0C1829 0%, #0E2040 100%)",
        border: "1px solid rgba(37,99,235,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-base">🦊</span>
        <p className="text-sm font-bold" style={{ color: "#EEF4FF" }}>Ask Fort</p>
        <span className="text-xs ml-auto px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}>
          AI
        </span>
      </div>

      {/* Central mic — the hero CTA */}
      <div className="flex flex-col items-center py-4">
        <div className="relative flex items-center justify-center mb-5">
          {/* Sonar rings — only rendered while listening */}
          {isListening && (
            <>
              <span
                className="sonar-ring sonar-ring-1"
                style={{ width: MIC_SIZE, height: MIC_SIZE }}
              />
              <span
                className="sonar-ring sonar-ring-2"
                style={{ width: MIC_SIZE, height: MIC_SIZE }}
              />
              <span
                className="sonar-ring sonar-ring-3"
                style={{ width: MIC_SIZE, height: MIC_SIZE }}
              />
            </>
          )}

          {/* The mic button itself */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={isListening ? stopVoice : startVoice}
            className={`relative z-10 rounded-full flex items-center justify-center text-3xl transition-all ${
              isListening ? "" : "mic-idle"
            }`}
            style={{
              width: MIC_SIZE,
              height: MIC_SIZE,
              background: isListening
                ? "rgba(239,68,68,0.15)"
                : "rgba(37,99,235,0.18)",
              border: isListening
                ? "2px solid rgba(239,68,68,0.5)"
                : "2px solid rgba(37,99,235,0.45)",
            }}
            aria-label={isListening ? "Stop listening" : "Tap to speak to Fort"}
          >
            {isListening ? "⏹" : "🎤"}
          </motion.button>
        </div>

        {/* State label + live transcript */}
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-center"
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#EF4444" }}>
                Listening…
              </p>
              {transcript && (
                <p
                  className="text-xs italic max-w-[220px] leading-relaxed transcript-in"
                  style={{ color: "#7B9CC4" }}
                >
                  &ldquo;{transcript}&rdquo;
                </p>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm"
              style={{ color: "#7B9CC4" }}
            >
              {noVoice ? "Tap to open Fort" : "Tap and speak to Fort"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quick-question chips — secondary affordance */}
      {!isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => router.push(`/ask?q=${encodeURIComponent(q)}`)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all active:scale-95"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                color: "#60A5FA",
              }}
            >
              {q}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Empty goal state with Fort the Fox ───────────────────────────────────────
// Empty goal state with Fort the Fox
function EmptyGoalState({ onAddGoal }: { onAddGoal: () => void }) {
  const [goalInput, setGoalInput] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl p-6 text-center"
      style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
    >
      <div className="flex justify-center mb-3 fox-float">
        <Image src="/mascot.png" alt="Fort the Fox" width={64} height={64} />
      </div>
      <h3 className="font-bold text-lg mb-1" style={{ color: "#EEF4FF" }}>
        What are you working toward?
      </h3>
      <p className="text-sm mb-5" style={{ color: "#7B9CC4" }}>
        Tell me your goal — anything goes. I&apos;ll build you a route.
      </p>
      <textarea
        rows={2}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-3"
        style={{
          background: "#060D1A",
          border: "1px solid #1A2F50",
          color: "#EEF4FF",
        }}
        placeholder="e.g. Save $3k for an emergency fund, pay off my credit card..."
        value={goalInput}
        onChange={(e) => setGoalInput(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => goalInput.trim() && onAddGoal()}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          Set this goal →
        </button>
        <button
          onClick={onAddGoal}
          className="py-3 px-4 rounded-xl text-sm font-medium"
          style={{ background: "#0C1829", border: "1px solid #1A2F50", color: "#7B9CC4" }}
        >
          Browse
        </button>
      </div>
    </motion.div>
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
      setUser(u);
      setGoals(g.goals);
    } catch {
      // Backend unreachable — demo mode
    } finally {
      setLoading(false);
    }
  }, [userId, setUser, setGoals]);

  useEffect(() => { load(); }, [load]);

  const showToast = (amount: number, message: string) => {
    setXpToast({ amount, message });
    setTimeout(() => setXpToast(null), 3000);
  };

  const handleTapScenario = async (scenario: (typeof TAP_SCENARIOS)[0]) => {
    setSelectedScenario(scenario);
    setTapScenarioOpen(false);
    setTapLoading(true);
    try {
      const result = await api.tapCheck({ user_id: userId, ...scenario }) as TapCheckResponse;
      if (!result.should_intercept) {
        showToast(0, "✓ Within budget. No goal impact.");
      } else {
        setTapCheckResult(result);
      }
    } catch {
      showToast(0, "Tap Check unavailable right now.");
    } finally {
      setTapLoading(false);
    }
  };

  const handlePause = async () => {
    if (!selectedScenario || !tapCheckResult) return;
    try {
      const res = await api.tapCheckResolve({
        user_id: userId,
        transaction_id: `tx_${Date.now()}`,
        decision: "paused",
        merchant: tapCheckResult.merchant,
        amount: tapCheckResult.amount,
        category: tapCheckResult.category,
        goal_impact_days: tapCheckResult.goal_impact?.days ?? 0,
      }) as { xp_earned: number };
      setTapCheckResult(null);
      showToast(res.xp_earned, `Smart pause. +${res.xp_earned} XP`);
    } catch {
      setTapCheckResult(null);
    }
  };

  const handleProceed = async () => {
    if (!tapCheckResult) return;
    if (tapCheckResult.show_alternatives) {
      router.push(
        `/alternatives?merchant=${encodeURIComponent(tapCheckResult.merchant)}&amount=${tapCheckResult.amount}&category=${tapCheckResult.category}&userId=${userId}`
      );
      setTapCheckResult(null);
      return;
    }
    try {
      await api.tapCheckResolve({
        user_id: userId,
        transaction_id: `tx_${Date.now()}`,
        decision: "proceeded",
        merchant: tapCheckResult.merchant,
        amount: tapCheckResult.amount,
        category: tapCheckResult.category,
        goal_impact_days: tapCheckResult.goal_impact?.days ?? 0,
      });
    } catch {}
    setTapCheckResult(null);
  };

  const handleAdjust = async () => {
    if (!tapCheckResult) return;
    try {
      const res = await api.tapCheckResolve({
        user_id: userId,
        transaction_id: `tx_${Date.now()}`,
        decision: "adjusted",
        merchant: tapCheckResult.merchant,
        amount: tapCheckResult.amount,
        category: tapCheckResult.category,
        goal_impact_days: 0,
      }) as { xp_earned: number };
      setTapCheckResult(null);
      showToast(res.xp_earned, `Limit updated. +${res.xp_earned} XP`);
    } catch {
      setTapCheckResult(null);
    }
  };

  const stageInfo = STAGES[user?.stage ?? "Credit Builder"] ?? STAGES["Credit Builder"];
  const xpTotal = STAGE_XP[user?.stage ?? "Credit Builder"] ?? 500;
  const xpProgress = user ? Math.min((user.xp / xpTotal) * 100, 100) : 0;

  return (
    <main className="min-h-screen pb-24 px-4 pt-6" style={{ background: "#060D1A" }}>
      {/* XP Toast */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-4 right-4 z-50 rounded-2xl px-5 py-3 flex items-center gap-3 glow-success"
            style={{ background: "#0C1829", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="text-xl">⚡</span>
            <span className="font-semibold" style={{ color: "#EEF4FF" }}>{xpToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-6" />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      ) : (
        <>
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-0.5" style={{ color: "#EEF4FF" }}>
              {user ? getGreeting(user.name) : "Good morning 👋"}
            </h1>
            <p className="text-sm mb-5" style={{ color: "#7B9CC4" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </motion.div>

          {/* Stage card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-4 mb-4"
              style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{stageInfo.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide" style={{ color: "#7B9CC4" }}>Stage</p>
                  <p className="font-bold truncate" style={{ color: "#EEF4FF" }}>{user.stage}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: "#7B9CC4" }}>XP</p>
                  <p className="font-bold" style={{ color: "#2563EB" }}>{user.xp}</p>
                </div>
              </div>
              <ProgressBar value={xpProgress} max={100} color="#2563EB" height="5px" />
              <p className="text-xs mt-1" style={{ color: "#7B9CC4" }}>{user.xp_to_next} XP to next stage</p>
            </motion.div>
          )}

          {/* Streak card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-4 mb-5 flex items-center justify-between"
              style={{
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <div>
                <p className="text-sm font-bold" style={{ color: "#EEF4FF" }}>🔥 {user.streak_days}-day streak</p>
                <p className="text-xs" style={{ color: "#7B9CC4" }}>
                  {user.streak_days < 14
                    ? `${14 - user.streak_days} days to the 14-day milestone`
                    : "You're in the top 20% 🏆"}
                </p>
              </div>
              <span className="text-3xl">{user.streak_days >= 14 ? "🏆" : "⚡"}</span>
            </motion.div>
          )}

          {/* Goals section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold" style={{ color: "#EEF4FF" }}>Your Goals</h2>
              {goals.length > 0 && (
                <button
                  onClick={() => router.push("/gps")}
                  className="text-xs font-semibold"
                  style={{ color: "#2563EB" }}
                >
                  Full GPS →
                </button>
              )}
            </div>

            {goals.length > 0 ? (
              goals.slice(0, 2).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))
            ) : (
              <EmptyGoalState onAddGoal={() => router.push("/gps")} />
            )}
          </motion.div>

          {/* Ask Fort — voice-first card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5"
          >
            <AskFortVoiceCard />
          </motion.div>
        </>
      )}

      {/* Tap to Pay FAB */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setTapScenarioOpen(true)}
        disabled={tapLoading}
        className="fixed bottom-24 right-5 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all glow-primary disabled:opacity-60"
        style={{ background: "#2563EB", zIndex: 40 }}
        title="Tap to Pay simulation"
      >
        {tapLoading ? "⏳" : "💳"}
      </motion.button>

      {/* Tap scenario picker */}
      <AnimatePresence>
        {tapScenarioOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTapScenarioOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-t-3xl p-6"
              style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#1A2F50" }} />
              <p className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: "#7B9CC4" }}>
                Choose a Tap to Pay scenario
              </p>
              <div className="space-y-3">
                {TAP_SCENARIOS.map((s) => (
                  <button
                    key={s.merchant}
                    onClick={() => handleTapScenario(s)}
                    className="w-full flex justify-between items-center rounded-xl px-4 py-3 transition-all hover:opacity-80"
                    style={{ background: "#060D1A", border: "1px solid #1A2F50" }}
                  >
                    <span className="font-semibold" style={{ color: "#EEF4FF" }}>{s.merchant}</span>
                    <span
                      className="font-bold"
                      style={{ color: s.amount > 500 ? "#EF4444" : "#EEF4FF" }}
                    >
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
        <TapCheckModal
          result={tapCheckResult}
          onPause={handlePause}
          onProceed={handleProceed}
          onAdjust={handleAdjust}
          onClose={() => setTapCheckResult(null)}
        />
      )}

      <Navigation />
    </main>
  );
}
