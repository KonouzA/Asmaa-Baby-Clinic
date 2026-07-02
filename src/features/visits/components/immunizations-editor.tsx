import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { numberProps, type VisitForm } from "./visit-form-helpers";

export function ImmunizationsEditor({ form }: { form: VisitForm }) {
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "immunizations",
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No vaccines administered at this visit.
        </p>
      )}

      {fields.map((f, i) => (
        <div
          key={f.id}
          className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
        >
          <Field>
            <FieldLabel htmlFor={`imm-${i}-vaccine`}>Vaccine</FieldLabel>
            <Input
              id={`imm-${i}-vaccine`}
              placeholder="e.g. Hepatitis B"
              {...register(`immunizations.${i}.vaccine`)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`imm-${i}-dose`}>Dose #</FieldLabel>
            <Input
              id={`imm-${i}-dose`}
              type="number"
              className="sm:w-24"
              {...numberProps(form, `immunizations.${i}.dose_number` as never)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`imm-${i}-date`}>Date given</FieldLabel>
            <Input
              id={`imm-${i}-date`}
              type="date"
              {...register(`immunizations.${i}.date_given`)}
            />
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
        onClick={() => append({ vaccine: "", date_given: "" })}
      >
        <Plus className="size-4" />
        Add vaccine
      </Button>
    </div>
  );
}
