import { z } from "zod";

// ── Enums (mirror src-tauri/sidecar/features/visits/visits.schema.ts) ──────────

export const visitTypeEnum = z.enum([
  "well-child",
  "sick",
  "follow-up",
  "vaccination",
  "emergency",
]);
export const visitStatusEnum = z.enum([
  "booked",
  "checked-in",
  "in-progress",
  "done",
  "no-show",
  "cancelled",
]);
export const heightTypeEnum = z.enum(["length", "height"]);
export const tempRouteEnum = z.enum(["axillary", "oral", "rectal", "tympanic"]);
export const examCategoryEnum = z.enum([
  "general_appearance",
  "heent",
  "neck",
  "chest_lungs",
  "cardiovascular",
  "abdomen",
  "genitourinary",
  "rectal",
  "musculoskeletal",
  "lymph_nodes",
  "extremities_skin",
  "neurological",
]);
export const examStatusEnum = z.enum(["normal", "abnormal"]);
export const devToolEnum = z.enum(["mchat", "asq", "denver", "flacc", "faces"]);
export const devMilestoneStatusEnum = z.enum(["on_track", "delayed"]);

// ── Section schemas (each maps to a step) ──────────────────────────────────────

const vitalsShape = {
  weight_kg: z.number().positive().optional(),
  height_cm: z.number().positive().optional(),
  height_type: heightTypeEnum.optional(),
  hc_cm: z.number().positive().optional(),
  temp_c: z.number().optional(),
  temp_route: tempRouteEnum.optional(),
  hr_bpm: z.number().int().optional(),
  rr_per_min: z.number().int().optional(),
  bp_systolic: z.number().int().optional(),
  bp_diastolic: z.number().int().optional(),
  bp_cuff_size: z.string().optional(),
  bp_position: z.string().optional(),
  spo2_pct: z.number().min(0).max(100).optional(),
  spo2_on_o2: z.boolean().optional(),
};

const hpiShape = {
  hpi_onset: z.string().optional(),
  hpi_duration: z.string().optional(),
  hpi_fever_pattern: z.string().optional(),
  hpi_feeding: z.string().optional(),
  hpi_urine_output: z.string().optional(),
  hpi_symptoms: z.string().optional(),
};

const planShape = {
  plan_treatment: z.string().optional(),
  plan_precautions: z.string().optional(),
  plan_follow_up_date: z.iso.date().optional(),
  plan_referrals: z.string().optional(),
};

const paymentShape = {
  fee: z.number().nonnegative().optional(),
  summary: z.string().optional(),
};

// ── Child collection item schemas ──────────────────────────────────────────────

export const examFindingSchema = z.object({
  category: examCategoryEnum,
  description: z.string().optional(),
  status: examStatusEnum.optional(),
});

export const visitMedicationSchema = z.object({
  drug: z.string().min(1, "Drug is required"),
  dose: z.string().optional(),
  dose_unit: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

export const diagnosisSchema = z.object({
  icd10_code: z.string().min(1, "ICD-10 code is required"),
  description: z.string().optional(),
  is_primary: z.boolean(),
});

export const screeningSchema = z.object({
  vision_result: z.string().optional(),
  hearing_result: z.string().optional(),
  dental_result: z.string().optional(),
  nutrition_notes: z.string().optional(),
  dev_tool: devToolEnum.optional(),
  dev_score: z.number().optional(),
  dev_milestone_status: devMilestoneStatusEnum.optional(),
  dev_action: z.string().optional(),
});

export const visitImmunizationSchema = z.object({
  vaccine: z.string().min(1, "Vaccine is required"),
  dose_number: z.number().int().positive().optional(),
  date_given: z.iso.date("Date given is required"),
});

// ── Main visit body (create) + partial (update / draft) ─────────────────────────

export const createVisitSchema = z
  .object({
    patient_id: z.uuid(),
    datetime: z.iso.datetime({ local: true }),
    type: visitTypeEnum,
    status: visitStatusEnum,
    duration_min: z.number().int().positive().optional(),
    reason: z.string().optional(),
    ...vitalsShape,
    ...hpiShape,
    ...planShape,
    ...paymentShape,
    exam_findings: z.array(examFindingSchema).max(12),
    medications: z.array(visitMedicationSchema),
    diagnoses: z.array(diagnosisSchema),
    immunizations: z.array(visitImmunizationSchema),
    screening: screeningSchema.optional(),
    attachment_ids: z.array(z.uuid()),
  });

export const updateVisitSchema = createVisitSchema.partial();

// ── List query ──────────────────────────────────────────────────────────────────

export const visitListQuerySchema = z.object({
  patientId: z.uuid().optional(),
  status: visitStatusEnum.optional(),
  type: visitTypeEnum.optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ── DTO types ───────────────────────────────────────────────────────────────────

export type VisitType = z.infer<typeof visitTypeEnum>;
export type VisitStatus = z.infer<typeof visitStatusEnum>;
export type ExamCategory = z.infer<typeof examCategoryEnum>;
export type ExamStatus = z.infer<typeof examStatusEnum>;

export type CreateVisitDto = z.infer<typeof createVisitSchema>;
export type UpdateVisitDto = z.infer<typeof updateVisitSchema>;
export type ExamFindingDto = z.infer<typeof examFindingSchema>;
export type VisitMedicationDto = z.infer<typeof visitMedicationSchema>;
export type DiagnosisDto = z.infer<typeof diagnosisSchema>;
export type ScreeningDto = z.infer<typeof screeningSchema>;
export type VisitImmunizationDto = z.infer<typeof visitImmunizationSchema>;
export type VisitListQuery = z.infer<typeof visitListQuerySchema>;

// ── Response shapes (from visits.service.ts) ───────────────────────────────────

/** Row shape returned by the paginated list endpoint (joins patient name + MRN). */
export type VisitListItem = {
  id: string;
  patient_id: string;
  datetime: string;
  type: VisitType;
  status: VisitStatus;
  reason: string | null;
  fee: number | null;
  patient_name: string;
  patient_mrn: string;
};

export type ExamFinding = {
  id: string;
  visit_id: string;
  category: ExamCategory;
  description: string | null;
  status: ExamStatus | null;
  created_at: string;
};

export type VisitMedication = {
  id: string;
  visit_id: string;
  drug: string;
  dose: string | null;
  dose_unit: string | null;
  route: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
  created_at: string;
};

export type VisitDiagnosis = {
  id: string;
  visit_id: string;
  icd10_code: string;
  description: string | null;
  is_primary: boolean;
  created_at: string;
};

export type VisitScreening = {
  id: string;
  visit_id: string;
  vision_result: string | null;
  hearing_result: string | null;
  dental_result: string | null;
  nutrition_notes: string | null;
  dev_tool: z.infer<typeof devToolEnum> | null;
  dev_score: number | null;
  dev_milestone_status: z.infer<typeof devMilestoneStatusEnum> | null;
  dev_action: string | null;
  created_at: string;
};

export type VisitAttachment = {
  id: string;
  patient_id: string;
  visit_id: string | null;
  type: string | null;
  title: string;
  date: string | null;
  file_path: string;
  created_at: string;
};

export type VisitImmunization = {
  id: string;
  patient_id: string;
  visit_id: string | null;
  vaccine: string;
  dose_number: number | null;
  date_given: string;
  created_at: string;
};

/** Full visit as returned by GET /api/visits/:id — core columns + child collections. */
export type VisitFull = {
  id: string;
  patient_id: string;
  datetime: string;
  duration_min: number | null;
  type: VisitType;
  status: VisitStatus;
  reason: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  height_type: z.infer<typeof heightTypeEnum> | null;
  hc_cm: number | null;
  temp_c: number | null;
  temp_route: z.infer<typeof tempRouteEnum> | null;
  hr_bpm: number | null;
  rr_per_min: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  bp_cuff_size: string | null;
  bp_position: string | null;
  spo2_pct: number | null;
  spo2_on_o2: boolean;
  hpi_onset: string | null;
  hpi_duration: string | null;
  hpi_fever_pattern: string | null;
  hpi_feeding: string | null;
  hpi_urine_output: string | null;
  hpi_symptoms: string | null;
  plan_treatment: string | null;
  plan_precautions: string | null;
  plan_follow_up_date: string | null;
  plan_referrals: string | null;
  fee: number | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  exam_findings: ExamFinding[];
  medications: VisitMedication[];
  diagnoses: VisitDiagnosis[];
  immunizations: VisitImmunization[];
  screening: VisitScreening | null;
  attachments: VisitAttachment[];
};

export type VisitListResponse = {
  data: VisitListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type VisitReceipt = {
  visit: {
    id: string;
    patient_id: string;
    datetime: string;
    type: string;
    status: string;
    fee: number | null;
    summary: string | null;
  };
  patient: { id: string; mrn: string; full_name: string; dob: string };
  diagnoses: Array<{
    icd10_code: string;
    description: string | null;
    is_primary: boolean;
  }>;
  medications: Array<{
    drug: string;
    dose: string | null;
    dose_unit: string | null;
    frequency: string | null;
    duration: string | null;
  }>;
};
