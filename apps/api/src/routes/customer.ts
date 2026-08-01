import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const customerRouter = Router();
customerRouter.use(authenticate);

customerRouter.get('/', async (_req, res) => {
  const customers = await prisma.customer.findMany({
    include: { tier: true, discounts: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(customers);
});

const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  address: z.string().optional(),
  tierId: z.string().uuid().optional(),
  defaultDiscountPercent: z.number().min(0).max(100).default(0)
});

customerRouter.post('/', async (req, res) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const customer = await prisma.customer.create({ data: parsed.data });
  res.status(201).json(customer);
});
