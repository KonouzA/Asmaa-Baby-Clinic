import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientGrowth } from "../hooks/use-patients";

const chartConfig = {
  weight_kg: { label: "Weight (kg)", color: "var(--chart-1)" },
  height_cm: { label: "Height (cm)", color: "var(--chart-2)" },
  hc_cm: { label: "Head circ. (cm)", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function GrowthChart({ patientId }: { patientId: string }) {
  const { data, isLoading } = usePatientGrowth(patientId);

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LineChartIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="font-medium">No growth data yet</p>
        <p className="text-sm text-muted-foreground">
          Growth points appear once visits record weight, height, or head
          circumference.
        </p>
      </div>
    );
  }

  const chartData = data.map((p) => ({
    date: new Date(p.datetime).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "2-digit",
    }),
    weight_kg: p.weight_kg,
    height_cm: p.height_cm,
    hc_cm: p.hc_cm,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <LineChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} width={32} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["weight_kg", "height_cm", "hc_cm"] as const).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
