export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STAFF';

export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'SPLIT';

export interface InvoiceLineInput {
  variantId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
}

export interface SyncRequest {
  deviceId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}
