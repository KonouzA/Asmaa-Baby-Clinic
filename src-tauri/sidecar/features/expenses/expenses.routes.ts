import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { createExpenseSchema, expenseListQuerySchema, updateExpenseSchema } from './expenses.schema';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from './expenses.service';

function requireExpense(id: string) {
  const expense = getExpense(id);
  if (!expense) throw new HTTPException(404, { message: 'Expense not found' });
  return expense;
}

export const expensesRoutes = new Hono()
  // GET /api/expenses?year=YYYY&month=M
  .get('/', zValidator('query', expenseListQuerySchema), (c) =>
    c.json(listExpenses(c.req.valid('query'))),
  )
  .post('/', zValidator('json', createExpenseSchema), (c) =>
    c.json(createExpense(c.req.valid('json')), 201),
  )
  .put('/:id', zValidator('json', updateExpenseSchema), (c) => {
    requireExpense(c.req.param('id'));
    return c.json(updateExpense(c.req.param('id'), c.req.valid('json')));
  })
  .delete('/:id', (c) => {
    requireExpense(c.req.param('id'));
    deleteExpense(c.req.param('id'));
    return c.json(null);
  });
