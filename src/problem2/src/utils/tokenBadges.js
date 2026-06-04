const tokenColors = {
  ATOM: "#7b4cf3",
  ETH: "#635bff",
  SWTH: "#08b9d1",
  USDC: "#3478f6",
  WBTC: "#ff9700",
};

export function tokenBadgeUrl(currency) {
  const color = tokenColors[currency] || "#08bc88";
  const label = encodeURIComponent((currency || "?").slice(0, 1));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="32" fill="${color}"/>
      <text x="32" y="39" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="800">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function updateTokenBadge(img, currency) {
  img.src = tokenBadgeUrl(currency);
}
