import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, SlidersHorizontal, Users, X } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NewPatientDialog,
  PatientsFilters,
  PatientsPagination,
  PatientsTable,
  usePatientList,
  type PatientFilters,
} from "@/features/patients";

const DEFAULT_FILTERS: PatientFilters = { sort: "created_at_desc" };

function countActiveFilters(f: PatientFilters): number {
  return [
    f.q,
    f.sex,
    f.ageMin != null ? 1 : undefined,
    f.ageMax != null ? 1 : undefined,
    f.lastVisitFrom,
    f.lastVisitTo,
  ].filter(Boolean).length;
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  usePageHeader({
    breadcrumbs: [{ label: "Patients", icon: Users }],
    action: {
      label: "New patient",
      icon: Plus,
      variant: "default",
      onClick: () => setDialogOpen(true),
    },
  });

  const { data, isLoading, isPlaceholderData } = usePatientList({
    ...filters,
    page,
    pageSize: 20,
  });

  // Any filter change resets pagination to the first page.
  const updateFilters = (patch: Partial<PatientFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const activeCount = countActiveFilters(filters);

  const clearFilters = () =>
    updateFilters({
      q: undefined,
      sex: undefined,
      ageMin: undefined,
      ageMax: undefined,
      lastVisitFrom: undefined,
      lastVisitTo: undefined,
    });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 md:px-10 lg:flex-row lg:items-start 2xl:max-w-[96rem]">
      {/* Desktop: inline sidebar */}
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:w-72 lg:shrink-0 2xl:w-80">
        <PatientsFilters filters={filters} onChange={updateFilters} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Mobile / tablet: filters live in a drawer */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-fit self-start lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 max-w-[85vw] gap-0 overflow-y-auto"
          >
            <SheetHeader className="flex-row items-center justify-between gap-2 border-b pr-12">
              <SheetTitle>Filters</SheetTitle>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="size-4" />
                  Clear
                </Button>
              )}
            </SheetHeader>
            <PatientsFilters
              filters={filters}
              onChange={updateFilters}
              hideHeader
              className="rounded-none border-0 bg-transparent"
            />
          </SheetContent>
        </Sheet>

        <PatientsTable
          patients={data?.data ?? []}
          isLoading={isLoading || (isPlaceholderData && !data)}
          onSelect={(id) => navigate(`/patients/${id}`)}
        />

        <PatientsPagination
          page={data?.page ?? page}
          pageSize={data?.pageSize ?? 20}
          total={data?.total ?? 0}
          onPageChange={setPage}
        />
      </div>

      <NewPatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) => navigate(`/patients/${id}`)}
      />
    </div>
  );
}
