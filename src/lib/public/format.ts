/** "5,000 TZS" for a validated amount and currency. Never called with a null amount. */
export function formatPrice(amount: number, currency: "TZS"): string {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`;
}
