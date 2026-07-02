import { AlertTriangle, Pill, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientFull } from "@/features/patients";
import { SEX_LABELS, formatAge, formatDate } from "@/features/patients/lib";

export function PatientInfoCard({ patientId }: { patientId: string }) {
  const { data: patient, isLoading } = usePatientFull(patientId);

  if (isLoading || !patient) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    );
  }

  const activeAllergies = patient.allergies.filter((a) => a.status === "active");
  const activeProblems = patient.problems.filter((p) => p.status !== "resolved");

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            {patient.full_name}
          </h3>
          <Badge variant={patient.sex === "female" ? "secondary" : "outline"}>
            {SEX_LABELS[patient.sex]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-mono">{patient.mrn}</span> ·{" "}
            {formatAge(patient.dob)} · Born {formatDate(patient.dob)}
            {patient.blood_type ? ` · ${patient.blood_type}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ContextList
            icon={AlertTriangle}
            label="Allergies"
            tone="destructive"
            items={activeAllergies.map((a) => a.allergen)}
          />
          <ContextList
            icon={Stethoscope}
            label="Problems"
            items={activeProblems.map((p) => p.condition)}
          />
          <ContextList
            icon={Pill}
            label="Medications"
            items={patient.medications.map((m) =>
              m.dose ? `${m.drug} · ${m.dose}` : m.drug,
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContextList({
  icon: Icon,
  label,
  items,
  tone = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: string[];
  tone?: "muted" | "destructive";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon
          className={
            tone === "destructive" && items.length > 0
              ? "size-3.5 text-destructive"
              : "size-3.5"
          }
        />
        {label}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None recorded</p>
      ) : (
        <ul className="flex flex-col gap-0.5 text-sm">
          {items.map((it, i) => (
            <li key={`${it}-${i}`} className="truncate">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
