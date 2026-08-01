import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { printReceipt } from '../services/printer.js';

export const printerRouter = Router();
printerRouter.use(authenticate);

const printSchema = z.object({
  invoiceNumber: z.string(),
  lines: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative()
    })
  )
});

printerRouter.post('/receipt', async (req, res) => {
  const parsed = printSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  await printReceipt(parsed.data);
  res.json({ status: 'queued' });
});
