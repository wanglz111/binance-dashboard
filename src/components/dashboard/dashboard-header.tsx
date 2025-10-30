'use client';

import { RotateCcwIcon, ShieldCheckIcon, SignalIcon } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  nextRefreshIn: number;
  isStreamConnected: boolean;
  isStreamEnabled: boolean;
  lastUpdated?: number;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  nextRefreshIn,
  isStreamConnected,
  isStreamEnabled,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const connectionLabel = !isStreamEnabled
    ? "实时连接 · 未开启"
    : isStreamConnected
      ? "实时连接 · 正常"
      : "实时连接 · 重连中";

  const connectionStyles = !isStreamEnabled
    ? "border-slate-800/50 bg-slate-900/40 text-slate-400"
    : isStreamConnected
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : "border-amber-400/40 bg-amber-400/10 text-amber-200";

  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-800/50 bg-slate-950/40 p-6 shadow-2xl shadow-black/30 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/80 to-amber-600/80 text-slate-900">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">
            Binance 量化账户
          </p>
          <h1 className="text-2xl font-semibold text-slate-100">
            智能资产监控面板
          </h1>
          <p className="text-sm text-slate-400">
            {lastUpdated
              ? `最后同步：${formatDateTime(lastUpdated)}`
              : "等待同步..."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/40 px-4 py-2 font-medium text-slate-200 transition",
              isRefreshing
                ? "cursor-wait opacity-80"
                : "hover:border-slate-500/60 hover:text-slate-100",
            )}
          >
            <RotateCcwIcon
              className={cn(
                "h-4 w-4",
                isRefreshing ? "animate-spin text-amber-300" : "text-slate-300",
              )}
            />
            {isRefreshing ? "刷新中..." : "手动刷新"}
          </button>
        ) : null}
        <div className="flex items-center gap-2 rounded-full border border-slate-800/50 bg-slate-900/40 px-4 py-2">
          <span className="text-slate-400">下次刷新</span>
          <strong className="text-slate-100">
            {nextRefreshIn.toString().padStart(2, "0")} 秒
          </strong>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2",
            connectionStyles,
          )}
        >
          <SignalIcon className="h-4 w-4" />
          <span>{connectionLabel}</span>
        </div>
      </div>
    </header>
  );
}
