import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1),
  due_date: z.iso.date().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
  due_date: z.iso.date().nullable().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
