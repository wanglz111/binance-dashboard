const parseBoolean = (value: string | undefined, fallback = false) => {
  if (!value) return fallback;
  return value === "true" || value === "1";
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const dashboardConfig = {
  refreshIntervalMs: parseNumber(
    process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_MS,
    30_000,
  ),
  wsBaseUrl:
    process.env.NEXT_PUBLIC_BINANCE_WS_URL ?? "wss://fstream.binance.com",
  enableStream: parseBoolean(
    process.env.NEXT_PUBLIC_ENABLE_STREAM,
    false,
  ),
};
