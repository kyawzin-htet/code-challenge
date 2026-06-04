import { featuredMarkets } from "../data/featuredMarkets.js";
import { formatMarketCurrency } from "../utils/formatters.js";

export function renderMarketList(container, getToken) {
  container.innerHTML = featuredMarkets
    .map((market) => {
      const token = getToken(market.currency);
      const price = token ? formatMarketCurrency(token.price, market.currency) : "--";
      const letter = market.currency === "WBTC" ? "W" : market.currency[0];
      const changeClass = market.negative ? "negative" : "";
      const itemClass = market.featured ? "watchlist-item featured" : "watchlist-item";

      return `
        <div class="${itemClass}">
          <div class="watchlist-token">
            <span class="coin-avatar ${market.className}" aria-hidden="true">${letter}</span>
            <div>
              <strong>${market.currency}</strong>
              <span>${market.name}</span>
            </div>
          </div>
          <div class="watchlist-price">
            <strong>${price}</strong>
            <span class="${changeClass}">${market.change}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

export function renderMarketSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;
}
