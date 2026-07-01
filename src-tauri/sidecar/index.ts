import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error';
import { requireAuth } from './middleware/require-auth';
import { authRoutes } from './features/auth/auth.routes';
import { ensureDefaultUser } from './features/auth/auth.service';
import { patientsRoutes } from './features/patients/patients.routes';

ensureDefaultUser();

const app = new Hono();

app.use('*', cors({ origin: '*' }));

app.get('/health', (c) => c.json({ ok: true }));

// Public: login only. Logout + me carry their own bearer check.
app.route('/api/auth', authRoutes);

// Protected: all feature routes go here. requireAuth runs first for every sub-route.
const api = new Hono();
api.use('*', requireAuth);
api.route('/patients', patientsRoutes);
app.route('/api', api);

app.onError(errorHandler);

export default {
  port: 3000,
  fetch: app.fetch,
};
