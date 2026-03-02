"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/services/api";

// Fox messages for each step
const FOX_MESSAGES = [
  "Hey! I'm Fort 🦊 — your financial co-pilot. Let's get you set up. Takes less than 2 minutes.",
  "Nice to meet you! How much do you bring home each month? This helps me give better advice — totally optional.",
  "What are you working toward? Anything goes — I can figure it out from plain English.",
  "Want to connect your bank so I can spot patterns? No worries if not — you can always do this later.",
];

const POPULAR_BANKS = [
  { name: "Chase", icon: "🏦" },
  { name: "Bank of America", icon: "🏛️" },
  { name: "Wells Fargo", icon: "🐴" },
  { name: "Citi", icon: "🌐" },
  { name: "Capital One", icon: "💳" },
  { name: "TD Bank", icon: "🍀" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [frequency, setFrequency] = useState("biweekly");
  const [goalText, setGoalText] = useState("");
  const [bankConnected, setBankConnected] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [connectingBank, setConnectingBank] = useState(false);

  const TOTAL_STEPS = 4;

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Just your name — that's all we need.");
      setStep(0);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.onboard({
        name: name.trim(),
        age: parseInt(age) || 22,
        income_monthly: parseFloat(income) || 3000,
        income_frequency: frequency,
        expenses: {},
        debts: [],
        goals_input: goalText.trim() ? [goalText.trim()] : [],
      }) as { user_id: string; assigned_stage: string; top_risk: string; risk_level: string };

      localStorage.setItem("fortifi_user_id", res.user_id);
      router.push(
        `/onboarding/stage?userId=${res.user_id}&stage=${encodeURIComponent(res.assigned_stage)}&topRisk=${encodeURIComponent(res.top_risk)}&riskLevel=${res.risk_level}`
      );
    } catch {
      // On API failure, still navigate with a demo user so the demo works
      localStorage.setItem("fortifi_user_id", "user_marcus_001");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleBankConnect = (bankName: string) => {
    setConnectingBank(true);
    setSelectedBank(bankName);
    setTimeout(() => {
      setConnectingBank(false);
      setBankConnected(true);
    }, 1800);
  };

  const filteredBanks = POPULAR_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const stepVariants = {
    enter: { opacity: 0, x: 32 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -32 },
  };

  return (
    <main
      className="min-h-screen flex flex-col px-5 py-8"
      style={{ background: "#060D1A" }}
    >
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full"
            animate={{ background: i <= step ? "#2563EB" : "#1A2F50" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Fort the Fox */}
      <motion.div
        key={step + "-fox"}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 mb-8"
      >
        <div className="shrink-0 fox-float">
          <Image src="/mascot.png" alt="Fort the Fox" width={52} height={52} />
        </div>
        <div
          className="rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed flex-1"
          style={{ background: "#0C1829", border: "1px solid #1A2F50", color: "#7B9CC4" }}
        >
          {FOX_MESSAGES[step]}
        </div>
      </motion.div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Name ── */}
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7B9CC4" }}>
                Your name
              </label>
              <input
                autoFocus
                className="w-full rounded-2xl px-5 py-4 text-2xl font-bold outline-none transition-all"
                style={{
                  background: "#0C1829",
                  border: "1px solid #1A2F50",
                  color: "#EEF4FF",
                }}
                placeholder="Marcus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && goNext()}
              />
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7B9CC4" }}>
                  Age <span style={{ color: "#2F4A6E" }}>(optional)</span>
                </label>
                <input
                  type="number"
                  className="w-full rounded-2xl px-5 py-3.5 text-lg outline-none transition-all"
                  style={{
                    background: "#0C1829",
                    border: "1px solid #1A2F50",
                    color: "#EEF4FF",
                  }}
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              {error && (
                <p className="mt-3 text-sm" style={{ color: "#EF4444" }}>{error}</p>
              )}
            </motion.div>
          )}

          {/* ── Step 1: Income (optional) ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7B9CC4" }}>
                Monthly take-home <span style={{ color: "#2F4A6E" }}>(optional)</span>
              </label>
              <div
                className="flex items-center rounded-2xl px-5 py-4 gap-2"
                style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
              >
                <span className="text-2xl font-bold" style={{ color: "#2563EB" }}>$</span>
                <input
                  autoFocus
                  type="number"
                  className="flex-1 bg-transparent text-2xl font-bold outline-none"
                  style={{ color: "#EEF4FF" }}
                  placeholder="3,200"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs" style={{ color: "#2F4A6E" }}>
                After taxes — what actually hits your account.
              </p>

              <div className="mt-5">
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7B9CC4" }}>
                  Paid every…
                </label>
                <div className="flex gap-2">
                  {["weekly", "biweekly", "monthly"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                      style={
                        frequency === f
                          ? { background: "#2563EB", color: "#fff" }
                          : { background: "#0C1829", color: "#7B9CC4", border: "1px solid #1A2F50" }
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="mt-4 rounded-xl px-4 py-3 text-xs"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", color: "#7B9CC4" }}
              >
                You can always update this in Settings later. No pressure.
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Goal (free-form, optional) ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#7B9CC4" }}>
                What are you working toward? <span style={{ color: "#2F4A6E" }}>(optional)</span>
              </label>
              <textarea
                autoFocus
                rows={4}
                className="w-full rounded-2xl px-5 py-4 text-base outline-none resize-none transition-all"
                style={{
                  background: "#0C1829",
                  border: "1px solid #1A2F50",
                  color: "#EEF4FF",
                  lineHeight: "1.6",
                }}
                placeholder="e.g. Pay off my student loans by next year, save up for a trip to Japan, build a $2k emergency fund, buy a car by summer..."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
              />
              <p className="mt-2 text-xs" style={{ color: "#2F4A6E" }}>
                Write it however feels natural — I&apos;ll figure it out.
              </p>

              {/* Quick suggestion chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Emergency fund 🛡️",
                  "Pay off debt 💳",
                  "Save for a trip ✈️",
                  "Buy a car 🚗",
                  "Start investing 📈",
                  "Move out 🏠",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setGoalText(goalText ? goalText + ", " + chip.replace(/\s[\u{1F000}-\u{1FFFF}]$/u, "") : chip.replace(/\s[\u{1F000}-\u{1FFFF}]$/u, ""))}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-90"
                    style={{ background: "#0C1829", border: "1px solid #1A2F50", color: "#7B9CC4" }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Bank Connection (optional, Plaid-style) ── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28 }}
            >
              {bankConnected ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#22C55E" }}>
                    {selectedBank} connected!
                  </h3>
                  <p className="text-sm" style={{ color: "#7B9CC4" }}>
                    Fort will now monitor your transactions and alert you when something looks off.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Trust badges */}
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {["🔒 Bank-grade encryption", "👁️ Read-only access", "🚫 We never store credentials"].map((b) => (
                      <span
                        key={b}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(37,99,235,0.1)", color: "#7B9CC4", border: "1px solid rgba(37,99,235,0.2)" }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Search */}
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
                    style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
                  >
                    <span style={{ color: "#7B9CC4" }}>🔍</span>
                    <input
                      autoFocus
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "#EEF4FF" }}
                      placeholder="Search your bank..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                    />
                  </div>

                  {/* Bank list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredBanks.map((bank) => (
                      <button
                        key={bank.name}
                        onClick={() => handleBankConnect(bank.name)}
                        disabled={connectingBank}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-90 text-left"
                        style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
                      >
                        <span className="text-2xl">{bank.icon}</span>
                        <span className="font-medium text-sm" style={{ color: "#EEF4FF" }}>{bank.name}</span>
                        {connectingBank && selectedBank === bank.name ? (
                          <span className="ml-auto text-xs" style={{ color: "#2563EB" }}>Connecting…</span>
                        ) : (
                          <span className="ml-auto" style={{ color: "#1A2F50" }}>›</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {filteredBanks.length === 0 && (
                    <p className="text-center text-sm py-4" style={{ color: "#7B9CC4" }}>
                      No banks found — try a different name.
                    </p>
                  )}

                  <p className="text-xs text-center mt-4" style={{ color: "#2F4A6E" }}>
                    Powered by Plaid · You can add this later in Settings
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (step === 0 && !name.trim()) {
              setError("Just your name — that's all we need.");
              return;
            }
            if (step < TOTAL_STEPS - 1) goNext();
            else handleSubmit();
          }}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all glow-primary disabled:opacity-60"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          {loading
            ? "Setting up your fortress…"
            : step === TOTAL_STEPS - 1
            ? "Let's go! 🚀"
            : "Continue →"}
        </motion.button>

        {/* Skip / Back row */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={goBack}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: "#0C1829", color: "#7B9CC4", border: "1px solid #1A2F50" }}
            >
              ← Back
            </button>
          )}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-2xl text-sm font-medium"
              style={{ color: "#2F4A6E" }}
            >
              Skip for now
            </button>
          )}
          {step === TOTAL_STEPS - 1 && !bankConnected && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl text-sm font-medium"
              style={{ color: "#2F4A6E" }}
            >
              Skip bank connection
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
