# POS Database Schema (PostgreSQL + Prisma)

## ER Diagram (Mermaid)

```mermaid
erDiagram
  USER ||--o{ CASH_REGISTER_SESSION : opens
  USER ||--o{ AUDIT_LOG : creates
  CATEGORY ||--o{ PRODUCT : has
  PRODUCT ||--o{ PRODUCT_VARIANT : has
  PRODUCT_VARIANT ||--o{ INVENTORY_STOCK : stocked_as
  WAREHOUSE ||--o{ INVENTORY_STOCK : stores
  PRODUCT_VARIANT ||--o{ STOCK_MOVEMENT : moves
  WAREHOUSE ||--o{ STOCK_MOVEMENT : tracks
  CUSTOMER ||--o{ INVOICE : purchases
  INVOICE ||--o{ INVOICE_LINE : contains
  PRODUCT_VARIANT ||--o{ INVOICE_LINE : sold_as
  INVOICE ||--o{ PAYMENT : paid_by
  SUPPLIER ||--o{ PURCHASE_ORDER : receives
  PURCHASE_ORDER ||--o{ PURCHASE_ORDER_ITEM : has
  PRODUCT_VARIANT ||--o{ PURCHASE_ORDER_ITEM : purchased_as
  PURCHASE_ORDER ||--o{ GOODS_RECEIPT : fulfilled_by
  MEMBERSHIP_TIER ||--o{ CUSTOMER : classifies
  CUSTOMER ||--o{ CUSTOMER_DISCOUNT : gets
```

## Key transactional rules

- `Invoice` creation + `InventoryStock` decrement + `StockMovement` insert happen in one serializable transaction.
- Invoice numbering uses `InvoiceSequence` keyed by date (`INV-YYYYMMDD-#####`).
- Variant stock is unique by `(warehouseId, productVariantId)`.
- Product variant identity is unique by `(productId, sizeLabel, colorLabel)`.
- Customer phone is unique for fast lookup and khata tracking.

## Migration strategy

1. Run Prisma migration against PostgreSQL: `npm run prisma:migrate -w apps/api`.
2. Generate Prisma client: `npm run prisma:generate -w apps/api`.
3. Seed base catalog/users/stock: `npm run db:seed`.
