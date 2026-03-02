"use client";

interface Props {
  className?: string;
}

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: "#1A2F50" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#0C1829", border: "1px solid #1A2F50" }}>
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 mb-3" style={{ background: "#0C1829", border: "1px solid #1A2F50" }}>
      <div className="flex justify-between mb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-2 w-full mb-2 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
