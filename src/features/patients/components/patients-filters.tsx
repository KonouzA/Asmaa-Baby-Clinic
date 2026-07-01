import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  PatientListQuery,
  PatientSort,
  Sex,
} from "../schemas/patients.schema";
import { SORT_LABELS } from "../lib";

export type PatientFilters = Pick<
  PatientListQuery,
  "q" | "sex" | "ageMin" | "ageMax" | "lastVisitFrom" | "lastVisitTo" | "sort"
>;

const ALL = "all";

export function PatientsFilters({
  filters,
  onChange,
  className,
  hideHeader = false,
}: {
  filters: PatientFilters;
  onChange: (patch: Partial<PatientFilters>) => void;
  /** Merged onto the root; pass e.g. borderless classes when embedding in a drawer. */
  className?: string;
  /** Hide the internal "Filters" title row (e.g. when a drawer supplies its own). */
  hideHeader?: boolean;
}) {
  // Debounce the free-text search so we don't refetch on every keystroke.
  const [search, setSearch] = useState(filters.q ?? "");
  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.q ?? "") !== search) onChange({ q: search || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Keep the local search box in sync when the query is cleared from outside
  // (e.g. a "Clear" control that lives in the drawer header).
  useEffect(() => {
    if (!filters.q) setSearch((s) => (s === "" ? s : ""));
  }, [filters.q]);

  const hasActiveFilters =
    !!filters.q ||
    !!filters.sex ||
    filters.ageMin != null ||
    filters.ageMax != null ||
    !!filters.lastVisitFrom ||
    !!filters.lastVisitTo;

  const clearAll = () => {
    setSearch("");
    onChange({
      q: undefined,
      sex: undefined,
      ageMin: undefined,
      ageMax: undefined,
      lastVisitFrom: undefined,
      lastVisitTo: undefined,
    });
  };

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border bg-card p-4", className)}>
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

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or MRN…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <FilterField label="Sex">
        <Select
          value={filters.sex ?? ALL}
          onValueChange={(v) =>
            onChange({ sex: v === ALL ? undefined : (v as Sex) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All sexes</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Sort by">
        <Select
          value={filters.sort ?? "created_at_desc"}
          onValueChange={(v) => onChange({ sort: v as PatientSort })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Age (years)">
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.ageMin ?? ""}
            onChange={(e) =>
              onChange({
                ageMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.ageMax ?? ""}
            onChange={(e) =>
              onChange({
                ageMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </FilterField>

      <FilterField label="Last visit">
        <div className="flex flex-col gap-2">
          <Input
            type="date"
            aria-label="Last visit from"
            value={filters.lastVisitFrom ?? ""}
            onChange={(e) =>
              onChange({ lastVisitFrom: e.target.value || undefined })
            }
          />
          <Input
            type="date"
            aria-label="Last visit to"
            value={filters.lastVisitTo ?? ""}
            onChange={(e) =>
              onChange({ lastVisitTo: e.target.value || undefined })
            }
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
