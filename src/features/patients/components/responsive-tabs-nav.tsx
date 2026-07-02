import { cn } from "@/lib/utils";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Tab navigation that collapses to a dropdown on small screens. Must be rendered
 * inside a controlled `<Tabs>` (the dropdown drives `onValueChange`, so the tab
 * value has to be controlled). The lifted `TabsList` shows from `sm` upward.
 */
export function ResponsiveTabsNav<T extends string>({
  tabs,
  value,
  onValueChange,
  className,
}: {
  tabs: readonly { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}) {
  return (
    <>
      {/* Mobile: dropdown */}
      <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
        <SelectTrigger className="w-full sm:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tabs.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Desktop: lifted tab bar inside a card-styled container */}
      <div className={cn("hidden rounded-xl border bg-card p-1.5 sm:block", className)}>
        <TabsList variant="lifted" className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </>
  );
}
