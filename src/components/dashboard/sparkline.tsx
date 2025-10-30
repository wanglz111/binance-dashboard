'use client';

import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 160,
  height = 48,
  className,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-12 w-[160px] items-center justify-center rounded-xl border border-slate-800/40 bg-slate-900/40 text-xs text-slate-500",
          className,
        )}
      >
        无数据
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const isPositive = lastValue >= firstValue;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      <polyline
        fill="none"
        stroke={isPositive ? "#34d399" : "#f87171"}
        strokeWidth={2.5}
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
