import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewPatientDialog, usePatientFull } from "@/features/patients";
import { VISIT_TYPE_LABELS } from "../lib";
import { visitTypeEnum, type VisitType } from "../schemas/visits.schema";
import { PatientCombobox } from "./patient-combobox";
import { PatientInfoCard } from "./patient-info-card";
import type { VisitForm } from "./visit-form-helpers";

export function VisitPatientStep({
  form,
  lockPatient = false,
}: {
  form: VisitForm;
  /** When editing an existing visit, the patient can't be changed. */
  lockPatient?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const patientId = form.watch("patient_id");
  const { data: patient } = usePatientFull(patientId || undefined);
  const selectedLabel = patient
    ? `${patient.full_name} · ${patient.mrn}`
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Patient</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <PatientCombobox
              value={patientId || undefined}
              selectedLabel={selectedLabel}
              disabled={lockPatient}
              onChange={(id) =>
                form.setValue("patient_id", id, { shouldValidate: true })
              }
            />
          </div>
          {!lockPatient && (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setDialogOpen(true)}
            >
              <UserPlus className="size-4" />
              New patient
            </Button>
          )}
        </div>
        {!patientId && (
          <p className="text-xs text-muted-foreground">
            Choose an existing patient or create a new one to continue.
          </p>
        )}
      </div>

      {patientId && <PatientInfoCard patientId={patientId} />}

      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel>Visit type</FieldLabel>
            <Select
              value={form.watch("type")}
              onValueChange={(v) =>
                form.setValue("type", v as VisitType, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {visitTypeEnum.options.map((t) => (
                  <SelectItem key={t} value={t}>
                    {VISIT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="datetime">Date &amp; time</FieldLabel>
            <Input
              id="datetime"
              type="datetime-local"
              {...form.register("datetime")}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="reason">Reason for visit</FieldLabel>
          <Input
            id="reason"
            placeholder="Chief complaint / reason…"
            {...form.register("reason")}
          />
        </Field>
      </FieldGroup>

      <NewPatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(id) =>
          form.setValue("patient_id", id, { shouldValidate: true })
        }
      />
    </div>
  );
}
