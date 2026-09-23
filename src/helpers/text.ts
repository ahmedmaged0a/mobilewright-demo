/** Formats an amount the way both demo apps render product prices, e.g. `$ 29.99`. */
export function formatPrice(amount: number): string {
  return `$ ${amount.toFixed(2)}`;
}

/** Extracts the numeric amount from a rendered price such as `$ 59.98` or `$59.98`. */
export function parsePrice(text: string): number {
  const match = /\d+(?:\.\d+)?/.exec(text.replaceAll(',', ''));
  if (!match) {
    throw new Error(`No price found in "${text}"`);
  }
  return Number(match[0]);
}

/** Formats a cart quantity the way both demo apps render it, e.g. `2 Items`. */
export function formatItemCount(count: number): string {
  return `${count} Items`;
}
