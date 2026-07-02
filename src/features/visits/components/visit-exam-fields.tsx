import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { VisitForm } from "./visit-form-helpers";

/** History of Present Illness — the narrative half of the Examination step. */
export function VisitHpiFields({ form }: { form: VisitForm }) {
  const { register } = form;

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="hpi_onset">Onset</FieldLabel>
          <Input
            id="hpi_onset"
            placeholder="e.g. 2 days ago"
            {...register("hpi_onset")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="hpi_duration">Duration</FieldLabel>
          <Input
            id="hpi_duration"
            placeholder="e.g. intermittent"
            {...register("hpi_duration")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="hpi_fever_pattern">Fever pattern</FieldLabel>
          <Input id="hpi_fever_pattern" {...register("hpi_fever_pattern")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="hpi_feeding">Feeding</FieldLabel>
          <Input id="hpi_feeding" {...register("hpi_feeding")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="hpi_urine_output">Urine output</FieldLabel>
          <Input id="hpi_urine_output" {...register("hpi_urine_output")} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="hpi_symptoms">Symptoms &amp; notes</FieldLabel>
        <Textarea
          id="hpi_symptoms"
          rows={3}
          placeholder="Presenting symptoms, associated complaints…"
          {...register("hpi_symptoms")}
        />
      </Field>
    </FieldGroup>
  );
}
