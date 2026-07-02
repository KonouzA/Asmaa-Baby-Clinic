import db from '../../db';
import type {
  CreateVisitDto,
  UpdateVisitDto,
  ExamFindingDto,
  VisitMedicationDto,
  DiagnosisDto,
  VisitImmunizationDto,
  ScreeningDto,
  VisitListQuery,
} from './visits.schema';

// ── Raw DB row types ──────────────────────────────────────────────────────────

type RawVisit = {
  id: string;
  patient_id: string;
  datetime: string;
  duration_min: number | null;
  type: string;
  status: string;
  reason: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  height_type: string | null;
  hc_cm: number | null;
  temp_c: number | null;
  temp_route: string | null;
  hr_bpm: number | null;
  rr_per_min: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  bp_cuff_size: string | null;
  bp_position: string | null;
  spo2_pct: number | null;
  spo2_on_o2: number;
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
};

type ExamFindingRow = {
  id: string; visit_id: string; category: string;
  description: string | null; status: string | null; created_at: string;
};

type VisitMedicationRow = {
  id: string; visit_id: string; drug: string; dose: string | null;
  dose_unit: string | null; route: string | null; frequency: string | null;
  duration: string | null; notes: string | null; created_at: string;
};

type VisitDiagnosisRow = {
  id: string; visit_id: string; icd10_code: string;
  description: string | null; is_primary: number; created_at: string;
};

type VisitScreeningRow = {
  id: string; visit_id: string; vision_result: string | null;
  hearing_result: string | null; dental_result: string | null;
  nutrition_notes: string | null; dev_tool: string | null;
  dev_score: number | null; dev_milestone_status: string | null;
  dev_action: string | null; created_at: string;
};

type VisitAttachmentRow = {
  id: string; patient_id: string; visit_id: string | null;
  type: string | null; title: string; date: string | null;
  file_path: string; created_at: string;
};

type ImmunizationRow = {
  id: string; patient_id: string; visit_id: string | null;
  vaccine: string; dose_number: number | null; date_given: string; created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVisit(row: RawVisit) {
  return { ...row, spo2_on_o2: row.spo2_on_o2 === 1 };
}

// All direct columns on the visit table (excludes child collections).
const VISIT_SCALAR_FIELDS = new Set([
  'patient_id', 'datetime', 'duration_min', 'type', 'status', 'reason',
  'weight_kg', 'height_cm', 'height_type', 'hc_cm', 'temp_c', 'temp_route',
  'hr_bpm', 'rr_per_min', 'bp_systolic', 'bp_diastolic', 'bp_cuff_size', 'bp_position',
  'spo2_pct', 'spo2_on_o2',
  'hpi_onset', 'hpi_duration', 'hpi_fever_pattern', 'hpi_feeding', 'hpi_urine_output', 'hpi_symptoms',
  'plan_treatment', 'plan_precautions', 'plan_follow_up_date', 'plan_referrals',
  'fee', 'summary',
]);

const BOOL_VISIT_FIELDS = new Set(['spo2_on_o2']);

// Inserts child rows for a visit. Called from both create and update.
// For updates, the caller deletes existing children first (replace strategy).
function insertVisitChildren(
  visitId: string,
  patientId: string,
  data: {
    exam_findings?: ExamFindingDto[];
    medications?: VisitMedicationDto[];
    diagnoses?: DiagnosisDto[];
    immunizations?: VisitImmunizationDto[];
    screening?: ScreeningDto;
    attachment_ids?: string[];
  },
): void {
  // Exam findings
  for (const f of data.exam_findings ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query(
      'INSERT INTO visit_exam_findings (id, visit_id, category, description, status) VALUES (?, ?, ?, ?, ?)',
    ) as any).run(crypto.randomUUID(), visitId, f.category, f.description ?? null, f.status ?? null);
  }

  // Visit medications
  for (const m of data.medications ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query(
      'INSERT INTO visit_medications (id, visit_id, drug, dose, dose_unit, route, frequency, duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ) as any).run(
      crypto.randomUUID(), visitId, m.drug,
      m.dose ?? null, m.dose_unit ?? null, m.route ?? null,
      m.frequency ?? null, m.duration ?? null, m.notes ?? null,
    );
  }

  // Diagnoses — insert into visit_diagnoses and upsert into patient_problems.
  for (const d of data.diagnoses ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query(
      'INSERT INTO visit_diagnoses (id, visit_id, icd10_code, description, is_primary) VALUES (?, ?, ?, ?, ?)',
    ) as any).run(
      crypto.randomUUID(), visitId, d.icd10_code, d.description ?? null, d.is_primary ? 1 : 0,
    );

    // Only upsert to patient_problems if this ICD-10 code isn't already on the problem list.
    const existing = db
      .query<{ id: string }, [string, string]>(
        'SELECT id FROM patient_problems WHERE patient_id = ? AND icd10_code = ?',
      )
      .get(patientId, d.icd10_code);

    if (!existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.query(
        'INSERT INTO patient_problems (id, patient_id, condition, icd10_code, status) VALUES (?, ?, ?, ?, ?)',
      ) as any).run(
        crypto.randomUUID(), patientId,
        d.description ?? d.icd10_code, d.icd10_code, 'active',
      );
    }
  }

  // Visit-scoped immunizations — stored in patient_immunizations with visit_id stamped.
  for (const imm of data.immunizations ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query(
      'INSERT INTO patient_immunizations (id, patient_id, visit_id, vaccine, dose_number, date_given) VALUES (?, ?, ?, ?, ?, ?)',
    ) as any).run(
      crypto.randomUUID(), patientId, visitId,
      imm.vaccine, imm.dose_number ?? null, imm.date_given,
    );
  }

  // Screening — one row per visit.
  if (data.screening) {
    const s = data.screening;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query(
      'INSERT INTO visit_screenings (id, visit_id, vision_result, hearing_result, dental_result, nutrition_notes, dev_tool, dev_score, dev_milestone_status, dev_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ) as any).run(
      crypto.randomUUID(), visitId,
      s.vision_result ?? null, s.hearing_result ?? null, s.dental_result ?? null,
      s.nutrition_notes ?? null, s.dev_tool ?? null, s.dev_score ?? null,
      s.dev_milestone_status ?? null, s.dev_action ?? null,
    );
  }

  // Link already-uploaded attachments to this visit.
  for (const attachmentId of data.attachment_ids ?? []) {
    db.query<void, [string, string]>(
      'UPDATE visit_attachments SET visit_id = ? WHERE id = ?',
    ).run(visitId, attachmentId);
  }
}

// ── Core CRUD ─────────────────────────────────────────────────────────────────

export function listVisits(query: VisitListQuery) {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.patientId) {
    conditions.push('v.patient_id = ?');
    params.push(query.patientId);
  }
  if (query.status) {
    conditions.push('v.status = ?');
    params.push(query.status);
  }
  if (query.type) {
    conditions.push('v.type = ?');
    params.push(query.type);
  }
  if (query.from) {
    conditions.push('v.datetime >= ?');
    params.push(query.from);
  }
  if (query.to) {
    conditions.push('v.datetime <= ?');
    params.push(`${query.to} 23:59:59`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (query.page - 1) * query.pageSize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countStmt = db.query(`SELECT COUNT(*) AS total FROM visit v ${where}`) as any;
  const { total } = countStmt.get(...params) as { total: number };

  // Include patient name + MRN so the global visit list is useful without a second request.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataStmt = db.query(`
    SELECT v.id, v.patient_id, v.datetime, v.type, v.status, v.reason, v.fee,
           p.full_name AS patient_name, p.mrn AS patient_mrn
    FROM visit v
    JOIN patient p ON p.id = v.patient_id
    ${where}
    ORDER BY v.datetime DESC
    LIMIT ? OFFSET ?
  `) as any;
  const data = dataStmt.all(...params, query.pageSize, offset);

  return { data, total, page: query.page, pageSize: query.pageSize };
}

export function getVisit(id: string) {
  const row = db.query<RawVisit, [string]>('SELECT * FROM visit WHERE id = ?').get(id);
  if (!row) return null;

  const exam_findings = db
    .query<ExamFindingRow, [string]>(
      'SELECT * FROM visit_exam_findings WHERE visit_id = ? ORDER BY created_at ASC',
    )
    .all(id);

  const medications = db
    .query<VisitMedicationRow, [string]>(
      'SELECT * FROM visit_medications WHERE visit_id = ? ORDER BY created_at ASC',
    )
    .all(id);

  const rawDiagnoses = db
    .query<VisitDiagnosisRow, [string]>(
      'SELECT * FROM visit_diagnoses WHERE visit_id = ? ORDER BY is_primary DESC, created_at ASC',
    )
    .all(id);

  const immunizations = db
    .query<ImmunizationRow, [string]>(
      'SELECT * FROM patient_immunizations WHERE visit_id = ? ORDER BY date_given ASC',
    )
    .all(id);

  const screening = db
    .query<VisitScreeningRow, [string]>('SELECT * FROM visit_screenings WHERE visit_id = ?')
    .get(id) ?? null;

  const attachments = db
    .query<VisitAttachmentRow, [string]>(
      'SELECT * FROM visit_attachments WHERE visit_id = ? ORDER BY created_at DESC',
    )
    .all(id);

  return {
    ...fmtVisit(row),
    exam_findings,
    medications,
    diagnoses: rawDiagnoses.map((d) => ({ ...d, is_primary: d.is_primary === 1 })),
    immunizations,
    screening,
    attachments,
  };
}

export function createVisit(data: CreateVisitDto) {
  return db.transaction(() => {
    const id = crypto.randomUUID();

    type InsertParams = {
      $id: string; $patient_id: string; $datetime: string; $duration_min: number | null;
      $type: string; $status: string; $reason: string | null;
      $weight_kg: number | null; $height_cm: number | null; $height_type: string | null;
      $hc_cm: number | null; $temp_c: number | null; $temp_route: string | null;
      $hr_bpm: number | null; $rr_per_min: number | null;
      $bp_systolic: number | null; $bp_diastolic: number | null;
      $bp_cuff_size: string | null; $bp_position: string | null;
      $spo2_pct: number | null; $spo2_on_o2: number;
      $hpi_onset: string | null; $hpi_duration: string | null;
      $hpi_fever_pattern: string | null; $hpi_feeding: string | null;
      $hpi_urine_output: string | null; $hpi_symptoms: string | null;
      $plan_treatment: string | null; $plan_precautions: string | null;
      $plan_follow_up_date: string | null; $plan_referrals: string | null;
      $fee: number | null; $summary: string | null;
    };

    const row = db
      .query<RawVisit, InsertParams>(`
        INSERT INTO visit (
          id, patient_id, datetime, duration_min, type, status, reason,
          weight_kg, height_cm, height_type, hc_cm, temp_c, temp_route,
          hr_bpm, rr_per_min, bp_systolic, bp_diastolic, bp_cuff_size, bp_position,
          spo2_pct, spo2_on_o2,
          hpi_onset, hpi_duration, hpi_fever_pattern, hpi_feeding, hpi_urine_output, hpi_symptoms,
          plan_treatment, plan_precautions, plan_follow_up_date, plan_referrals,
          fee, summary
        ) VALUES (
          $id, $patient_id, $datetime, $duration_min, $type, $status, $reason,
          $weight_kg, $height_cm, $height_type, $hc_cm, $temp_c, $temp_route,
          $hr_bpm, $rr_per_min, $bp_systolic, $bp_diastolic, $bp_cuff_size, $bp_position,
          $spo2_pct, $spo2_on_o2,
          $hpi_onset, $hpi_duration, $hpi_fever_pattern, $hpi_feeding, $hpi_urine_output, $hpi_symptoms,
          $plan_treatment, $plan_precautions, $plan_follow_up_date, $plan_referrals,
          $fee, $summary
        ) RETURNING *
      `)
      .get({
        $id: id,
        $patient_id: data.patient_id,
        $datetime: data.datetime,
        $duration_min: data.duration_min ?? null,
        $type: data.type,
        $status: data.status,
        $reason: data.reason ?? null,
        $weight_kg: data.weight_kg ?? null,
        $height_cm: data.height_cm ?? null,
        $height_type: data.height_type ?? null,
        $hc_cm: data.hc_cm ?? null,
        $temp_c: data.temp_c ?? null,
        $temp_route: data.temp_route ?? null,
        $hr_bpm: data.hr_bpm ?? null,
        $rr_per_min: data.rr_per_min ?? null,
        $bp_systolic: data.bp_systolic ?? null,
        $bp_diastolic: data.bp_diastolic ?? null,
        $bp_cuff_size: data.bp_cuff_size ?? null,
        $bp_position: data.bp_position ?? null,
        $spo2_pct: data.spo2_pct ?? null,
        $spo2_on_o2: data.spo2_on_o2 ? 1 : 0,
        $hpi_onset: data.hpi_onset ?? null,
        $hpi_duration: data.hpi_duration ?? null,
        $hpi_fever_pattern: data.hpi_fever_pattern ?? null,
        $hpi_feeding: data.hpi_feeding ?? null,
        $hpi_urine_output: data.hpi_urine_output ?? null,
        $hpi_symptoms: data.hpi_symptoms ?? null,
        $plan_treatment: data.plan_treatment ?? null,
        $plan_precautions: data.plan_precautions ?? null,
        $plan_follow_up_date: data.plan_follow_up_date ?? null,
        $plan_referrals: data.plan_referrals ?? null,
        $fee: data.fee ?? null,
        $summary: data.summary ?? null,
      })!;

    insertVisitChildren(id, data.patient_id, data);

    return getVisit(id)!;
  })();
}

export function updateVisit(id: string, data: UpdateVisitDto) {
  return db.transaction(() => {
    // 1. Update scalar columns on the visit row.
    const scalarEntries = Object.entries(data).filter(
      ([k, v]) => v !== undefined && VISIT_SCALAR_FIELDS.has(k),
    );

    let currentVisit: RawVisit | null;

    if (scalarEntries.length > 0) {
      const params: Record<string, string | number | null> = { $id: id };
      const setClauses = scalarEntries.map(([k, v]) => {
        params[`$${k}`] = BOOL_VISIT_FIELDS.has(k) ? (v ? 1 : 0) : (v as string | number | null);
        return `${k} = $${k}`;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentVisit = (db.query(
        `UPDATE visit SET ${setClauses.join(', ')}, updated_at = datetime('now') WHERE id = $id RETURNING *`,
      ) as any).get(params) as RawVisit | null;
    } else {
      currentVisit = db.query<RawVisit, [string]>('SELECT * FROM visit WHERE id = ?').get(id);
    }

    if (!currentVisit) return null;

    const patientId = currentVisit.patient_id;

    // 2. Replace child collections — only for keys explicitly present in the payload.
    //    undefined = "don't touch this tab". [] = "clear this tab's data".

    if (data.exam_findings !== undefined) {
      db.query<void, [string]>('DELETE FROM visit_exam_findings WHERE visit_id = ?').run(id);
    }
    if (data.medications !== undefined) {
      db.query<void, [string]>('DELETE FROM visit_medications WHERE visit_id = ?').run(id);
    }
    if (data.diagnoses !== undefined) {
      db.query<void, [string]>('DELETE FROM visit_diagnoses WHERE visit_id = ?').run(id);
    }
    if (data.immunizations !== undefined) {
      // Deletes only visit-scoped immunizations. Historical ones (visit_id = NULL) are untouched.
      db.query<void, [string]>('DELETE FROM patient_immunizations WHERE visit_id = ?').run(id);
    }
    if (data.screening !== undefined) {
      db.query<void, [string]>('DELETE FROM visit_screenings WHERE visit_id = ?').run(id);
    }
    if (data.attachment_ids !== undefined) {
      // Unlink current attachments from this visit before linking the new set.
      db.query<void, [string]>('UPDATE visit_attachments SET visit_id = NULL WHERE visit_id = ?').run(id);
    }

    insertVisitChildren(id, patientId, data);

    return getVisit(id);
  })();
}

export function deleteVisit(id: string) {
  db.query<void, [string]>('DELETE FROM visit WHERE id = ?').run(id);
}

// ── Receipt ───────────────────────────────────────────────────────────────────

export function getVisitReceipt(id: string) {
  const visit = db
    .query<
      { id: string; patient_id: string; datetime: string; type: string; status: string; fee: number | null; summary: string | null },
      [string]
    >('SELECT id, patient_id, datetime, type, status, fee, summary FROM visit WHERE id = ?')
    .get(id);

  if (!visit) return null;

  const patient = db
    .query<{ id: string; mrn: string; full_name: string; dob: string }, [string]>(
      'SELECT id, mrn, full_name, dob FROM patient WHERE id = ?',
    )
    .get(visit.patient_id);

  const diagnoses = db
    .query<{ icd10_code: string; description: string | null; is_primary: number }, [string]>(
      'SELECT icd10_code, description, is_primary FROM visit_diagnoses WHERE visit_id = ? ORDER BY is_primary DESC',
    )
    .all(id)
    .map((d) => ({ ...d, is_primary: d.is_primary === 1 }));

  const medications = db
    .query<
      { drug: string; dose: string | null; dose_unit: string | null; frequency: string | null; duration: string | null },
      [string]
    >(
      'SELECT drug, dose, dose_unit, frequency, duration FROM visit_medications WHERE visit_id = ?',
    )
    .all(id);

  return { visit, patient, diagnoses, medications };
}
