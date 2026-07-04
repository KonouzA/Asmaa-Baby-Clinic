import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { CheckCircle2, CheckIcon, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import {
  createVisitSchema,
  type CreateVisitDto,
  type VisitFull,
  type VisitStatus,
} from "../schemas/visits.schema";
import {
  useCreateVisit,
  useUpdateVisit,
  useVisitFull,
} from "../hooks/use-visits";
import { VISIT_STATUS_BADGE, VISIT_STATUS_LABELS } from "../lib";
import {
  nowLocalInput,
  toLocalInput,
  type VisitForm as RHF,
} from "./visit-form-helpers";
import { VisitPatientStep } from "./visit-patient-step";
import { VisitVitalsFields } from "./visit-vitals-fields";
import { VisitHpiFields } from "./visit-exam-fields";
import { ExamFindingsEditor } from "./exam-findings-editor";
import { ScreeningNotesFields } from "./screening-notes-fields";
import { VisitMedsEditor } from "./visit-meds-editor";
import { ImmunizationsEditor } from "./immunizations-editor";
import { DiagnosesEditor } from "./diagnoses-editor";
import { VisitAttachmentsStep } from "./visit-attachments-step";
import { PaymentSummaryFields } from "./payment-summary-fields";

const VISIT_STATUSES = Object.keys(VISIT_STATUS_LABELS) as VisitStatus[];

const STEPS = [
  { id: "patient", title: "Patient", description: "Who & why" },
  { id: "vitals", title: "Vitals", description: "Measurements" },
  { id: "exam", title: "Examination", description: "HPI & findings" },
  { id: "screening", title: "Screening", description: "Notes" },
  { id: "medications", title: "Medications", description: "Prescriptions" },
  { id: "vaccination", title: "Vaccination", description: "Immunizations" },
  { id: "diagnosis", title: "Diagnosis", description: "NPI / ICD-10" },
  { id: "attachments", title: "Attachments", description: "Files" },
  { id: "summary", title: "Summary", description: "Payment & plan" },
] as const;

const STEP_META: Record<string, { title: string; description: string }> = {
  patient: {
    title: "Patient & visit",
    description: "Select the patient and the reason for this visit.",
  },
  vitals: {
    title: "Vitals",
    description: "Growth measurements and vital signs.",
  },
  exam: {
    title: "Examination",
    description: "History of present illness and physical exam findings.",
  },
  screening: {
    title: "Screening & notes",
    description: "Vision, hearing, dental and developmental screening.",
  },
  medications: {
    title: "Medications",
    description: "Medications prescribed at this visit.",
  },
  vaccination: {
    title: "Vaccination",
    description: "Vaccines administered at this visit.",
  },
  diagnosis: {
    title: "Diagnosis",
    description: "Diagnoses (ICD-10) for this encounter.",
  },
  attachments: {
    title: "Attachments",
    description: "Files linked to this visit.",
  },
  summary: {
    title: "Summary & payment",
    description: "Plan, fee and visit summary.",
  },
};

/** Ensure a datetime-local value carries seconds so it passes ISO validation. */
function withSeconds(dt: string): string {
  if (!dt) return dt;
  return /T\d{2}:\d{2}$/.test(dt) ? `${dt}:00` : dt;
}

/**
 * Drop rows added via an "Add" button but never filled in — the backend rejects
 * empty required fields (icd10_code, drug, vaccine), and a blank row shouldn't
 * block saving the rest of the visit.
 */
function pruneEmptyRows(values: CreateVisitDto): CreateVisitDto {
  return {
    ...values,
    diagnoses: values.diagnoses.filter((d) => d.icd10_code.trim() !== ""),
    medications: values.medications.filter((m) => m.drug.trim() !== ""),
    immunizations: values.immunizations.filter(
      (i) => i.vaccine.trim() !== "" && i.date_given.trim() !== "",
    ),
  };
}

function emptyDefaults(patientId: string): CreateVisitDto {
  return {
    patient_id: patientId,
    datetime: nowLocalInput(),
    type: "well-child",
    status: "in-progress",
    reason: "",
    exam_findings: [],
    medications: [],
    diagnoses: [],
    immunizations: [],
    attachment_ids: [],
  } as CreateVisitDto;
}

/** Map a loaded visit into form defaults (strip child ids, nulls → undefined). */
function visitToDefaults(v: VisitFull): CreateVisitDto {
  const s = (x: string | null) => x ?? undefined;
  const n = (x: number | null) => x ?? undefined;
  return {
    patient_id: v.patient_id,
    datetime: toLocalInput(v.datetime),
    type: v.type,
    status: v.status,
    duration_min: n(v.duration_min),
    reason: s(v.reason),
    weight_kg: n(v.weight_kg),
    height_cm: n(v.height_cm),
    height_type: v.height_type ?? undefined,
    hc_cm: n(v.hc_cm),
    temp_c: n(v.temp_c),
    temp_route: v.temp_route ?? undefined,
    hr_bpm: n(v.hr_bpm),
    rr_per_min: n(v.rr_per_min),
    bp_systolic: n(v.bp_systolic),
    bp_diastolic: n(v.bp_diastolic),
    bp_cuff_size: s(v.bp_cuff_size),
    bp_position: s(v.bp_position),
    spo2_pct: n(v.spo2_pct),
    spo2_on_o2: v.spo2_on_o2,
    hpi_onset: s(v.hpi_onset),
    hpi_duration: s(v.hpi_duration),
    hpi_fever_pattern: s(v.hpi_fever_pattern),
    hpi_feeding: s(v.hpi_feeding),
    hpi_urine_output: s(v.hpi_urine_output),
    hpi_symptoms: s(v.hpi_symptoms),
    plan_treatment: s(v.plan_treatment),
    plan_precautions: s(v.plan_precautions),
    plan_follow_up_date: s(v.plan_follow_up_date),
    plan_referrals: s(v.plan_referrals),
    fee: n(v.fee),
    summary: s(v.summary),
    exam_findings: v.exam_findings.map((f) => ({
      category: f.category,
      description: f.description ?? undefined,
      status: f.status ?? undefined,
    })),
    medications: v.medications.map((m) => ({
      drug: m.drug,
      dose: m.dose ?? undefined,
      dose_unit: m.dose_unit ?? undefined,
      route: m.route ?? undefined,
      frequency: m.frequency ?? undefined,
      duration: m.duration ?? undefined,
      notes: m.notes ?? undefined,
    })),
    diagnoses: v.diagnoses.map((d) => ({
      icd10_code: d.icd10_code,
      description: d.description ?? undefined,
      is_primary: d.is_primary,
    })),
    immunizations: v.immunizations.map((i) => ({
      vaccine: i.vaccine,
      dose_number: i.dose_number ?? undefined,
      date_given: i.date_given,
    })),
    screening: v.screening
      ? {
          vision_result: v.screening.vision_result ?? undefined,
          hearing_result: v.screening.hearing_result ?? undefined,
          dental_result: v.screening.dental_result ?? undefined,
          nutrition_notes: v.screening.nutrition_notes ?? undefined,
          dev_tool: v.screening.dev_tool ?? undefined,
          dev_score: v.screening.dev_score ?? undefined,
          dev_milestone_status: v.screening.dev_milestone_status ?? undefined,
          dev_action: v.screening.dev_action ?? undefined,
        }
      : undefined,
    attachment_ids: v.attachments.map((a) => a.id),
  } as CreateVisitDto;
}

export function VisitForm({
  visitId,
  initialPatientId,
}: {
  visitId?: string;
  initialPatientId?: string;
}) {
  const navigate = useNavigate();
  const isEditing = !!visitId;

  const [currentId, setCurrentId] = useState<string | undefined>(visitId);
  const [idx, setIdx] = useState(0);

  const { data: loaded } = useVisitFull(visitId);
  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit(currentId ?? "");

  const form = useForm<CreateVisitDto>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: emptyDefaults(initialPatientId ?? ""),
  });

  // Populate the form once the existing visit loads.
  const hydrated = useRef(false);
  useEffect(() => {
    if (loaded && !hydrated.current) {
      form.reset(visitToDefaults(loaded));
      hydrated.current = true;
    }
  }, [loaded, form]);

  // `loaded` can refetch with a newer status after the initial hydration above
  // (e.g. the visits table changed it) — keep the status field in sync even
  // though we don't want to re-run the full form reset.
  useEffect(() => {
    if (loaded && hydrated.current) {
      form.setValue("status", loaded.status);
    }
  }, [loaded?.status, form]);

  const step = STEPS[idx].id;
  const isLast = idx === STEPS.length - 1;
  const patientId = form.watch("patient_id");
  const isSaving = createVisit.isPending || updateVisit.isPending;

  const persist = async (status?: VisitStatus): Promise<string | undefined> => {
    const values = pruneEmptyRows(form.getValues());
    const payload: CreateVisitDto = {
      ...values,
      datetime: withSeconds(values.datetime),
      status: status ?? values.status,
    };
    try {
      if (currentId) {
        await updateVisit.mutateAsync(payload);
        return currentId;
      }
      const created = await createVisit.mutateAsync(payload);
      setCurrentId(created.id);
      // Reflect the new id in the URL without leaving the form.
      navigate(`/visits/${created.id}`, { replace: true });
      return created.id;
    } catch {
      // Mutations surface their own error toast.
      return undefined;
    }
  };

  const goNext = async () => {
    if (idx === 0) {
      const ok = await form.trigger(["patient_id", "type", "datetime"]);
      if (!ok) return;
      // Create the draft on first advance so the visit exists as in-progress.
      if (!currentId) {
        const id = await persist("in-progress");
        if (!id) return;
      }
    }
    setIdx((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => setIdx((i) => Math.max(i - 1, 0));

  const status = form.watch("status");
  const handleStatusChange = (next: VisitStatus) => {
    form.setValue("status", next, { shouldDirty: true });
    if (currentId) updateVisit.mutate({ status: next });
  };

  const complete = async () => {
    const id = await persist("done");
    if (id) navigate("/visits");
  };

  const meta = STEP_META[step];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6 md:px-10">
      <Stepper
        value={idx + 1}
        onValueChange={(v) => setIdx(v - 1)}
        indicators={{ completed: <CheckIcon className="size-3.5" /> }}
        className="flex flex-col gap-2"
      >
        <StepperNav className="gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <StepperItem
              key={s.id}
              step={i + 1}
              className="flex flex-col items-center gap-1"
            >
              <StepperTrigger className="flex flex-col items-center gap-1 px-0">
                <StepperIndicator>{i + 1}</StepperIndicator>
                <StepperTitle className="text-xs text-center leading-tight">
                  {s.title}
                </StepperTitle>
              </StepperTrigger>
              {i < STEPS.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold tracking-tight">
                {meta.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {meta.description}
              </p>
            </div>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger size="sm" className="w-36">
                <SelectValue>
                  <Badge
                    variant={VISIT_STATUS_BADGE[status]}
                    className="font-normal"
                  >
                    {VISIT_STATUS_LABELS[status]}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VISIT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {VISIT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <StepBody
            step={step}
            form={form}
            lockPatient={isEditing}
            attachments={loaded?.attachments ?? []}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/visits")}
        >
          Cancel
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={idx === 0}
          >
            Back
          </Button>
          {currentId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => persist()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save draft
            </Button>
          )}
          {isLast ? (
            <Button
              type="button"
              onClick={complete}
              disabled={isSaving || !patientId}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Complete visit
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              disabled={isSaving || (idx === 0 && !patientId)}
            >
              {isSaving && idx === 0 ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBody({
  step,
  form,
  lockPatient,
  attachments,
}: {
  step: string;
  form: RHF;
  lockPatient: boolean;
  attachments: VisitFull["attachments"];
}) {
  switch (step) {
    case "patient":
      return <VisitPatientStep form={form} lockPatient={lockPatient} />;
    case "vitals":
      return <VisitVitalsFields form={form} />;
    case "exam":
      return (
        <div className="flex flex-col gap-6">
          <VisitHpiFields form={form} />
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Physical exam findings</h3>
            <ExamFindingsEditor form={form} />
          </div>
        </div>
      );
    case "screening":
      return <ScreeningNotesFields form={form} />;
    case "medications":
      return <VisitMedsEditor form={form} />;
    case "vaccination":
      return <ImmunizationsEditor form={form} />;
    case "diagnosis":
      return <DiagnosesEditor form={form} />;
    case "attachments":
      return <VisitAttachmentsStep attachments={attachments} />;
    case "summary":
      return <PaymentSummaryFields form={form} />;
    default:
      return null;
  }
}
