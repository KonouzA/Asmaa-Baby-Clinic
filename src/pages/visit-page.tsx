import { useParams, useSearchParams } from "react-router";
import { Stethoscope } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { VisitForm } from "@/features/visits";

export function VisitPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("patientId") ?? undefined;
  const isEditing = !!visitId;

  usePageHeader({
    breadcrumbs: [
      { label: "Visits", to: "/visits", icon: Stethoscope },
      { label: isEditing ? "Visit" : "New visit" },
    ],
  });

  // `key` forces a fresh form instance when navigating between visits.
  return (
    <VisitForm
      key={visitId ?? "new"}
      visitId={visitId}
      initialPatientId={initialPatientId}
    />
  );
}
