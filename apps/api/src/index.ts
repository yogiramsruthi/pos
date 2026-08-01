import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { billingRouter } from './routes/billing.js';
import { cashRouter } from './routes/cash.js';
import { customerRouter } from './routes/customer.js';
import { healthRouter } from './routes/health.js';
import { inventoryRouter } from './routes/inventory.js';
import { printerRouter } from './routes/printer.js';
import { purchaseRouter } from './routes/purchase.js';
import { reportsRouter } from './routes/reports.js';
import { syncRouter } from './routes/sync.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/billing', billingRouter);
app.use('/api/customers', customerRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/cash', cashRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/print', printerRouter);
app.use('/api/sync', syncRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`POS API running on port ${env.port}`);
});
