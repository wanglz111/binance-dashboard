'use client';

import { cn } from "@/lib/utils";

type Accent = "positive" | "negative" | "neutral";

interface MetricCardProps {
  label: string;
  primary: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  deltaLabel?: string;
  deltaValue?: string;
  deltaType?: Accent;
  highlight?: Accent;
}

export function MetricCard({
  label,
  primary,
  secondaryLabel,
  secondaryValue,
  deltaLabel,
  deltaValue,
  deltaType = "neutral",
  highlight = "neutral",
}: MetricCardProps) {
  const highlightStyles =
    highlight === "positive"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : highlight === "negative"
        ? "border-rose-500/30 bg-rose-500/5"
        : "border-slate-700/60 bg-slate-900/40";

  const deltaStyles =
    deltaType === "positive"
      ? "text-emerald-400"
      : deltaType === "negative"
        ? "text-rose-400"
        : "text-slate-400";

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border px-6 py-5 shadow-lg shadow-slate-900/25 transition hover:border-slate-500/60 hover:shadow-slate-900/35",
        highlightStyles,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {deltaValue ? (
          <span className={cn("text-sm font-semibold", deltaStyles)}>
            {deltaLabel ? `${deltaLabel} ` : ""}
            {deltaValue}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <span className="text-3xl font-semibold tracking-tight text-slate-50">
          {primary}
        </span>
        {secondaryValue ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-slate-800/60 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
              {secondaryLabel ?? "对照"}
            </span>
            <span
              className={cn(
                "font-semibold",
                secondaryValue.startsWith("-")
                  ? "text-rose-400"
                  : "text-emerald-400",
              )}
            >
              {secondaryValue}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
