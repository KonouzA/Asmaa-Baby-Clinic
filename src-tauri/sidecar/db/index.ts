import { Database } from 'bun:sqlite';
import { migrations } from './migrations';

const db = new Database('app.db', { create: true });
db.exec('PRAGMA journal_mode = WAL;');

// Apply embedded migrations in order, once each (see ./migrations.ts).
runMigrations();

function runMigrations() {
  db.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     );`,
  );

  const applied = new Set(
    db
      .query<{ name: string }, []>('SELECT name FROM _migrations')
      .all()
      .map((r) => r.name),
  );

  for (const { name, sql } of migrations) {
    if (applied.has(name)) continue;
    db.transaction(() => {
      db.exec(sql);
      db.query('INSERT INTO _migrations (name) VALUES ($name)').run({ $name: name });
    })();
    console.log(`[db] applied migration ${name}`);
  }
}

export default db;
