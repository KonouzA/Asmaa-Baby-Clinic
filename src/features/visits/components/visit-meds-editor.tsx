import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import type { VisitForm } from "./visit-form-helpers";

export function VisitMedsEditor({ form }: { form: VisitForm }) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No medications prescribed for this visit.
        </p>
      )}

      {fields.map((f, i) => (
        <div key={f.id} className="rounded-lg border bg-card p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`med-${i}-drug`}>Drug</FieldLabel>
              <Input
                id={`med-${i}-drug`}
                {...register(`medications.${i}.drug`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`med-${i}-dose`}>Dose</FieldLabel>
              <Input
                id={`med-${i}-dose`}
                {...register(`medications.${i}.dose`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`med-${i}-unit`}>Unit</FieldLabel>
              <Input
                id={`med-${i}-unit`}
                placeholder="mg, mL…"
                {...register(`medications.${i}.dose_unit`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`med-${i}-route`}>Route</FieldLabel>
              <Input
                id={`med-${i}-route`}
                placeholder="PO, IV…"
                {...register(`medications.${i}.route`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`med-${i}-freq`}>Frequency</FieldLabel>
              <Input
                id={`med-${i}-freq`}
                placeholder="BID, TID…"
                {...register(`medications.${i}.frequency`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`med-${i}-dur`}>Duration</FieldLabel>
              <Input
                id={`med-${i}-dur`}
                placeholder="5 days…"
                {...register(`medications.${i}.duration`)}
              />
            </Field>
            <div className="flex items-end justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => remove(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Field>
              <FieldLabel htmlFor={`med-${i}-notes`}>Notes</FieldLabel>
              <Input
                id={`med-${i}-notes`}
                {...register(`medications.${i}.notes`)}
              />
            </Field>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() =>
          append({
            drug: "",
            dose: "",
            dose_unit: "",
            route: "",
            frequency: "",
            duration: "",
            notes: "",
          })
        }
      >
        <Plus className="size-4" />
        Add medication
      </Button>
    </div>
  );
}
