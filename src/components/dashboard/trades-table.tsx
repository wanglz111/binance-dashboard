'use client';

import { useMemo, useState } from "react";
import type { TradeViewModel } from "@/lib/binance/types";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TradesTableProps {
  trades: TradeViewModel[];
  currency: string;
  isLoading?: boolean;
}

const DISPLAY_LIMIT = 10;

const HEADERS = [
  "时间",
  "币种",
  "方向",
  "成交价格",
  "成交数量",
  "成交金额",
  "手续费",
  "已实现盈亏",
];

export function TradesTable({
  trades,
  currency,
  isLoading = false,
}: TradesTableProps) {
  const [showAll, setShowAll] = useState(false);

  const { totalRealized, visibleTrades, hasMore, hiddenCount } = useMemo(() => {
    const realizedPnls = trades.map((trade) => trade.realizedPnl);
    const totalRealizedValue = realizedPnls.reduce(
      (acc, val) => acc + val,
      0,
    );

    const hasMoreRecords = trades.length > DISPLAY_LIMIT;
    const hidden = hasMoreRecords ? trades.length - DISPLAY_LIMIT : 0;

    return {
      totalRealized: totalRealizedValue,
      visibleTrades: showAll ? trades : trades.slice(0, DISPLAY_LIMIT),
      hasMore: hasMoreRecords,
      hiddenCount: hidden,
    };
  }, [showAll, trades]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-950/30 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800/40 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">最近交易记录</h3>
          <p className="text-sm text-slate-400">
            显示 {visibleTrades.length} / {trades.length} 笔交易 · 累计已实现盈亏{" "}
            <span
              className={cn(
                "font-semibold",
                totalRealized >= 0 ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {formatCurrency(totalRealized, currency)}
            </span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/40">
          <thead className="bg-slate-900/60">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  正在加载交易记录...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  暂无交易记录
                </td>
              </tr>
            ) : (
              visibleTrades.map((trade) => {
                const isBuy = trade.side === "BUY";
                const pnlPositive = trade.realizedPnl >= 0;

                return (
                  <tr
                    key={`${trade.id}-${trade.time}`}
                    className="hover:bg-slate-900/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatDateTime(trade.time)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-100">
                      {trade.symbol}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          isBuy
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40"
                            : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/40",
                        )}
                      >
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatNumber(trade.price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatNumber(trade.qty, 4)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatCurrency(trade.quoteQty, currency)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatCurrency(trade.commission, trade.commissionAsset)}
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm font-semibold",
                        pnlPositive ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {formatCurrency(trade.realizedPnl, currency)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="border-t border-slate-800/40 bg-slate-900/30 px-6 py-4 text-right">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="rounded-full border border-slate-700/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500/60 hover:text-slate-100"
          >
            {showAll ? "收起记录" : `展开剩余 ${hiddenCount} 笔交易`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
