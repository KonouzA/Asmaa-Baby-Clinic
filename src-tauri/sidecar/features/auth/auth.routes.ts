import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from './auth.schema';
import { login, logout, getSession } from './auth.service';

const bearer = (c: Context): string | null => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
};

export const authRoutes = new Hono()
  .post('/login', zValidator('json', loginSchema), (c) =>
    c.json(login(c.req.valid('json'))),
  )
  .post('/logout', (c) => {
    logout(bearer(c));
    return c.json({ ok: true });
  })
  .get('/me', (c) => c.json(getSession(bearer(c))));
