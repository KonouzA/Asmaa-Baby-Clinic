import { z } from 'zod';

export const sexEnum = z.enum(['male', 'female']);
export const deliveryTypeEnum = z.enum(['nsvd', 'cs', 'assisted']);
export const feedingTypeEnum = z.enum(['breast', 'formula', 'mixed']);
export const bloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

const patientBasicSchema = z.object({
  full_name: z.string().min(1),
  dob: z.iso.date(),
  time_of_birth: z.string().regex(/^\d{2}:\d{2}$/).optional(),
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

export const createPatientSchema = patientBasicSchema.extend(patientBirthInfoSchema.shape);
export const updatePatientSchema = createPatientSchema.partial();

export const allergySchema = z.object({
  allergen: z.string().min(1),
  type: z.enum(['drug', 'food', 'environment']),
  reaction: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'anaphylaxis']).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});
export const updateAllergySchema = allergySchema.partial();

export const problemSchema = z.object({
  condition: z.string().min(1),
  icd10_code: z.string().optional(),
  onset_date: z.iso.date().optional(),
  status: z.enum(['active', 'chronic', 'resolved']).default('active'),
});
export const updateProblemSchema = problemSchema.partial();

export const patientMedicationSchema = z.object({
  drug: z.string().min(1),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
});
export const updatePatientMedicationSchema = patientMedicationSchema.partial();

export const immunizationSchema = z.object({
  visit_id: z.uuid().optional(),
  vaccine: z.string().min(1),
  dose_number: z.number().int().positive().optional(),
  date_given: z.iso.date(),
});

export const patientListQuerySchema = z.object({
  q: z.string().optional(),
  sex: sexEnum.optional(),
  ageMin: z.coerce.number().int().nonnegative().optional(),
  ageMax: z.coerce.number().int().nonnegative().optional(),
  lastVisitFrom: z.iso.date().optional(),
  lastVisitTo: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .enum(['mrn_asc', 'mrn_desc', 'full_name_asc', 'full_name_desc', 'dob_asc', 'dob_desc', 'created_at_asc', 'created_at_desc'])
    .default('created_at_desc'),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;
export type AllergyDto = z.infer<typeof allergySchema>;
export type UpdateAllergyDto = z.infer<typeof updateAllergySchema>;
export type ProblemDto = z.infer<typeof problemSchema>;
export type UpdateProblemDto = z.infer<typeof updateProblemSchema>;
export type PatientMedicationDto = z.infer<typeof patientMedicationSchema>;
export type UpdatePatientMedicationDto = z.infer<typeof updatePatientMedicationSchema>;
export type ImmunizationDto = z.infer<typeof immunizationSchema>;
export type PatientListQuery = z.infer<typeof patientListQuerySchema>;
