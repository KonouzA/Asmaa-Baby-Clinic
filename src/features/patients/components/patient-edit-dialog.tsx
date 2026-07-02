import { useEffect, useState } from "react";
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
import { useSavePatientEdits } from "../hooks/use-patients";
import {
  createPatientSchema,
  type CreatePatientDto,
  type PatientFull,
} from "../schemas/patients.schema";
import { BasicFields, BirthInfoFields } from "./patient-form-fields";
import { PatientSummary } from "./patient-summary";
import { PATIENT_TABS, type PatientTabValue } from "./patient-form-tabs";
import { ResponsiveTabsNav } from "./responsive-tabs-nav";
import {
  ClinicalDraftEditor,
  ImmunizationDraftEditor,
} from "./clinical-draft-editor";
import {
  diffClinical,
  draftFromPatient,
  type DraftClinical,
} from "./patient-draft";

/** Map a persisted patient (nullable fields) onto the form's optional-undefined shape. */
function toFormValues(p: PatientFull): CreatePatientDto {
  return {
    full_name: p.full_name,
    dob: p.dob,
    sex: p.sex,
    time_of_birth: p.time_of_birth ?? undefined,
    blood_type: p.blood_type ?? undefined,
    gestational_age_weeks: p.gestational_age_weeks ?? undefined,
    birth_weight_kg: p.birth_weight_kg ?? undefined,
    birth_length_cm: p.birth_length_cm ?? undefined,
    birth_hc_cm: p.birth_hc_cm ?? undefined,
    delivery_type: p.delivery_type ?? undefined,
    nicu_admission: p.nicu_admission,
    nicu_days: p.nicu_days ?? undefined,
    neonatal_complications: p.neonatal_complications ?? undefined,
    newborn_screening_done: p.newborn_screening_done,
    newborn_screening_result: p.newborn_screening_result ?? undefined,
    feeding_type: p.feeding_type ?? undefined,
    weaning_status: p.weaning_status ?? undefined,
  };
}

/** Which tab owns each patient field, so we can jump there on a validation error. */
const FIELD_TAB: Partial<Record<keyof CreatePatientDto, PatientTabValue>> = {
  full_name: "basic",
  dob: "basic",
  time_of_birth: "basic",
  sex: "basic",
  blood_type: "basic",
};

export function PatientEditDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: PatientFull;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<PatientTabValue>("basic");
  const [draft, setDraft] = useState<DraftClinical>(() =>
    draftFromPatient(patient),
  );
  const save = useSavePatientEdits(patient.id);
  const form = useForm<CreatePatientDto>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: toFormValues(patient),
  });

  // Re-seed the form and clinical draft whenever a different patient / fresh
  // data is opened.
  useEffect(() => {
    if (open) {
      form.reset(toFormValues(patient));
      setDraft(draftFromPatient(patient));
      setTab("basic");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient]);

  const submit = form.handleSubmit(
    (values) => {
      save.mutate(
        { core: values, diff: diffClinical(patient, draft) },
        { onSuccess: () => onOpenChange(false) },
      );
    },
    (errors) => {
      const first = Object.keys(errors)[0] as keyof CreatePatientDto | undefined;
      setTab((first && FIELD_TAB[first]) ?? "basic");
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Edit patient</DialogTitle>
          <DialogDescription>
            Update {patient.full_name}'s record ({patient.mrn}). Changes are saved
            together when you click Save.
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
