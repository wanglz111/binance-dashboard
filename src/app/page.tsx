'use client';

import { useState } from "react";
import { AnalysisPanel } from "@/components/dashboard/analysis-panel";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { TradesTable } from "@/components/dashboard/trades-table";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function Home() {
  const {
    data,
    error,
    isLoading,
    stats,
    nextRefreshIn,
    isStreamConnected,
    isStreamEnabled,
    refresh,
  } = useDashboardData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const baseCurrency = data?.summary?.baseCurrency ?? "USDT";

  const metricCards =
    stats?.map((stat) => {
      const type = stat.type ?? "currency";

      const primary =
        type === "percent"
          ? formatPercent(stat.value)
          : formatCurrency(stat.value, stat.currency ?? baseCurrency);

      const secondaryValue =
        type === "range" && stat.secondary !== undefined
          ? formatCurrency(stat.secondary, stat.currency ?? baseCurrency)
          : undefined;

      const secondaryLabel =
        type === "range" ? "最大亏损" : stat.secondaryLabel;

      const deltaValue =
        typeof stat.delta === "number" ? formatPercent(stat.delta) : undefined;

      const deltaType =
        typeof stat.delta === "number"
          ? stat.delta > 0
            ? "positive"
            : stat.delta < 0
              ? "negative"
              : "neutral"
          : "neutral";

      return (
        <MetricCard
          key={stat.label}
          label={stat.label}
          primary={primary}
          secondaryLabel={secondaryLabel}
          secondaryValue={secondaryValue}
          deltaLabel={stat.deltaLabel}
          deltaValue={deltaValue}
          deltaType={deltaType}
          highlight={stat.highlight}
        />
      );
    }) ?? [];

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-12">
        <DashboardHeader
          nextRefreshIn={nextRefreshIn}
          isStreamConnected={isStreamConnected}
          isStreamEnabled={isStreamEnabled}
          lastUpdated={data?.summary?.lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {error ? (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
            <h2 className="text-lg font-semibold">
              {"数据加载失败"}
            </h2>
            <p className="mt-2 text-sm text-rose-100/80">
              {error instanceof Error
                ? error.message
                : "请稍后重试。"}
            </p>
          </div>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {metricCards.length > 0
            ? metricCards
            : Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`metric-skeleton-${index}`}
                  className="h-40 animate-pulse rounded-2xl border border-slate-800/40 bg-slate-900/30"
                />
              ))}
        </section>

        <PositionsTable
          positions={data?.positions ?? []}
          currency={baseCurrency}
          isLoading={isLoading}
        />

        <TradesTable
          trades={data?.trades ?? []}
          currency={baseCurrency}
          isLoading={isLoading}
        />

        <AnalysisPanel summary={data?.summary} trades={data?.trades ?? []} />
      </div>
    </main>
  );
}
