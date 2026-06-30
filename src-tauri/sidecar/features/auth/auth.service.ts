import { HTTPException } from 'hono/http-exception';
import db from '../../db';
import type { LoginDto, LoginResponse, SessionUser } from './auth.schema';

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
};

// In-memory sessions: token -> user. Sidecar lifetime == app lifetime for this
// single-user local app, so there's no need to persist sessions. Tokens reset
// when the sidecar restarts; the frontend treats a 401 from /me as logged-out.
const sessions = new Map<string, SessionUser>();

const toSessionUser = (row: UserRow): SessionUser => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
});

// Seed the hardcoded admin/admin account on boot if no user exists.
export function ensureDefaultUser(): void {
  const { count } = db
    .query<{ count: number }, []>('SELECT COUNT(*) AS count FROM clinic_user')
    .get()!;
  if (count > 0) return;

  db.query(
    `INSERT INTO clinic_user (id, username, password_hash, display_name)
     VALUES ($id, $username, $hash, $displayName)`,
  ).run({
    $id: crypto.randomUUID(),
    $username: 'admin',
    $hash: Bun.password.hashSync('admin'),
    $displayName: 'Administrator',
  });
  console.log('[auth] seeded default admin user (admin/admin)');
}

export function login(dto: LoginDto): LoginResponse {
  const row = db
    .query<UserRow, { $username: string }>(
      'SELECT * FROM clinic_user WHERE username = $username',
    )
    .get({ $username: dto.username });

  if (!row || !Bun.password.verifySync(dto.password, row.password_hash)) {
    throw new HTTPException(401, { message: 'Invalid username or password' });
  }

  const user = toSessionUser(row);
  const token = crypto.randomUUID();
  sessions.set(token, user);
  return { token, user };
}

export function logout(token: string | null): void {
  if (token) sessions.delete(token);
}

export function getSession(token: string | null): SessionUser {
  const user = token ? sessions.get(token) : undefined;
  if (!user) throw new HTTPException(401, { message: 'Not authenticated' });
  return user;
}
