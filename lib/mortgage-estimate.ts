/** Estimated monthly mortgage payment (AMD). */
export function estimateMonthlyPayment(
  price: number,
  downPct = 20,
  years = 20,
  annualRate = 12,
): number {
  const principal = price * (1 - downPct / 100);
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
