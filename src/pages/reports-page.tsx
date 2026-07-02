import { useState } from "react";
import {
  Banknote,
  FileBarChart,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IncomeExpenseChart,
  PatientAgeChart,
  ProfitTrendChart,
  ReportStatCard,
  VisitTypeChart,
  VisitVolumeChart,
  YearMonthPicker,
  formatCurrency,
  useReportsYear,
  usePatientStats,
  useVisitStats,
} from "@/features/reports";
import { ExpensesTable } from "@/features/expenses";

const now = new Date();

export function ReportsPage() {
  usePageHeader({
    breadcrumbs: [{ label: "Reports", icon: FileBarChart }],
  });

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const yearQuery = useReportsYear(year);
  const months = yearQuery.data ?? [];
  const selected = months[month - 1];

  const visitStatsQuery = useVisitStats({
    from: `${year}-01-01`,
    to: `${year}-12-31`,
    groupBy: "month",
  });
  const patientStatsQuery = usePatientStats();

  const loadingYear = yearQuery.isLoading;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 md:px-10">
      {/* Period picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Financial and clinical analytics for the selected period.
          </p>
        </div>
        <YearMonthPicker
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
          currentYear={now.getFullYear()}
        />
      </div>

      <Tabs defaultValue="overview">
        <Card size="sm" className="w-fit p-1">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-6">
          {/* KPI row — selected month */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <ReportStatCard
              label="Total payment"
              value={formatCurrency(selected?.total_payment ?? 0)}
              icon={Banknote}
              isLoading={loadingYear}
            />
            <ReportStatCard
              label="Total cost"
              value={formatCurrency(selected?.total_cost ?? 0)}
              icon={Receipt}
              isLoading={loadingYear}
            />
            <ReportStatCard
              label="Net profit"
              value={formatCurrency(selected?.net ?? 0)}
              tone={
                (selected?.net ?? 0) > 0
                  ? "positive"
                  : (selected?.net ?? 0) < 0
                    ? "negative"
                    : "default"
              }
              icon={TrendingUp}
              isLoading={loadingYear}
            />
            <ReportStatCard
              label="Visits"
              value={String(selected?.visit_count ?? 0)}
              sub={`${selected?.patient_count ?? 0} unique patients`}
              icon={Users}
              isLoading={loadingYear}
            />
          </div>

          {/* Financial analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <IncomeExpenseChart months={months} isLoading={loadingYear} />
            <ProfitTrendChart months={months} isLoading={loadingYear} />
          </div>

          {/* Clinical analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <VisitTypeChart
              byType={visitStatsQuery.data?.by_type ?? []}
              isLoading={visitStatsQuery.isLoading}
            />
            <VisitVolumeChart
              byPeriod={visitStatsQuery.data?.by_period ?? []}
              isLoading={visitStatsQuery.isLoading}
            />
            <PatientAgeChart
              stats={patientStatsQuery.data}
              isLoading={patientStatsQuery.isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <ExpensesTable year={year} month={month} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
