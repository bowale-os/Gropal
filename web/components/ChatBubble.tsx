"use client";

import Image from "next/image";
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
        <div className="w-8 h-8 rounded-[3px] overflow-hidden mr-2 shrink-0 self-end flex items-center justify-center"
          style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)" }}
        >
          <Image src="/fox.png" alt="Fort" width={28} height={28} className="object-contain" />
        </div>
      )}
      <div className={`max-w-[82%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: "#FF6B2B",
                  color: "#080808",
                  borderRadius: "4px 4px 2px 4px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                }
              : {
                  background: "#0E0E0E",
                  color: "#F5F0E8",
                  border: "1px solid #242424",
                  borderRadius: "4px 4px 4px 2px",
                }
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
                className="text-xs font-mono px-3 py-1.5 transition-all hover:border-primary hover:text-primary"
                style={{
                  background: "transparent",
                  border: "1px solid #242424",
                  color: "#6B6560",
                  borderRadius: "2px",
                }}
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
        className="w-8 h-8 rounded-[3px] overflow-hidden mr-2 shrink-0 flex items-center justify-center"
        style={{ background: "rgba(255,107,43,0.1)", border: "1px solid rgba(255,107,43,0.2)" }}
      >
        <Image src="/fox.png" alt="Fort" width={28} height={28} className="object-contain" />
      </div>
      <div
        className="px-4 py-3 flex items-center gap-1.5"
        style={{ background: "#0E0E0E", border: "1px solid #242424", borderRadius: "4px 4px 4px 2px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#FF6B2B",
              animation: `bounce-dot 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
