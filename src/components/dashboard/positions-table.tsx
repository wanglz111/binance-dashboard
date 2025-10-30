'use client';

import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { PositionViewModel } from "@/lib/binance/types";
import { cn } from "@/lib/utils";

interface PositionsTableProps {
  positions: PositionViewModel[];
  currency: string;
  isLoading?: boolean;
}

export function PositionsTable({
  positions,
  currency,
  isLoading = false,
}: PositionsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-950/40 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800/40 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">当前仓位</h3>
          <p className="text-sm text-slate-400">
            持仓数量：{positions.length || 0}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/40">
          <thead className="bg-slate-900/60">
            <tr>
              {[
                "币种",
                "方向",
                "开仓价格",
                "标记价格",
                "持仓量",
                "未实现盈亏",
                "盈亏率",
                "杠杆",
                "保证金",
              ].map((header) => (
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
                  colSpan={9}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  正在加载仓位数据...
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  当前暂无持仓
                </td>
              </tr>
            ) : (
              positions.map((position) => {
                const isLong = position.side === "LONG";
                const pnlPositive = position.unrealizedPnl >= 0;

                return (
                  <tr key={position.symbol} className="hover:bg-slate-900/40">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-100">
                      {position.symbol}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          isLong
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40"
                            : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/40",
                        )}
                      >
                        {isLong ? "LONG" : "SHORT"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatNumber(position.entryPrice)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatNumber(position.markPrice)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatNumber(position.positionAmount, 3)}
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm font-semibold",
                        pnlPositive ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {formatCurrency(position.unrealizedPnl, currency)}
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm font-semibold",
                        position.pnlRate >= 0
                          ? "text-emerald-400"
                          : "text-rose-400",
                      )}
                    >
                      {formatPercent(position.pnlRate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {position.leverage.toFixed(2)}x
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {formatCurrency(position.isolatedMargin, currency)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
