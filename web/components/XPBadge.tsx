"use client";

interface Props {
  xp: number;
  size?: "sm" | "md" | "lg";
}

export default function XPBadge({ xp, size = "sm" }: Props) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizes[size]}`}
      style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)" }}
    >
      ⚡ +{xp} XP
    </span>
  );
}
