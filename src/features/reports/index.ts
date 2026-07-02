// Public surface of the reports feature.

export { ReportStatCard } from "./components/report-stat-card";
export { YearMonthPicker } from "./components/year-month-picker";
export { ChartCard } from "./components/chart-card";
export { IncomeExpenseChart } from "./components/income-expense-chart";
export { ProfitTrendChart } from "./components/profit-trend-chart";
export { VisitTypeChart } from "./components/visit-type-chart";
export { VisitVolumeChart } from "./components/visit-volume-chart";
export { PatientAgeChart } from "./components/patient-age-chart";
export { DashboardTrendChart } from "./components/dashboard-trend-chart";
export { TodayQueueCard } from "./components/today-queue-card";

export {
  useReportsYear,
  useMonthlyReport,
  useVisitStats,
  usePatientStats,
  useDashboard,
  reportKeys,
} from "./hooks/use-reports";

export { reportsApi } from "./api/reports.api";

export {
  formatCurrency,
  formatMonthYear,
  MONTH_LABELS,
  MONTH_SHORT,
  AGE_GROUP_LABELS,
} from "./lib";

export type {
  MonthlyReport,
  VisitStats,
  PatientStats,
  Dashboard,
  DashboardTrendPoint,
  VisitStatsQuery,
  AgeGroup,
} from "./schemas/reports.schema";
