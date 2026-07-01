import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { patientsApi } from "../api/patients.api";
import { useCreatePatient } from "../hooks/use-patients";
import {
  createPatientSchema,
  type AllergyDto,
  type CreatePatientDto,
  type ImmunizationDto,
  type PatientMedicationDto,
  type ProblemDto,
} from "../schemas/patients.schema";
import { BasicFields, BirthInfoFields } from "./patient-form-fields";
import { ALLERGY_TYPE_LABELS } from "../lib";

const STEPS = [
  "Basic",
  "Birth Info",
  "Clinical List",
  "Vaccination",
  "Review",
] as const;

type DraftClinical = {
  allergies: AllergyDto[];
  problems: ProblemDto[];
  medications: PatientMedicationDto[];
  immunizations: ImmunizationDto[];
};

const emptyDraft: DraftClinical = {
  allergies: [],
  problems: [],
  medications: [],
  immunizations: [],
};

export function NewPatientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (patientId: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftClinical>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const createPatient = useCreatePatient();

  const form = useForm<CreatePatientDto>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: { full_name: "", dob: "", sex: "male" },
  });

  const reset = () => {
    form.reset({ full_name: "", dob: "", sex: "male" });
    setDraft(emptyDraft);
    setStep(0);
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const next = async () => {
    // Validate patient fields on the two form-backed steps before advancing.
    if (step === 0) {
      const ok = await form.trigger(["full_name", "dob", "sex", "blood_type", "time_of_birth"]);
      if (!ok) return;
    }
    if (step === 1) {
      const ok = await form.trigger();
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const patient = await createPatient.mutateAsync(values);
      // Persist the draft clinical lists against the freshly created patient.
      await Promise.all([
        ...draft.allergies.map((a) => patientsApi.createAllergy(patient.id, a)),
        ...draft.problems.map((p) => patientsApi.createProblem(patient.id, p)),
        ...draft.medications.map((m) =>
          patientsApi.createMedication(patient.id, m),
        ),
        ...draft.immunizations.map((i) =>
          patientsApi.createImmunization(patient.id, i),
        ),
      ]);
      close(false);
      onCreated?.(patient.id);
    } catch {
      // useCreatePatient surfaces its own error toast; keep the dialog open.
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>New patient</DialogTitle>
          <DialogDescription>
            Register a new patient record. Only the Basic step is required.
          </DialogDescription>
        </DialogHeader>

        <Stepper step={step} />

        <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
          {step === 0 && <BasicFields form={form} />}
          {step === 1 && <BirthInfoFields form={form} />}
          {step === 2 && <ClinicalStep draft={draft} setDraft={setDraft} />}
          {step === 3 && (
            <ImmunizationStep draft={draft} setDraft={setDraft} />
          )}
          {step === 4 && <ReviewStep form={form} draft={draft} />}
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0 || submitting}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create patient
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1 border-b bg-muted/30 px-6 py-3 text-xs">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-primary bg-primary/10 text-primary",
                !active && !done && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden truncate sm:inline",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ── Step 3: allergies / problems / medications ─────────────────────────────────

function ClinicalStep({
  draft,
  setDraft,
}: {
  draft: DraftClinical;
  setDraft: React.Dispatch<React.SetStateAction<DraftClinical>>;
}) {
  const [allergen, setAllergen] = useState("");
  const [allergyType, setAllergyType] =
    useState<AllergyDto["type"]>("drug");
  const [condition, setCondition] = useState("");
  const [drug, setDrug] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Allergies</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Allergen"
            value={allergen}
            onChange={(e) => setAllergen(e.target.value)}
          />
          <Select
            value={allergyType}
            onValueChange={(v) => setAllergyType(v as AllergyDto["type"])}
          >
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
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!allergen.trim()}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                allergies: [
                  ...d.allergies,
                  { allergen: allergen.trim(), type: allergyType, status: "active" },
                ],
              }));
              setAllergen("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <DraftChips
          items={draft.allergies.map((a) => `${a.allergen} (${a.type})`)}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              allergies: d.allergies.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Problems</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!condition.trim()}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                problems: [
                  ...d.problems,
                  { condition: condition.trim(), status: "active" },
                ],
              }));
              setCondition("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <DraftChips
          items={draft.problems.map((p) => p.condition)}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              problems: d.problems.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>

      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold">Medications</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Drug"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!drug.trim()}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                medications: [...d.medications, { drug: drug.trim() }],
              }));
              setDrug("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <DraftChips
          items={draft.medications.map((m) => m.drug)}
          onRemove={(i) =>
            setDraft((d) => ({
              ...d,
              medications: d.medications.filter((_, idx) => idx !== i),
            }))
          }
        />
      </section>
    </div>
  );
}

// ── Step 4: immunizations ────────────────────────────────────────────────────────

function ImmunizationStep({
  draft,
  setDraft,
}: {
  draft: DraftClinical;
  setDraft: React.Dispatch<React.SetStateAction<DraftClinical>>;
}) {
  const [vaccine, setVaccine] = useState("");
  const [dateGiven, setDateGiven] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">Vaccination history</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field>
          <FieldLabel htmlFor="wiz-vaccine">Vaccine</FieldLabel>
          <Input
            id="wiz-vaccine"
            placeholder="e.g. Hepatitis B"
            value={vaccine}
            onChange={(e) => setVaccine(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-date">Date given</FieldLabel>
          <Input
            id="wiz-date"
            type="date"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          disabled={!vaccine.trim() || !dateGiven}
          onClick={() => {
            setDraft((d) => ({
              ...d,
              immunizations: [
                ...d.immunizations,
                { vaccine: vaccine.trim(), date_given: dateGiven },
              ],
            }));
            setVaccine("");
            setDateGiven("");
          }}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      <DraftChips
        items={draft.immunizations.map(
          (i) => `${i.vaccine} · ${i.date_given}`,
        )}
        onRemove={(i) =>
          setDraft((d) => ({
            ...d,
            immunizations: d.immunizations.filter((_, idx) => idx !== i),
          }))
        }
      />
    </div>
  );
}

// ── Step 5: review ────────────────────────────────────────────────────────────────

function ReviewStep({
  form,
  draft,
}: {
  form: ReturnType<typeof useForm<CreatePatientDto>>;
  draft: DraftClinical;
}) {
  const v = form.getValues();
  const rows: [string, string][] = [
    ["Full name", v.full_name || "—"],
    ["Date of birth", v.dob || "—"],
    ["Sex", v.sex],
    ["Blood type", v.blood_type ?? "—"],
    ["Allergies", String(draft.allergies.length)],
    ["Problems", String(draft.problems.length)],
    ["Medications", String(draft.medications.length)],
    ["Immunizations", String(draft.immunizations.length)],
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        Growth measurements (weight, height, head circumference) are tracked
        automatically from each visit's vitals.
      </p>
    </div>
  );
}

function DraftChips({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0)
    return <p className="text-xs text-muted-foreground">None added yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label, i) => (
        <Badge key={`${label}-${i}`} variant="secondary" className="gap-1 pr-1">
          {label}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="rounded-full p-0.5 hover:bg-background/60"
          >
            <Trash2 className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
