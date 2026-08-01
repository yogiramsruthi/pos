import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        include: {
          stocks: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(products);
});

const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  categoryId: z.string().uuid(),
  brand: z.string().optional(),
  fabric: z.string().optional(),
  description: z.string().optional()
});

inventoryRouter.post('/products', async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

inventoryRouter.get('/variants/scan/:barcode', async (req, res) => {
  const variant = await prisma.productVariant.findUnique({
    where: { barcode: req.params.barcode },
    include: { product: true, stocks: true }
  });

  if (!variant) {
    res.status(404).json({ message: 'Variant not found' });
    return;
  }

  res.json(variant);
});
