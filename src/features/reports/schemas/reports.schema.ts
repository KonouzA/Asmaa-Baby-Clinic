import { z } from "zod";
import type { VisitStatus, VisitType } from "@/features/visits";

// ── Query for GET /api/reports/visit-stats ──────────────────────────────────────

export const visitStatsQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("month"),
});

export type VisitStatsQuery = z.infer<typeof visitStatsQuerySchema>;

// ── Response shapes (from reports.service.ts) ───────────────────────────────────

/** A single month row, enriched with visit-derived + computed totals. */
export type MonthlyReport = {
  id: string | null;
  month: number;
  year: number;
  cost_electricity_clinic: number;
  cost_electricity_stairs: number;
  cost_water: number;
  cost_phone_personal: number;
  cost_landline: number;
  cost_internet: number;
  cost_cleaning: number;
  cost_secretary: number;
  cost_medical_waste: number;
  cost_others: number;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  total_cost: number;
  total_payment: number;
  net: number;
  visit_count: number;
  patient_count: number;
};

export type VisitStats = {
  by_period: Array<{
    period: string;
    total: number;
    done: number;
    no_show: number;
    cancelled: number;
    revenue: number;
  }>;
  by_type: Array<{ type: VisitType; count: number }>;
  by_status: Array<{ status: VisitStatus; count: number }>;
};

export type AgeGroup = "under_1" | "1_to_2" | "2_to_5" | "5_to_12" | "over_12";

export type PatientStats = {
  total: number;
  male: number;
  female: number;
  new_this_month: number;
  by_age_group: Array<{ age_group: AgeGroup; count: number }>;
};

export type DashboardTrendPoint = {
  month: number;
  year: number;
  revenue: number;
  cost: number;
  net: number;
  visit_count: number;
};

export type Dashboard = {
  trend: DashboardTrendPoint[];
  today_count: number;
  upcoming_count: number;
  total_patients: number;
};
