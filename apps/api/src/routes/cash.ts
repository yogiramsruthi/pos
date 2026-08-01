import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const cashRouter = Router();
cashRouter.use(authenticate);

cashRouter.get('/sessions', async (_req, res) => {
  const sessions = await prisma.cashRegisterSession.findMany({
    include: { movements: true, openedBy: true, closedBy: true },
    orderBy: { openedAt: 'desc' }
  });
  res.json(sessions);
});

const openSessionSchema = z.object({
  openingBalance: z.number().nonnegative(),
  notes: z.string().optional()
});

cashRouter.post('/sessions/open', async (req, res) => {
  const parsed = openSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const session = await prisma.cashRegisterSession.create({
    data: {
      openingBalance: parsed.data.openingBalance,
      notes: parsed.data.notes,
      openedByUserId: (req as { user?: { userId: string } }).user?.userId ?? null
    }
  });

  res.status(201).json(session);
});
