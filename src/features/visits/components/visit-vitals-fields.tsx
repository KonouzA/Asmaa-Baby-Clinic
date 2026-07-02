import { Controller } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMP_ROUTE_LABELS } from "../lib";
import { numberProps, type VisitForm } from "./visit-form-helpers";

export function VisitVitalsFields({ form }: { form: VisitForm }) {
  const { register, control, formState } = form;
  const { errors } = formState;

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="weight_kg">Weight (kg)</FieldLabel>
          <Input
            id="weight_kg"
            type="number"
            step="0.01"
            {...numberProps(form, "weight_kg")}
          />
          <FieldError errors={[errors.weight_kg]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="height_cm">Height / length (cm)</FieldLabel>
          <Input
            id="height_cm"
            type="number"
            step="0.1"
            {...numberProps(form, "height_cm")}
          />
          <FieldError errors={[errors.height_cm]} />
        </Field>
        <Field>
          <FieldLabel>Measured as</FieldLabel>
          <Controller
            control={control}
            name="height_type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Length / height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="length">Length (recumbent)</SelectItem>
                  <SelectItem value="height">Height (standing)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="hc_cm">Head circumference (cm)</FieldLabel>
          <Input
            id="hc_cm"
            type="number"
            step="0.1"
            {...numberProps(form, "hc_cm")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="temp_c">Temperature (°C)</FieldLabel>
          <Input
            id="temp_c"
            type="number"
            step="0.1"
            {...numberProps(form, "temp_c")}
          />
        </Field>
        <Field>
          <FieldLabel>Temp route</FieldLabel>
          <Controller
            control={control}
            name="temp_route"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Route" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMP_ROUTE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="hr_bpm">Heart rate (bpm)</FieldLabel>
          <Input id="hr_bpm" type="number" {...numberProps(form, "hr_bpm")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="rr_per_min">Resp. rate (/min)</FieldLabel>
          <Input
            id="rr_per_min"
            type="number"
            {...numberProps(form, "rr_per_min")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="spo2_pct">SpO₂ (%)</FieldLabel>
          <Input
            id="spo2_pct"
            type="number"
            step="1"
            {...numberProps(form, "spo2_pct")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="bp_systolic">BP systolic</FieldLabel>
          <Input
            id="bp_systolic"
            type="number"
            {...numberProps(form, "bp_systolic")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bp_diastolic">BP diastolic</FieldLabel>
          <Input
            id="bp_diastolic"
            type="number"
            {...numberProps(form, "bp_diastolic")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bp_cuff_size">Cuff size</FieldLabel>
          <Input id="bp_cuff_size" {...register("bp_cuff_size")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="bp_position">Position</FieldLabel>
          <Input id="bp_position" {...register("bp_position")} />
        </Field>
      </div>

      <Field orientation="horizontal">
        <Controller
          control={control}
          name="spo2_on_o2"
          render={({ field }) => (
            <Checkbox
              id="spo2_on_o2"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
          )}
        />
        <FieldLabel htmlFor="spo2_on_o2">SpO₂ measured on supplemental O₂</FieldLabel>
      </Field>
    </FieldGroup>
  );
}
