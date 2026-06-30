import type { Context, Next } from 'hono';
import { getSession } from '../features/auth/auth.service';

const bearer = (c: Context): string | null => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
};

export async function requireAuth(c: Context, next: Next) {
  getSession(bearer(c)); // throws HTTPException(401) if missing or invalid
  await next();
}
