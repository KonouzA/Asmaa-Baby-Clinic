import { Settings } from "lucide-react";
import { usePageHeader } from "@/components/main-layout";
import { SectionPlaceholder } from "@/components/section-placeholder";

export function SettingsPage() {
  usePageHeader({
    breadcrumbs: [{ label: "Settings", icon: Settings }],
  });

  return (
    <SectionPlaceholder
      icon={Settings}
      title="Settings"
      description="Clinic details, account preferences and application options will live here."
    />
  );
}
