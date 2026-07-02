import { z } from 'zod';

export const createExpenseSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  value: z.number().nonnegative(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseListQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;
