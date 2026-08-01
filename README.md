# Garments POS Web + Desktop App

Production-ready Point of Sale (POS) system for garments retail (T-shirts, shirts, trousers/pants, men/women categories), designed for responsive web use and Windows desktop packaging.

## 1) Scope

This repository is structured for phased delivery:

1. **Phase 1 (current design baseline)**
   - Database schema
   - API structure and endpoint contract
2. **Phase 2**
   - Core inventory + billing workflows
3. **Phase 3**
   - Purchase, customer, cash management modules
4. **Phase 4**
   - Reports/P&L/dashboard/export
5. **Phase 5**
   - Electron packaging + thermal printer integration + hardening

---

## 2) Target Tech Stack

- **Frontend:** React (or Next.js), Tailwind CSS, mobile-first responsive UI
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL (transaction-safe inventory + billing)
- **Desktop:** Electron for Windows packaging
- **Offline:** IndexedDB cache + sync queue
- **Thermal Printing:** ESC/POS integration (`node-thermal-printer` and/or QZ Tray/WebUSB path)
- **Auth:** Role-based access (Admin, Manager, Cashier, Staff)

---

## 3) High-Level Architecture

- **Client (Web/Electron Renderer):**
  - POS billing, inventory, purchase, reports UI
  - Local cache and offline queue (IndexedDB)
- **API Server (Express):**
  - Authentication/authorization
  - Business modules (inventory, sales, purchase, customer, cash, reports)
  - Audit logging and validation
- **Database (PostgreSQL):**
  - Relational schema with transactional integrity
- **Printer Layer:**
  - Receipt + barcode-label print adapters for USB/Bluetooth/LAN thermal printers

---

## 4) Database Schema (ER Baseline)

> Primary design objective: variant-level stock control (size + color) with strong sales/purchase traceability.

### Core Masters

- `users` (id, name, phone, email, password_hash, role, is_active, created_at)
- `stores` (id, code, name, address, phone, is_active)
- `categories` (id, name, parent_id nullable)
- `brands` (id, name)
- `tax_rates` (id, name, rate_percent)
- `sizes` (id, code, label, sort_order)
- `colors` (id, name, hex_code)
- `suppliers` (id, name, phone, email, address, gst_number)
- `customers` (id, name, phone, email, address, dob, anniversary, loyalty_tier, default_discount_type, default_discount_value, credit_limit, opening_balance)

### Catalog & Inventory

- `products` (id, category_id, brand_id, name, sku_prefix, fabric, description, hsn_code, is_active)
- `product_variants` (id, product_id, size_id, color_id, sku, barcode, mrp, cost_price, selling_price, tax_rate_id, is_active)
- `inventory_balances` (id, store_id, variant_id, qty_on_hand, qty_reserved, reorder_level)
- `inventory_transactions` (id, store_id, variant_id, tx_type, qty, unit_cost, ref_type, ref_id, note, created_by, created_at)
- `stock_adjustments` (id, store_id, reason, note, created_by, created_at)
- `stock_adjustment_items` (id, adjustment_id, variant_id, qty_delta, unit_cost)

### Sales & Billing

- `sales_invoices` (id, store_id, invoice_no, invoice_date, customer_id nullable, cashier_id, status, subtotal, item_discount_total, bill_discount_total, tax_total, round_off, grand_total, paid_total, balance_due)
- `sales_invoice_items` (id, invoice_id, variant_id, qty, mrp, unit_price, discount_type, discount_value, discount_amount, tax_rate, tax_amount, line_total)
- `sales_payments` (id, invoice_id, mode, amount, reference_no, paid_at)
- `parked_bills` (id, store_id, token_no, payload_json, created_by, created_at, expires_at)
- `sales_returns` (id, store_id, return_no, original_invoice_id, customer_id, reason, subtotal, tax_total, grand_total, refund_status, created_by, created_at)
- `sales_return_items` (id, return_id, invoice_item_id, variant_id, qty, unit_price, tax_amount, line_total)
- `refund_payments` (id, return_id, mode, amount, reference_no, paid_at)

### Purchase

- `purchase_orders` (id, store_id, supplier_id, po_no, po_date, status, subtotal, tax_total, grand_total)
- `purchase_order_items` (id, po_id, variant_id, qty_ordered, cost_price, tax_rate, tax_amount, line_total)
- `grns` (id, store_id, supplier_id, grn_no, grn_date, po_id nullable, status)
- `grn_items` (id, grn_id, variant_id, qty_received, cost_price, tax_rate, tax_amount, line_total)
- `purchase_invoices` (id, store_id, supplier_id, invoice_no, invoice_date, grn_id nullable, subtotal, tax_total, grand_total, due_amount, status)
- `supplier_payments` (id, purchase_invoice_id, mode, amount, reference_no, paid_at)

### Cash Management

- `cash_sessions` (id, store_id, opened_by, opened_at, opening_cash, closed_by nullable, closed_at nullable, expected_cash nullable, actual_cash nullable, discrepancy nullable, status)
- `cash_movements` (id, session_id, movement_type, amount, reason, note, created_by, created_at)
- `cash_denominations` (id, session_id, denomination_value, count)

### Discounts, Loyalty, Offers

- `discount_rules` (id, name, scope, customer_tier nullable, category_id nullable, discount_type, discount_value, stackable, start_at, end_at, is_active)
- `customer_discount_history` (id, customer_id, invoice_id, rule_id nullable, discount_amount, applied_by, applied_at)
- `loyalty_ledgers` (id, customer_id, tx_type, points, ref_type, ref_id, created_at)

### Audit/Support

- `activity_logs` (id, user_id, module, action, ref_type, ref_id, payload_json, created_at)
- `app_settings` (id, key, value_json)
- `sync_queue` (id, entity_type, entity_id, operation, payload_json, sync_status, retry_count, last_error, created_at)

### Key Relationships

- `products 1:N product_variants`
- `product_variants 1:N inventory_balances` (per store)
- `sales_invoices 1:N sales_invoice_items`, `sales_invoices 1:N sales_payments`
- `purchase_orders 1:N purchase_order_items`, `grns 1:N grn_items`
- `cash_sessions 1:N cash_movements`
- `customers 1:N sales_invoices`, `suppliers 1:N purchase_orders/purchase_invoices`

---

## 5) REST API Structure (v1)

Base path: `/api/v1`

### Auth & Users

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`
- `GET /users` (Admin/Manager)
- `POST /users` (Admin)

### Catalog & Inventory

- `GET /categories`, `POST /categories`
- `GET /products`, `POST /products`, `GET /products/:id`, `PATCH /products/:id`
- `GET /variants`, `POST /variants`, `PATCH /variants/:id`
- `POST /variants/:id/barcode/regenerate`
- `POST /barcodes/print` (bulk label print)
- `POST /inventory/stock-in`
- `POST /inventory/stock-out`
- `POST /inventory/adjustments`
- `GET /inventory/balances`
- `GET /inventory/transactions`
- `GET /inventory/low-stock`
- `POST /inventory/scan-search`

### Billing & Returns

- `POST /sales/invoices` (create bill)
- `GET /sales/invoices/:id`
- `POST /sales/invoices/:id/payments`
- `POST /sales/invoices/:id/print-receipt`
- `POST /sales/invoices/:id/reprint-receipt`
- `POST /sales/park`
- `GET /sales/parked`
- `POST /sales/parked/:id/resume`
- `POST /sales/returns`
- `POST /sales/returns/:id/refund`

### Customers & Discounts

- `GET /customers`, `POST /customers`, `PATCH /customers/:id`
- `GET /customers/:id/purchase-history`
- `GET /customers/:id/discount-history`
- `GET /discount-rules`, `POST /discount-rules`, `PATCH /discount-rules/:id`
- `POST /billing/apply-customer-discount`

### Purchase & Suppliers

- `GET /suppliers`, `POST /suppliers`
- `POST /purchase/orders`, `GET /purchase/orders/:id`
- `POST /purchase/grns`, `GET /purchase/grns/:id`
- `POST /purchase/invoices`, `GET /purchase/invoices/:id`
- `POST /purchase/invoices/:id/payments`

### Cash Management

- `POST /cash/sessions/open`
- `POST /cash/sessions/:id/close`
- `POST /cash/movements`
- `POST /cash/denominations`
- `GET /cash/sessions/:id/summary`

### Reports & Dashboard

- `GET /dashboard/kpis`
- `GET /reports/sales`
- `GET /reports/inventory-valuation`
- `GET /reports/fast-slow-moving`
- `GET /reports/tax-summary`
- `GET /reports/profit-loss`
- `GET /reports/cash-summary`
- `GET /reports/export?type=excel|pdf`

### Sync & Health

- `POST /sync/push`
- `GET /sync/pull`
- `GET /health`

---

## 6) Barcode, Scanning, and Printing Design

- Barcode generated per `product_variant` (CODE128/EAN-13 strategy configurable).
- Scan support:
  - USB/Bluetooth scanner in keyboard mode (focused hidden input)
  - Mobile camera scanning via ZXing/Quagga on supported devices
- Printing:
  - Receipt template renderer -> ESC/POS command stream
  - Label print payload for roll/sheet sizes (58mm/80mm and configurable label dimensions)
  - Reprint endpoint for receipts and barcode labels

---

## 7) Offline-First Strategy

- Cache product/customer/master data in IndexedDB.
- Queue offline writes (bill, payment, stock adjustment) in `sync_queue`.
- Use idempotent sync keys for conflict-safe replay.
- Prioritize sales and payment sync when connection restores.

---

## 8) Role & Permission Matrix (Baseline)

- **Admin:** full system control, pricing/tax/settings/user management
- **Manager:** inventory, purchases, reports, controlled overrides
- **Cashier:** POS billing, returns (restricted), customer actions
- **Staff:** limited stock operations and lookup

---

## 9) Seed Data Expectations

Seed dataset should include:

- Categories: Men, Women, Kids + subcategories
- Sample brands/fabrics/sizes/colors
- 50+ product variants with SKU/barcode, prices, tax rates
- Demo customers (tiered discounts) and suppliers
- Opening stock and sample sales/purchase entries

---

## 10) Next Implementation Steps

1. Create migration files for all tables above.
2. Implement Auth, Product, Variant, and Inventory APIs first.
3. Build fast billing screen with barcode-first flow and receipt printing.
4. Add customer discount auto-apply + override rules.
5. Add purchase, cash, and reports modules.
6. Package with Electron and finalize printer adapters for Windows deployment.

