'use client';

import type { DashboardSummary, TradeViewModel } from "@/lib/binance/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Sparkline } from "@/components/dashboard/sparkline";
import { LightbulbIcon } from "lucide-react";
import { useMemo } from "react";

interface AnalysisPanelProps {
  summary?: DashboardSummary;
  trades: TradeViewModel[];
}

export function AnalysisPanel({ summary, trades }: AnalysisPanelProps) {
  const analysis = useMemo(() => {
    if (!trades || trades.length === 0) {
      return null;
    }

    const cumulative: number[] = [];
    trades
      .slice()
      .reverse()
      .forEach((trade, index) => {
        const previous = cumulative[index - 1] ?? 0;
        cumulative.push(previous + trade.realizedPnl);
      });

    const wins = trades.filter((trade) => trade.realizedPnl > 0).length;
    const losses = trades.filter((trade) => trade.realizedPnl < 0).length;
    const winRate =
      trades.length > 0 ? (wins / trades.length) * 100 : undefined;

    const avgWin =
      wins > 0
        ? trades
            .filter((trade) => trade.realizedPnl > 0)
            .reduce((acc, trade) => acc + trade.realizedPnl, 0) / wins
        : undefined;

    const avgLoss =
      losses > 0
        ? trades
            .filter((trade) => trade.realizedPnl < 0)
            .reduce((acc, trade) => acc + trade.realizedPnl, 0) / losses
        : undefined;

    return {
      cumulative,
      winRate,
      avgWin,
      avgLoss,
    };
  }, [trades]);

  return (
    <div className="grid gap-6 rounded-3xl border border-slate-800/40 bg-slate-950/40 p-6 shadow-xl shadow-black/15 backdrop-blur lg:grid-cols-[2fr_3fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
            <LightbulbIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              策略洞察（预览）
            </h3>
            <p className="text-sm text-slate-400">
              概览账户运行状态，为后续 AI 分析提供上下文。
            </p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <StatItem
            label="总资产"
            value={summary ? formatCurrency(summary.totalAsset, summary.baseCurrency) : "--"}
          />
          <StatItem
            label="未实现盈亏率"
            value={
              summary ? formatPercent(summary.unrealizedRate) : "--"
            }
          />
          <StatItem
            label="最大盈利"
            value={
              summary
                ? formatCurrency(summary.maxWin, summary.baseCurrency)
                : "--"
            }
          />
          <StatItem
            label="最大亏损"
            value={
              summary
                ? formatCurrency(summary.maxLoss, summary.baseCurrency)
                : "--"
            }
          />
        </dl>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            已实现盈亏趋势
          </h4>
          <button
            type="button"
            className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-400/20"
            disabled
          >
            AI 分析 · 即将上线
          </button>
        </div>
        <Sparkline
          data={analysis?.cumulative ?? []}
          className="w-full justify-self-end"
          width={320}
          height={72}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TrendItem
            label="胜率"
            value={
              analysis?.winRate !== undefined
                ? formatPercent(analysis.winRate)
                : "--"
            }
          />
          <TrendItem
            label="平均盈利"
            value={
              analysis?.avgWin !== undefined
                ? formatCurrency(
                    analysis.avgWin,
                    summary?.baseCurrency ?? "USDT",
                  )
                : "--"
            }
          />
          <TrendItem
            label="平均亏损"
            negative
            value={
              analysis?.avgLoss !== undefined
                ? formatCurrency(
                    analysis.avgLoss,
                    summary?.baseCurrency ?? "USDT",
                  )
                : "--"
            }
          />
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="rounded-2xl border border-slate-800/40 bg-slate-900/40 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-lg font-semibold text-slate-100">{value}</dd>
    </div>
  );
}

interface TrendItemProps {
  label: string;
  value: string;
  negative?: boolean;
}

function TrendItem({ label, value, negative = false }: TrendItemProps) {
  return (
    <div className="rounded-2xl border border-slate-800/40 bg-slate-900/30 px-4 py-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-2 text-lg font-semibold ${
          negative ? "text-rose-400" : "text-emerald-400"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
