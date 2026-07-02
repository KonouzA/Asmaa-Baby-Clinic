import { z } from "zod";

export const createExpenseSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  value: z.number().nonnegative("Value must be zero or more"),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;

// ── Response shape (from expenses.service.ts) ───────────────────────────────────

export type Expense = {
  id: string;
  year: number;
  month: number;
  name: string;
  description: string | null;
  value: number;
  created_at: string;
  updated_at: string;
};
