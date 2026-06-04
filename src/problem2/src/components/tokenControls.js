import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from "../config/constants.js";
import { updateTokenBadge } from "../utils/tokenBadges.js";

export function hydrateTokenSelects({ fromToken, toToken }, tokens, hasToken, findAlternativeToken) {
  const options = tokens.map((token) => `<option value="${token.currency}">${token.currency}</option>`).join("");

  fromToken.innerHTML = options;
  toToken.innerHTML = options;

  fromToken.value = hasToken(DEFAULT_FROM_TOKEN) ? DEFAULT_FROM_TOKEN : tokens[0]?.currency;
  toToken.value = hasToken(DEFAULT_TO_TOKEN) ? DEFAULT_TO_TOKEN : tokens[1]?.currency || tokens[0]?.currency;

  if (fromToken.value === toToken.value) {
    toToken.value = findAlternativeToken(fromToken.value);
  }
}

export function updateTokenBadges({ fromIcon, toIcon }, fromCurrency, toCurrency) {
  updateTokenBadge(fromIcon, fromCurrency);
  updateTokenBadge(toIcon, toCurrency);
}
