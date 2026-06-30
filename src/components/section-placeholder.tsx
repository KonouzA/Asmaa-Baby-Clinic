import type { LucideIcon } from "lucide-react";

type SectionPlaceholderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function SectionPlaceholder({
  icon: Icon,
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 px-6 py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
          <Icon className="size-7" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </main>
  );
}
