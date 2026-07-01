import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreatePatientDto } from "../schemas/patients.schema";
import {
  BLOOD_TYPES,
  DELIVERY_TYPE_LABELS,
  FEEDING_TYPE_LABELS,
  SEX_LABELS,
} from "../lib";

type Form = UseFormReturn<CreatePatientDto>;

/** Register a numeric field so empty input maps to `undefined` (optional) not `NaN`. */
function numberProps(form: Form, name: keyof CreatePatientDto) {
  return form.register(name as never, {
    setValueAs: (v: string) =>
      v === "" || v === null ? undefined : Number(v),
  });
}

export function BasicFields({ form }: { form: Form }) {
  const { register, control, formState } = form;
  const { errors } = formState;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="full_name">Full name</FieldLabel>
        <Input id="full_name" {...register("full_name")} />
        <FieldError errors={[errors.full_name]} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
          <Input id="dob" type="date" {...register("dob")} />
          <FieldError errors={[errors.dob]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="time_of_birth">Time of birth</FieldLabel>
          <Input id="time_of_birth" type="time" {...register("time_of_birth")} />
          <FieldError errors={[errors.time_of_birth]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>Sex</FieldLabel>
          <Controller
            control={control}
            name="sex"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEX_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.sex]} />
        </Field>

        <Field>
          <FieldLabel>Blood type</FieldLabel>
          <Controller
            control={control}
            name="blood_type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Unknown" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.blood_type]} />
        </Field>
      </div>
    </FieldGroup>
  );
}

export function BirthInfoFields({ form }: { form: Form }) {
  const { register, control, watch, formState } = form;
  const { errors } = formState;
  const nicuAdmission = watch("nicu_admission");
  const screeningDone = watch("newborn_screening_done");

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="gestational_age_weeks">
            Gestational age (weeks)
          </FieldLabel>
          <Input
            id="gestational_age_weeks"
            type="number"
            step="0.1"
            {...numberProps(form, "gestational_age_weeks")}
          />
          <FieldError errors={[errors.gestational_age_weeks]} />
        </Field>
        <Field>
          <FieldLabel>Delivery type</FieldLabel>
          <Controller
            control={control}
            name="delivery_type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DELIVERY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.delivery_type]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="birth_weight_kg">Birth weight (kg)</FieldLabel>
          <Input
            id="birth_weight_kg"
            type="number"
            step="0.01"
            {...numberProps(form, "birth_weight_kg")}
          />
          <FieldError errors={[errors.birth_weight_kg]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="birth_length_cm">Birth length (cm)</FieldLabel>
          <Input
            id="birth_length_cm"
            type="number"
            step="0.1"
            {...numberProps(form, "birth_length_cm")}
          />
          <FieldError errors={[errors.birth_length_cm]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="birth_hc_cm">Head circ. (cm)</FieldLabel>
          <Input
            id="birth_hc_cm"
            type="number"
            step="0.1"
            {...numberProps(form, "birth_hc_cm")}
          />
          <FieldError errors={[errors.birth_hc_cm]} />
        </Field>
      </div>

      <Field orientation="horizontal">
        <Controller
          control={control}
          name="nicu_admission"
          render={({ field }) => (
            <Checkbox
              id="nicu_admission"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
          )}
        />
        <FieldLabel htmlFor="nicu_admission">NICU admission</FieldLabel>
      </Field>

      {nicuAdmission && (
        <Field>
          <FieldLabel htmlFor="nicu_days">NICU days</FieldLabel>
          <Input
            id="nicu_days"
            type="number"
            {...numberProps(form, "nicu_days")}
          />
          <FieldError errors={[errors.nicu_days]} />
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="neonatal_complications">
          Neonatal complications
        </FieldLabel>
        <Textarea
          id="neonatal_complications"
          rows={2}
          {...register("neonatal_complications")}
        />
      </Field>

      <Field orientation="horizontal">
        <Controller
          control={control}
          name="newborn_screening_done"
          render={({ field }) => (
            <Checkbox
              id="newborn_screening_done"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
            />
          )}
        />
        <FieldLabel htmlFor="newborn_screening_done">
          Newborn screening done
        </FieldLabel>
      </Field>

      {screeningDone && (
        <Field>
          <FieldLabel htmlFor="newborn_screening_result">
            Screening result
          </FieldLabel>
          <Input
            id="newborn_screening_result"
            {...register("newborn_screening_result")}
          />
        </Field>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel>Feeding type</FieldLabel>
          <Controller
            control={control}
            name="feeding_type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feeding type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEEDING_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="weaning_status">Weaning status</FieldLabel>
          <Input id="weaning_status" {...register("weaning_status")} />
        </Field>
      </div>
    </FieldGroup>
  );
}
