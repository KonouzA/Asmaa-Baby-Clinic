import { api } from "@/lib/api";
import type {
  Dashboard,
  MonthlyReport,
  PatientStats,
  VisitStats,
  VisitStatsQuery,
} from "../schemas/reports.schema";

/** Serialize a query object into a `?key=value` string, dropping empty values. */
function toQueryString(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const base = "/api/reports";

export const reportsApi = {
  /** All 12 months of a year (zero-filled where no cost row exists). */
  list: (year: number) => api.get<MonthlyReport[]>(`${base}?year=${year}`),
  getMonth: (year: number, month: number) =>
    api.get<MonthlyReport>(`${base}/${year}/${month}`),
  visitStats: (query: Partial<VisitStatsQuery>) =>
    api.get<VisitStats>(`${base}/visit-stats${toQueryString(query)}`),
  patientStats: () => api.get<PatientStats>(`${base}/patient-stats`),
  dashboard: () => api.get<Dashboard>(`${base}/dashboard`),
};
