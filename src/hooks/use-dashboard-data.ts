'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { dashboardConfig } from "@/config/dashboard";
import type { DashboardPayload } from "@/lib/binance/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as DashboardPayload;
};

const REFRESH_INTERVAL = dashboardConfig.refreshIntervalMs;

type DashboardStat = {
  label: string;
  value: number;
  currency?: string;
  type: "currency" | "percent" | "range";
  secondary?: number;
  secondaryLabel?: string;
  highlight?: "positive" | "negative" | "neutral";
  delta?: number;
  deltaLabel?: string;
};

export function useDashboardData() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardPayload>("/api/binance/dashboard", fetcher, {
    refreshInterval: dashboardConfig.enableStream ? 60_000 : REFRESH_INTERVAL,
    revalidateOnFocus: false,
  });

  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [nextRefreshIn, setNextRefreshIn] = useState(
    Math.floor(REFRESH_INTERVAL / 1000),
  );
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setNextRefreshIn(Math.floor(REFRESH_INTERVAL / 1000));

    countdownRef.current = setInterval(() => {
      setNextRefreshIn((value) => {
        if (value <= 1) {
          return Math.floor(REFRESH_INTERVAL / 1000);
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [data]);

  useEffect(() => {
    if (!dashboardConfig.enableStream) {
      return;
    }

    let websocket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
    let activeListenKey: string | null = null;
    let isUnmounted = false;

    const scheduleReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      reconnectTimer = setTimeout(() => {
        if (!isUnmounted) {
          connect();
        }
      }, 5_000);
    };

    const connect = async () => {
      try {
        const response = await fetch("/api/binance/listen-key", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to request listen key");
        }

        const payload = (await response.json()) as { listenKey: string };
        const listenKey = payload.listenKey;

        if (!listenKey) {
          throw new Error("listen key is missing in response");
        }

        activeListenKey = listenKey;

        websocket = new WebSocket(
          `${dashboardConfig.wsBaseUrl}/ws/${listenKey}`,
        );

        websocket.onopen = () => {
          if (isUnmounted) return;
          setIsStreamConnected(true);
        };

        websocket.onclose = () => {
          if (isUnmounted) return;
          setIsStreamConnected(false);
          scheduleReconnect();
        };

        websocket.onerror = () => {
          websocket?.close();
        };

        websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data as string);
            const eventType = message?.e;

            if (
              eventType === "ACCOUNT_UPDATE" ||
              eventType === "ORDER_TRADE_UPDATE"
            ) {
              mutate();
            }
          } catch (streamError) {
            console.warn("Failed to parse stream payload", streamError);
          }
        };

        keepAliveTimer = setInterval(() => {
          if (!activeListenKey) return;
          fetch("/api/binance/listen-key", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ listenKey: activeListenKey }),
          }).catch((keepAliveError) => {
            console.warn("Failed to keep listen key alive", keepAliveError);
          });
        }, 30 * 60 * 1000);
      } catch (connectionError) {
        console.warn("Failed to connect to Binance stream", connectionError);
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      setIsStreamConnected(false);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
      }
      websocket?.close();
    };
  }, [mutate]);

  const stats = useMemo<DashboardStat[] | null>(() => {
    if (!data?.summary) {
      return null;
    }

    const { summary } = data;

    return [
      {
        label: "总资产折合",
        value: summary.totalAsset,
        currency: summary.baseCurrency,
        type: "currency",
        highlight: "neutral",
        delta: summary.totalProfitRate,
        deltaLabel: "较初始",
      },
      {
        label: "总盈利",
        value: summary.totalProfit,
        currency: summary.baseCurrency,
        type: "currency",
        highlight: summary.totalProfit >= 0 ? "positive" : "negative",
        delta: summary.totalProfitRate,
        deltaLabel: "较初始",
      },
      {
        label: "总盈利率",
        value: summary.totalProfitRate,
        type: "percent",
        highlight: summary.totalProfitRate >= 0 ? "positive" : "negative",
      },
      {
        label: "未实现盈亏",
        value: summary.unrealizedPnl,
        currency: summary.baseCurrency,
        type: "currency",
        highlight: summary.unrealizedPnl >= 0 ? "positive" : "negative",
        delta: summary.unrealizedRate,
        deltaLabel: "对应收益率",
      },
      {
        label: "未实现盈亏率",
        value: summary.unrealizedRate,
        type: "percent",
        highlight: summary.unrealizedRate >= 0 ? "positive" : "negative",
      },
      {
        label: "最大盈利 / 最大亏损",
        value: summary.maxWin,
        secondary: summary.maxLoss,
        currency: summary.baseCurrency,
        type: "range",
        highlight:
          summary.maxWin >= Math.abs(summary.maxLoss) ? "positive" : "negative",
        secondaryLabel: "最大亏损",
      },
    ];
  }, [data]);

  const isStreamEnabled = dashboardConfig.enableStream;

  const refresh = () => mutate(undefined, { revalidate: true });

  return {
    data,
    error,
    isLoading,
    isStreamConnected: isStreamConnected && isStreamEnabled,
    isStreamEnabled,
    stats,
    nextRefreshIn,
    refresh,
  };
}
