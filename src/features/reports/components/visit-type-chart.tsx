import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { VISIT_TYPE_LABELS, type VisitType } from "@/features/visits";
import type { VisitStats } from "../schemas/reports.schema";
import { ChartCard } from "./chart-card";

// Brand-tinted palette, one per visit type.
const TYPE_COLOR: Record<VisitType, string> = {
  "well-child": "var(--primary)",
  sick: "var(--secondary)",
  "follow-up": "var(--accent)",
  vaccination: "var(--chart-4)",
  emergency: "var(--chart-5)",
};

const config = Object.fromEntries(
  (Object.keys(VISIT_TYPE_LABELS) as VisitType[]).map((t) => [
    t,
    { label: VISIT_TYPE_LABELS[t], color: TYPE_COLOR[t] },
  ]),
) satisfies ChartConfig;

/** Donut of visit counts by type. */
export function VisitTypeChart({
  byType,
  isLoading = false,
}: {
  byType: VisitStats["by_type"];
  isLoading?: boolean;
}) {
  const data = byType.map((d) => ({
    type: d.type,
    count: d.count,
    fill: TYPE_COLOR[d.type],
  }));

  const isEmpty = data.reduce((s, d) => s + d.count, 0) === 0;

  return (
    <ChartCard
      title="Visits by type"
      description="Distribution across visit types"
      isLoading={isLoading}
      isEmpty={isEmpty}
    >
      <ChartContainer config={config} className="mx-auto aspect-square max-h-72">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="type" hideLabel />}
          />
          <Pie data={data} dataKey="count" nameKey="type" innerRadius={55}>
            {data.map((d) => (
              <Cell key={d.type} fill={d.fill} />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="type" />}
            className="flex-wrap"
          />
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
}
