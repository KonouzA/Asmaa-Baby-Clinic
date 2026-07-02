import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  VisitListQuery,
  VisitStatus,
  VisitType,
} from "../schemas/visits.schema";
import { VISIT_STATUS_LABELS, VISIT_TYPE_LABELS } from "../lib";

export type VisitFilters = Pick<
  VisitListQuery,
  "status" | "type" | "from" | "to"
>;

const ALL = "all";

export function VisitsFilters({
  filters,
  onChange,
  className,
  hideHeader = false,
}: {
  filters: VisitFilters;
  onChange: (patch: Partial<VisitFilters>) => void;
  className?: string;
  hideHeader?: boolean;
}) {
  const hasActiveFilters =
    !!filters.status || !!filters.type || !!filters.from || !!filters.to;

  const clearAll = () =>
    onChange({
      status: undefined,
      type: undefined,
      from: undefined,
      to: undefined,
    });

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-4",
        className,
      )}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Filters
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={clearAll}
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      )}

      <FilterField label="Status">
        <Select
          value={filters.status ?? ALL}
          onValueChange={(v) =>
            onChange({ status: v === ALL ? undefined : (v as VisitStatus) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Type">
        <Select
          value={filters.type ?? ALL}
          onValueChange={(v) =>
            onChange({ type: v === ALL ? undefined : (v as VisitType) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {Object.entries(VISIT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Date range">
        <div className="flex flex-col gap-2">
          <Input
            type="date"
            aria-label="From"
            value={filters.from ?? ""}
            onChange={(e) => onChange({ from: e.target.value || undefined })}
          />
          <Input
            type="date"
            aria-label="To"
            value={filters.to ?? ""}
            onChange={(e) => onChange({ to: e.target.value || undefined })}
          />
        </div>
      </FilterField>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
