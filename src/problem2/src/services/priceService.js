import { POPULAR_TOKEN_ORDER, PRICE_ENDPOINT } from "../config/constants.js";

export async function fetchPrices() {
  const response = await fetch(PRICE_ENDPOINT, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Price feed failed with ${response.status}`);
  }

  return response.json();
}

export function normalizePrices(prices) {
  const latestByCurrency = new Map();

  prices.forEach((item) => {
    if (!item.currency || !Number.isFinite(item.price) || item.price <= 0) {
      return;
    }

    const current = latestByCurrency.get(item.currency);
    const nextTime = new Date(item.date).getTime() || 0;
    const currentTime = current ? new Date(current.date).getTime() || 0 : -1;

    if (!current || nextTime >= currentTime) {
      latestByCurrency.set(item.currency, {
        currency: item.currency,
        price: item.price,
        date: item.date,
      });
    }
  });

  return [...latestByCurrency.values()].sort((a, b) => {
    const aIndex = POPULAR_TOKEN_ORDER.indexOf(a.currency);
    const bIndex = POPULAR_TOKEN_ORDER.indexOf(b.currency);

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    }

    return a.currency.localeCompare(b.currency);
  });
}
