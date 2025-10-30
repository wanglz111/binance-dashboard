const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return percentFormatter.format(value / 100);
};

export const formatNumber = (value: number, fractionDigits = 2) => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return numberFormatter.format(Number(value.toFixed(fractionDigits)));
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
  return `${numberFormatter.format(value)} ${currency}`;
};
