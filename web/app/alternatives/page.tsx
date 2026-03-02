"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import type { Alternative } from "@/types";
import Navigation from "@/components/Navigation";

const MARCUS_ID = "user_marcus_001";

function AlternativesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [originalImpact, setOriginalImpact] = useState(0);

  const merchant = params.get("merchant") ?? "Merchant";
  const amount = parseFloat(params.get("amount") ?? "0");
  const category = params.get("category") ?? "other";
  const userId = params.get("userId") ?? MARCUS_ID;

  const load = useCallback(async () => {
    try {
      const res = await api.getAlternatives({ user_id: userId, merchant, amount, category }) as {
        alternatives: Alternative[];
        original_impact_months: number;
      };
      setAlternatives(res.alternatives);
      setOriginalImpact(res.original_impact_months);
    } catch {} finally {
      setLoading(false);
    }
  }, [userId, merchant, amount, category]);

  useEffect(() => { load(); }, [load]);

  const select = async (alt: Alternative) => {
    setSelecting(alt.id);
    try {
      await api.selectAlternative({
        user_id: userId,
        alternative_id: alt.id,
        alternative_label: alt.label,
        original_amount: amount,
        category,
        monthly_cost: alt.monthly_cost,
        goal_impact_months: alt.goal_impact_months,
      });
      router.push("/gps");
    } catch {
      setSelecting(null);
    }
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-6" style={{ background: "#060D1A" }}>
      <button onClick={() => router.back()} className="text-sm text-[#7B9CC4] mb-4 flex items-center gap-1">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-[#EEF4FF] mb-1">Smarter Options</h1>
      <div
        className="rounded-xl px-4 py-3 mb-6 text-sm"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
      >
        <span className="font-semibold">{merchant} ${amount.toLocaleString()}</span> — pushes your top goal back{" "}
        <span className="font-bold">{originalImpact} months</span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="text-3xl mb-4"
          >
            ⚙️
          </motion.div>
          <p className="text-sm text-[#7B9CC4]">Finding smarter paths...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alternatives.map((alt, i) => (
            <motion.div
              key={alt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5"
              style={{
                background: alt.id === "D" ? "rgba(239,68,68,0.04)" : "#0C1829",
                border: `1px solid ${alt.id === "D" ? "rgba(239,68,68,0.15)" : "#1A2F50"}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{alt.emoji}</span>
                <div>
                  <p className="font-semibold text-[#EEF4FF]">{alt.label}</p>
                  <span
                    className="text-xs font-bold"
                    style={{ color: alt.goal_impact_months < originalImpact ? "#22C55E" : "#EF4444" }}
                  >
                    {alt.goal_impact_months < originalImpact
                      ? `↓ ${alt.goal_impact_months} months delay (vs ${originalImpact})`
                      : `${alt.goal_impact_months} months delay`}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#7B9CC4] mb-4">{alt.description}</p>
              {alt.monthly_cost && (
                <p className="text-xs text-[#7B9CC4] mb-3">
                  ~${alt.monthly_cost}/month commitment
                </p>
              )}
              <button
                onClick={() => select(alt)}
                disabled={selecting !== null}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                style={
                  alt.id === "D"
                    ? { background: "#1A2F50", color: "#7B9CC4" }
                    : { background: "#2563EB", color: "#fff" }
                }
              >
                {selecting === alt.id ? "Applying..." : alt.id === "D" ? "Proceed Anyway" : "Choose This Path"}
              </button>
            </motion.div>
          ))}
        </div>
      )}
      <Navigation />
    </main>
  );
}

export default function AlternativesPage() {
  return (
    <Suspense>
      <AlternativesContent />
    </Suspense>
  );
}
