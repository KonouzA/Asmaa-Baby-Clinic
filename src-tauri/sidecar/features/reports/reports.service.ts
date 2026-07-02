import db from '../../db';
import type { ReportCostsDto, VisitStatsQuery } from './reports.schema';

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportRow = {
  id: string;
  month: number;
  year: number;
  cost_electricity_clinic: number;
  cost_electricity_stairs: number;
  cost_water: number;
  cost_phone_personal: number;
  cost_landline: number;
  cost_internet: number;
  cost_cleaning: number;
  cost_secretary: number;
  cost_medical_waste: number;
  cost_others: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Total cost is now the sum of itemized rows in the `expense` ledger
// (see features/expenses) rather than the fixed cost_* columns below —
// those columns are kept only for backward-compatible reads via the
// PUT /api/reports/:year/:month endpoint.
function expenseTotal(month: number, year: number) {
  const result = db
    .query<{ total: number | null }, [number, number]>(
      'SELECT SUM(value) AS total FROM expense WHERE year = ? AND month = ?',
    )
    .get(year, month);
  return result?.total ?? 0;
}

// Compute visit-derived totals for a given month/year.
function visitTotals(month: number, year: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  // Last day of month via SQLite date math.
  const to = `${year}-${String(month).padStart(2, '0')}-31 23:59:59`;

  const result = db
    .query<
      { total_payment: number | null; visit_count: number; patient_count: number },
      [string, string]
    >(
      `SELECT
        SUM(CASE WHEN status = 'done' THEN COALESCE(fee, 0) ELSE 0 END) AS total_payment,
        COUNT(*) AS visit_count,
        COUNT(DISTINCT patient_id) AS patient_count
       FROM visit
       WHERE datetime >= ? AND datetime <= ?`,
    )
    .get(from, to)!;

  return {
    total_payment: result.total_payment ?? 0,
    visit_count: result.visit_count,
    patient_count: result.patient_count,
  };
}

function enrichReport(row: ReportRow) {
  const cost = expenseTotal(row.month, row.year);
  const { total_payment, visit_count, patient_count } = visitTotals(row.month, row.year);
  return {
    ...row,
    total_cost: cost,
    total_payment,
    net: total_payment - cost,
    visit_count,
    patient_count,
  };
}

// Zero-filled placeholder for months that have no cost row yet.
function emptyMonth(month: number, year: number) {
  const cost = expenseTotal(month, year);
  const { total_payment, visit_count, patient_count } = visitTotals(month, year);
  return {
    id: null,
    month,
    year,
    cost_electricity_clinic: 0,
    cost_electricity_stairs: 0,
    cost_water: 0,
    cost_phone_personal: 0,
    cost_landline: 0,
    cost_internet: 0,
    cost_cleaning: 0,
    cost_secretary: 0,
    cost_medical_waste: 0,
    cost_others: 0,
    notes: null,
    created_at: null,
    updated_at: null,
    total_cost: cost,
    total_payment,
    net: total_payment - cost,
    visit_count,
    patient_count,
  };
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export function listReports(year: number) {
  const rows = db
    .query<ReportRow, [number]>('SELECT * FROM report WHERE year = ? ORDER BY month ASC')
    .all(year);

  const byMonth = new Map(rows.map((r) => [r.month, r]));

  // Always return all 12 months so the frontend can render the full year chart.
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row = byMonth.get(month);
    return row ? enrichReport(row) : emptyMonth(month, year);
  });
}

export function getMonthlyReport(year: number, month: number) {
  const row = db
    .query<ReportRow, [number, number]>('SELECT * FROM report WHERE year = ? AND month = ?')
    .get(year, month);

  return row ? enrichReport(row) : emptyMonth(month, year);
}

export function upsertReport(year: number, month: number, data: ReportCostsDto) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);

  // Build the upsert: on conflict (month, year) update only the provided columns.
  const setClauses = entries.map(([k]) => `${k} = excluded.${k}`).join(', ');
  const colNames = entries.map(([k]) => k).join(', ');
  const placeholders = entries.map(() => '?').join(', ');
  const values = entries.map(([, v]) => v as string | number | null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (db.query(`
    INSERT INTO report (id, month, year, ${colNames})
    VALUES (?, ?, ?, ${placeholders})
    ON CONFLICT(month, year) DO UPDATE SET
      ${setClauses},
      updated_at = datetime('now')
    RETURNING *
  `) as any).get(crypto.randomUUID(), month, year, ...values) as ReportRow;

  return enrichReport(row);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getVisitStats(query: VisitStatsQuery) {
  const conditions: string[] = [];
  const params: string[] = [];

  if (query.from) { conditions.push('datetime >= ?'); params.push(query.from); }
  if (query.to) { conditions.push('datetime <= ?'); params.push(`${query.to} 23:59:59`); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // SQLite date-grouping expression per groupBy.
  const groupExpr = query.groupBy === 'day'
    ? "strftime('%Y-%m-%d', datetime)"
    : query.groupBy === 'week'
    ? "strftime('%Y-W%W', datetime)"
    : "strftime('%Y-%m', datetime)";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byPeriod = (db.query(`
    SELECT ${groupExpr} AS period,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
           SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) AS no_show,
           SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
           SUM(CASE WHEN status = 'done' THEN COALESCE(fee, 0) ELSE 0 END) AS revenue
    FROM visit ${where}
    GROUP BY period
    ORDER BY period ASC
  `) as any).all(...params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byType = (db.query(`
    SELECT type, COUNT(*) AS count
    FROM visit ${where}
    GROUP BY type
    ORDER BY count DESC
  `) as any).all(...params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byStatus = (db.query(`
    SELECT status, COUNT(*) AS count
    FROM visit ${where}
    GROUP BY status
    ORDER BY count DESC
  `) as any).all(...params);

  return { by_period: byPeriod, by_type: byType, by_status: byStatus };
}

export function getPatientStats() {
  const totals = db
    .query<{ total: number; male: number; female: number }, []>(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END) AS male,
             SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END) AS female
      FROM patient
    `)
    .get()!;

  // New patients this calendar month.
  const { new_this_month } = db
    .query<{ new_this_month: number }, []>(`
      SELECT COUNT(*) AS new_this_month
      FROM patient
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `)
    .get()!;

  // Rough age-group buckets from dob (approximate — no leap-year precision needed here).
  const ageGroups = db
    .query<{ age_group: string; count: number }, []>(`
      SELECT
        CASE
          WHEN (julianday('now') - julianday(dob)) / 365.25 < 1  THEN 'under_1'
          WHEN (julianday('now') - julianday(dob)) / 365.25 < 2  THEN '1_to_2'
          WHEN (julianday('now') - julianday(dob)) / 365.25 < 5  THEN '2_to_5'
          WHEN (julianday('now') - julianday(dob)) / 365.25 < 12 THEN '5_to_12'
          ELSE 'over_12'
        END AS age_group,
        COUNT(*) AS count
      FROM patient
      GROUP BY age_group
      ORDER BY age_group
    `)
    .all();

  return { ...totals, new_this_month, by_age_group: ageGroups };
}

export function getDashboard() {
  // Last 6 months of revenue vs cost.
  const last6Months = db
    .query<{ month: number; year: number }, []>(`
      SELECT DISTINCT
        CAST(strftime('%m', datetime) AS INTEGER) AS month,
        CAST(strftime('%Y', datetime) AS INTEGER) AS year
      FROM visit
      WHERE datetime >= date('now', '-6 months')
      ORDER BY year ASC, month ASC
    `)
    .all();

  const trend = last6Months.map(({ month, year }) => {
    const cost = expenseTotal(month, year);
    const { total_payment, visit_count } = visitTotals(month, year);
    return { month, year, revenue: total_payment, cost, net: total_payment - cost, visit_count };
  });

  // Today's visits.
  const { today_count } = db
    .query<{ today_count: number }, []>(`
      SELECT COUNT(*) AS today_count FROM visit
      WHERE date(datetime) = date('now')
    `)
    .get()!;

  // Upcoming (booked / checked-in) from now forward.
  const { upcoming_count } = db
    .query<{ upcoming_count: number }, []>(`
      SELECT COUNT(*) AS upcoming_count FROM visit
      WHERE status IN ('booked', 'checked-in') AND datetime >= datetime('now')
    `)
    .get()!;

  const { total_patients } = db
    .query<{ total_patients: number }, []>('SELECT COUNT(*) AS total_patients FROM patient')
    .get()!;

  return { trend, today_count, upcoming_count, total_patients };
}
