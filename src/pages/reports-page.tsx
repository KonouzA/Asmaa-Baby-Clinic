import { FileBarChart } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { SectionPlaceholder } from "@/components/section-placeholder";

export function ReportsPage() {
  usePageHeader({
    breadcrumbs: [{ label: "Reports", icon: FileBarChart }],
  });

  return (
    <SectionPlaceholder
      icon={FileBarChart}
      title="Reports"
      description="Monthly activity, fees collected and cost breakdowns will live here."
    />
  );
}
