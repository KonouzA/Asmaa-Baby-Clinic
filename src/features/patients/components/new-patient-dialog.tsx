import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { patientsApi } from "../api/patients.api";
import { useCreatePatient } from "../hooks/use-patients";
import {
  createPatientSchema,
  type CreatePatientDto,
} from "../schemas/patients.schema";
import { BasicFields, BirthInfoFields } from "./patient-form-fields";
import { PatientSummary } from "./patient-summary";
import { PATIENT_TABS, type PatientTabValue } from "./patient-form-tabs";
import { ResponsiveTabsNav } from "./responsive-tabs-nav";
import {
  ClinicalDraftEditor,
  ImmunizationDraftEditor,
} from "./clinical-draft-editor";
import { emptyDraft, type DraftClinical } from "./patient-draft";

/** Which tab owns each patient field, so we can jump there on a validation error. */
const FIELD_TAB: Partial<Record<keyof CreatePatientDto, PatientTabValue>> = {
  full_name: "basic",
  dob: "basic",
  time_of_birth: "basic",
  sex: "basic",
  blood_type: "basic",
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
  const [tab, setTab] = useState<PatientTabValue>("basic");
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
    setTab("basic");
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const submit = form.handleSubmit(
    async (values) => {
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
    },
    (errors) => {
      // Jump to the first tab that has a validation error so it's visible.
      const first = Object.keys(errors)[0] as keyof CreatePatientDto | undefined;
      setTab((first && FIELD_TAB[first]) ?? "basic");
    },
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>New patient</DialogTitle>
          <DialogDescription>
            Register a new patient record. Only the Basic tab is required.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as PatientTabValue)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="px-6 pt-4">
            <ResponsiveTabsNav
              tabs={PATIENT_TABS}
              value={tab}
              onValueChange={setTab}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <TabsContent value="basic" className="mt-0">
              <BasicFields form={form} />
            </TabsContent>
            <TabsContent value="birth" className="mt-0">
              <BirthInfoFields form={form} />
            </TabsContent>
            <TabsContent value="clinical" className="mt-0">
              <ClinicalDraftEditor draft={draft} setDraft={setDraft} />
            </TabsContent>
            <TabsContent value="vaccination" className="mt-0">
              <ImmunizationDraftEditor draft={draft} setDraft={setDraft} />
            </TabsContent>
            <TabsContent value="summary" className="mt-0">
              <PatientSummary values={form.getValues()} clinical={draft} />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
