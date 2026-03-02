"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import type { ChatMessage } from "@/types";
import ChatBubble, { TypingIndicator } from "@/components/ChatBubble";
import Navigation from "@/components/Navigation";

interface SRResult  { 0: { transcript: string }; isFinal: boolean }
interface SRResults { [i: number]: SRResult; length: number }
interface SREvent   { results: SRResults }
interface SRInstance {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror:  (() => void) | null;
  onend:    (() => void) | null;
}

function getSR(): (new () => SRInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"] ?? null) as (new () => SRInstance) | null;
}

const MARCUS_ID = "user_marcus_001";
const SUGGESTED_PROMPTS = [
  { label: "Can I afford this?",              icon: "💳" },
  { label: "How am I doing?",                 icon: "◎" },
  { label: "Debt payoff vs save — which first?", icon: "⚖" },
  { label: "Explain my top risk",             icon: "△" },
];

function AskPageContent() {
  const { chatHistory, addChatMessage, clearChat } = useGropalStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const bottomRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SRInstance | null>(null);
  const searchParams = useSearchParams();
  const autoQ        = searchParams.get("q");

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("fortifi_user_id") || localStorage.getItem("gropal_user_id") || MARCUS_ID
      : MARCUS_ID;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const send = useCallback(async (message: string) => {
    if (!message.trim()) return;
    addChatMessage({ role: "user", content: message, timestamp: new Date().toISOString() });
    setInput(""); setLiveTranscript(""); setIsTyping(true);
    try {
      const history = chatHistory.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.ask(userId, message, history) as { response: string; suggested_actions?: ChatMessage["suggested_actions"] };
      addChatMessage({ role: "assistant", content: res.response, timestamp: new Date().toISOString(), suggested_actions: res.suggested_actions });
    } catch {
      addChatMessage({ role: "assistant", content: "Trouble connecting. Try again in a moment.", timestamp: new Date().toISOString() });
    } finally { setIsTyping(false); }
  }, [chatHistory, addChatMessage, userId]);

  useEffect(() => {
    if (autoQ && chatHistory.length === 0) send(autoQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoQ]);

  const startListening = useCallback(() => {
    const SR = getSR();
    if (!SR) { inputRef.current?.focus(); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e: SREvent) => {
      const t = Array.from({ length: e.results.length }).map((_, i) => e.results[i][0].transcript).join("");
      setLiveTranscript(t);
      if (e.results[e.results.length - 1].isFinal) { setIsListening(false); send(t); }
    };
    r.onerror = () => { setIsListening(false); setLiveTranscript(""); };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r; r.start(); setIsListening(true); setLiveTranscript("");
  }, [send]);

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const hasMessages = chatHistory.length > 0;
  const MIC_SIZE = 80;

  return (
    <main className="min-h-screen bg-bg flex flex-col pb-20">

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-6 pb-4 sticky top-0 z-10"
        style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #242424" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[3px] overflow-hidden flex items-center justify-center"
            style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)" }}>
            <Image src="/fox.png" alt="Fort" width={30} height={30} className="object-contain" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-ink">Ask Fort</p>
            <p className="font-mono text-[10px] tracking-widest" style={{ color: isListening ? "#FF3B3B" : "#6B6560" }}>
              {isListening ? "LISTENING" : "AI CO-PILOT"}
            </p>
          </div>
        </div>
        {hasMessages && (
          <button onClick={clearChat}
            className="font-mono text-[10px] px-3 py-1.5 rounded-[2px] transition-all hover:border-border-warm"
            style={{ background: "transparent", border: "1px solid #242424", color: "#6B6560" }}>
            CLEAR
          </button>
        )}
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!hasMessages ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="fox-float mb-3">
              <Image src="/fox-laptop.png" alt="Fort" width={110} height={110} className="object-contain" />
            </div>
            <p className="font-display font-bold text-xl text-ink mb-2">Ask Fort anything</p>
            <p className="text-sm max-w-[240px] leading-relaxed mb-10" style={{ color: "#6B6560" }}>
              I know your goals, risks, and stage. Real answers with real numbers.
            </p>

            {/* Hero mic */}
            <div className="relative flex items-center justify-center mb-4">
              {isListening && (
                <>
                  <span className="sonar-ring sonar-ring-1" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
                  <span className="sonar-ring sonar-ring-2" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
                  <span className="sonar-ring sonar-ring-3" style={{ width: MIC_SIZE, height: MIC_SIZE }} />
                </>
              )}
              <motion.button
                whileTap={{ scale: 0.91 }}
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 rounded-full flex items-center justify-center text-3xl transition-all ${!isListening ? "mic-idle" : ""}`}
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
                <motion.div key="l" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-6">
                  <p className="font-mono text-[11px] tracking-widest" style={{ color: "#FF3B3B" }}>LISTENING</p>
                  {liveTranscript && (
                    <p className="text-xs italic mt-1 max-w-[220px] transcript-in" style={{ color: "#6B6560" }}>&ldquo;{liveTranscript}&rdquo;</p>
                  )}
                </motion.div>
              ) : (
                <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-mono text-[11px] tracking-widest mb-8" style={{ color: "#6B6560" }}>
                  TAP MIC TO SPEAK
                </motion.p>
              )}
            </AnimatePresence>

            {!isListening && (
              <div className="flex flex-col gap-2 w-full max-w-[300px]">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-[9px] tracking-widest" style={{ color: "#3A3530" }}>OR TYPE</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p.label} onClick={() => send(p.label)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[3px] text-sm text-left transition-all hover:border-border-warm"
                    style={{ background: "#0E0E0E", border: "1px solid #242424" }}>
                    <span className="font-mono text-base" style={{ color: "#FF6B2B" }}>{p.icon}</span>
                    <span className="text-ink">{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {chatHistory.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <ChatBubble message={msg} onActionClick={send} />
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="sticky bottom-20 px-4 py-3"
        style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid #242424" }}
      >
        <div className="flex items-end gap-2 px-3 py-2 rounded-[3px]"
          style={{ background: "#0E0E0E", border: "1px solid #242424" }}>
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-28 min-h-[34px] py-1.5"
            style={{ color: "#F5F0E8", fontFamily: "'DM Sans', sans-serif" }}
            placeholder={isListening ? "Listening…" : "Ask Fort anything…"}
            value={isListening ? liveTranscript : input}
            readOnly={isListening}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            className={`w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 transition-all ${!isListening ? "mic-idle" : ""}`}
            style={{
              background: isListening ? "rgba(255,59,59,0.12)" : "rgba(255,107,43,0.1)",
              border: isListening ? "1px solid rgba(255,59,59,0.35)" : "1px solid rgba(255,107,43,0.25)",
            }}
          >
            {isListening ? "⏹" : "🎤"}
          </motion.button>
          <button
            onClick={() => send(input)}
            disabled={(!input.trim() && !liveTranscript) || isTyping}
            className="w-8 h-8 rounded-[2px] flex items-center justify-center shrink-0 font-mono font-bold transition-all disabled:opacity-25"
            style={{ background: "#FF6B2B", color: "#080808" }}
          >
            ↑
          </button>
        </div>
      </div>

      <Navigation />
    </main>
  );
}

export default function AskPage() {
  return <Suspense><AskPageContent /></Suspense>;
}
