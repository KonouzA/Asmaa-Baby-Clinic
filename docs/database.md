# Database Schema

SQLite via `bun:sqlite`. Migration file: `src-tauri/sidecar/db/migrations/001_init.sql`.

**Conventions**
- All primary keys are UUIDs (`TEXT NOT NULL`), generated with `crypto.randomUUID()`.
- Dates are `TEXT` in ISO format (`YYYY-MM-DD`). Datetimes are `TEXT` (`YYYY-MM-DD HH:MM:SS`).
- Booleans are `INTEGER` (0 / 1).
- Computed fields (BMI, growth percentiles, z-scores, age at visit, BP percentile) are **not stored** — derived in the application layer.
- FK enforcement requires `PRAGMA foreign_keys = ON` at DB init (not enabled by default in `bun:sqlite`).

---

## `_sequences`

Monotonic counters for auto-generated human-readable IDs.

| Column | Type | Notes |
|---|---|---|
| `name` | TEXT PK | Counter name (e.g. `patient_mrn`) |
| `value` | INTEGER | Current value; increment then read before each insert |

Seeded with `('patient_mrn', 0)`. MRN format: `P-0001`, `P-0002` …

---

## Patient entity

### `patient`

Basic info (§3.1) + perinatal history (§3.2) embedded as columns (one-to-one).

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `mrn` | TEXT UNIQUE | Auto-generated (see `_sequences`) |
| `full_name` | TEXT NOT NULL | — |
| `dob` | TEXT NOT NULL | `YYYY-MM-DD` — source of all computed age |
| `time_of_birth` | TEXT | `HH:MM` — required for neonatal bilirubin chart |
| `sex` | TEXT NOT NULL | `male` / `female` |
| `gestational_age_weeks` | REAL | Drives corrected-age logic (<2 y) and bilirubin curve |
| `blood_type` | TEXT | `A+` `A-` `B+` `B-` `AB+` `AB-` `O+` `O-` |
| `birth_weight_kg` | REAL | — |
| `birth_length_cm` | REAL | — |
| `birth_hc_cm` | REAL | Head circumference at birth |
| `delivery_type` | TEXT | `nsvd` / `cs` / `assisted` |
| `nicu_admission` | INTEGER | Boolean |
| `nicu_days` | INTEGER | — |
| `neonatal_complications` | TEXT | Free text (jaundice, RDS, sepsis, etc.) |
| `newborn_screening_done` | INTEGER | Boolean |
| `newborn_screening_result` | TEXT | Metabolic, hearing, CCHD |
| `feeding_type` | TEXT | `breast` / `formula` / `mixed` |
| `weaning_status` | TEXT | — |
| `created_at` | TEXT | `datetime('now')` |
| `updated_at` | TEXT | `datetime('now')` |

---

### `patient_allergies`

One row per allergy. Surfaces as a banner; used to flag conflicting prescriptions.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `allergen` | TEXT NOT NULL | — |
| `type` | TEXT NOT NULL | `drug` / `food` / `environment` |
| `reaction` | TEXT | — |
| `severity` | TEXT | `mild` / `moderate` / `anaphylaxis` |
| `status` | TEXT | `active` (default) / `inactive` |
| `created_at` | TEXT | — |

---

### `patient_problems`

Problem list — carried across all visits.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `condition` | TEXT NOT NULL | — |
| `icd10_code` | TEXT | — |
| `onset_date` | TEXT | `YYYY-MM-DD` |
| `status` | TEXT | `active` (default) / `chronic` / `resolved` |
| `created_at` | TEXT | — |

---

### `patient_medications`

Long-term medication list — distinct from medications prescribed at a visit.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `drug` | TEXT NOT NULL | — |
| `dose` | TEXT | — |
| `route` | TEXT | — |
| `frequency` | TEXT | — |
| `start_date` | TEXT | — |
| `end_date` | TEXT | Null = still active |
| `created_at` | TEXT | — |

---

### `patient_immunizations`

Vaccination registry. `visit_id` is nullable — baseline vaccines entered without a visit.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `visit_id` | TEXT → `visit.id` | SET NULL on delete; null for historical entries |
| `vaccine` | TEXT NOT NULL | — |
| `dose_number` | INTEGER | 1st / 2nd / 3rd / booster |
| `date_given` | TEXT NOT NULL | `YYYY-MM-DD` |
| `created_at` | TEXT | — |

---

## Visit entity

### `visit`

Core visit info (§3.6) + vitals (§3.7) + HPI + plan + payment — all as columns.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `datetime` | TEXT NOT NULL | Visit date/time |
| `duration_min` | INTEGER | — |
| `type` | TEXT NOT NULL | `well-child` / `sick` / `follow-up` / `vaccination` / `emergency` |
| `status` | TEXT NOT NULL | `booked` / `checked-in` / `in-progress` / `done` / `no-show` / `cancelled` |
| `reason` | TEXT | — |
| **Vitals** | | |
| `weight_kg` | REAL | — |
| `height_cm` | REAL | — |
| `height_type` | TEXT | `length` (recumbent, <2 y) / `height` (standing, ≥2 y) |
| `hc_cm` | REAL | Head circumference |
| `temp_c` | REAL | Temperature in °C |
| `temp_route` | TEXT | `axillary` / `oral` / `rectal` / `tympanic` |
| `hr_bpm` | INTEGER | Heart rate |
| `rr_per_min` | INTEGER | Respiratory rate |
| `bp_systolic` | INTEGER | mmHg |
| `bp_diastolic` | INTEGER | mmHg |
| `bp_cuff_size` | TEXT | — |
| `bp_position` | TEXT | — |
| `spo2_pct` | REAL | % |
| `spo2_on_o2` | INTEGER | Boolean — room air (0) vs on O₂ (1) |
| **HPI** | | |
| `hpi_onset` | TEXT | — |
| `hpi_duration` | TEXT | — |
| `hpi_fever_pattern` | TEXT | — |
| `hpi_feeding` | TEXT | — |
| `hpi_urine_output` | TEXT | — |
| `hpi_symptoms` | TEXT | Associated symptoms |
| **Plan** | | |
| `plan_treatment` | TEXT | — |
| `plan_precautions` | TEXT | Return precautions |
| `plan_follow_up_date` | TEXT | `YYYY-MM-DD` |
| `plan_referrals` | TEXT | — |
| **Payment** | | |
| `fee` | REAL | Consultation fee — feeds monthly report |
| `summary` | TEXT | Visit summary |
| `created_at` | TEXT | — |
| `updated_at` | TEXT | — |

---

### `visit_exam_findings`

One row per body system per visit (up to 12 rows per visit).

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `visit_id` | TEXT NOT NULL → `visit.id` | CASCADE delete |
| `category` | TEXT NOT NULL | `general_appearance` · `heent` · `neck` · `chest_lungs` · `cardiovascular` · `abdomen` · `genitourinary` · `rectal` · `musculoskeletal` · `lymph_nodes` · `extremities_skin` · `neurological` |
| `description` | TEXT | Free-text findings |
| `status` | TEXT | `normal` / `abnormal` |
| `created_at` | TEXT | — |

---

### `visit_medications`

Medications prescribed at this visit (weight-based). Separate from `patient_medications`.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `visit_id` | TEXT NOT NULL → `visit.id` | CASCADE delete |
| `drug` | TEXT NOT NULL | — |
| `dose` | TEXT | e.g. `10 mg/kg` or calculated value |
| `dose_unit` | TEXT | — |
| `route` | TEXT | — |
| `frequency` | TEXT | — |
| `duration` | TEXT | — |
| `notes` | TEXT | — |
| `created_at` | TEXT | — |

---

### `visit_diagnoses`

ICD-10 coded diagnoses per visit. Diagnosis creation also writes to `patient_problems`.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `visit_id` | TEXT NOT NULL → `visit.id` | CASCADE delete |
| `icd10_code` | TEXT NOT NULL | — |
| `description` | TEXT | — |
| `is_primary` | INTEGER | Boolean — 1 = primary diagnosis |
| `created_at` | TEXT | — |

---

### `visit_screenings`

Well-child screenings + developmental milestone record. One row per visit.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `visit_id` | TEXT NOT NULL → `visit.id` | CASCADE delete |
| `vision_result` | TEXT | — |
| `hearing_result` | TEXT | — |
| `dental_result` | TEXT | — |
| `nutrition_notes` | TEXT | — |
| `dev_tool` | TEXT | `mchat` / `asq` / `denver` / `flacc` / `faces` |
| `dev_score` | REAL | — |
| `dev_milestone_status` | TEXT | `on_track` / `delayed` |
| `dev_action` | TEXT | — |
| `created_at` | TEXT | — |

---

### `visit_attachments`

Per-patient file repository (lab PDFs, imaging, referral letters, generated docs). `visit_id` is nullable for documents not tied to a specific visit.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `patient_id` | TEXT NOT NULL → `patient.id` | CASCADE delete |
| `visit_id` | TEXT → `visit.id` | SET NULL on delete |
| `type` | TEXT | `lab` / `imaging` / `referral` / `generated` |
| `title` | TEXT NOT NULL | — |
| `date` | TEXT | `YYYY-MM-DD` |
| `file_path` | TEXT NOT NULL | Absolute path on disk |
| `created_at` | TEXT | — |

---

## Report entity

### `report`

Monthly financial record. One row per month — `UNIQUE(month, year)`.

`total_payment`, `total_cost`, `visit_count`, `patient_count` are **not stored** — computed at query time from `visit.fee` and the 10 cost columns.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `month` | INTEGER NOT NULL | 1–12 |
| `year` | INTEGER NOT NULL | e.g. 2025 |
| `cost_electricity_clinic` | REAL | — |
| `cost_electricity_stairs` | REAL | — |
| `cost_water` | REAL | — |
| `cost_phone_personal` | REAL | — |
| `cost_landline` | REAL | — |
| `cost_internet` | REAL | — |
| `cost_cleaning` | REAL | — |
| `cost_secretary` | REAL | — |
| `cost_medical_waste` | REAL | — |
| `cost_others` | REAL | — |
| `notes` | TEXT | — |
| `created_at` | TEXT | — |
| `updated_at` | TEXT | — |

**Computed at query time:**

```sql
-- Total payment and visit/patient counts for a given month
SELECT
  SUM(fee)                             AS total_payment,
  COUNT(*)                             AS visit_count,
  COUNT(DISTINCT patient_id)           AS patient_count
FROM visit
WHERE status = 'done'
  AND strftime('%m', datetime) = printf('%02d', :month)
  AND strftime('%Y', datetime) = CAST(:year AS TEXT);
```
