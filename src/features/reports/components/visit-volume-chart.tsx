import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { VisitStats } from "../schemas/reports.schema";
import { MONTH_SHORT } from "../lib";
import { ChartCard } from "./chart-card";

const config = {
  done: { label: "Done", color: "var(--primary)" },
  no_show: { label: "No-show", color: "var(--secondary)" },
  cancelled: { label: "Cancelled", color: "var(--destructive)" },
} satisfies ChartConfig;

/** Turn a `strftime` period key into a short label (month keys → "Jul"). */
function periodLabel(period: string): string {
  const m = /^\d{4}-(\d{2})$/.exec(period);
  if (m) return MONTH_SHORT[Number(m[1]) - 1] ?? period;
  return period;
}

/** Stacked bars of visit volume per period, split by outcome. */
export function VisitVolumeChart({
  byPeriod,
  isLoading = false,
}: {
  byPeriod: VisitStats["by_period"];
  isLoading?: boolean;
}) {
  const data = byPeriod.map((p) => ({
    period: periodLabel(p.period),
    done: p.done,
    no_show: p.no_show,
    cancelled: p.cancelled,
  }));

  return (
    <ChartCard
      title="Visit volume"
      description="Completed vs. missed visits per period"
      isLoading={isLoading}
      isEmpty={data.length === 0}
    >
      <ChartContainer config={config}>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="done" stackId="v" fill="var(--color-done)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="no_show" stackId="v" fill="var(--color-no_show)" />
          <Bar dataKey="cancelled" stackId="v" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
