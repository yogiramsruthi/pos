export interface InventoryVariant {
  id: string;
  barcode: string;
  sizeLabel: string;
  colorLabel: string;
  sellingPrice: string;
  stocks: Array<{ quantityOnHand: number }>;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  brand?: string;
  category?: { name: string };
  variants: InventoryVariant[];
}

export interface DashboardData {
  todaysSales: number;
  todaysInvoices: number;
  topProducts: Array<{ variantId: string; _sum: { quantity: number | null } }>;
  lowStock: Array<{
    id: string;
    quantityOnHand: number;
    warehouse: { name: string };
    variant: { product: { name: string }; sizeLabel: string; colorLabel: string };
  }>;
}
