import db from '../../db';
import type { CreateTaskDto, UpdateTaskDto } from './tasks.schema';

type TaskRow = {
  id: string;
  title: string;
  done: number;
  due_date: string | null;
  sort_order: number;
  created_at: string;
};

function fmtTask(row: TaskRow) {
  return { ...row, done: row.done === 1 };
}

export function listTasks() {
  return db
    .query<TaskRow, []>('SELECT * FROM task ORDER BY sort_order ASC, created_at ASC')
    .all()
    .map(fmtTask);
}

export function getTask(id: string) {
  const row = db.query<TaskRow, [string]>('SELECT * FROM task WHERE id = ?').get(id);
  return row ? fmtTask(row) : null;
}

export function createTask(data: CreateTaskDto) {
  const id = crypto.randomUUID();
  // Default sort_order to end of list if not provided.
  let sortOrder = data.sort_order;
  if (sortOrder === undefined) {
    const { max } = db
      .query<{ max: number | null }, []>('SELECT MAX(sort_order) AS max FROM task')
      .get()!;
    sortOrder = (max ?? -1) + 1;
  }

  type InsertParams = { $id: string; $title: string; $due_date: string | null; $sort_order: number };
  return fmtTask(
    db
      .query<TaskRow, InsertParams>(
        'INSERT INTO task (id, title, due_date, sort_order) VALUES ($id, $title, $due_date, $sort_order) RETURNING *',
      )
      .get({ $id: id, $title: data.title, $due_date: data.due_date ?? null, $sort_order: sortOrder })!,
  );
}

export function updateTask(id: string, data: UpdateTaskDto) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return getTask(id);

  const params: Record<string, string | number | null> = { $id: id };
  const setClauses = entries.map(([k, v]) => {
    if (k === 'done') {
      params[`$${k}`] = v ? 1 : 0;
    } else {
      params[`$${k}`] = v as string | number | null;
    }
    return `${k} = $${k}`;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (db.query(
    `UPDATE task SET ${setClauses.join(', ')} WHERE id = $id RETURNING *`,
  ) as any).get(params) as TaskRow | null;

  return row ? fmtTask(row) : null;
}

export function deleteTask(id: string) {
  db.query<void, [string]>('DELETE FROM task WHERE id = ?').run(id);
}
