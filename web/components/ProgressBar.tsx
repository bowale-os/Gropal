"use client";

interface Props {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "#FF6B2B",
  height = "6px",
  showLabel = false,
}: Props) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="w-full">
      <div
        className="w-full overflow-hidden rounded-[2px]"
        style={{ height, background: "#161616", border: "1px solid #242424" }}
      >
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color, borderRadius: "2px" }}
        />
      </div>
      {showLabel && (
        <p className="font-mono text-[10px] mt-1 text-right" style={{ color: "#6B6560" }}>
          {Math.round(pct)}%
        </p>
      )}
    </div>
  );
}
