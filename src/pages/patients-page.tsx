import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Users } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import {
  NewPatientDialog,
  PatientsFilters,
  PatientsPagination,
  PatientsTable,
  usePatientList,
  type PatientFilters,
} from "@/features/patients";

const DEFAULT_FILTERS: PatientFilters = { sort: "created_at_desc" };

export function PatientsPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:px-10">
      <PatientsFilters filters={filters} onChange={updateFilters} />

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

      <NewPatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) => navigate(`/patients/${id}`)}
      />
    </div>
  );
}
