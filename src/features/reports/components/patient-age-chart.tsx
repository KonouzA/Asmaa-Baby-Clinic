import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PatientStats } from "../schemas/reports.schema";
import { AGE_GROUP_LABELS, AGE_GROUP_ORDER } from "../lib";
import { ChartCard } from "./chart-card";

const config = {
  count: { label: "Patients", color: "var(--secondary)" },
} satisfies ChartConfig;

/** Horizontal bars of patients per age group, with a gender-split footer. */
export function PatientAgeChart({
  stats,
  isLoading = false,
}: {
  stats: PatientStats | undefined;
  isLoading?: boolean;
}) {
  const counts = new Map(
    (stats?.by_age_group ?? []).map((g) => [g.age_group, g.count]),
  );
  const data = AGE_GROUP_ORDER.map((g) => ({
    group: AGE_GROUP_LABELS[g],
    count: counts.get(g) ?? 0,
  }));

  const isEmpty = !stats || stats.total === 0;

  return (
    <ChartCard
      title="Patients by age"
      description="Registered patients grouped by age"
      isLoading={isLoading}
      isEmpty={isEmpty}
    >
      <ChartContainer config={config}>
        <BarChart accessibilityLayer data={data} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="group"
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>

      {stats && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{stats.male}</span> male
          </span>
          <span>
            <span className="font-medium text-foreground">{stats.female}</span> female
          </span>
          <span>
            <span className="font-medium text-foreground">
              {stats.new_this_month}
            </span>{" "}
            new this month
          </span>
        </div>
      )}
    </ChartCard>
  );
}
