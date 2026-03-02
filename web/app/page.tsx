"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const TICKER_ITEMS = [
  "OUTSMART RISK", "BUILD WEALTH", "ROUTE EVERY DOLLAR",
  "INTERCEPT BAD BUYS", "EARN XP", "LEVEL UP YOUR MONEY",
  "OUTSMART RISK", "BUILD WEALTH", "ROUTE EVERY DOLLAR",
  "INTERCEPT BAD BUYS", "EARN XP", "LEVEL UP YOUR MONEY",
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg flex flex-col overflow-hidden relative">

      {/* Top ticker tape */}
      <div className="border-b border-border py-2 bg-bg-card overflow-hidden">
        <div className="ticker-inner flex gap-8 text-[10px] font-mono font-medium text-ink-muted tracking-[0.18em]">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="flex items-center gap-2 shrink-0">
              <span className="w-1 h-1 rounded-full bg-primary inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">

        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,43,0.07) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
          }}
        />

        <div className="max-w-sm w-full relative z-10">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <Image src="/logo-text.png" alt="Fortify" width={160} height={48} priority className="object-contain" />
          </motion.div>

          {/* Fox mascot + bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-end justify-center gap-4 mb-8"
          >
            <div className="fox-float relative">
              <div
                className="absolute inset-0 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, rgba(255,107,43,0.4) 0%, transparent 70%)", filter: "blur(16px)" }}
              />
              <Image src="/fox-main.png" alt="Fort the Fox" width={120} height={120} priority className="relative z-10" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-3 max-w-[180px] relative"
              style={{ borderColor: "rgba(255,107,43,0.25)" }}
            >
              {/* Chat tail */}
              <div
                className="absolute -left-2 bottom-4 w-0 h-0"
                style={{
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderRight: "8px solid #242424",
                }}
              />
              <div
                className="absolute -left-[7px] bottom-[17px] w-0 h-0"
                style={{
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderRight: "7px solid #0E0E0E",
                }}
              />
              <p className="text-ink text-xs font-display font-semibold leading-snug">
                Hey! I&apos;m Fort.
              </p>
              <p className="text-ink-muted text-[11px] leading-snug mt-1">
                Let&apos;s build your financial fortress.
              </p>
            </motion.div>
          </motion.div>

          {/* Value prop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mb-8 text-center"
          >
            <h1 className="font-display font-bold text-2xl text-ink leading-tight mb-3">
              Your money,<br />
              <span className="text-primary">finally working for you.</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-2">
              {["Intercept bad buys", "Route every dollar", "Build XP streaks"].map((item) => (
                <span key={item} className="tag" style={{ background: "#161616", border: "1px solid #242424", color: "#6B6560" }}>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => router.push("/onboarding")}
              className="btn-primary w-full py-4 text-base font-display font-bold tracking-wide glow-primary"
            >
              Start for free →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-ghost w-full py-3 text-sm"
            >
              Skip to demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-[11px] font-mono text-ink-muted mt-5 tracking-wide"
          >
            BUILT FOR 18–25 YEAR-OLDS · NO CARD NEEDED
          </motion.p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-3 px-6 flex justify-between items-center">
        <span className="text-[10px] font-mono text-ink-muted tracking-widest">FORTIFY v1.0</span>
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-ink-muted">LIVE</span>
        </div>
      </div>
    </main>
  );
}
