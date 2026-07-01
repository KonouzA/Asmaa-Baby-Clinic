import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
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
}: {
  filters: PatientFilters;
  onChange: (patch: Partial<PatientFilters>) => void;
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
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or MRN…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={filters.sex ?? ALL}
          onValueChange={(v) =>
            onChange({ sex: v === ALL ? undefined : (v as Sex) })
          }
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All sexes</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort ?? "created_at_desc"}
          onValueChange={(v) => onChange({ sort: v as PatientSort })}
        >
          <SelectTrigger className="w-full sm:w-44">
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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Age min
            <Input
              type="number"
              min={0}
              className="w-24"
              value={filters.ageMin ?? ""}
              onChange={(e) =>
                onChange({
                  ageMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Age max
            <Input
              type="number"
              min={0}
              className="w-24"
              value={filters.ageMax ?? ""}
              onChange={(e) =>
                onChange({
                  ageMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
        </div>

        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Last visit from
            <Input
              type="date"
              className="w-40"
              value={filters.lastVisitFrom ?? ""}
              onChange={(e) =>
                onChange({ lastVisitFrom: e.target.value || undefined })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Last visit to
            <Input
              type="date"
              className="w-40"
              value={filters.lastVisitTo ?? ""}
              onChange={(e) =>
                onChange({ lastVisitTo: e.target.value || undefined })
              }
            />
          </label>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="sm:ml-auto"
            onClick={clearAll}
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
