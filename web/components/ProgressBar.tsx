"use client";

interface Props {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, max = 100, color = "#2563EB", height = "8px", showLabel = false }: Props) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="w-full">
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1A2F50" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <p className="text-xs mt-1 text-right" style={{ color: "#7B9CC4" }}>{Math.round(pct)}%</p>
      )}
    </div>
  );
}
