import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyReport } from "../schemas/reports.schema";
import { formatCurrency, MONTH_SHORT } from "../lib";
import { ChartCard } from "./chart-card";

const config = {
  net: { label: "Net profit", color: "var(--primary)" },
} satisfies ChartConfig;

/** Net-profit trend (income − cost) across the 12 months of a year. */
export function ProfitTrendChart({
  months,
  isLoading = false,
}: {
  months: MonthlyReport[];
  isLoading?: boolean;
}) {
  const data = months.map((m) => ({
    month: MONTH_SHORT[m.month - 1],
    net: m.net,
  }));

  const isEmpty = data.every((d) => d.net === 0);

  return (
    <ChartCard
      title="Profit trend"
      description="Net profit per month across the year"
      isLoading={isLoading}
      isEmpty={isEmpty}
    >
      <ChartContainer config={config}>
        <AreaChart accessibilityLayer data={data}>
          <defs>
            <linearGradient id="fill-net" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-net)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-net)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : String(v))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono font-medium tabular-nums">
                    {formatCurrency(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Area
            dataKey="net"
            type="monotone"
            stroke="var(--color-net)"
            strokeWidth={2}
            fill="url(#fill-net)"
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}
