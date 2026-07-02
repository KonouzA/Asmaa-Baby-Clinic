import type { UseFormReturn } from "react-hook-form";
import type { CreateVisitDto } from "../schemas/visits.schema";

export type VisitForm = UseFormReturn<CreateVisitDto>;

/** Register a numeric field so empty input maps to `undefined` (optional) not `NaN`. */
export function numberProps(form: VisitForm, name: keyof CreateVisitDto) {
  return form.register(name as never, {
    setValueAs: (v: string) => (v === "" || v === null ? undefined : Number(v)),
  });
}

/** Convert an ISO datetime to the `YYYY-MM-DDTHH:mm` shape a datetime-local input wants. */
export function toLocalInput(value: string): string {
  if (!value) return "";
  // Already local (no timezone) — trim seconds if present.
  const m = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : value;
}

/** Current local time as `YYYY-MM-DDTHH:mm` for a new visit's default datetime. */
export function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
