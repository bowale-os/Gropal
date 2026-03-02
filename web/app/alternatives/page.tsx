"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
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
        alternatives: Alternative[]; original_impact_months: number;
      };
      setAlternatives(res.alternatives); setOriginalImpact(res.original_impact_months);
    } catch {} finally { setLoading(false); }
  }, [userId, merchant, amount, category]);

  useEffect(() => { load(); }, [load]);

  const select = async (alt: Alternative) => {
    setSelecting(alt.id);
    try {
      await api.selectAlternative({
        user_id: userId, alternative_id: alt.id, alternative_label: alt.label,
        original_amount: amount, category, monthly_cost: alt.monthly_cost,
        goal_impact_months: alt.goal_impact_months,
      });
      router.push("/gps");
    } catch { setSelecting(null); }
  };

  return (
    <main className="min-h-screen bg-bg pb-24 px-4 pt-6">

      {/* Back + header */}
      <button onClick={() => router.back()}
        className="font-mono text-[10px] tracking-widest mb-5 flex items-center gap-1.5 transition-colors hover:text-primary"
        style={{ color: "#6B6560" }}>
        ← BACK
      </button>

      <div className="mb-5">
        <p className="font-mono text-[9px] tracking-[0.18em] mb-1" style={{ color: "#3A3530" }}>DECISION ENGINE</p>
        <h1 className="font-display font-bold text-2xl text-ink">Smarter Options</h1>
      </div>

      {/* Impact warning */}
      <div className="p-3 mb-5 rounded-[3px]"
        style={{ background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)", borderLeft: "2px solid #FF3B3B" }}>
        <p className="font-mono text-[11px]" style={{ color: "#FF3B3B" }}>
          <span className="font-bold">{merchant} ${amount.toLocaleString()}</span> — pushes your top goal back{" "}
          <span className="font-bold">{originalImpact} months</span>
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="fox-float mb-4">
            <Image src="/fox-chart.png" alt="Fort" width={80} height={80} className="object-contain" />
          </div>
          <p className="font-mono text-[11px] tracking-widest" style={{ color: "#6B6560" }}>
            FINDING SMARTER PATHS…
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alternatives.map((alt, i) => {
            const isBetter = alt.goal_impact_months < originalImpact;
            const isWorst = alt.id === "D";
            return (
              <motion.div
                key={alt.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09 }}
                className="overflow-hidden rounded-[4px]"
                style={{
                  background: isWorst ? "rgba(255,59,59,0.04)" : "#0E0E0E",
                  border: `1px solid ${isWorst ? "rgba(255,59,59,0.15)" : "#242424"}`,
                  borderLeft: `2px solid ${isWorst ? "#FF3B3B" : isBetter ? "#22FF88" : "#FF6B2B"}`,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xl shrink-0">{alt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-ink">{alt.label}</p>
                      <p className="font-mono text-[10px] mt-0.5" style={{ color: isBetter ? "#22FF88" : "#FF3B3B" }}>
                        {isBetter
                          ? `↓ ${alt.goal_impact_months}mo delay (saves ${originalImpact - alt.goal_impact_months}mo)`
                          : `${alt.goal_impact_months}mo delay`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#6B6560" }}>{alt.description}</p>
                  {alt.monthly_cost && (
                    <p className="font-mono text-[10px] mb-3" style={{ color: "#6B6560" }}>
                      ~${alt.monthly_cost}/mo commitment
                    </p>
                  )}
                  <button
                    onClick={() => select(alt)}
                    disabled={selecting !== null}
                    className={`w-full py-3 font-display font-bold text-sm rounded-[3px] transition-all disabled:opacity-50 ${isWorst ? "" : "btn-primary"}`}
                    style={isWorst ? { background: "transparent", border: "1px solid #242424", color: "#6B6560" } : {}}
                  >
                    {selecting === alt.id ? "Applying…" : isWorst ? "Proceed Anyway" : "Choose This Path →"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Navigation />
    </main>
  );
}

export default function AlternativesPage() {
  return <Suspense><AlternativesContent /></Suspense>;
}
