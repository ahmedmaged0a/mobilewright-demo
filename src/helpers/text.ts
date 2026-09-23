export function formatPrice(amount: number): string {
  return `$ ${amount.toFixed(2)}`;
}

export function parsePrice(text: string): number {
  const match = /\d+(?:\.\d+)?/.exec(text.replaceAll(',', ''));
  if (!match) {
    throw new Error(`No price found in "${text}"`);
  }
  return Number(match[0]);
}

export function formatItemCount(count: number): string {
  return `${count} Items`;
}
