import { useParams } from "react-router";
import { Users } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { PatientDetail, usePatientFull } from "@/features/patients";

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient, isLoading, isError } = usePatientFull(patientId);

  usePageHeader({
    breadcrumbs: [
      { label: "Patients", to: "/patients", icon: Users },
      { label: patient?.full_name ?? "Patient" },
    ],
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 md:px-10 2xl:max-w-7xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-20 text-center 2xl:max-w-7xl">
        <p className="text-lg font-medium">Patient not found</p>
        <p className="text-sm text-muted-foreground">
          This patient may have been deleted or the link is invalid.
        </p>
      </div>
    );
  }

  return <PatientDetail patient={patient} />;
}
