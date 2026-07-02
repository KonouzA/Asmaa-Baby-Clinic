import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardTrendPoint } from "../schemas/reports.schema";
import { formatCurrency, MONTH_SHORT } from "../lib";

const config = {
  revenue: { label: "Income", color: "var(--primary)" },
  cost: { label: "Expenses", color: "var(--secondary)" },
} satisfies ChartConfig;

/** Compact income-vs-cost line chart for the homepage (last ~6 months). */
export function DashboardTrendChart({
  trend,
  isLoading = false,
}: {
  trend: DashboardTrendPoint[] | undefined;
  isLoading?: boolean;
}) {
  const data = (trend ?? []).map((t) => ({
    label: `${MONTH_SHORT[t.month - 1]}`,
    revenue: t.revenue,
    cost: t.cost,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Income vs. expenses</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="aspect-video w-full" />
        ) : data.length === 0 ? (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            No recent activity yet.
          </div>
        ) : (
          <ChartContainer config={config}>
            <LineChart accessibilityLayer data={data} margin={{ left: 4, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
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
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="cost"
                type="monotone"
                stroke="var(--color-cost)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
