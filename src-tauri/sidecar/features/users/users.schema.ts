import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(), // zod v4: `z.email()` replaces the deprecated `z.string().email()`
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type User = CreateUserDto & { id: number };
