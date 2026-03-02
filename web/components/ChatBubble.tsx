"use client";

import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
  onActionClick?: (action: string) => void;
}

export default function ChatBubble({ message, onActionClick }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 text-base self-end"
          style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}
        >
          🦊
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            isUser
              ? { background: "#2563EB", color: "#fff", borderBottomRightRadius: "4px" }
              : { background: "#0C1829", color: "#EEF4FF", border: "1px solid #1A2F50", borderBottomLeftRadius: "4px" }
          }
        >
          {message.content}
        </div>
        {message.suggested_actions && message.suggested_actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggested_actions.map((action) => (
              <button
                key={action.action}
                onClick={() => onActionClick?.(action.action)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)" }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 text-base"
        style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)" }}
      >
        🦊
      </div>
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: "#0C1829", border: "1px solid #1A2F50", borderBottomLeftRadius: "4px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "#2563EB",
              animation: `bounce-dot 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
