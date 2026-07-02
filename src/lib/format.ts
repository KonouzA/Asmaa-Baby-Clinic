const currencyFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** App-wide money formatter, e.g. `EGP 1,200`. */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `EGP ${currencyFmt.format(value)}`;
}
