-- Auth: single clinic login. The admin row is seeded at runtime
-- (ensureDefaultUser in features/auth/auth.service.ts) because the
-- password hash is computed with Bun.password at boot, not stored here.
CREATE TABLE IF NOT EXISTS clinic_user (
  id            TEXT PRIMARY KEY NOT NULL,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
