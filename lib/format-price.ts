/** Whole-number price in Armenian dram style, e.g. 250250000 → "250.250.000 AMD" */
export function formatPrice(amount: number): string {
  const n = Math.round(amount);
  if (!Number.isFinite(n)) return "0 AMD";

  const negative = n < 0;
  const grouped = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped} AMD`;
}
