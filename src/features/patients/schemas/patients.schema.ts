import { z } from "zod";

// ── Enums (mirror src-tauri/sidecar/features/patients/patients.schema.ts) ──────

export const sexEnum = z.enum(["male", "female"]);
export const deliveryTypeEnum = z.enum(["nsvd", "cs", "assisted"]);
export const feedingTypeEnum = z.enum(["breast", "formula", "mixed"]);
export const bloodTypeEnum = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);
export const allergyTypeEnum = z.enum(["drug", "food", "environment"]);
export const allergySeverityEnum = z.enum(["mild", "moderate", "anaphylaxis"]);
export const allergyStatusEnum = z.enum(["active", "inactive"]);
export const problemStatusEnum = z.enum(["active", "chronic", "resolved"]);

// ── Patient create / update ────────────────────────────────────────────────────

const patientBasicSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  dob: z.iso.date("Date of birth is required"),
  time_of_birth: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM format")
    .optional(),
  sex: sexEnum,
  blood_type: bloodTypeEnum.optional(),
});

const patientBirthInfoSchema = z.object({
  gestational_age_weeks: z.number().positive().optional(),
  birth_weight_kg: z.number().positive().optional(),
  birth_length_cm: z.number().positive().optional(),
  birth_hc_cm: z.number().positive().optional(),
  delivery_type: deliveryTypeEnum.optional(),
  nicu_admission: z.boolean().optional(),
  nicu_days: z.number().int().nonnegative().optional(),
  neonatal_complications: z.string().optional(),
  newborn_screening_done: z.boolean().optional(),
  newborn_screening_result: z.string().optional(),
  feeding_type: feedingTypeEnum.optional(),
  weaning_status: z.string().optional(),
});

export const createPatientSchema = patientBasicSchema.extend(
  patientBirthInfoSchema.shape,
);
export const updatePatientSchema = createPatientSchema.partial();

// ── Nested resources ───────────────────────────────────────────────────────────

export const allergySchema = z.object({
  allergen: z.string().min(1, "Allergen is required"),
  type: allergyTypeEnum,
  reaction: z.string().optional(),
  severity: allergySeverityEnum.optional(),
  status: allergyStatusEnum.default("active"),
});

export const problemSchema = z.object({
  condition: z.string().min(1, "Condition is required"),
  icd10_code: z.string().optional(),
  onset_date: z.iso.date().optional(),
  status: problemStatusEnum.default("active"),
});

export const patientMedicationSchema = z.object({
  drug: z.string().min(1, "Drug is required"),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
});

export const immunizationSchema = z.object({
  visit_id: z.uuid().optional(),
  vaccine: z.string().min(1, "Vaccine is required"),
  dose_number: z.number().int().positive().optional(),
  date_given: z.iso.date("Date given is required"),
});

// ── List query ──────────────────────────────────────────────────────────────────

export const patientSortEnum = z.enum([
  "mrn_asc",
  "mrn_desc",
  "full_name_asc",
  "full_name_desc",
  "dob_asc",
  "dob_desc",
  "created_at_asc",
  "created_at_desc",
]);

export const patientListQuerySchema = z.object({
  q: z.string().optional(),
  sex: sexEnum.optional(),
  ageMin: z.coerce.number().int().nonnegative().optional(),
  ageMax: z.coerce.number().int().nonnegative().optional(),
  lastVisitFrom: z.iso.date().optional(),
  lastVisitTo: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: patientSortEnum.default("created_at_desc"),
});

// ── DTO types ───────────────────────────────────────────────────────────────────

export type Sex = z.infer<typeof sexEnum>;
export type DeliveryType = z.infer<typeof deliveryTypeEnum>;
export type FeedingType = z.infer<typeof feedingTypeEnum>;
export type BloodType = z.infer<typeof bloodTypeEnum>;
export type PatientSort = z.infer<typeof patientSortEnum>;

export type CreatePatientDto = z.infer<typeof createPatientSchema>;
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;
export type AllergyDto = z.infer<typeof allergySchema>;
export type ProblemDto = z.infer<typeof problemSchema>;
export type PatientMedicationDto = z.infer<typeof patientMedicationSchema>;
export type ImmunizationDto = z.infer<typeof immunizationSchema>;
export type PatientListQuery = z.infer<typeof patientListQuerySchema>;

// ── Response shapes (from patients.service.ts) ─────────────────────────────────

export type Patient = {
  id: string;
  mrn: string;
  full_name: string;
  dob: string;
  time_of_birth: string | null;
  sex: Sex;
  gestational_age_weeks: number | null;
  blood_type: BloodType | null;
  birth_weight_kg: number | null;
  birth_length_cm: number | null;
  birth_hc_cm: number | null;
  delivery_type: DeliveryType | null;
  nicu_admission: boolean;
  nicu_days: number | null;
  neonatal_complications: string | null;
  newborn_screening_done: boolean;
  newborn_screening_result: string | null;
  feeding_type: FeedingType | null;
  weaning_status: string | null;
  created_at: string;
  updated_at: string;
};

export type Allergy = {
  id: string;
  patient_id: string;
  allergen: string;
  type: z.infer<typeof allergyTypeEnum>;
  reaction: string | null;
  severity: z.infer<typeof allergySeverityEnum> | null;
  status: z.infer<typeof allergyStatusEnum>;
  created_at: string;
};

export type Problem = {
  id: string;
  patient_id: string;
  condition: string;
  icd10_code: string | null;
  onset_date: string | null;
  status: z.infer<typeof problemStatusEnum>;
  created_at: string;
};

export type PatientMedication = {
  id: string;
  patient_id: string;
  drug: string;
  dose: string | null;
  route: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Immunization = {
  id: string;
  patient_id: string;
  visit_id: string | null;
  vaccine: string;
  dose_number: number | null;
  date_given: string;
  created_at: string;
};

export type PatientFull = Patient & {
  allergies: Allergy[];
  problems: Problem[];
  medications: PatientMedication[];
  immunizations: Immunization[];
};

export type GrowthPoint = {
  visit_id: string;
  datetime: string;
  weight_kg: number | null;
  height_cm: number | null;
  height_type: "length" | "height" | null;
  hc_cm: number | null;
};

export type VisitSummary = {
  id: string;
  datetime: string;
  type: string;
  status: string;
  reason: string | null;
  fee: number | null;
};

export type PatientListResponse = {
  data: Patient[];
  total: number;
  page: number;
  pageSize: number;
};
