"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { api } from "@/services/api";

const FOX_MESSAGES = [
  "Hey — I'm Fort. Your financial co-pilot. Let's get you set up. Two minutes, tops.",
  "How much hits your account each month? This helps me give sharper advice.",
  "What are you working toward? Write it however — I'll parse it.",
  "Connect your bank so I can spot patterns. Read-only. No credentials stored.",
];

const POPULAR_BANKS = [
  { name: "Chase", icon: "🏦" },
  { name: "Bank of America", icon: "🏛️" },
  { name: "Wells Fargo", icon: "🐴" },
  { name: "Citi", icon: "🌐" },
  { name: "Capital One", icon: "💳" },
  { name: "TD Bank", icon: "🍀" },
];

const GOAL_CHIPS = [
  "Emergency fund", "Pay off debt", "Save for a trip",
  "Buy a car", "Start investing", "Move out",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!name.trim()) { setError("Your name — that's all we need."); setStep(0); return; }
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
      router.push(`/onboarding/stage?userId=${res.user_id}&stage=${encodeURIComponent(res.assigned_stage)}&topRisk=${encodeURIComponent(res.top_risk)}&riskLevel=${res.risk_level}`);
    } catch {
      localStorage.setItem("fortifi_user_id", "user_marcus_001");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleBankConnect = (bankName: string) => {
    setConnectingBank(true);
    setSelectedBank(bankName);
    setTimeout(() => { setConnectingBank(false); setBankConnected(true); }, 1800);
  };

  const filteredBanks = POPULAR_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col bg-bg px-5 pt-6 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Image src="/logo-badge.png" alt="Fortify" width={28} height={28} className="object-contain" />
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className="h-[3px] rounded-[1px]"
              style={{ width: i === step ? 24 : 16 }}
              animate={{ background: i <= step ? "#FF6B2B" : "#242424" }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: "#3A3530" }}>
          {step + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Fox message */}
      <motion.div
        key={step + "-fox"}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end gap-3 mb-8"
      >
        <div className="shrink-0 fox-float">
          <Image src="/fox.png" alt="Fort the Fox" width={56} height={56} className="object-contain" />
        </div>
        <div
          className="flex-1 p-4 rounded-[4px] rounded-bl-[1px] text-sm leading-relaxed"
          style={{ background: "#0E0E0E", border: "1px solid #242424", borderLeft: "2px solid #FF6B2B", color: "#6B6560" }}
        >
          {FOX_MESSAGES[step]}
        </div>
      </motion.div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <p className="font-mono text-[9px] tracking-[0.14em] mb-2" style={{ color: "#3A3530" }}>YOUR NAME</p>
              <input
                autoFocus
                className="w-full px-4 py-4 text-2xl font-display font-bold outline-none rounded-[3px] transition-all bg-bg-card"
                style={{ border: "1px solid #242424", color: "#F5F0E8" }}
                placeholder="Marcus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && goNext()}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B2B")}
                onBlur={(e) => (e.target.style.borderColor = "#242424")}
              />
              {error && <p className="mt-2 font-mono text-[11px]" style={{ color: "#FF3B3B" }}>{error}</p>}

              <p className="font-mono text-[9px] tracking-[0.14em] mt-5 mb-2" style={{ color: "#3A3530" }}>
                AGE <span style={{ color: "#2E2B28" }}>(OPTIONAL)</span>
              </p>
              <input
                type="number"
                className="w-full px-4 py-3.5 text-lg font-mono outline-none rounded-[3px] bg-bg-card transition-all"
                style={{ border: "1px solid #242424", color: "#F5F0E8" }}
                placeholder="22"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B2B")}
                onBlur={(e) => (e.target.style.borderColor = "#242424")}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <p className="font-mono text-[9px] tracking-[0.14em] mb-2" style={{ color: "#3A3530" }}>MONTHLY TAKE-HOME</p>
              <div
                className="flex items-center gap-2 px-4 py-4 rounded-[3px] bg-bg-card transition-all"
                style={{ border: "1px solid #242424" }}
              >
                <span className="text-2xl font-mono font-bold" style={{ color: "#FF6B2B" }}>$</span>
                <input
                  autoFocus
                  type="number"
                  className="flex-1 bg-transparent text-2xl font-mono font-bold outline-none"
                  style={{ color: "#F5F0E8" }}
                  placeholder="3,200"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <p className="font-mono text-[10px] mt-2" style={{ color: "#3A3530" }}>After taxes — what actually hits your account.</p>

              <p className="font-mono text-[9px] tracking-[0.14em] mt-5 mb-2" style={{ color: "#3A3530" }}>PAID EVERY</p>
              <div className="flex gap-2">
                {["weekly", "biweekly", "monthly"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className="flex-1 py-2.5 font-mono text-xs tracking-wider capitalize transition-all rounded-[3px]"
                    style={
                      frequency === f
                        ? { background: "#FF6B2B", color: "#080808", fontWeight: 700 }
                        : { background: "#0E0E0E", color: "#6B6560", border: "1px solid #242424" }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <p className="font-mono text-[9px] tracking-[0.14em] mb-2" style={{ color: "#3A3530" }}>YOUR GOALS</p>
              <textarea
                autoFocus
                rows={4}
                className="w-full px-4 py-4 text-sm outline-none resize-none rounded-[3px] bg-bg-card leading-relaxed transition-all"
                style={{ border: "1px solid #242424", color: "#F5F0E8" }}
                placeholder="e.g. Pay off my student loans by next year, save up for Japan, build a $2k emergency fund…"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B2B")}
                onBlur={(e) => (e.target.style.borderColor = "#242424")}
              />
              <p className="font-mono text-[10px] mt-2 mb-4" style={{ color: "#3A3530" }}>Write it naturally — I&apos;ll figure it out.</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setGoalText(goalText ? goalText + ", " + chip : chip)}
                    className="font-mono text-[10px] px-3 py-1.5 rounded-[2px] tracking-wide transition-all hover:border-primary hover:text-primary"
                    style={{ background: "#0E0E0E", border: "1px solid #242424", color: "#6B6560" }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              {bankConnected ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-4 text-3xl"
                    style={{ background: "rgba(34,255,136,0.1)", border: "1px solid rgba(34,255,136,0.3)" }}
                  >
                    ✓
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2" style={{ color: "#22FF88" }}>
                    {selectedBank} connected
                  </h3>
                  <p className="text-sm" style={{ color: "#6B6560" }}>
                    Fort will monitor your transactions and flag patterns.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {["🔒 Bank-grade encryption", "👁 Read-only", "🚫 No credentials stored"].map((b) => (
                      <span key={b} className="font-mono text-[9px] px-2.5 py-1 rounded-[2px] tracking-wide"
                        style={{ background: "#0E0E0E", border: "1px solid #242424", color: "#6B6560" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-3 rounded-[3px] bg-bg-card mb-3"
                    style={{ border: "1px solid #242424" }}>
                    <span className="text-sm" style={{ color: "#6B6560" }}>⌕</span>
                    <input autoFocus className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#F5F0E8" }}
                      placeholder="Search your bank…" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {filteredBanks.map((bank) => (
                      <button key={bank.name} onClick={() => handleBankConnect(bank.name)} disabled={connectingBank}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-[3px] transition-all hover:border-border-warm text-left"
                        style={{ background: "#0E0E0E", border: "1px solid #242424" }}>
                        <span className="text-xl">{bank.icon}</span>
                        <span className="font-display font-medium text-sm text-ink flex-1">{bank.name}</span>
                        {connectingBank && selectedBank === bank.name
                          ? <span className="font-mono text-[10px]" style={{ color: "#FF6B2B" }}>connecting…</span>
                          : <span style={{ color: "#3A3530" }}>›</span>}
                      </button>
                    ))}
                    {filteredBanks.length === 0 && (
                      <p className="text-center font-mono text-[11px] py-4" style={{ color: "#6B6560" }}>No banks found.</p>
                    )}
                  </div>
                  <p className="font-mono text-[9px] text-center mt-4" style={{ color: "#2E2B28" }}>
                    POWERED BY PLAID · ADD LATER IN SETTINGS
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="mt-8 space-y-2">
        <button
          onClick={() => {
            if (step === 0 && !name.trim()) { setError("Your name — that's all we need."); return; }
            if (step < TOTAL_STEPS - 1) goNext();
            else handleSubmit();
          }}
          disabled={loading}
          className="btn-primary w-full py-4 text-sm font-display font-bold tracking-wide glow-primary disabled:opacity-50"
        >
          {loading ? "Setting up your fortress…" : step === TOTAL_STEPS - 1 ? "Let's go →" : "Continue →"}
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={goBack} className="btn-ghost flex-1 py-3 text-sm">← Back</button>
          )}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <button onClick={goNext} className="flex-1 py-3 text-sm font-mono text-[11px]" style={{ color: "#3A3530" }}>
              Skip
            </button>
          )}
          {step === TOTAL_STEPS - 1 && !bankConnected && (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 font-mono text-[11px]" style={{ color: "#3A3530" }}>
              Skip bank connection
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
