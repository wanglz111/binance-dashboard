export interface FuturesAsset {
  asset: string;
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
  maintMargin: string;
  crossWalletBalance: string;
  crossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
}

export type PositionSide = "BOTH" | "LONG" | "SHORT";

export interface FuturesPosition {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedProfit: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: "true" | "false";
  entryPrice: string;
  maxNotional: string;
  positionSide: PositionSide;
  positionAmt: string;
  notional: string;
  isolatedWallet: string;
  updateTime: number;
  markPrice: string;
}

export interface FuturesAccount {
  feeTier: number;
  canTrade: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  updateTime: number;
  totalInitialMargin: string;
  totalMaintMargin: string;
  totalWalletBalance: string;
  totalUnrealizedProfit: string;
  totalMarginBalance: string;
  totalPositionInitialMargin: string;
  totalOpenOrderInitialMargin: string;
  totalCrossWalletBalance: string;
  totalCrossUnPnl: string;
  availableBalance: string;
  maxWithdrawAmount: string;
  assets: FuturesAsset[];
  positions: FuturesPosition[];
}

export interface Trade {
  symbol: string;
  id: number;
  orderId: number;
  orderListId: number;
  price: string;
  qty: string;
  realizedPnl: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  buyer: boolean;
  maker: boolean;
  isBestMatch: boolean;
  side?: "BUY" | "SELL";
}

export interface IncomeRecord {
  symbol: string;
  incomeType: string;
  income: string;
  asset: string;
  time: number;
  info: string;
  tranId: number;
  tradeId: string;
}

export interface AccountMetrics {
  totalWalletBalance: number;
  totalMarginBalance: number;
  totalUnrealizedProfit: number;
  availableBalance: number;
  maxWithdrawAmount: number;
  lastUpdateTime: number;
}

export interface PositionViewModel {
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  markPrice: number;
  positionAmount: number;
  leverage: number;
  unrealizedPnl: number;
  pnlRate: number;
  notional: number;
  isolated: boolean;
  isolatedMargin: number;
  updateTime: number;
}

export interface TradeViewModel {
  id: number;
  symbol: string;
  side: "BUY" | "SELL";
  price: number;
  qty: number;
  quoteQty: number;
  realizedPnl: number;
  commission: number;
  commissionAsset: string;
  time: number;
  isMaker: boolean;
}

export interface DashboardSummary {
  totalAsset: number;
  totalProfit: number;
  totalProfitRate: number;
  unrealizedPnl: number;
  unrealizedRate: number;
  maxWin: number;
  maxLoss: number;
  lastUpdated: number;
  baseCurrency: string;
}

export interface DashboardPayload {
  summary: DashboardSummary;
  positions: PositionViewModel[];
  trades: TradeViewModel[];
}
