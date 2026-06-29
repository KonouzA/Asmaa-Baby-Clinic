import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error';

const app = new Hono();

app.use('*', cors({ origin: '*' })); // Required for the Tauri WebView to call the sidecar

app.get('/health', (c) => c.json({ ok: true }));

app.onError(errorHandler);

export default {
  port: 3000,
  fetch: app.fetch,
};
