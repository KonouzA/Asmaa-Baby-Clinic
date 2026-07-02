import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CreatePatientDto } from "../schemas/patients.schema";
import {
  BLOOD_TYPES,
  DELIVERY_TYPE_LABELS,
  FEEDING_TYPE_LABELS,
  SEX_LABELS,
  formatDate,
} from "../lib";

/**
 * Minimal display shapes so the summary works with both the in-memory create
 * draft (DTOs, no id) and the persisted patient (full records).
 */
export type ClinicalSummary = {
  allergies: { allergen: string; type: string }[];
  problems: { condition: string }[];
  medications: { drug: string; dose?: string | null }[];
  immunizations: { vaccine: string; date_given: string }[];
};

/**
 * Read-only recap of everything entered across the form tabs, grouped into one
 * collapsible section per tab. Shared by the create and edit dialogs.
 */
export function PatientSummary({
  values,
  clinical,
}: {
  values: CreatePatientDto;
  clinical: ClinicalSummary;
}) {
  const { allergies, problems, medications, immunizations } = clinical;

  return (
    <div className="flex flex-col gap-3">
      <SummarySection title="Basic" defaultOpen>
        <InfoGrid
          rows={[
            ["Full name", values.full_name || "—"],
            ["Date of birth", formatDate(values.dob)],
            ["Time of birth", values.time_of_birth || "—"],
            ["Sex", SEX_LABELS[values.sex]],
            [
              "Blood type",
              BLOOD_TYPES.includes(values.blood_type as never)
                ? (values.blood_type as string)
                : "—",
            ],
          ]}
        />
      </SummarySection>

      <SummarySection title="Birth Info">
        <InfoGrid
          rows={[
            [
              "Gestational age",
              values.gestational_age_weeks != null
                ? `${values.gestational_age_weeks} wk`
                : "—",
            ],
            [
              "Delivery type",
              values.delivery_type
                ? DELIVERY_TYPE_LABELS[values.delivery_type]
                : "—",
            ],
            [
              "Birth weight",
              values.birth_weight_kg != null
                ? `${values.birth_weight_kg} kg`
                : "—",
            ],
            [
              "Birth length",
              values.birth_length_cm != null
                ? `${values.birth_length_cm} cm`
                : "—",
            ],
            [
              "Head circumference",
              values.birth_hc_cm != null ? `${values.birth_hc_cm} cm` : "—",
            ],
            ["NICU admission", values.nicu_admission ? "Yes" : "No"],
            [
              "NICU days",
              values.nicu_days != null ? String(values.nicu_days) : "—",
            ],
            [
              "Newborn screening",
              values.newborn_screening_done
                ? values.newborn_screening_result || "Done"
                : "Not done",
            ],
            ["Neonatal complications", values.neonatal_complications || "—"],
            [
              "Feeding",
              values.feeding_type
                ? FEEDING_TYPE_LABELS[values.feeding_type]
                : "—",
            ],
            ["Weaning status", values.weaning_status || "—"],
          ]}
        />
      </SummarySection>

      <SummarySection
        title="Clinical List"
        count={allergies.length + problems.length + medications.length}
      >
        <div className="flex flex-col gap-4">
          <ChipList
            label="Allergies"
            items={allergies.map((a) => `${a.allergen} (${a.type})`)}
          />
          <ChipList
            label="Problems"
            items={problems.map((p) => p.condition)}
          />
          <ChipList
            label="Medications"
            items={medications.map((m) =>
              m.dose ? `${m.drug} · ${m.dose}` : m.drug,
            )}
          />
        </div>
      </SummarySection>

      <SummarySection title="Vaccination" count={immunizations.length}>
        <ChipList
          label="Vaccinations"
          items={immunizations.map(
            (i) => `${i.vaccine} · ${formatDate(i.date_given)}`,
          )}
        />
      </SummarySection>
    </div>
  );
}

function SummarySection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="group/section rounded-xl border bg-card"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold">
        <span className="flex items-center gap-2">
          {title}
          {count != null && (
            <Badge variant="secondary" className="font-normal">
              {count}
            </Badge>
          )}
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]/section:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 py-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className={cn("flex flex-col gap-1.5")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None added.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((text, i) => (
            <Badge key={`${text}-${i}`} variant="outline" className="font-normal">
              {text}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
