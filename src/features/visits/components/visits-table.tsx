import { CalendarClock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/features/patients/lib";
import type { VisitListItem } from "../schemas/visits.schema";
import { VISIT_STATUS_BADGE, VISIT_STATUS_LABELS, VISIT_TYPE_LABELS } from "../lib";

export function VisitsTable({
  visits,
  isLoading,
  onSelect,
}: {
  visits: VisitListItem[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-48">Date &amp; time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead className="w-32">Type</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-24 text-right">Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : visits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : (
            visits.map((v) => (
              <TableRow
                key={v.id}
                className="cursor-pointer"
                onClick={() => onSelect(v.id)}
              >
                <TableCell className="text-muted-foreground">
                  {formatDateTime(v.datetime)}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{v.patient_name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {v.patient_mrn}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {VISIT_TYPE_LABELS[v.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={VISIT_STATUS_BADGE[v.status]}
                    className="font-normal"
                  >
                    {VISIT_STATUS_LABELS[v.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {v.fee != null ? v.fee.toFixed(2) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 5 }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <CalendarClock className="size-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No visits found</p>
      <p className="text-sm text-muted-foreground">
        Try adjusting your filters, or start a new visit.
      </p>
    </div>
  );
}
