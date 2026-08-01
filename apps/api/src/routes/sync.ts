import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const syncRouter = Router();
syncRouter.use(authenticate);

const syncEventSchema = z.object({
  deviceId: z.string(),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  entityType: z.string(),
  entityId: z.string(),
  payload: z.record(z.any())
});

syncRouter.post('/events', async (req, res) => {
  const parsed = syncEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const event = await prisma.syncEvent.create({
    data: {
      ...parsed.data,
      status: 'PENDING'
    }
  });

  res.status(201).json(event);
});

syncRouter.get('/events/:deviceId', async (req, res) => {
  const events = await prisma.syncEvent.findMany({
    where: { deviceId: req.params.deviceId, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 100
  });

  res.json(events);
});
