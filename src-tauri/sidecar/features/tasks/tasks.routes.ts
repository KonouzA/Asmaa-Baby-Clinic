import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';
import { listTasks, getTask, createTask, updateTask, deleteTask } from './tasks.service';

function requireTask(id: string) {
  const task = getTask(id);
  if (!task) throw new HTTPException(404, { message: 'Task not found' });
  return task;
}

export const tasksRoutes = new Hono()
  .get('/', (c) => c.json(listTasks()))
  .post('/', zValidator('json', createTaskSchema), (c) =>
    c.json(createTask(c.req.valid('json')), 201),
  )
  .put('/:id', zValidator('json', updateTaskSchema), (c) => {
    const id = c.req.param('id');
    requireTask(id);
    const updated = updateTask(id, c.req.valid('json'));
    return c.json(updated);
  })
  .delete('/:id', (c) => {
    requireTask(c.req.param('id'));
    deleteTask(c.req.param('id'));
    return c.body(null, 204);
  });
