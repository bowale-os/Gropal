"use client";

interface Props {
  className?: string;
}

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-[2px] ${className}`}
      style={{ background: "#161616", border: "1px solid #242424" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-[4px] w-full mb-3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="card p-4 mb-3">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-[4px] w-full mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
