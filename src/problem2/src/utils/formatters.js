export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    ...options,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 2 : 6,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatMarketCurrency(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: currency === "SWTH" ? 5 : 2,
    maximumFractionDigits: currency === "SWTH" ? 5 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}
