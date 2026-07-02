import { useNavigate } from "react-router";
import { CalendarClock, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useVisitList,
  VISIT_STATUS_BADGE,
  VISIT_STATUS_LABELS,
  VISIT_TYPE_LABELS,
} from "@/features/visits";
import { formatDateTime } from "@/features/patients/lib";

/** Local YYYY-MM-DD for "today" (avoids the UTC shift of toISOString). */
function localToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Homepage "today's queue": all of today's visits with status at a glance. */
export function TodayQueueCard() {
  const navigate = useNavigate();
  const today = localToday();
  const { data, isLoading } = useVisitList({
    from: today,
    to: today,
    page: 1,
    pageSize: 50,
  });

  const visits = data?.data ?? [];
  const counts = visits.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle>Today's queue</CardTitle>
        <CardDescription>
          {isLoading
            ? "Loading…"
            : `${visits.length} visit${visits.length === 1 ? "" : "s"} scheduled today`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status summary chips */}
        {!isLoading && visits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(["booked", "checked-in", "in-progress", "done"] as const).map(
              (s) =>
                counts[s] ? (
                  <Badge key={s} variant={VISIT_STATUS_BADGE[s]} className="font-normal">
                    {VISIT_STATUS_LABELS[s]}: {counts[s]}
                  </Badge>
                ) : null,
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <CalendarClock className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No visits today</p>
            <p className="text-xs text-muted-foreground">
              New visits scheduled for today will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {visits.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/visits/${v.id}`)}
                  className="flex w-full items-center gap-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(v.datetime).split(", ").pop()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {v.patient_name}
                  </span>
                  <Badge variant="outline" className="hidden font-normal sm:inline-flex">
                    {VISIT_TYPE_LABELS[v.type]}
                  </Badge>
                  <Badge variant={VISIT_STATUS_BADGE[v.status]} className="font-normal">
                    {VISIT_STATUS_LABELS[v.status]}
                  </Badge>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
