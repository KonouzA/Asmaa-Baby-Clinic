import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports.api";
import type { VisitStatsQuery } from "../schemas/reports.schema";

// ── Query keys ──────────────────────────────────────────────────────────────────

export const reportKeys = {
  all: ["reports"] as const,
  year: (year: number) => ["reports", "year", year] as const,
  month: (year: number, month: number) =>
    ["reports", "month", year, month] as const,
  visitStats: (query: Partial<VisitStatsQuery>) =>
    ["reports", "visit-stats", query] as const,
  patientStats: () => ["reports", "patient-stats"] as const,
  dashboard: () => ["reports", "dashboard"] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────────

export function useReportsYear(year: number) {
  return useQuery({
    queryKey: reportKeys.year(year),
    queryFn: () => reportsApi.list(year),
    placeholderData: (prev) => prev,
  });
}

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: reportKeys.month(year, month),
    queryFn: () => reportsApi.getMonth(year, month),
    placeholderData: (prev) => prev,
  });
}

export function useVisitStats(query: Partial<VisitStatsQuery>) {
  return useQuery({
    queryKey: reportKeys.visitStats(query),
    queryFn: () => reportsApi.visitStats(query),
    placeholderData: (prev) => prev,
  });
}

export function usePatientStats() {
  return useQuery({
    queryKey: reportKeys.patientStats(),
    queryFn: () => reportsApi.patientStats(),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: () => reportsApi.dashboard(),
  });
}
