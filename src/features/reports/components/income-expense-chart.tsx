import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyReport } from "../schemas/reports.schema";
import { formatCurrency, MONTH_SHORT } from "../lib";
import { ChartCard } from "./chart-card";

const config = {
  total_payment: { label: "Income", color: "var(--primary)" },
  total_cost: { label: "Expenses", color: "var(--secondary)" },
} satisfies ChartConfig;

/** Grouped income-vs-expense bars across the 12 months of a year. */
export function IncomeExpenseChart({
  months,
  isLoading = false,
}: {
  months: MonthlyReport[];
  isLoading?: boolean;
}) {
  const data = months.map((m) => ({
    month: MONTH_SHORT[m.month - 1],
    total_payment: m.total_payment,
    total_cost: m.total_cost,
  }));

  const isEmpty = data.every((d) => d.total_payment === 0 && d.total_cost === 0);

  return (
    <ChartCard
      title="Income vs. Expenses"
      description="Fees collected against recorded costs, per month"
      isLoading={isLoading}
      isEmpty={isEmpty}
    >
      <ChartContainer config={config}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">
                      {config[name as keyof typeof config]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrency(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="total_payment" fill="var(--color-total_payment)" radius={4} />
          <Bar dataKey="total_cost" fill="var(--color-total_cost)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
