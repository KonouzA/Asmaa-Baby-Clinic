import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Card shell shared by every report chart: title, optional description, and
 * consistent loading / empty states. */
export function ChartCard({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  emptyLabel = "No data for this period.",
  children,
}: {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="aspect-video w-full" />
        ) : isEmpty ? (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
