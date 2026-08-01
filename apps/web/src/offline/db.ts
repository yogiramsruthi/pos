import Dexie, { type EntityTable } from 'dexie';
import type { DashboardData, InventoryProduct } from '../types';

export interface CachedDashboard {
  id: string;
  payload: DashboardData;
  updatedAt: string;
}

export interface SyncQueueItem {
  id?: number;
  operation: string;
  endpoint: string;
  payload: unknown;
  retries: number;
  createdAt: string;
}

export const db = new Dexie('posOfflineCache') as Dexie & {
  inventory: EntityTable<InventoryProduct, 'id'>;
  dashboard: EntityTable<CachedDashboard, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
};

db.version(1).stores({
  inventory: 'id,name,sku',
  dashboard: 'id,updatedAt',
  syncQueue: '++id,operation,endpoint,createdAt'
});
