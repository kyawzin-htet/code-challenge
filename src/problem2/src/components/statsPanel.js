export function renderStatsPanel({ assetCount, topRate }, tokens, hasToken) {
  assetCount.textContent = tokens.length;
  topRate.textContent = hasToken("WBTC") ? "WBTC" : tokens[0]?.currency || "--";
}
