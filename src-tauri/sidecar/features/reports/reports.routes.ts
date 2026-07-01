import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { reportCostsSchema, reportYearQuerySchema, visitStatsQuerySchema } from './reports.schema';
import {
  listReports,
  getMonthlyReport,
  upsertReport,
  getVisitStats,
  getPatientStats,
  getDashboard,
} from './reports.service';

const monthParamSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const reportsRoutes = new Hono()
  // GET /api/reports?year=2026 — all 12 months for the year
  .get('/', zValidator('query', reportYearQuerySchema), (c) =>
    c.json(listReports(c.req.valid('query').year)),
  )
  // GET /api/reports/visit-stats
  .get('/visit-stats', zValidator('query', visitStatsQuerySchema), (c) =>
    c.json(getVisitStats(c.req.valid('query'))),
  )
  // GET /api/reports/patient-stats
  .get('/patient-stats', (c) => c.json(getPatientStats()))
  // GET /api/reports/dashboard
  .get('/dashboard', (c) => c.json(getDashboard()))
  // GET /api/reports/:year/:month
  .get('/:year/:month', zValidator('param', monthParamSchema), (c) => {
    const { year, month } = c.req.valid('param');
    return c.json(getMonthlyReport(year, month));
  })
  // PUT /api/reports/:year/:month — upsert cost columns
  .put('/:year/:month', zValidator('param', monthParamSchema), zValidator('json', reportCostsSchema), (c) => {
    const { year, month } = c.req.valid('param');
    return c.json(upsertReport(year, month, c.req.valid('json')));
  });
