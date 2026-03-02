"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useGropalStore } from "@/store";
import { api } from "@/services/api";
import type { ChatMessage } from "@/types";
import ChatBubble, { TypingIndicator } from "@/components/ChatBubble";
import Navigation from "@/components/Navigation";

// Minimal Speech API types — not in every TS lib version
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
  { label: "Can I afford this?",      emoji: "💳" },
  { label: "How am I doing?",         emoji: "📊" },
  { label: "Should I pay off debt or save?", emoji: "🎯" },
  { label: "Explain my top risk",     emoji: "⚠️" },
];

// ─── Main content — wrapped in Suspense for useSearchParams ──────────────────
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
      ? localStorage.getItem("fortifi_user_id") ||
        localStorage.getItem("gropal_user_id") ||
        MARCUS_ID
      : MARCUS_ID;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // ── Send a message to Fort ────────────────────────────────────────────────
  const send = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      addChatMessage({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });
      setInput("");
      setLiveTranscript("");
      setIsTyping(true);

      try {
        const history = chatHistory.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = (await api.ask(userId, message, history)) as {
          response: string;
          suggested_actions?: ChatMessage["suggested_actions"];
        };
        addChatMessage({
          role: "assistant",
          content: res.response,
          timestamp: new Date().toISOString(),
          suggested_actions: res.suggested_actions,
        });
      } catch {
        addChatMessage({
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Try again in a moment.",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsTyping(false);
      }
    },
    [chatHistory, addChatMessage, userId]
  );

  // ── Auto-send ?q= param on first mount ───────────────────────────────────
  useEffect(() => {
    if (autoQ && chatHistory.length === 0) {
      send(autoQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoQ]);

  // ── Voice recognition ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = getSR();

    if (!SR) {
      inputRef.current?.focus();
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (e: SREvent) => {
      const t = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join("");
      setLiveTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setIsListening(false);
        send(t);
      }
    };
    r.onerror = () => {
      setIsListening(false);
      setLiveTranscript("");
    };
    r.onend = () => setIsListening(false);

    recognitionRef.current = r;
    r.start();
    setIsListening(true);
    setLiveTranscript("");
  }, [send]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const hasMessages = chatHistory.length > 0;
  const MIC_SIZE = 88;

  return (
    <main className="min-h-screen flex flex-col pb-20" style={{ background: "#060D1A" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 pt-6 pb-4 sticky top-0 z-10"
        style={{
          background: "rgba(6,13,26,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1A2F50",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            🦊
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#EEF4FF" }}>
              Ask Fort
            </p>
            <p className="text-xs" style={{ color: "#7B9CC4" }}>
              {isListening ? "Listening…" : "Your AI financial co-pilot"}
            </p>
          </div>
        </div>
        {hasMessages && (
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "#1A2F50", color: "#7B9CC4" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Scroll area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!hasMessages ? (
          /* ── Empty / voice-first state ─────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-2"
          >
            {/* Floating Fort */}
            <div className="fox-float text-5xl mb-2">🦊</div>
            <p
              className="text-lg font-bold mb-1"
              style={{ color: "#EEF4FF" }}
            >
              Ask Fort anything
            </p>
            <p
              className="text-sm mb-10 max-w-[240px] leading-relaxed"
              style={{ color: "#7B9CC4" }}
            >
              I know your goals, risks, and stage — I'll give you real answers with real numbers.
            </p>

            {/* ── Hero mic button ─────────────────────────────────────────── */}
            <div className="relative flex items-center justify-center mb-6">
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
              <motion.button
                whileTap={{ scale: 0.91 }}
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 rounded-full flex items-center justify-center text-4xl transition-all ${
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
                aria-label={isListening ? "Stop" : "Tap to speak"}
              >
                {isListening ? "⏹" : "🎤"}
              </motion.button>
            </div>

            {/* Live transcript / label */}
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mb-6"
                >
                  <p className="text-sm font-semibold" style={{ color: "#EF4444" }}>
                    Listening…
                  </p>
                  {liveTranscript && (
                    <p
                      className="text-xs italic mt-1 max-w-[220px] leading-relaxed transcript-in"
                      style={{ color: "#7B9CC4" }}
                    >
                      &ldquo;{liveTranscript}&rdquo;
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm mb-6"
                  style={{ color: "#7B9CC4" }}
                >
                  Tap the mic and speak
                </motion.p>
              )}
            </AnimatePresence>

            {/* Separator */}
            {!isListening && (
              <>
                <div className="flex items-center gap-3 w-full max-w-[280px] mb-5">
                  <div className="flex-1 h-px" style={{ background: "#1A2F50" }} />
                  <span className="text-xs" style={{ color: "#2F4A6E" }}>or ask a question</span>
                  <div className="flex-1 h-px" style={{ background: "#1A2F50" }} />
                </div>

                {/* Quick-prompt chips */}
                <div className="flex flex-col gap-2 w-full max-w-[280px]">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.label)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all active:scale-[0.97]"
                      style={{
                        background: "#0C1829",
                        border: "1px solid #1A2F50",
                        color: "#EEF4FF",
                      }}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          /* ── Conversation view ──────────────────────────────────────────── */
          <AnimatePresence>
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
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

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <div
        className="sticky bottom-20 px-4 py-3"
        style={{
          background: "rgba(6,13,26,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #1A2F50",
        }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-2"
          style={{ background: "#0C1829", border: "1px solid #1A2F50" }}
        >
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-28 min-h-[36px] py-1.5"
            style={{ color: "#EEF4FF" }}
            placeholder={isListening ? "Listening…" : "Type a question…"}
            value={isListening ? liveTranscript : input}
            readOnly={isListening}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
          />

          {/* Mic button — always visible, primary affordance */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isListening ? "" : "mic-idle"
            }`}
            style={{
              background: isListening
                ? "rgba(239,68,68,0.15)"
                : "rgba(37,99,235,0.15)",
              border: isListening
                ? "1px solid rgba(239,68,68,0.4)"
                : "1px solid rgba(37,99,235,0.3)",
            }}
            aria-label={isListening ? "Stop" : "Speak"}
          >
            {isListening ? "⏹" : "🎤"}
          </motion.button>

          {/* Send */}
          <button
            onClick={() => send(input)}
            disabled={(!input.trim() && !liveTranscript) || isTyping}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg transition-all disabled:opacity-30"
            style={{ background: "#2563EB", color: "#fff" }}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>

      <Navigation />
    </main>
  );
}

// ─── Page export — Suspense required for useSearchParams ─────────────────────
export default function AskPage() {
  return (
    <Suspense>
      <AskPageContent />
    </Suspense>
  );
}
