"use client";

import { useMemo } from "react";
import type { OrderViewModel } from "@/lib/binance/types";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: OrderViewModel[];
  currency: string;
  isLoading?: boolean;
}

const HEADERS = [
  "时间",
  "方向",
  "类型",
  "委托价",
  "委托数量",
  "已成交",
  "剩余数量",
  "成交金额",
  "状态",
];

export function OrdersTable({ orders, currency, isLoading = false }: OrdersTableProps) {
  const groupedOrders = useMemo(() => {
    const map = new Map<string, OrderViewModel[]>();

    orders.forEach((order) => {
      const list = map.get(order.symbol) ?? [];
      list.push(order);
      map.set(order.symbol, list);
    });

    return Array.from(map.entries())
      .map(([symbol, items]) => ({
        symbol,
        items: items.sort((a, b) => b.updateTime - a.updateTime),
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [orders]);

  const totalOrders = orders.length;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-950/30 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800/40 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">委托订单</h3>
          <p className="text-sm text-slate-400">
            按币种分组展示，当前共 {totalOrders} 笔委托
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="px-6 py-10 text-center text-sm text-slate-400">正在同步委托订单...</div>
      ) : totalOrders === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">暂无未完成委托</div>
      ) : (
        <div className="divide-y divide-slate-800/40">
          {groupedOrders.map((group) => (
            <div key={group.symbol} className="overflow-x-auto">
              <div className="flex items-center justify-between bg-slate-900/40 px-6 py-3 text-sm">
                <div className="font-semibold text-slate-100">{group.symbol}</div>
                <div className="text-xs text-slate-400">{group.items.length} 笔挂单</div>
              </div>
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
                  {group.items.map((order) => {
                    const isBuy = order.side === "BUY";
                    return (
                      <tr key={`${order.orderId}-${order.updateTime}`} className="hover:bg-slate-900/30">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatDateTime(order.updateTime)}
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">{order.type}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatNumber(order.price, order.pricePrecision)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatNumber(order.origQty, order.qtyPrecision)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatNumber(order.executedQty, order.qtyPrecision)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatNumber(order.remainingQty, order.qtyPrecision)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                          {formatCurrency(order.quoteAmount, currency)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-amber-200">
                          {order.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
