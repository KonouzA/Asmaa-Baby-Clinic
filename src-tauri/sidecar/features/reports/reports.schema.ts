import { z } from 'zod';

export const reportCostsSchema = z.object({
  cost_electricity_clinic: z.number().nonnegative().optional(),
  cost_electricity_stairs: z.number().nonnegative().optional(),
  cost_water: z.number().nonnegative().optional(),
  cost_phone_personal: z.number().nonnegative().optional(),
  cost_landline: z.number().nonnegative().optional(),
  cost_internet: z.number().nonnegative().optional(),
  cost_cleaning: z.number().nonnegative().optional(),
  cost_secretary: z.number().nonnegative().optional(),
  cost_medical_waste: z.number().nonnegative().optional(),
  cost_others: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const reportYearQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export const visitStatsQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
});

export type ReportCostsDto = z.infer<typeof reportCostsSchema>;
export type VisitStatsQuery = z.infer<typeof visitStatsQuerySchema>;
