import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const purchaseRouter = Router();
purchaseRouter.use(authenticate);

purchaseRouter.get('/suppliers', async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(suppliers);
});

const createSupplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional()
});

purchaseRouter.post('/suppliers', async (req, res) => {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const supplier = await prisma.supplier.create({ data: parsed.data });
  res.status(201).json(supplier);
});
