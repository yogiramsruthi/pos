# POS API Contracts (v1)

Base URL: `/api`

## Auth
- `POST /auth/login`

## Inventory & Barcode
- `GET /inventory/products`
- `POST /inventory/products`
- `GET /inventory/variants/scan/:barcode`

## Billing
- `POST /billing/invoices`

## Customers & Discount
- `GET /customers`
- `POST /customers`

## Purchase
- `GET /purchase/suppliers`
- `POST /purchase/suppliers`

## Cash Management
- `GET /cash/sessions`
- `POST /cash/sessions/open`

## Reports
- `GET /reports/dashboard`

## Thermal Printing
- `POST /print/receipt`

## Offline Sync
- `POST /sync/events`
- `GET /sync/events/:deviceId`

## Offline sync contract
Client caches product/customer/dashboard snapshots in IndexedDB and queues failed write operations with:
- `operation`
- `endpoint`
- `payload`
- `retries`

Queued operations should be replayed when network is available with idempotent server endpoints (planned with `SyncEvent` model).

## Auth rules
- Public: health, login.
- Protected: all other routes (JWT).
- Role checks are handled via `authorize(...)` middleware for sensitive modules.

## Validation standards
- All write endpoints validate body with Zod.
- On validation failure: `400 { errors: ... }`.
- Auth failure: `401`, permission failure: `403`, not found: `404`.
