import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import type { VisitForm } from "./visit-form-helpers";

/** NPI — diagnoses (ICD-10) list with a single primary flag. */
export function DiagnosesEditor({ form }: { form: VisitForm }) {
  const { control, register, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses",
  });

  // Radio-like behavior: marking one primary clears the others.
  const setPrimary = (index: number) => {
    fields.forEach((_, i) => setValue(`diagnoses.${i}.is_primary`, i === index));
  };

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No diagnoses recorded for this visit.
        </p>
      )}

      {fields.map((f, i) => (
        <div
          key={f.id}
          className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,9rem)_1fr_auto_auto] sm:items-end"
        >
          <Field>
            <FieldLabel htmlFor={`dx-${i}-code`}>ICD-10</FieldLabel>
            <Input
              id={`dx-${i}-code`}
              placeholder="e.g. J06.9"
              className="font-mono"
              {...register(`diagnoses.${i}.icd10_code`)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`dx-${i}-desc`}>Description</FieldLabel>
            <Input
              id={`dx-${i}-desc`}
              {...register(`diagnoses.${i}.description`)}
            />
          </Field>
          <Field orientation="horizontal" className="pb-2">
            <Controller
              control={control}
              name={`diagnoses.${i}.is_primary`}
              render={({ field }) => (
                <Checkbox
                  id={`dx-${i}-primary`}
                  checked={!!field.value}
                  onCheckedChange={(v) => {
                    if (v === true) setPrimary(i);
                    else field.onChange(false);
                  }}
                />
              )}
            />
            <FieldLabel htmlFor={`dx-${i}-primary`}>Primary</FieldLabel>
          </Field>
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
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() =>
          append({
            icd10_code: "",
            description: "",
            is_primary: fields.length === 0,
          })
        }
      >
        <Plus className="size-4" />
        Add diagnosis
      </Button>
    </div>
  );
}
