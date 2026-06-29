-- Sequences (MRN auto-generation: P-0001, P-0002 …)

CREATE TABLE IF NOT EXISTS _sequences (
  name  TEXT PRIMARY KEY NOT NULL,
  value INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO _sequences(name, value) VALUES('patient_mrn', 0);

-- ============================================================
-- Patient
-- ============================================================

CREATE TABLE IF NOT EXISTS patient (
  id                       TEXT PRIMARY KEY NOT NULL,
  mrn                      TEXT NOT NULL UNIQUE,
  full_name                TEXT NOT NULL,
  dob                      TEXT NOT NULL,
  time_of_birth            TEXT,
  sex                      TEXT NOT NULL CHECK(sex IN ('male', 'female')),
  gestational_age_weeks    REAL,
  blood_type               TEXT CHECK(blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  -- Perinatal history (one-to-one, embedded)
  birth_weight_kg          REAL,
  birth_length_cm          REAL,
  birth_hc_cm              REAL,
  delivery_type            TEXT CHECK(delivery_type IN ('nsvd', 'cs', 'assisted')),
  nicu_admission           INTEGER NOT NULL DEFAULT 0,
  nicu_days                INTEGER,
  neonatal_complications   TEXT,
  newborn_screening_done   INTEGER NOT NULL DEFAULT 0,
  newborn_screening_result TEXT,
  feeding_type             TEXT CHECK(feeding_type IN ('breast', 'formula', 'mixed')),
  weaning_status           TEXT,
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_allergies (
  id          TEXT PRIMARY KEY NOT NULL,
  patient_id  TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  allergen    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('drug', 'food', 'environment')),
  reaction    TEXT,
  severity    TEXT CHECK(severity IN ('mild', 'moderate', 'anaphylaxis')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_problems (
  id          TEXT PRIMARY KEY NOT NULL,
  patient_id  TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  condition   TEXT NOT NULL,
  icd10_code  TEXT,
  onset_date  TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'chronic', 'resolved')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_medications (
  id          TEXT PRIMARY KEY NOT NULL,
  patient_id  TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  drug        TEXT NOT NULL,
  dose        TEXT,
  route       TEXT,
  frequency   TEXT,
  start_date  TEXT,
  end_date    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Visit (before patient_immunizations: immunizations reference visit.id)
-- ============================================================

CREATE TABLE IF NOT EXISTS visit (
  id                  TEXT PRIMARY KEY NOT NULL,
  patient_id          TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  datetime            TEXT NOT NULL,
  duration_min        INTEGER,
  type                TEXT NOT NULL CHECK(type IN ('well-child', 'sick', 'follow-up', 'vaccination', 'emergency')),
  status              TEXT NOT NULL DEFAULT 'booked' CHECK(status IN ('booked', 'checked-in', 'in-progress', 'done', 'no-show', 'cancelled')),
  reason              TEXT,
  -- Vitals
  weight_kg           REAL,
  height_cm           REAL,
  height_type         TEXT CHECK(height_type IN ('length', 'height')),
  hc_cm               REAL,
  temp_c              REAL,
  temp_route          TEXT CHECK(temp_route IN ('axillary', 'oral', 'rectal', 'tympanic')),
  hr_bpm              INTEGER,
  rr_per_min          INTEGER,
  bp_systolic         INTEGER,
  bp_diastolic        INTEGER,
  bp_cuff_size        TEXT,
  bp_position         TEXT,
  spo2_pct            REAL,
  spo2_on_o2          INTEGER NOT NULL DEFAULT 0,
  -- HPI
  hpi_onset           TEXT,
  hpi_duration        TEXT,
  hpi_fever_pattern   TEXT,
  hpi_feeding         TEXT,
  hpi_urine_output    TEXT,
  hpi_symptoms        TEXT,
  -- Plan
  plan_treatment      TEXT,
  plan_precautions    TEXT,
  plan_follow_up_date TEXT,
  plan_referrals      TEXT,
  -- Payment + summary
  fee                 REAL,
  summary             TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Patient (continued)
-- ============================================================

CREATE TABLE IF NOT EXISTS patient_immunizations (
  id          TEXT PRIMARY KEY NOT NULL,
  patient_id  TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  visit_id    TEXT REFERENCES visit(id) ON DELETE SET NULL,
  vaccine     TEXT NOT NULL,
  dose_number INTEGER,
  date_given  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Visit (continued)
-- ============================================================

CREATE TABLE IF NOT EXISTS visit_exam_findings (
  id          TEXT PRIMARY KEY NOT NULL,
  visit_id    TEXT NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK(category IN (
    'general_appearance', 'heent', 'neck', 'chest_lungs',
    'cardiovascular', 'abdomen', 'genitourinary', 'rectal',
    'musculoskeletal', 'lymph_nodes', 'extremities_skin', 'neurological'
  )),
  description TEXT,
  status      TEXT CHECK(status IN ('normal', 'abnormal')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visit_medications (
  id          TEXT PRIMARY KEY NOT NULL,
  visit_id    TEXT NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
  drug        TEXT NOT NULL,
  dose        TEXT,
  dose_unit   TEXT,
  route       TEXT,
  frequency   TEXT,
  duration    TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visit_diagnoses (
  id          TEXT PRIMARY KEY NOT NULL,
  visit_id    TEXT NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
  icd10_code  TEXT NOT NULL,
  description TEXT,
  is_primary  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visit_screenings (
  id                   TEXT PRIMARY KEY NOT NULL,
  visit_id             TEXT NOT NULL REFERENCES visit(id) ON DELETE CASCADE,
  vision_result        TEXT,
  hearing_result       TEXT,
  dental_result        TEXT,
  nutrition_notes      TEXT,
  dev_tool             TEXT CHECK(dev_tool IN ('mchat', 'asq', 'denver', 'flacc', 'faces')),
  dev_score            REAL,
  dev_milestone_status TEXT CHECK(dev_milestone_status IN ('on_track', 'delayed')),
  dev_action           TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visit_attachments (
  id          TEXT PRIMARY KEY NOT NULL,
  patient_id  TEXT NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  visit_id    TEXT REFERENCES visit(id) ON DELETE SET NULL,
  type        TEXT CHECK(type IN ('lab', 'imaging', 'referral', 'generated')),
  title       TEXT NOT NULL,
  date        TEXT,
  file_path   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Report
-- ============================================================

CREATE TABLE IF NOT EXISTS report (
  id                      TEXT PRIMARY KEY NOT NULL,
  month                   INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  year                    INTEGER NOT NULL,
  cost_electricity_clinic REAL NOT NULL DEFAULT 0,
  cost_electricity_stairs REAL NOT NULL DEFAULT 0,
  cost_water              REAL NOT NULL DEFAULT 0,
  cost_phone_personal     REAL NOT NULL DEFAULT 0,
  cost_landline           REAL NOT NULL DEFAULT 0,
  cost_internet           REAL NOT NULL DEFAULT 0,
  cost_cleaning           REAL NOT NULL DEFAULT 0,
  cost_secretary          REAL NOT NULL DEFAULT 0,
  cost_medical_waste      REAL NOT NULL DEFAULT 0,
  cost_others             REAL NOT NULL DEFAULT 0,
  notes                   TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(month, year)
);
