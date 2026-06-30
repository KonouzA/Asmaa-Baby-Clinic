# API Endpoints & Zod Schemas Plan

Maps every UI surface in [`pages.md`](./pages.md) to the backend it needs, against the
schema in [`database.md`](./database.md). Organized by **feature folder** — each `##`
section is one `features/<name>/` mirrored on both sides (per `CLAUDE.md`):

- **Sidecar:** `src-tauri/sidecar/features/<name>/<name>.{schema,service,routes}.ts`
  registered in `index.ts` with `app.route('/api/<name>', <name>Routes)`.
- **Frontend:** `src/features/<name>/{schemas,api,hooks,components,index.ts}`.

Conventions carried from the `users` reference:

- Request flow: **Component → TanStack Query hook → `src/lib/api.ts` → Hono route → service → `bun:sqlite`**.
- `src/lib/api.ts` exposes `get/post/put/delete`. List routes return arrays; create returns `201`.
- Zod **v4** (`z.email()`, `z.iso.date()`, not deprecated `.string().email()`).
- IDs are **UUID strings** (`z.uuid()`), not numbers — so query-key helpers take `string`.
- `bun:sqlite` is **synchronous** → service functions are not `async`.
- Computed fields (BMI, percentiles, z-scores, age, BP percentile, report totals) are **derived in the service/app layer**, never stored.
- A `PUT` that touches `visit_diagnoses` must also upsert into `patient_problems` (per DB note).

Convention proposed for this plan (not yet in the `users` example):
- **Standard list envelope** for paginated lists: `{ data: T[], total: number, page: number, pageSize: number }`.
- Error responses: `{ error: string }` (already consumed by `api.ts`).

---

## Feature: `auth`

Login / session. (No DB table yet — see *Open questions*. Assume a single `clinic_user` or env-configured credential to start.)

| Method | Path | Purpose | Page / Component |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate, return session token + user | Login Page |
| `POST` | `/api/auth/logout` | Invalidate session | Home → User/Session Area |
| `GET`  | `/api/auth/me` | Current user (route guard, header display) | Home Page |

```ts
// auth.schema.ts
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export const sessionUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayName: z.string(),
});
export const loginResponseSchema = z.object({
  token: z.string(),
  user: sessionUserSchema,
});
export type LoginDto = z.infer<typeof loginSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
```

Hooks: `useLogin()`, `useLogout()`, `useCurrentUser()`.

---

## Feature: `patients`

Backs Patients Page, Patient Details Page, New Patient Modal, and the Visits page Patient Selector.

### Core endpoints

| Method | Path | Purpose | Page / Component |
|---|---|---|---|
| `GET`  | `/api/patients` | Paginated + filtered list | Patients Page list |
| `GET`  | `/api/patients/:id` | Full patient (basic + birth info) | Patient Details |
| `GET`  | `/api/patients/:id/full` | Patient + all child collections in one call | Patient Details (all sections) |
| `POST` | `/api/patients` | Create (assigns MRN from `_sequences`) | New Patient Modal |
| `PUT`  | `/api/patients/:id` | Update basic + birth info | Patient Details → Edit |
| `DELETE` | `/api/patients/:id` | Archive / delete (CASCADE children) | Patient Details → Archive |

**Query params for `GET /api/patients`** (Search Bar + Filters):
`q` (name/MRN/phone), `sex`, `ageMin`, `ageMax`, `lastVisitFrom`, `lastVisitTo`, `page`, `pageSize`, `sort`.

> **Note:** `database.md` has no `phone` column on `patient`. Either add it to the table
> or drop phone from the search spec (see *Open questions*).

### Child-collection endpoints (Persistent Clinical List + Vaccination sections)

Allergies, problems, long-term meds, and immunizations each carry across visits, so they get sub-resources:

| Method | Path | Table |
|---|---|---|
| `GET` / `POST` | `/api/patients/:id/allergies` | `patient_allergies` |
| `PUT` / `DELETE` | `/api/patients/:id/allergies/:allergyId` | `patient_allergies` |
| `GET` / `POST` | `/api/patients/:id/problems` | `patient_problems` |
| `PUT` / `DELETE` | `/api/patients/:id/problems/:problemId` | `patient_problems` |
| `GET` / `POST` | `/api/patients/:id/medications` | `patient_medications` |
| `PUT` / `DELETE` | `/api/patients/:id/medications/:medId` | `patient_medications` |
| `GET` / `POST` | `/api/patients/:id/immunizations` | `patient_immunizations` (`visit_id` null for baseline) |
| `DELETE` | `/api/patients/:id/immunizations/:immId` | `patient_immunizations` |
| `GET` | `/api/patients/:id/growth` | Derived growth series (weight/height/HC + percentiles & z-scores) for the Growth section/charts |
| `GET` | `/api/patients/:id/visits` | Visit History on Patient Details |
| `GET` / `POST` | `/api/patients/:id/attachments` | `visit_attachments` (patient-scoped, `visit_id` null) |

```ts
// patients.schema.ts
export const sexEnum = z.enum(['male', 'female']);
export const deliveryTypeEnum = z.enum(['nsvd', 'cs', 'assisted']);
export const feedingTypeEnum = z.enum(['breast', 'formula', 'mixed']);
export const bloodTypeEnum = z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']);

// New Patient Modal — one object validated per step, merged on submit.
export const patientBasicSchema = z.object({       // Step 1
  full_name: z.string().min(1),
  dob: z.iso.date(),
  time_of_birth: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  sex: sexEnum,
  blood_type: bloodTypeEnum.optional(),
});
export const patientBirthInfoSchema = z.object({   // Step 2
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
export const problemSchema = z.object({
  condition: z.string().min(1),
  icd10_code: z.string().optional(),
  onset_date: z.iso.date().optional(),
  status: z.enum(['active', 'chronic', 'resolved']).default('active'),
});
export const patientMedicationSchema = z.object({
  drug: z.string().min(1),
  dose: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
});
export const immunizationSchema = z.object({
  visit_id: z.uuid().optional(),       // null/omit for baseline historical entry
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
});
```

Hooks: `usePatients(query)`, `usePatient(id)`, `usePatientFull(id)`, `useCreatePatient()`,
`useUpdatePatient()`, `useDeletePatient()`, plus per-child `use*` mutation hooks and `usePatientGrowth(id)`, `usePatientVisits(id)`.

---

## Feature: `visits`

Backs the Visits Page tabbed interface, Visit History list, and Visit Detail View.
**The tabs are not separate resources — they are sections of one visit record.** A visit
is created and saved through a single endpoint that accepts the whole nested payload
(core + vitals + HPI + plan + payment + the child collections). The tabs just decide
which slice of that one object a given screen edits.

### Endpoints

| Method | Path | Purpose | Component |
|---|---|---|---|
| `GET`  | `/api/visits` | Global Visit History (filter by date/status/patient/type) | Visits Page list |
| `GET`  | `/api/visits/:id` | Full visit + all children, one object | Visit Detail View |
| `POST` | `/api/visits` | Create the visit — full nested payload | New Visit / first save |
| `PUT`  | `/api/visits/:id` | Save the visit — full nested payload (Save/Draft, any tabs filled) | All tabs |
| `DELETE` | `/api/visits/:id` | Delete visit (CASCADE children) | Visit Detail |
| `GET`  | `/api/visits/:id/receipt` | Printable receipt/invoice payload | Summary & Payment / Print-Export |

**Query params for `GET /api/visits`:** `patientId`, `status`, `type`, `from`, `to`, `page`, `pageSize`.

`POST`/`PUT` take **one body** (`visitSchema` below). The service writes the `visit` row
and then replaces its child rows (`visit_exam_findings`, `visit_medications`,
`visit_screenings`, `visit_diagnoses`, visit-scoped `visit_attachments` /
`patient_immunizations`) in a single transaction — diagnoses also upsert into
`patient_problems` per the DB note. No per-tab routes.

> **Attachments caveat:** file *bytes* can't ride inside this JSON body. The actual
> upload stays a separate step (see `/api/files` in *Cross-cutting*); the visit payload
> only references already-stored attachments by `file_path`/`id`. Same for large
> binaries — metadata in, bytes out-of-band.

```ts
// visits.schema.ts
export const visitTypeEnum = z.enum(['well-child','sick','follow-up','vaccination','emergency']);
export const visitStatusEnum = z.enum(['booked','checked-in','in-progress','done','no-show','cancelled']);

// --- section schemas: each maps to one tab, all merged into the single visit body ---
export const visitVitalsSchema = z.object({
  weight_kg: z.number().positive().optional(),
  height_cm: z.number().positive().optional(),
  height_type: z.enum(['length', 'height']).optional(),
  hc_cm: z.number().positive().optional(),
  temp_c: z.number().optional(),
  temp_route: z.enum(['axillary','oral','rectal','tympanic']).optional(),
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
  plan_follow_up_date: z.iso.date().optional(),
  plan_referrals: z.string().optional(),
});
export const visitPaymentSchema = z.object({
  fee: z.number().nonnegative().optional(),
  summary: z.string().optional(),
});

// --- child-collection item schemas (arrays nested in the visit body) ---
export const examFindingSchema = z.object({
  category: z.enum(['general_appearance','heent','neck','chest_lungs','cardiovascular',
    'abdomen','genitourinary','rectal','musculoskeletal','lymph_nodes',
    'extremities_skin','neurological']),
  description: z.string().optional(),
  status: z.enum(['normal', 'abnormal']).optional(),
});
export const examFindingsBulkSchema = z.array(examFindingSchema).max(12);

export const visitMedicationSchema = z.object({
  drug: z.string().min(1),
  dose: z.string().optional(),
  dose_unit: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});
export const screeningSchema = z.object({
  vision_result: z.string().optional(),
  hearing_result: z.string().optional(),
  dental_result: z.string().optional(),
  nutrition_notes: z.string().optional(),
  dev_tool: z.enum(['mchat','asq','denver','flacc','faces']).optional(),
  dev_score: z.number().optional(),
  dev_milestone_status: z.enum(['on_track', 'delayed']).optional(),
  dev_action: z.string().optional(),
});
export const diagnosisSchema = z.object({
  icd10_code: z.string().min(1),
  description: z.string().optional(),
  is_primary: z.boolean().default(false),
});
export const visitImmunizationSchema = z.object({   // Vaccination tab; service stamps visit_id
  vaccine: z.string().min(1),
  dose_number: z.number().int().positive().optional(),
  date_given: z.iso.date(),
});

// --- THE single visit body: core + every section + every child collection ---
export const visitSchema = z.object({
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
    exam_findings: z.array(examFindingSchema).max(12).default([]),  // Physical Examination
    medications:   z.array(visitMedicationSchema).default([]),       // Medications
    diagnoses:     z.array(diagnosisSchema).default([]),             // NPI
    immunizations: z.array(visitImmunizationSchema).default([]),     // Vaccination
    screening:     screeningSchema.optional(),                       // Screening / Notes (one row)
    attachment_ids: z.array(z.uuid()).default([]),                   // refs to already-uploaded files
  });

// POST = create, PUT = save. Save/Draft just means many fields are still empty,
// so the PUT body is the same shape with everything optional.
export const createVisitSchema = visitSchema;
export const updateVisitSchema = visitSchema.partial();

export const visitListQuerySchema = z.object({
  patientId: z.uuid().optional(),
  status: visitStatusEnum.optional(),
  type: visitTypeEnum.optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
```

Hooks: `useVisits(query)`, `useVisit(id)`, `useCreateVisit()`, `useUpdateVisit(id)`
(debounced for auto-save — sends the whole visit object), `useVisitReceipt(id)`. The tabs
all read from / write to that one `useVisit` object; there are no per-tab hooks.

---

## Feature: `reports`

Backs the Reports Page. Read endpoints compute totals at query time from `visit.fee` + the 10 cost columns; write endpoints maintain the per-month cost row.

| Method | Path | Purpose | Component |
|---|---|---|---|
| `GET`  | `/api/reports?year=` | All months for a year, with computed totals | Monthly Costs / Income vs Expense chart |
| `GET`  | `/api/reports/:year/:month` | Single month row + computed totals | Monthly Costs detail |
| `PUT`  | `/api/reports/:year/:month` | Upsert cost columns (`UNIQUE(month, year)`) | Expense Tracker |
| `GET`  | `/api/reports/visit-stats?from=&to=&groupBy=` | Visit counts by period/type/status | Visit Statistics |
| `GET`  | `/api/reports/patient-stats` | Totals, new-this-month, by age group / sex | Patient Statistics |
| `GET`  | `/api/reports/dashboard` | Home Page dashboard graph aggregates | Home → Dashboard Graphs |

```ts
// reports.schema.ts
export const reportCostsSchema = z.object({
  cost_electricity_clinic: z.number().nonnegative().optional(),
  cost_electricity_stairs: z.number().nonnegative().optional(),
  cost_water: z.number().nonnegative().optional(),
  cost_phone_personal: z.number().nonnegative().optional(),
  cost_landline: z.number().nonnegative().optional(),
  cost_internet: z.number().nonnegative().optional(),
  cost_cleaning: z.number().nonnegative().optional(),
  cost_secretary: z.number().nonnegative().optional(),
  cost_medical_waste: z.number().nonnegative().optional(),
  cost_others: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
// Response includes computed fields (not stored):
export const monthlyReportSchema = reportCostsSchema.extend({
  id: z.uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  total_cost: z.number(),       // sum of the 10 cost columns
  total_payment: z.number(),    // SUM(visit.fee) WHERE status='done'
  net: z.number(),              // total_payment - total_cost
  visit_count: z.number().int(),
  patient_count: z.number().int(),
});
```

Hooks: `useReports(year)`, `useMonthlyReport(year, month)`, `useUpsertReport()`,
`useVisitStats(query)`, `usePatientStats()`, `useDashboard()`.

---

## Settings Page — no backend

The Settings Page only holds the **Font Size** selector, which is a client-side UI
preference. Persist it locally (e.g. `localStorage` / a Tauri store) — **no endpoint,
no table, no feature folder.**

---

## Feature: `tasks`

Backs the Home Page Tasks List (focus / to-do). No table in `database.md` — needs a migration (`task`: id, title, done, due_date, sort_order, created_at).

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create task |
| `PUT`  | `/api/tasks/:id` | Update (toggle done, edit, reorder) |
| `DELETE` | `/api/tasks/:id` | Delete task |

```ts
// tasks.schema.ts
export const createTaskSchema = z.object({
  title: z.string().min(1),
  due_date: z.iso.date().optional(),
});
export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});
```

Hooks: `useTasks()`, `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`.

---

## Cross-cutting / utility

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Sidecar readiness probe (used by `useSidecar()` in `App.tsx`) |
| `GET` | `/api/icd10?q=` | ICD-10 autocomplete for NPI tab & problem list (reference lookup) |
| `GET` | `/api/files/:id` | Stream/serve an attachment file by id (Attachments) |

---

## Migrations implied by this plan

New tables / columns not in `database.md` — each needs a `NNN_*.sql` appended to the
`migrations.ts` registry (per `CLAUDE.md`, `readdir` does not work in `--compile` output):

1. `task` — Home Tasks List.
2. `clinic_user` (or auth strategy) — Login.
3. Add `phone` to `patient` *if* phone search is kept.
4. (Optional) ICD-10 reference table if `/api/icd10` is served locally.

## Open questions

- **Auth model:** single shared login, or per-doctor users? Token storage (Tauri secure store vs in-memory)? This decides the `auth` table + middleware.
- **Patient phone:** add column or drop from search spec.
- **Attachments upload:** multipart `POST` to the sidecar, or does the Tauri shell write the file and send only the path? Affects whether `/attachments` takes a file body or a `file_path`.
