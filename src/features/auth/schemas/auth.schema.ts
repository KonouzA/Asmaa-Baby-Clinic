import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const sessionUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayName: z.string(),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: sessionUserSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
