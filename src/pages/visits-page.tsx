import { Stethoscope } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { SectionPlaceholder } from "@/components/section-placeholder";

export function VisitsPage() {
  usePageHeader({
    breadcrumbs: [{ label: "Visits", icon: Stethoscope }],
  });

  return (
    <SectionPlaceholder
      icon={Stethoscope}
      title="Visits"
      description="Exams, diagnoses, screenings, growth measurements and attachments will live here."
    />
  );
}
