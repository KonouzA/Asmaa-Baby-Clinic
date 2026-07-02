import db from '../../db';
import type { CreateExpenseDto, ExpenseListQuery, UpdateExpenseDto } from './expenses.schema';

export type Expense = {
  id: string;
  year: number;
  month: number;
  name: string;
  description: string | null;
  value: number;
  created_at: string;
  updated_at: string;
};

export function listExpenses(query: ExpenseListQuery) {
  return db
    .query<Expense, [number, number]>(
      'SELECT * FROM expense WHERE year = ? AND month = ? ORDER BY created_at ASC',
    )
    .all(query.year, query.month);
}

export function getExpense(id: string) {
  return db.query<Expense, [string]>('SELECT * FROM expense WHERE id = ?').get(id);
}

export function createExpense(dto: CreateExpenseDto) {
  const id = crypto.randomUUID();
  return db
    .query<Expense, [string, number, number, string, string | null, number]>(
      `INSERT INTO expense (id, year, month, name, description, value)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING *`,
    )
    .get(id, dto.year, dto.month, dto.name, dto.description ?? null, dto.value)!;
}

export function updateExpense(id: string, dto: UpdateExpenseDto) {
  const entries = Object.entries(dto).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return getExpense(id) ?? null;

  const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v as string | number);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (db.query(`
    UPDATE expense SET ${setClauses}, updated_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `) as any).get(...values, id) as Expense | null;

  return row;
}

export function deleteExpense(id: string) {
  db.query('DELETE FROM expense WHERE id = ?').run(id);
}
