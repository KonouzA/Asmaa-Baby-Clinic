import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { numberProps, type VisitForm } from "./visit-form-helpers";

export function PaymentSummaryFields({ form }: { form: VisitForm }) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <FieldGroup>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="plan_follow_up_date">
            Follow-up date
          </FieldLabel>
          <Input
            id="plan_follow_up_date"
            type="date"
            {...register("plan_follow_up_date", {
              setValueAs: (v) => (v === "" ? undefined : v),
            })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="fee">Visit fee</FieldLabel>
          <Input
            id="fee"
            type="number"
            step="0.01"
            min={0}
            {...numberProps(form, "fee")}
          />
          <FieldError errors={[errors.fee]} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="plan_treatment">Treatment plan</FieldLabel>
        <Textarea id="plan_treatment" rows={2} {...register("plan_treatment")} />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="plan_precautions">Precautions</FieldLabel>
          <Textarea
            id="plan_precautions"
            rows={2}
            {...register("plan_precautions")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="plan_referrals">Referrals</FieldLabel>
          <Textarea
            id="plan_referrals"
            rows={2}
            {...register("plan_referrals")}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="summary">Visit summary</FieldLabel>
        <Textarea
          id="summary"
          rows={3}
          placeholder="Overall assessment and summary for the record / receipt…"
          {...register("summary")}
        />
      </Field>
    </FieldGroup>
  );
}
