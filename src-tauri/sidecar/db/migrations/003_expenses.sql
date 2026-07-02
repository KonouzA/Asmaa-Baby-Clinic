-- Itemized monthly expense ledger. Replaces the fixed 10-category cost editor
-- with free-form line items (name, description, value) scoped to a year/month.
CREATE TABLE IF NOT EXISTS expense (
  id          TEXT PRIMARY KEY NOT NULL,
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  name        TEXT NOT NULL,
  description TEXT,
  value       REAL NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expense_year_month ON expense(year, month);
