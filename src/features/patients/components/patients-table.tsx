import { UserRound } from "lucide-react";
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
import type { Patient } from "../schemas/patients.schema";
import { SEX_LABELS, formatAge, formatDate } from "../lib";

export function PatientsTable({
  patients,
  isLoading,
  onSelect,
}: {
  patients: Patient[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-28">MRN</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Sex</TableHead>
            <TableHead className="w-32">Age</TableHead>
            <TableHead className="w-40">Date of birth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : (
            patients.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => onSelect(p.id)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.mrn}
                </TableCell>
                <TableCell className="font-medium">{p.full_name}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.sex === "female" ? "secondary" : "outline"}
                    className="font-normal"
                  >
                    {SEX_LABELS[p.sex]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatAge(p.dob)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(p.dob)}
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
        <UserRound className="size-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No patients found</p>
      <p className="text-sm text-muted-foreground">
        Try adjusting your search or filters, or add a new patient.
      </p>
    </div>
  );
}
