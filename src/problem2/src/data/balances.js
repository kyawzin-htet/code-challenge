const balances = new Map([
  ["SWTH", 519000],
  ["USDC", 12684.03],
  ["ETH", 4.26],
  ["WBTC", 0.48],
  ["ATOM", 930],
  ["OSMO", 18400],
  ["KUJI", 2100],
  ["OKB", 90],
  ["ZIL", 71000],
  ["USD", 5000],
]);

export function getBalance(currency, token) {
  if (balances.has(currency)) {
    return balances.get(currency);
  }

  const seededBalance = token ? Math.max(12, 2400 / token.price) : 0;
  balances.set(currency, seededBalance);
  return seededBalance;
}

export function setBalance(currency, value) {
  balances.set(currency, Math.max(0, value));
}
