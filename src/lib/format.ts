const DEFAULT_NUMBER_PRECISION = 2;

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatterCache = new Map<number, Intl.NumberFormat>();

const getNumberFormatter = (precision: number) => {
  if (!numberFormatterCache.has(precision)) {
    numberFormatterCache.set(
      precision,
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    );
  }

  return numberFormatterCache.get(precision)!;
};

export const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return percentFormatter.format(value / 100);
};

export const formatNumber = (
  value: number,
  fractionDigits = DEFAULT_NUMBER_PRECISION,
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  const formatter = getNumberFormatter(fractionDigits);
  return formatter.format(Number(value.toFixed(fractionDigits)));
};

export const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

export const formatCurrency = (value: number, currency = "USDT") => {
  if (!Number.isFinite(value)) {
    return `-- ${currency}`;
  }
  return `${getNumberFormatter(DEFAULT_NUMBER_PRECISION).format(value)} ${currency}`;
};
