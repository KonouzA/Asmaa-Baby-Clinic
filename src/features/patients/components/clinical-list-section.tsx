import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Allergy,
  Immunization,
  PatientMedication,
  Problem,
} from "../schemas/patients.schema";
import {
  useCreateAllergy,
  useCreateImmunization,
  useCreateMedication,
  useCreateProblem,
  useDeleteAllergy,
  useDeleteImmunization,
  useDeleteMedication,
  useDeleteProblem,
} from "../hooks/use-patients";
import { ALLERGY_TYPE_LABELS, formatDate, humanize } from "../lib";

function SectionFrame({
  title,
  onAdd,
  addLabel,
  children,
  form,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  form: React.ReactNode | null;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>
      {form}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function ItemRow({
  primary,
  secondary,
  badge,
  onDelete,
  deleting,
}: {
  primary: string;
  secondary?: string;
  badge?: React.ReactNode;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 truncate text-sm font-medium">
          {primary}
          {badge}
        </span>
        {secondary && (
          <span className="truncate text-xs text-muted-foreground">
            {secondary}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        disabled={deleting}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground">{text}</p>;
}

// ── Allergies ────────────────────────────────────────────────────────────────────

export function AllergiesSection({
  patientId,
  items,
}: {
  patientId: string;
  items: Allergy[];
}) {
  const [adding, setAdding] = useState(false);
  const [allergen, setAllergen] = useState("");
  const [type, setType] = useState<Allergy["type"]>("drug");
  const create = useCreateAllergy(patientId);
  const remove = useDeleteAllergy(patientId);

  const submit = () => {
    if (!allergen.trim()) return;
    create.mutate(
      { allergen: allergen.trim(), type, status: "active" },
      {
        onSuccess: () => {
          setAllergen("");
          setAdding(false);
        },
      },
    );
  };

  return (
    <SectionFrame
      title="Allergies"
      addLabel="Add"
      onAdd={() => setAdding((v) => !v)}
      form={
        adding ? (
          <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
            <Input
              placeholder="Allergen"
              value={allergen}
              onChange={(e) => setAllergen(e.target.value)}
            />
            <Select value={type} onValueChange={(v) => setType(v as Allergy["type"])}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ALLERGY_TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={submit} disabled={create.isPending}>
              Save
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyHint text="No allergies recorded." />
      ) : (
        items.map((a) => (
          <ItemRow
            key={a.id}
            primary={a.allergen}
            secondary={a.reaction ?? undefined}
            badge={
              <Badge variant="outline" className="font-normal">
                {ALLERGY_TYPE_LABELS[a.type] ?? a.type}
                {a.severity ? ` · ${humanize(a.severity)}` : ""}
              </Badge>
            }
            onDelete={() => remove.mutate(a.id)}
            deleting={remove.isPending}
          />
        ))
      )}
    </SectionFrame>
  );
}

// ── Problems ─────────────────────────────────────────────────────────────────────

export function ProblemsSection({
  patientId,
  items,
}: {
  patientId: string;
  items: Problem[];
}) {
  const [adding, setAdding] = useState(false);
  const [condition, setCondition] = useState("");
  const create = useCreateProblem(patientId);
  const remove = useDeleteProblem(patientId);

  const submit = () => {
    if (!condition.trim()) return;
    create.mutate(
      { condition: condition.trim(), status: "active" },
      {
        onSuccess: () => {
          setCondition("");
          setAdding(false);
        },
      },
    );
  };

  return (
    <SectionFrame
      title="Problems"
      addLabel="Add"
      onAdd={() => setAdding((v) => !v)}
      form={
        adding ? (
          <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
            <Input
              placeholder="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
            <Button onClick={submit} disabled={create.isPending}>
              Save
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyHint text="No problems recorded." />
      ) : (
        items.map((p) => (
          <ItemRow
            key={p.id}
            primary={p.condition}
            secondary={p.icd10_code ? `ICD-10 ${p.icd10_code}` : undefined}
            badge={
              <Badge variant="outline" className="font-normal">
                {humanize(p.status)}
              </Badge>
            }
            onDelete={() => remove.mutate(p.id)}
            deleting={remove.isPending}
          />
        ))
      )}
    </SectionFrame>
  );
}

// ── Medications ──────────────────────────────────────────────────────────────────

export function MedicationsSection({
  patientId,
  items,
}: {
  patientId: string;
  items: PatientMedication[];
}) {
  const [adding, setAdding] = useState(false);
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const create = useCreateMedication(patientId);
  const remove = useDeleteMedication(patientId);

  const submit = () => {
    if (!drug.trim()) return;
    create.mutate(
      { drug: drug.trim(), dose: dose.trim() || undefined },
      {
        onSuccess: () => {
          setDrug("");
          setDose("");
          setAdding(false);
        },
      },
    );
  };

  return (
    <SectionFrame
      title="Medications"
      addLabel="Add"
      onAdd={() => setAdding((v) => !v)}
      form={
        adding ? (
          <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
            <Input
              placeholder="Drug"
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
            />
            <Input
              placeholder="Dose (optional)"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
            <Button onClick={submit} disabled={create.isPending}>
              Save
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyHint text="No medications recorded." />
      ) : (
        items.map((m) => (
          <ItemRow
            key={m.id}
            primary={m.drug}
            secondary={[m.dose, m.frequency, m.route]
              .filter(Boolean)
              .join(" · ")}
            onDelete={() => remove.mutate(m.id)}
            deleting={remove.isPending}
          />
        ))
      )}
    </SectionFrame>
  );
}

// ── Immunizations ────────────────────────────────────────────────────────────────

export function ImmunizationsSection({
  patientId,
  items,
}: {
  patientId: string;
  items: Immunization[];
}) {
  const [adding, setAdding] = useState(false);
  const [vaccine, setVaccine] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const create = useCreateImmunization(patientId);
  const remove = useDeleteImmunization(patientId);

  const submit = () => {
    if (!vaccine.trim() || !dateGiven) return;
    create.mutate(
      { vaccine: vaccine.trim(), date_given: dateGiven },
      {
        onSuccess: () => {
          setVaccine("");
          setDateGiven("");
          setAdding(false);
        },
      },
    );
  };

  return (
    <SectionFrame
      title="Vaccinations"
      addLabel="Add"
      onAdd={() => setAdding((v) => !v)}
      form={
        adding ? (
          <div className="flex gap-2 rounded-lg border bg-muted/30 p-3">
            <Input
              placeholder="Vaccine"
              value={vaccine}
              onChange={(e) => setVaccine(e.target.value)}
            />
            <Input
              type="date"
              className="w-40"
              value={dateGiven}
              onChange={(e) => setDateGiven(e.target.value)}
            />
            <Button onClick={submit} disabled={create.isPending}>
              Save
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyHint text="No vaccinations recorded." />
      ) : (
        items.map((i) => (
          <ItemRow
            key={i.id}
            primary={i.vaccine}
            secondary={`Given ${formatDate(i.date_given)}${
              i.dose_number ? ` · dose ${i.dose_number}` : ""
            }`}
            onDelete={() => remove.mutate(i.id)}
            deleting={remove.isPending}
          />
        ))
      )}
    </SectionFrame>
  );
}
