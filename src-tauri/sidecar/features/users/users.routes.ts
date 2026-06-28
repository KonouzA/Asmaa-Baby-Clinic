import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from './users.schema';
import { getUsers, createUser } from './users.service';

export const usersRoutes = new Hono()
  .get('/', (c) => c.json(getUsers()))
  .post('/', zValidator('json', createUserSchema), (c) => {
    const body = c.req.valid('json');
    return c.json(createUser(body), 201);
  });
