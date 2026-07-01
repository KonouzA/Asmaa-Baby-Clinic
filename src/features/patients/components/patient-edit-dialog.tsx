import { useEffect } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUpdatePatient } from "../hooks/use-patients";
import {
  createPatientSchema,
  type CreatePatientDto,
  type Patient,
} from "../schemas/patients.schema";
import { BasicFields, BirthInfoFields } from "./patient-form-fields";

/** Map a persisted patient (nullable fields) onto the form's optional-undefined shape. */
function toFormValues(p: Patient): CreatePatientDto {
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

export function PatientEditDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdatePatient(patient.id);
  const form = useForm<CreatePatientDto>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: toFormValues(patient),
  });

  // Re-seed the form whenever a different patient / fresh data is opened.
  useEffect(() => {
    if (open) form.reset(toFormValues(patient));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patient]);

  const submit = form.handleSubmit((values) => {
    update.mutate(values, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Edit patient</DialogTitle>
          <DialogDescription>
            Update {patient.full_name}'s record ({patient.mrn}).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Basic
              </TabsTrigger>
              <TabsTrigger value="birth" className="flex-1">
                Birth Info
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
            <TabsContent value="basic" className="mt-0">
              <BasicFields form={form} />
            </TabsContent>
            <TabsContent value="birth" className="mt-0">
              <BirthInfoFields form={form} />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
