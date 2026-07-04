import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const visitTypeEnum = z.enum(['well-child', 'sick', 'follow-up', 'vaccination', 'emergency']);
export const visitStatusEnum = z.enum(['booked', 'checked-in', 'in-progress', 'done', 'no-show', 'cancelled']);

// ── Section schemas (each maps to one UI tab) ─────────────────────────────────

export const visitVitalsSchema = z.object({
  weight_kg: z.number().positive().optional(),
  height_cm: z.number().positive().optional(),
  height_type: z.enum(['length', 'height']).optional(),
  hc_cm: z.number().positive().optional(),
  temp_c: z.number().optional(),
  temp_route: z.enum(['axillary', 'oral', 'rectal', 'tympanic']).optional(),
  hr_bpm: z.number().int().optional(),
  rr_per_min: z.number().int().optional(),
  bp_systolic: z.number().int().optional(),
  bp_diastolic: z.number().int().optional(),
  bp_cuff_size: z.string().optional(),
  bp_position: z.string().optional(),
  spo2_pct: z.number().min(0).max(100).optional(),
  spo2_on_o2: z.boolean().optional(),
});

export const visitHpiSchema = z.object({
  hpi_onset: z.string().optional(),
  hpi_duration: z.string().optional(),
  hpi_fever_pattern: z.string().optional(),
  hpi_feeding: z.string().optional(),
  hpi_urine_output: z.string().optional(),
  hpi_symptoms: z.string().optional(),
});

export const visitPlanSchema = z.object({
  plan_treatment: z.string().optional(),
  plan_precautions: z.string().optional(),
  plan_follow_up_date: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.iso.date().optional(),
  ),
  plan_referrals: z.string().optional(),
});

export const visitPaymentSchema = z.object({
  fee: z.number().nonnegative().optional(),
  summary: z.string().optional(),
});

// ── Child collection item schemas ─────────────────────────────────────────────

export const examFindingSchema = z.object({
  category: z.enum([
    'general_appearance', 'heent', 'neck', 'chest_lungs', 'cardiovascular',
    'abdomen', 'genitourinary', 'rectal', 'musculoskeletal', 'lymph_nodes',
    'extremities_skin', 'neurological',
  ]),
  description: z.string().optional(),
  status: z.enum(['normal', 'abnormal']).optional(),
});

export const visitMedicationSchema = z.object({
  drug: z.string().min(1),
  dose: z.string().optional(),
  dose_unit: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

export const diagnosisSchema = z.object({
  icd10_code: z.string().min(1),
  description: z.string().optional(),
  is_primary: z.boolean().default(false),
});

export const screeningSchema = z.object({
  vision_result: z.string().optional(),
  hearing_result: z.string().optional(),
  dental_result: z.string().optional(),
  nutrition_notes: z.string().optional(),
  dev_tool: z.enum(['mchat', 'asq', 'denver', 'flacc', 'faces']).optional(),
  dev_score: z.number().optional(),
  dev_milestone_status: z.enum(['on_track', 'delayed']).optional(),
  dev_action: z.string().optional(),
});

// Visit-scoped immunization (service stamps visit_id automatically).
export const visitImmunizationSchema = z.object({
  vaccine: z.string().min(1),
  dose_number: z.number().int().positive().optional(),
  date_given: z.iso.date(),
});

// ── Main visit body: core + all sections + all child collections ───────────────
// POST uses this as-is. PUT uses .partial() — all fields optional for draft saves.

export const visitSchema = z
  .object({
    patient_id: z.uuid(),
    datetime: z.iso.datetime({ local: true }),
    type: visitTypeEnum,
    status: visitStatusEnum.default('in-progress'),
    duration_min: z.number().int().positive().optional(),
    reason: z.string().optional(),
  })
  .extend(visitVitalsSchema.shape)
  .extend(visitHpiSchema.shape)
  .extend(visitPlanSchema.shape)
  .extend(visitPaymentSchema.shape)
  .extend({
    exam_findings: z.array(examFindingSchema).max(12).default([]),
    medications: z.array(visitMedicationSchema).default([]),
    diagnoses: z.array(diagnosisSchema).default([]),
    immunizations: z.array(visitImmunizationSchema).default([]),
    screening: screeningSchema.optional(),
    attachment_ids: z.array(z.uuid()).default([]),
  });

export const createVisitSchema = visitSchema;
export const updateVisitSchema = visitSchema.partial();

// ── List query ─────────────────────────────────────────────────────────────────

export const visitListQuerySchema = z.object({
  patientId: z.uuid().optional(),
  status: visitStatusEnum.optional(),
  type: visitTypeEnum.optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ── Exported DTO types ────────────────────────────────────────────────────────

export type CreateVisitDto = z.infer<typeof createVisitSchema>;
export type UpdateVisitDto = z.infer<typeof updateVisitSchema>;
export type VisitListQuery = z.infer<typeof visitListQuerySchema>;
export type ExamFindingDto = z.infer<typeof examFindingSchema>;
export type VisitMedicationDto = z.infer<typeof visitMedicationSchema>;
export type DiagnosisDto = z.infer<typeof diagnosisSchema>;
export type VisitImmunizationDto = z.infer<typeof visitImmunizationSchema>;
export type ScreeningDto = z.infer<typeof screeningSchema>;
