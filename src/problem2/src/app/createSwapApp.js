import { PLATFORM_FEE } from "../config/constants.js";
import { fallbackPrices } from "../data/fallbackPrices.js";
import { getBalance, setBalance } from "../data/balances.js";
import { renderMarketList, renderMarketSkeleton } from "../components/marketList.js";
import { createSidebarMenu } from "../components/sidebarMenu.js";
import { renderStatsPanel } from "../components/statsPanel.js";
import { hydrateTokenSelects, updateTokenBadges } from "../components/tokenControls.js";
import { fetchPrices, normalizePrices } from "../services/priceService.js";
import { parseAmount, sanitizeAmount } from "../utils/amounts.js";
import { formatCurrency, formatNumber } from "../utils/formatters.js";
import { wait } from "../utils/wait.js";

export function createSwapApp(elements) {
  const state = {
    tokens: [],
    isLoading: true,
    isSubmitting: false,
  };

  const sidebarMenu = createSidebarMenu({
    menuButton: elements.menuButton,
    closeButton: elements.closeMenuButton,
    sidebar: elements.sidebar,
    backdrop: elements.sidebarBackdrop,
    links: elements.sidebarLinks,
  });

  async function init() {
    renderLoading();
    bindEvents();

    try {
      const prices = await fetchPrices();
      state.tokens = normalizePrices(prices);
      elements.priceSource.textContent = "Live prices loaded";
    } catch (error) {
      state.tokens = normalizePrices(fallbackPrices);
      elements.priceSource.textContent = "Using fallback prices";
    } finally {
      state.isLoading = false;
      hydrateControls();
      updateQuote();
      hidePageLoader();
    }
  }

  function bindEvents() {
    sidebarMenu.bind();

    elements.fromAmount.addEventListener("input", () => {
      elements.fromAmount.value = sanitizeAmount(elements.fromAmount.value);
      hideConfirmation();
      updateQuote();
    });

    elements.fromToken.addEventListener("change", () => {
      if (elements.fromToken.value === elements.toToken.value) {
        elements.toToken.value = findAlternativeToken(elements.fromToken.value);
      }
      hideConfirmation();
      updateQuote();
    });

    elements.toToken.addEventListener("change", () => {
      if (elements.toToken.value === elements.fromToken.value) {
        elements.fromToken.value = findAlternativeToken(elements.toToken.value);
      }
      hideConfirmation();
      updateQuote();
    });

    elements.switchButton.addEventListener("click", () => {
      const fromToken = elements.fromToken.value;
      const toToken = elements.toToken.value;
      const receiveAmount = elements.toAmount.value;

      elements.fromToken.value = toToken;
      elements.toToken.value = fromToken;
      elements.fromAmount.value = receiveAmount || elements.fromAmount.value;

      hideConfirmation();
      updateQuote();
    });

    elements.maxButton.addEventListener("click", () => {
      const token = getToken(elements.fromToken.value);
      const balance = getBalance(token.currency, token);
      elements.fromAmount.value = formatNumber(balance, { maximumFractionDigits: 8 });
      hideConfirmation();
      updateQuote();
    });

    elements.form.addEventListener("submit", submitSwap);
  }

  function hydrateControls() {
    hydrateTokenSelects(
      { fromToken: elements.fromToken, toToken: elements.toToken },
      state.tokens,
      hasToken,
      findAlternativeToken,
    );
    renderMarketList(elements.watchlist, getToken);
    renderStatsPanel(
      { assetCount: elements.assetCount, topRate: elements.topRate },
      state.tokens,
      hasToken,
    );
  }

  function updateQuote() {
    if (state.isLoading || !state.tokens.length) {
      return;
    }

    const from = getToken(elements.fromToken.value);
    const to = getToken(elements.toToken.value);
    const amount = parseAmount(elements.fromAmount.value);
    const validation = validateSwap(from, to, amount);
    const grossReceive = validation.ok ? (amount * from.price) / to.price : 0;
    const feeInFrom = validation.ok ? amount * PLATFORM_FEE : 0;
    const netReceive = validation.ok ? grossReceive * (1 - PLATFORM_FEE) : 0;
    const usdValue = validation.ok ? amount * from.price : 0;

    elements.toAmount.value = validation.ok ? formatNumber(netReceive, { maximumFractionDigits: 8 }) : "";
    elements.fromUsd.textContent = `Value: ${formatCurrency(usdValue)}`;
    elements.toUsd.textContent = `Value: ${formatCurrency(netReceive * to.price)}`;
    elements.fromBalance.textContent = `Balance: ${formatNumber(getBalance(from.currency, from), { maximumFractionDigits: 8 })} ${from.currency}`;
    elements.toBalance.textContent = `Balance: ${formatNumber(getBalance(to.currency, to), { maximumFractionDigits: 8 })} ${to.currency}`;
    elements.rateLine.textContent = `1 ${from.currency} = ${formatNumber(from.price / to.price, { maximumFractionDigits: 8 })} ${to.currency}`;
    elements.feeLine.textContent = `${formatNumber(feeInFrom, { maximumFractionDigits: 8 })} ${from.currency}`;
    elements.error.textContent = validation.message;
    elements.submit.disabled = !validation.ok || state.isSubmitting;
    elements.buttonCopy.textContent = state.isSubmitting ? "Routing swap" : validation.ok ? "Confirm swap" : "Enter amount";
    elements.statusPill.textContent = "0.18% fee";

    updateTokenBadges(
      { fromIcon: elements.fromIcon, toIcon: elements.toIcon },
      from.currency,
      to.currency,
    );
  }

  function validateSwap(from, to, amount) {
    if (!from || !to) {
      return { ok: false, message: "Select two priced assets to continue." };
    }

    if (from.currency === to.currency) {
      return { ok: false, message: "Choose two different assets for the swap." };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: "" };
    }

    if (amount > getBalance(from.currency, from)) {
      return { ok: false, message: `Insufficient ${from.currency} balance.` };
    }

    if (amount * from.price < 0.5) {
      return { ok: false, message: "Minimum swap value is $0.50." };
    }

    return { ok: true, message: "" };
  }

  async function submitSwap(event) {
    event.preventDefault();

    const from = getToken(elements.fromToken.value);
    const to = getToken(elements.toToken.value);
    const amount = parseAmount(elements.fromAmount.value);
    const validation = validateSwap(from, to, amount);

    if (!validation.ok) {
      elements.error.textContent = validation.message || "Enter an amount to continue.";
      return;
    }

    state.isSubmitting = true;
    elements.submit.classList.add("is-loading");
    updateQuote();

    await wait(1100);

    const received = elements.toAmount.value;
    setBalance(from.currency, getBalance(from.currency, from) - amount);
    setBalance(to.currency, getBalance(to.currency, to) + parseAmount(received));

    state.isSubmitting = false;
    elements.submit.classList.remove("is-loading");
    elements.confirmation.hidden = false;
    elements.confirmationCopy.textContent = `${formatNumber(amount, { maximumFractionDigits: 8 })} ${from.currency} swapped for ${received} ${to.currency}.`;
    elements.fromAmount.value = "";
    updateQuote();
  }

  function renderLoading() {
    renderMarketSkeleton(elements.watchlist);
    elements.submit.disabled = true;
  }

  function getToken(currency) {
    return state.tokens.find((token) => token.currency === currency);
  }

  function hasToken(currency) {
    return state.tokens.some((token) => token.currency === currency);
  }

  function findAlternativeToken(currency) {
    return state.tokens.find((token) => token.currency !== currency)?.currency || currency;
  }

  function hideConfirmation() {
    elements.confirmation.hidden = true;
  }

  function hidePageLoader() {
    if (!elements.pageLoader) {
      return;
    }

    elements.pageLoader.classList.add("is-hidden");
    elements.pageLoader.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      elements.pageLoader.hidden = true;
    }, 240);
  }

  return { init };
}
