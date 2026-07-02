import type {
  BloodType,
  DeliveryType,
  FeedingType,
  Sex,
} from "./schemas/patients.schema";

/** Human-readable age from an ISO date of birth, e.g. "3 y 2 mo" or "5 mo" or "12 d". */
export function formatAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  if (Number.isNaN(birth.getTime())) return "—";

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;

  if (months < 1) {
    const days = Math.max(
      0,
      Math.floor((now.getTime() - birth.getTime()) / 86_400_000),
    );
    return `${days} d`;
  }
  if (months < 24) return `${months} mo`;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths ? `${years} y ${remMonths} mo` : `${years} y`;
}

/** Format an ISO date (YYYY-MM-DD or datetime) as a short locale date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format an ISO datetime as short date + time. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const SEX_LABELS: Record<Sex, string> = {
  male: "Male",
  female: "Female",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  nsvd: "Normal vaginal (NSVD)",
  cs: "Cesarean (C-section)",
  assisted: "Assisted",
};

export const FEEDING_TYPE_LABELS: Record<FeedingType, string> = {
  breast: "Breastfed",
  formula: "Formula",
  mixed: "Mixed",
};

export const BLOOD_TYPES: BloodType[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export const ALLERGY_TYPE_LABELS: Record<string, string> = {
  drug: "Drug",
  food: "Food",
  environment: "Environment",
};

export const SORT_LABELS: Record<string, string> = {
  created_at_desc: "Newest first",
  created_at_asc: "Oldest first",
  full_name_asc: "Name (A–Z)",
  full_name_desc: "Name (Z–A)",
  mrn_asc: "MRN (ascending)",
  mrn_desc: "MRN (descending)",
  dob_asc: "DOB (oldest)",
  dob_desc: "DOB (youngest)",
};

/** Fallback label helper: capitalizes a raw enum/status token. */
export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/[_-]/g, " ");
}
