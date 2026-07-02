import { Controller } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEV_TOOL_LABELS } from "../lib";
import { numberProps, type VisitForm } from "./visit-form-helpers";

export function ScreeningNotesFields({ form }: { form: VisitForm }) {
  const { register, control } = form;

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="screening.vision_result">Vision</FieldLabel>
          <Input
            id="screening.vision_result"
            {...register("screening.vision_result")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="screening.hearing_result">Hearing</FieldLabel>
          <Input
            id="screening.hearing_result"
            {...register("screening.hearing_result")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="screening.dental_result">Dental</FieldLabel>
          <Input
            id="screening.dental_result"
            {...register("screening.dental_result")}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="screening.nutrition_notes">
          Nutrition notes
        </FieldLabel>
        <Textarea
          id="screening.nutrition_notes"
          rows={2}
          {...register("screening.nutrition_notes")}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel>Development tool</FieldLabel>
          <Controller
            control={control}
            name="screening.dev_tool"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEV_TOOL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="screening.dev_score">Score</FieldLabel>
          <Input
            id="screening.dev_score"
            type="number"
            step="0.1"
            {...numberProps(form, "screening.dev_score" as never)}
          />
        </Field>
        <Field>
          <FieldLabel>Milestone status</FieldLabel>
          <Controller
            control={control}
            name="screening.dev_milestone_status"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">On track</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="screening.dev_action">
          Development action / follow-up
        </FieldLabel>
        <Textarea
          id="screening.dev_action"
          rows={2}
          {...register("screening.dev_action")}
        />
      </Field>
    </FieldGroup>
  );
}
