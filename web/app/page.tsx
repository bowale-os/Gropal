"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #060D1A 0%, #0C1B38 50%, #060D1A 100%)",
      }}
    >
      {/* Radial glow behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-sm w-full relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <Image
            src="/logo.png"
            alt="FortiFi"
            width={72}
            height={72}
            className="rounded-2xl"
            priority
          />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-4xl font-extrabold mb-1 tracking-tight"
          style={{ color: "#EEF4FF" }}
        >
          FortiFi
        </motion.h1>

        {/* Mascot + speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-3 my-6"
        >
          <div className="fox-float">
            <Image
              src="/mascot.png"
              alt="Fort the Fox"
              width={64}
              height={64}
              priority
            />
          </div>
          <div
            className="text-left rounded-2xl rounded-bl-none px-4 py-3 text-sm relative"
            style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
          >
            <p style={{ color: "#EEF4FF" }}>Hey! I&apos;m Fort 🦊</p>
            <p style={{ color: "#7B9CC4" }}>Let&apos;s build your financial fortress.</p>
          </div>
        </motion.div>

        {/* Value prop */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-8 leading-relaxed"
          style={{ color: "#7B9CC4" }}
        >
          Intercept spending decisions · Route every dollar · Build habits that compound.
        </motion.p>

        {/* Primary CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/onboarding")}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all glow-primary"
          style={{ background: "#2563EB", color: "#fff" }}
        >
          Get started — it&apos;s free →
        </motion.button>

        {/* Skip to demo */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-80"
          style={{
            background: "transparent",
            color: "#7B9CC4",
            border: "1px solid #1A2F50",
          }}
        >
          Skip to demo
        </motion.button>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs mt-5"
          style={{ color: "#2F4A6E" }}
        >
          Built for 18–25 year-olds figuring it out · No credit card needed
        </motion.p>
      </motion.div>
    </main>
  );
}
