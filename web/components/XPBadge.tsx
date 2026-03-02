"use client";

interface Props {
  xp: number;
  size?: "sm" | "md" | "lg";
}

export default function XPBadge({ xp, size = "sm" }: Props) {
  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold rounded-[2px] ${sizes[size]}`}
      style={{
        background: "rgba(255,214,10,0.1)",
        color: "#FFD60A",
        border: "1px solid rgba(255,214,10,0.25)",
      }}
    >
      ▲ +{xp} XP
    </span>
  );
}
