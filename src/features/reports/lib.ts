import type { AgeGroup } from "./schemas/reports.schema";

// Money — re-exported from the shared module so the visits feature can use it
// without creating a visits↔reports import cycle.
export { formatCurrency } from "@/lib/format";

// ── Dates ───────────────────────────────────────────────────────────────────────

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Short month label, e.g. "Jan". */
export const MONTH_SHORT = MONTH_LABELS.map((m) => m.slice(0, 3));

/** e.g. "July 2026". */
export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_LABELS[month - 1] ?? month} ${year}`;
}

// ── Patient age groups ──────────────────────────────────────────────────────────

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under_1: "< 1 year",
  "1_to_2": "1–2 years",
  "2_to_5": "2–5 years",
  "5_to_12": "5–12 years",
  over_12: "12+ years",
};

export const AGE_GROUP_ORDER: AgeGroup[] = [
  "under_1",
  "1_to_2",
  "2_to_5",
  "5_to_12",
  "over_12",
];
