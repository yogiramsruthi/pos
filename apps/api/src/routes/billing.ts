import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const billingRouter = Router();

billingRouter.use(authenticate);

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative()
});

const createInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  lines: z.array(lineSchema).min(1),
  billDiscountAmount: z.number().nonnegative().default(0),
  roundOffAmount: z.number().default(0),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'WALLET', 'SPLIT']),
  amountReceived: z.number().nonnegative()
});

billingRouter.post('/invoices', async (req, res) => {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten() });
    return;
  }

  const payload = parsed.data;
  const subtotal = payload.lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);
  const itemDiscount = payload.lines.reduce((acc, line) => acc + line.discountAmount, 0);
  const taxableAmount = subtotal - itemDiscount - payload.billDiscountAmount;
  const taxAmount = payload.lines.reduce(
    (acc, line) => acc + (line.quantity * line.unitPrice - line.discountAmount) * (line.taxRate / 100),
    0
  );
  const totalAmount = Number((taxableAmount + taxAmount + payload.roundOffAmount).toFixed(2));

  const result = await prisma.$transaction(async (tx) => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = await tx.invoiceSequence.upsert({
      where: { key: today },
      update: { currentValue: { increment: 1 } },
      create: { key: today, currentValue: 1 }
    });

    const invoiceNumber = `INV-${today}-${String(seq.currentValue).padStart(5, '0')}`;

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: payload.customerId,
        warehouseId: payload.warehouseId,
        subtotalAmount: subtotal,
        itemDiscountAmount: itemDiscount,
        billDiscountAmount: payload.billDiscountAmount,
        taxAmount,
        roundOffAmount: payload.roundOffAmount,
        totalAmount,
        paymentStatus: payload.amountReceived >= totalAmount ? 'PAID' : 'PARTIAL',
        lines: {
          create: payload.lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            taxRate: line.taxRate,
            taxAmount: Number(((line.quantity * line.unitPrice - line.discountAmount) * (line.taxRate / 100)).toFixed(2)),
            lineTotal: Number(
              (
                line.quantity * line.unitPrice -
                line.discountAmount +
                (line.quantity * line.unitPrice - line.discountAmount) * (line.taxRate / 100)
              ).toFixed(2)
            )
          }))
        },
        payments: {
          create: {
            mode: payload.paymentMode,
            amount: payload.amountReceived
          }
        }
      },
      include: { lines: true, payments: true }
    });

    for (const line of payload.lines) {
      await tx.inventoryStock.updateMany({
        where: {
          productVariantId: line.variantId,
          warehouseId: payload.warehouseId
        },
        data: {
          quantityOnHand: { decrement: line.quantity }
        }
      });

      await tx.stockMovement.create({
        data: {
          movementType: 'SALE',
          quantity: line.quantity,
          productVariantId: line.variantId,
          warehouseId: payload.warehouseId,
          reason: `Sold in invoice ${invoice.invoiceNumber}`
        }
      });
    }

    return invoice;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  });

  res.status(201).json(result);
});
