import { featuredMarkets } from "../data/featuredMarkets.js";
import { fallbackTokenBadgeUrl, tokenBadgeUrl } from "../utils/tokenBadges.js";
import { formatMarketCurrency } from "../utils/formatters.js";

export function renderMarketList(container, getToken) {
  container.innerHTML = featuredMarkets
    .map((market) => {
      const token = getToken(market.currency);
      const price = token ? formatMarketCurrency(token.price, market.currency) : "--";
      const changeClass = market.negative ? "negative" : "";
      const itemClass = market.featured ? "watchlist-item featured" : "watchlist-item";

      return `
        <div class="${itemClass}">
          <div class="watchlist-token">
            <img
              class="coin-avatar ${market.className}"
              src="${tokenBadgeUrl(market.currency)}"
              alt=""
              width="40"
              height="40"
              aria-hidden="true"
              onerror="this.onerror=null;this.src='${fallbackTokenBadgeUrl(market.currency)}';"
            />
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
