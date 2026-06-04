export function sanitizeAmount(value) {
  const normalized = value.replace(/[^\d.]/g, "");
  const parts = normalized.split(".");
  const whole = parts.shift() || "";
  const decimal = parts.join("").slice(0, 8);

  return parts.length ? `${whole}.${decimal}` : whole;
}

export function parseAmount(value) {
  return Number.parseFloat(String(value).replace(/,/g, "")) || 0;
}
