import { env } from "@/lib/env";
import { BinanceRestClient } from "@/lib/binance/client";
import type {
  DashboardPayload,
  FuturesAccount,
  FuturesOrder,
  IncomeRecord,
  OrderViewModel,
  PositionViewModel,
  Trade,
  TradeViewModel,
  DashboardSummary,
} from "@/lib/binance/types";
import { createMockService } from "@/lib/binance/mock";

const BASE_CURRENCY_FALLBACK = "USDT";
const DEFAULT_PRICE_PRECISION = 2;

const getPrecisionFromString = (
  value: string | undefined,
  fallback = DEFAULT_PRICE_PRECISION,
) => {
  if (!value) return fallback;

  const [, decimals] = value.split(".");
  return decimals ? Math.max(decimals.length, fallback) : fallback;
};

export type BinanceServiceContract = {
  getAccount(): Promise<FuturesAccount>;
  getTrades(limit?: number): Promise<Trade[]>;
  getIncome(limit?: number, incomeType?: string): Promise<IncomeRecord[]>;
  getOpenOrders(symbol?: string): Promise<FuturesOrder[]>;
  createListenKey(): Promise<string>;
  keepAliveListenKey(listenKey: string): Promise<void>;
  getDashboardPayload(): Promise<DashboardPayload>;
};

class BinanceService implements BinanceServiceContract {
  private readonly client = new BinanceRestClient();

  async getAccount(): Promise<FuturesAccount> {
    return this.client.signedFetch("/fapi/v2/account");
  }

  async getTrades(limit = 50): Promise<Trade[]> {
    return this.client.signedFetch("/fapi/v1/userTrades", {
      limit,
    });
  }

  async getOpenOrders(symbol?: string): Promise<FuturesOrder[]> {
    return this.client.signedFetch("/fapi/v1/openOrders", {
      symbol,
    });
  }

  async getIncome(limit = 100, incomeType = "REALIZED_PNL"): Promise<
    IncomeRecord[]
  > {
    return this.client.signedFetch("/fapi/v1/income", {
      limit,
      incomeType,
    });
  }

  async createListenKey(): Promise<string> {
    const response = await this.client.keyedFetch<{ listenKey: string }>(
      "/fapi/v1/listenKey",
      "POST",
    );
    return response.listenKey;
  }

  async keepAliveListenKey(listenKey: string): Promise<void> {
    await this.client.keyedFetch("/fapi/v1/listenKey", "PUT", {
      listenKey,
    });
  }

  async getDashboardPayload(): Promise<DashboardPayload> {
    const [account, trades, income, orders] = await Promise.all([
      this.getAccount(),
      this.getTrades(500),
      this.getIncome(500, "REALIZED_PNL"),
      this.getOpenOrders(),
    ]);

    const summary = buildSummary(
      account,
      trades,
      income,
      env.BINANCE_INITIAL_EQUITY,
    );
    const positions = buildPositions(account);
    const tradeViews = buildTrades(trades);
    const orderViews = buildOrders(orders);

    return {
      summary,
      positions,
      trades: tradeViews,
      orders: orderViews,
    };
  }
}

const service: BinanceServiceContract = env.DASHBOARD_MOCK_MODE
  ? createMockService()
  : new BinanceService();

export const binanceService = service;

export function buildSummary(
  account: FuturesAccount,
  trades: Trade[],
  incomes: IncomeRecord[],
  initialEquity: number,
): DashboardSummary {
  const totalMarginBalance = Number(
    account.totalMarginBalance ?? account.totalWalletBalance ?? 0,
  );
  const totalAsset = totalMarginBalance;
  const totalUnrealizedProfit = Number(account.totalUnrealizedProfit ?? 0);

  const totalProfit = totalMarginBalance - initialEquity;
  const totalProfitRate =
    initialEquity > 0 ? (totalProfit / initialEquity) * 100 : 0;
  const unrealizedRate =
    totalMarginBalance !== 0
      ? (totalUnrealizedProfit / totalMarginBalance) * 100
      : 0;

  const realizedPnls = incomes
    .map((record) => Number(record.income))
    .filter((value) => Number.isFinite(value));

  const maxWin =
    realizedPnls.length > 0
      ? Math.max(0, ...realizedPnls)
      : Math.max(0, ...trades.map((trade) => Number(trade.realizedPnl ?? 0)));

  const maxLoss =
    realizedPnls.length > 0
      ? Math.min(0, ...realizedPnls)
      : Math.min(0, ...trades.map((trade) => Number(trade.realizedPnl ?? 0)));

  const baseCurrency =
    account.assets.find((asset) => Number(asset.walletBalance) > 0)?.asset ??
    BASE_CURRENCY_FALLBACK;

  const commissionByAsset = trades.reduce<Record<string, number>>(
    (acc, trade) => {
      const asset = trade.commissionAsset || baseCurrency;
      const commission = Number(trade.commission ?? 0);
      if (!Number.isFinite(commission)) return acc;
      acc[asset] = (acc[asset] ?? 0) + commission;
      return acc;
    },
    {},
  );

  const totalCommission = Object.values(commissionByAsset).reduce(
    (sum, value) => sum + value,
    0,
  );

  const totalTradeVolume = trades.reduce((sum, trade) => {
    const amount = Number(trade.quoteQty ?? 0);
    return sum + (Number.isFinite(amount) ? Math.abs(amount) : 0);
  }, 0);

  const totalPositionNotional = account.positions.reduce((sum, position) => {
    const notional = Number(position.notional ?? 0);
    return sum + (Number.isFinite(notional) ? Math.abs(notional) : 0);
  }, 0);

  const lastUpdated =
    account.updateTime || trades[0]?.time || incomes[0]?.time || Date.now();

  return {
    totalAsset,
    totalProfit,
    totalProfitRate,
    unrealizedPnl: totalUnrealizedProfit,
    unrealizedRate,
    maxWin,
    maxLoss,
    lastUpdated,
    baseCurrency,
    totalCommission,
    commissionByAsset,
    totalTradeVolume,
    totalTradeCount: trades.length,
    totalPositionNotional,
  };
}

export function buildPositions(account: FuturesAccount): PositionViewModel[] {
  return account.positions
    .map((position) => {
      const quantity = Number(position.positionAmt ?? 0);

      if (Math.abs(quantity) < 1e-8) {
        return null;
      }

      const entryPriceStr = position.entryPrice ?? "0";
      const markPriceStr = position.markPrice ??
        (quantity !== 0 ? Math.abs(Number(position.notional ?? 0) / quantity).toString() : "0");

      const entryPrice = Number(entryPriceStr ?? 0);
      const notional = Number(position.notional ?? 0);
      const unrealizedProfit =
        Number(position.unrealizedProfit ?? position.unRealizedProfit ?? 0) ||
        0;

      const markPrice = Number(markPriceStr ?? 0) ||
        (quantity !== 0 ? Math.abs(notional / quantity) : 0);

      const pricePrecision = Math.max(
        getPrecisionFromString(entryPriceStr),
        getPrecisionFromString(markPriceStr),
      );

      const leverage = Number(position.leverage ?? 0) || 0;
      const notionalAbs = Math.abs(notional);
      const marginBasis =
        leverage > 0
          ? notionalAbs / leverage
          : notionalAbs;
      const pnlRate =
        marginBasis > 0
          ? (unrealizedProfit / marginBasis) * 100
          : 0;

      const isolated =
        String(position.isolated ?? "false").toLowerCase() === "true";

      const marginValue = isolated
        ? Number(position.isolatedWallet ?? marginBasis)
        : marginBasis;

      return {
        symbol: position.symbol,
        side: quantity >= 0 ? "LONG" : "SHORT",
        entryPrice,
        markPrice,
        pricePrecision,
        positionAmount: quantity,
        leverage,
        unrealizedPnl: unrealizedProfit,
        pnlRate,
        notional,
        isolated,
        isolatedMargin: marginValue,
        updateTime: position.updateTime ?? account.updateTime ?? Date.now(),
      };
    })
    .filter((position): position is PositionViewModel => Boolean(position))
    .sort((a, b) => Math.abs(b.notional) - Math.abs(a.notional));
}

export function buildTrades(trades: Trade[]): TradeViewModel[] {
  return trades
    .map((trade) => {
      const side: "BUY" | "SELL" = trade.buyer ? "BUY" : "SELL";
      const pricePrecision = getPrecisionFromString(trade.price);

      return {
        id: trade.id,
        symbol: trade.symbol,
        side,
        price: Number(trade.price ?? 0),
        pricePrecision,
        qty: Number(trade.qty ?? 0),
        quoteQty: Number(trade.quoteQty ?? 0),
        realizedPnl: Number(trade.realizedPnl ?? 0),
        commission: Number(trade.commission ?? 0),
        commissionAsset: trade.commissionAsset,
        time: trade.time,
        isMaker: trade.maker,
      };
    })
    .sort((a, b) => b.time - a.time);
}

export function buildOrders(orders: FuturesOrder[]): OrderViewModel[] {
  return orders
    .map((order) => {
      const pricePrecision = getPrecisionFromString(order.price);
      const qtyPrecision = getPrecisionFromString(order.origQty, 3);
      const price = Number(order.price ?? 0);
      const origQty = Number(order.origQty ?? 0);
      const executedQty = Number(order.executedQty ?? 0);
      const quoteAmount = Number(order.cumQuote ?? 0);
      const remainingQty = Math.max(origQty - executedQty, 0);

      return {
        orderId: order.orderId,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        status: order.status,
        price,
        pricePrecision,
        origQty,
        executedQty,
        remainingQty,
        quoteAmount,
        qtyPrecision,
        updateTime: order.updateTime ?? order.time ?? Date.now(),
      };
    })
    .sort((a, b) => b.updateTime - a.updateTime);
}
