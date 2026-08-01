import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const reportsRouter = Router();
reportsRouter.use(authenticate);

reportsRouter.get('/dashboard', async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [invoiceAggregate, topProducts, lowStock] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { createdAt: { gte: today }, status: 'COMPLETED' }
    }),
    prisma.invoiceLine.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    prisma.inventoryStock.findMany({
      where: {
        quantityOnHand: { lte: 5 }
      },
      include: { variant: { include: { product: true } }, warehouse: true },
      take: 10
    })
  ]);

  res.json({
    todaysSales: invoiceAggregate._sum.totalAmount ?? 0,
    todaysInvoices: invoiceAggregate._count.id,
    topProducts,
    lowStock
  });
});
