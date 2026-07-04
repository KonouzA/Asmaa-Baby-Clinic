import { useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTime } from "@/features/patients/lib";
import { formatCurrency } from "@/lib/format";
import { useDeleteVisit, useUpdateVisit } from "../hooks/use-visits";
import type { VisitListItem, VisitStatus } from "../schemas/visits.schema";
import { VISIT_STATUS_BADGE, VISIT_STATUS_LABELS, VISIT_TYPE_LABELS } from "../lib";

const VISIT_STATUSES = Object.keys(VISIT_STATUS_LABELS) as VisitStatus[];

function VisitStatusSelect({ visit }: { visit: VisitListItem }) {
  const updateVisit = useUpdateVisit(visit.id);

  return (
    <Select
      value={visit.status}
      onValueChange={(status: VisitStatus) => {
        if (status !== visit.status) updateVisit.mutate({ status });
      }}
    >
      <SelectTrigger
        size="sm"
        onClick={(e) => e.stopPropagation()}
        className="w-36 [&_[data-slot=select-value]]:w-full"
      >
        <SelectValue>
          <Badge variant={VISIT_STATUS_BADGE[visit.status]} className="font-normal">
            {VISIT_STATUS_LABELS[visit.status]}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {VISIT_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {VISIT_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VisitsTable({
  visits,
  isLoading,
  onSelect,
}: {
  visits: VisitListItem[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  const deleteVisit = useDeleteVisit();
  const [deleting, setDeleting] = useState<VisitListItem | undefined>(undefined);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-48">Date &amp; time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead className="w-32">Type</TableHead>
            <TableHead className="w-36">Status</TableHead>
            <TableHead className="w-24 text-right">Fee</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : visits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
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
                  <VisitStatusSelect visit={v} />
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {v.fee != null ? formatCurrency(v.fee) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(v);
                    }}
                    aria-label={`Delete visit for ${v.patient_name}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete visit for "{deleting?.patient_name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the visit record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteVisit.mutate(deleting.id);
                setDeleting(undefined);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
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
