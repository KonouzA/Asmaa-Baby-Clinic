import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ReportStatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
  isLoading = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  /** `positive`/`negative` color the value (profit green / loss red). */
  tone?: "default" | "positive" | "negative";
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                tone === "positive" && "text-emerald-600 dark:text-emerald-400",
                tone === "negative" && "text-destructive",
              )}
            >
              {value}
            </p>
          )}
          {sub && !isLoading && (
            <p className="text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
