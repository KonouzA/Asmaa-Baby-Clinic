import { Users } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { SectionPlaceholder } from "@/components/section-placeholder";

export function PatientsPage() {
  usePageHeader({
    breadcrumbs: [{ label: "Patients", icon: Users }],
  });

  return (
    <SectionPlaceholder
      icon={Users}
      title="Patients"
      description="Patient records, allergies, problems, medications and immunizations will live here."
    />
  );
}
