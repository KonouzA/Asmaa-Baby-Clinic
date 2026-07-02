import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import {
  createVisitSchema,
  updateVisitSchema,
  visitListQuerySchema,
} from './visits.schema';
import {
  listVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
  getVisitReceipt,
} from './visits.service';

function requireVisit(id: string) {
  const visit = getVisit(id);
  if (!visit) throw new HTTPException(404, { message: 'Visit not found' });
  return visit;
}

export const visitsRoutes = new Hono()
  .get('/', zValidator('query', visitListQuerySchema), (c) =>
    c.json(listVisits(c.req.valid('query'))),
  )
  .post('/', zValidator('json', createVisitSchema), (c) =>
    c.json(createVisit(c.req.valid('json')), 201),
  )
  .get('/:id', (c) => c.json(requireVisit(c.req.param('id'))))
  .put('/:id', zValidator('json', updateVisitSchema), (c) => {
    const id = c.req.param('id');
    requireVisit(id);
    const updated = updateVisit(id, c.req.valid('json'));
    return c.json(updated);
  })
  .delete('/:id', (c) => {
    requireVisit(c.req.param('id'));
    deleteVisit(c.req.param('id'));
    return c.body(null, 204);
  })
  .get('/:id/receipt', (c) => {
    const receipt = getVisitReceipt(c.req.param('id'));
    if (!receipt) throw new HTTPException(404, { message: 'Visit not found' });
    return c.json(receipt);
  });
