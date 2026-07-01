import db from '../../db';
import type {
  CreatePatientDto,
  UpdatePatientDto,
  AllergyDto,
  UpdateAllergyDto,
  ProblemDto,
  UpdateProblemDto,
  PatientMedicationDto,
  UpdatePatientMedicationDto,
  ImmunizationDto,
  PatientListQuery,
} from './patients.schema';

// ── Raw DB row types ──────────────────────────────────────────────────────────

type RawPatient = {
  id: string;
  mrn: string;
  full_name: string;
  dob: string;
  time_of_birth: string | null;
  sex: string;
  gestational_age_weeks: number | null;
  blood_type: string | null;
  birth_weight_kg: number | null;
  birth_length_cm: number | null;
  birth_hc_cm: number | null;
  delivery_type: string | null;
  nicu_admission: number;
  nicu_days: number | null;
  neonatal_complications: string | null;
  newborn_screening_done: number;
  newborn_screening_result: string | null;
  feeding_type: string | null;
  weaning_status: string | null;
  created_at: string;
  updated_at: string;
};

type Allergy = {
  id: string;
  patient_id: string;
  allergen: string;
  type: string;
  reaction: string | null;
  severity: string | null;
  status: string;
  created_at: string;
};

type Problem = {
  id: string;
  patient_id: string;
  condition: string;
  icd10_code: string | null;
  onset_date: string | null;
  status: string;
  created_at: string;
};

type PatientMedication = {
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

type Immunization = {
  id: string;
  patient_id: string;
  visit_id: string | null;
  vaccine: string;
  dose_number: number | null;
  date_given: string;
  created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// SQLite stores booleans as 0/1; convert to proper JS booleans before returning.
function fmtPatient(row: RawPatient) {
  return {
    ...row,
    nicu_admission: row.nicu_admission === 1,
    newborn_screening_done: row.newborn_screening_done === 1,
  };
}

const BOOL_PATIENT_FIELDS = new Set(['nicu_admission', 'newborn_screening_done']);

const SORT_MAP: Record<string, string> = {
  mrn_asc: 'p.mrn ASC',
  mrn_desc: 'p.mrn DESC',
  full_name_asc: 'p.full_name ASC',
  full_name_desc: 'p.full_name DESC',
  dob_asc: 'p.dob ASC',
  dob_desc: 'p.dob DESC',
  created_at_asc: 'p.created_at ASC',
  created_at_desc: 'p.created_at DESC',
};

// ── Patient core ──────────────────────────────────────────────────────────────

export function listPatients(query: PatientListQuery) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.q) {
    conditions.push('(p.full_name LIKE ? OR p.mrn LIKE ?)');
    params.push(`%${query.q}%`, `%${query.q}%`);
  }
  if (query.sex) {
    conditions.push('p.sex = ?');
    params.push(query.sex);
  }
  if (query.ageMin !== undefined) {
    conditions.push("CAST((julianday('now') - julianday(p.dob)) / 365.25 AS INTEGER) >= ?");
    params.push(query.ageMin);
  }
  if (query.ageMax !== undefined) {
    conditions.push("CAST((julianday('now') - julianday(p.dob)) / 365.25 AS INTEGER) <= ?");
    params.push(query.ageMax);
  }

  let joinClause = '';
  if (query.lastVisitFrom || query.lastVisitTo) {
    joinClause =
      'LEFT JOIN (SELECT patient_id, MAX(datetime) AS last_visit_at FROM visit GROUP BY patient_id) lv ON lv.patient_id = p.id';
    if (query.lastVisitFrom) {
      conditions.push('lv.last_visit_at >= ?');
      params.push(query.lastVisitFrom);
    }
    if (query.lastVisitTo) {
      conditions.push('lv.last_visit_at <= ?');
      params.push(`${query.lastVisitTo} 23:59:59`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_MAP[query.sort] ?? 'p.created_at DESC';
  const offset = (query.page - 1) * query.pageSize;

  // Dynamic param count — cast statement to `any` to spread a runtime array.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countStmt = db.query(`SELECT COUNT(*) AS total FROM patient p ${joinClause} ${where}`) as any;
  const { total } = countStmt.get(...params) as { total: number };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataStmt = db.query(
    `SELECT p.* FROM patient p ${joinClause} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
  ) as any;
  const data = (dataStmt.all(...params, query.pageSize, offset) as RawPatient[]).map(fmtPatient);

  return { data, total, page: query.page, pageSize: query.pageSize };
}

export function getPatient(id: string) {
  const row = db.query<RawPatient, [string]>('SELECT * FROM patient WHERE id = ?').get(id);
  return row ? fmtPatient(row) : null;
}

export function getPatientFull(id: string) {
  const patient = getPatient(id);
  if (!patient) return null;

  const allergies = db
    .query<Allergy, [string]>(
      'SELECT * FROM patient_allergies WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(id);

  const problems = db
    .query<Problem, [string]>(
      'SELECT * FROM patient_problems WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(id);

  const medications = db
    .query<PatientMedication, [string]>(
      'SELECT * FROM patient_medications WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(id);

  const immunizations = db
    .query<Immunization, [string]>(
      'SELECT * FROM patient_immunizations WHERE patient_id = ? ORDER BY date_given DESC',
    )
    .all(id);

  return { ...patient, allergies, problems, medications, immunizations };
}

export function createPatient(data: CreatePatientDto) {
  return db.transaction(() => {
    db.query<void, [string]>(
      "UPDATE _sequences SET value = value + 1 WHERE name = ?",
    ).run('patient_mrn');

    const { value } = db
      .query<{ value: number }, [string]>('SELECT value FROM _sequences WHERE name = ?')
      .get('patient_mrn')!;

    const mrn = `P-${value.toString().padStart(4, '0')}`;
    const id = crypto.randomUUID();

    type InsertParams = {
      $id: string; $mrn: string; $full_name: string; $dob: string;
      $time_of_birth: string | null; $sex: string; $gestational_age_weeks: number | null;
      $blood_type: string | null; $birth_weight_kg: number | null;
      $birth_length_cm: number | null; $birth_hc_cm: number | null;
      $delivery_type: string | null; $nicu_admission: number; $nicu_days: number | null;
      $neonatal_complications: string | null; $newborn_screening_done: number;
      $newborn_screening_result: string | null; $feeding_type: string | null;
      $weaning_status: string | null;
    };

    const row = db
      .query<RawPatient, InsertParams>(`
        INSERT INTO patient (
          id, mrn, full_name, dob, time_of_birth, sex, gestational_age_weeks, blood_type,
          birth_weight_kg, birth_length_cm, birth_hc_cm, delivery_type,
          nicu_admission, nicu_days, neonatal_complications,
          newborn_screening_done, newborn_screening_result, feeding_type, weaning_status
        ) VALUES (
          $id, $mrn, $full_name, $dob, $time_of_birth, $sex, $gestational_age_weeks, $blood_type,
          $birth_weight_kg, $birth_length_cm, $birth_hc_cm, $delivery_type,
          $nicu_admission, $nicu_days, $neonatal_complications,
          $newborn_screening_done, $newborn_screening_result, $feeding_type, $weaning_status
        ) RETURNING *
      `)
      .get({
        $id: id,
        $mrn: mrn,
        $full_name: data.full_name,
        $dob: data.dob,
        $time_of_birth: data.time_of_birth ?? null,
        $sex: data.sex,
        $gestational_age_weeks: data.gestational_age_weeks ?? null,
        $blood_type: data.blood_type ?? null,
        $birth_weight_kg: data.birth_weight_kg ?? null,
        $birth_length_cm: data.birth_length_cm ?? null,
        $birth_hc_cm: data.birth_hc_cm ?? null,
        $delivery_type: data.delivery_type ?? null,
        $nicu_admission: data.nicu_admission ? 1 : 0,
        $nicu_days: data.nicu_days ?? null,
        $neonatal_complications: data.neonatal_complications ?? null,
        $newborn_screening_done: data.newborn_screening_done ? 1 : 0,
        $newborn_screening_result: data.newborn_screening_result ?? null,
        $feeding_type: data.feeding_type ?? null,
        $weaning_status: data.weaning_status ?? null,
      })!;

    return fmtPatient(row);
  })();
}

export function updatePatient(id: string, data: UpdatePatientDto) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return getPatient(id);

  const params: Record<string, string | number | null> = { $id: id };
  const setClauses = entries.map(([k, v]) => {
    params[`$${k}`] = BOOL_PATIENT_FIELDS.has(k) ? (v ? 1 : 0) : (v as string | number | null);
    return `${k} = $${k}`;
  });

  // Dynamic named params — cast to avoid SQLQueryBindings constraint on the generic.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stmt = db.query(
    `UPDATE patient SET ${setClauses.join(', ')}, updated_at = datetime('now') WHERE id = $id RETURNING *`,
  ) as any;
  const row = stmt.get(params) as RawPatient | null;
  return row ? fmtPatient(row) : null;
}

export function deletePatient(id: string) {
  db.query<void, [string]>('DELETE FROM patient WHERE id = ?').run(id);
}

// ── Allergies ──────────────────────────────────────────────────────────────────

export function listAllergies(patientId: string): Allergy[] {
  return db
    .query<Allergy, [string]>(
      'SELECT * FROM patient_allergies WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(patientId);
}

export function createAllergy(patientId: string, data: AllergyDto): Allergy {
  type P = {
    $id: string; $patient_id: string; $allergen: string; $type: string;
    $reaction: string | null; $severity: string | null; $status: string;
  };
  return db
    .query<Allergy, P>(`
      INSERT INTO patient_allergies (id, patient_id, allergen, type, reaction, severity, status)
      VALUES ($id, $patient_id, $allergen, $type, $reaction, $severity, $status)
      RETURNING *
    `)
    .get({
      $id: crypto.randomUUID(),
      $patient_id: patientId,
      $allergen: data.allergen,
      $type: data.type,
      $reaction: data.reaction ?? null,
      $severity: data.severity ?? null,
      $status: data.status,
    })!;
}

export function updateAllergy(
  allergyId: string,
  patientId: string,
  data: UpdateAllergyDto,
): Allergy | null {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return db
      .query<Allergy, [string, string]>(
        'SELECT * FROM patient_allergies WHERE id = ? AND patient_id = ?',
      )
      .get(allergyId, patientId);
  }
  const params: Record<string, string | null> = { $id: allergyId, $patient_id: patientId };
  const setClauses = entries.map(([k, v]) => {
    params[`$${k}`] = v as string | null;
    return `${k} = $${k}`;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((db.query(
    `UPDATE patient_allergies SET ${setClauses.join(', ')} WHERE id = $id AND patient_id = $patient_id RETURNING *`,
  ) as any).get(params) as Allergy | null) ?? null;
}

export function deleteAllergy(allergyId: string, patientId: string) {
  db.query<void, [string, string]>(
    'DELETE FROM patient_allergies WHERE id = ? AND patient_id = ?',
  ).run(allergyId, patientId);
}

// ── Problems ──────────────────────────────────────────────────────────────────

export function listProblems(patientId: string): Problem[] {
  return db
    .query<Problem, [string]>(
      'SELECT * FROM patient_problems WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(patientId);
}

export function createProblem(patientId: string, data: ProblemDto): Problem {
  type P = {
    $id: string; $patient_id: string; $condition: string;
    $icd10_code: string | null; $onset_date: string | null; $status: string;
  };
  return db
    .query<Problem, P>(`
      INSERT INTO patient_problems (id, patient_id, condition, icd10_code, onset_date, status)
      VALUES ($id, $patient_id, $condition, $icd10_code, $onset_date, $status)
      RETURNING *
    `)
    .get({
      $id: crypto.randomUUID(),
      $patient_id: patientId,
      $condition: data.condition,
      $icd10_code: data.icd10_code ?? null,
      $onset_date: data.onset_date ?? null,
      $status: data.status,
    })!;
}

export function updateProblem(
  problemId: string,
  patientId: string,
  data: UpdateProblemDto,
): Problem | null {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return db
      .query<Problem, [string, string]>(
        'SELECT * FROM patient_problems WHERE id = ? AND patient_id = ?',
      )
      .get(problemId, patientId);
  }
  const params: Record<string, string | null> = { $id: problemId, $patient_id: patientId };
  const setClauses = entries.map(([k, v]) => {
    params[`$${k}`] = v as string | null;
    return `${k} = $${k}`;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((db.query(
    `UPDATE patient_problems SET ${setClauses.join(', ')} WHERE id = $id AND patient_id = $patient_id RETURNING *`,
  ) as any).get(params) as Problem | null) ?? null;
}

export function deleteProblem(problemId: string, patientId: string) {
  db.query<void, [string, string]>(
    'DELETE FROM patient_problems WHERE id = ? AND patient_id = ?',
  ).run(problemId, patientId);
}

// ── Patient Medications ───────────────────────────────────────────────────────

export function listMedications(patientId: string): PatientMedication[] {
  return db
    .query<PatientMedication, [string]>(
      'SELECT * FROM patient_medications WHERE patient_id = ? ORDER BY created_at DESC',
    )
    .all(patientId);
}

export function createMedication(patientId: string, data: PatientMedicationDto): PatientMedication {
  type P = {
    $id: string; $patient_id: string; $drug: string; $dose: string | null;
    $route: string | null; $frequency: string | null;
    $start_date: string | null; $end_date: string | null;
  };
  return db
    .query<PatientMedication, P>(`
      INSERT INTO patient_medications (id, patient_id, drug, dose, route, frequency, start_date, end_date)
      VALUES ($id, $patient_id, $drug, $dose, $route, $frequency, $start_date, $end_date)
      RETURNING *
    `)
    .get({
      $id: crypto.randomUUID(),
      $patient_id: patientId,
      $drug: data.drug,
      $dose: data.dose ?? null,
      $route: data.route ?? null,
      $frequency: data.frequency ?? null,
      $start_date: data.start_date ?? null,
      $end_date: data.end_date ?? null,
    })!;
}

export function updateMedication(
  medId: string,
  patientId: string,
  data: UpdatePatientMedicationDto,
): PatientMedication | null {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return db
      .query<PatientMedication, [string, string]>(
        'SELECT * FROM patient_medications WHERE id = ? AND patient_id = ?',
      )
      .get(medId, patientId);
  }
  const params: Record<string, string | null> = { $id: medId, $patient_id: patientId };
  const setClauses = entries.map(([k, v]) => {
    params[`$${k}`] = v as string | null;
    return `${k} = $${k}`;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((db.query(
    `UPDATE patient_medications SET ${setClauses.join(', ')} WHERE id = $id AND patient_id = $patient_id RETURNING *`,
  ) as any).get(params) as PatientMedication | null) ?? null;
}

export function deleteMedication(medId: string, patientId: string) {
  db.query<void, [string, string]>(
    'DELETE FROM patient_medications WHERE id = ? AND patient_id = ?',
  ).run(medId, patientId);
}

// ── Immunizations ─────────────────────────────────────────────────────────────

export function listImmunizations(patientId: string): Immunization[] {
  return db
    .query<Immunization, [string]>(
      'SELECT * FROM patient_immunizations WHERE patient_id = ? ORDER BY date_given DESC',
    )
    .all(patientId);
}

export function createImmunization(patientId: string, data: ImmunizationDto): Immunization {
  type P = {
    $id: string; $patient_id: string; $visit_id: string | null;
    $vaccine: string; $dose_number: number | null; $date_given: string;
  };
  return db
    .query<Immunization, P>(`
      INSERT INTO patient_immunizations (id, patient_id, visit_id, vaccine, dose_number, date_given)
      VALUES ($id, $patient_id, $visit_id, $vaccine, $dose_number, $date_given)
      RETURNING *
    `)
    .get({
      $id: crypto.randomUUID(),
      $patient_id: patientId,
      $visit_id: data.visit_id ?? null,
      $vaccine: data.vaccine,
      $dose_number: data.dose_number ?? null,
      $date_given: data.date_given,
    })!;
}

export function deleteImmunization(immId: string, patientId: string) {
  db.query<void, [string, string]>(
    'DELETE FROM patient_immunizations WHERE id = ? AND patient_id = ?',
  ).run(immId, patientId);
}

// ── Growth & visit history ────────────────────────────────────────────────────

export function getPatientGrowth(patientId: string) {
  type GrowthPoint = {
    visit_id: string;
    datetime: string;
    weight_kg: number | null;
    height_cm: number | null;
    height_type: string | null;
    hc_cm: number | null;
  };
  return db
    .query<GrowthPoint, [string]>(
      `SELECT id AS visit_id, datetime, weight_kg, height_cm, height_type, hc_cm
       FROM visit
       WHERE patient_id = ?
         AND (weight_kg IS NOT NULL OR height_cm IS NOT NULL OR hc_cm IS NOT NULL)
       ORDER BY datetime ASC`,
    )
    .all(patientId);
}

export function getPatientVisits(patientId: string) {
  type VisitSummary = {
    id: string;
    datetime: string;
    type: string;
    status: string;
    reason: string | null;
    fee: number | null;
  };
  return db
    .query<VisitSummary, [string]>(
      `SELECT id, datetime, type, status, reason, fee
       FROM visit
       WHERE patient_id = ?
       ORDER BY datetime DESC`,
    )
    .all(patientId);
}
