# pos

Prompt: Point of Sale (POS) Web App for Garment Retail
Build a full-featured, production-ready Point of Sale (POS) web application for a garments retail store selling T-shirts, shirts, pants/trousers, and men's & women's clothing items. The app must work as a responsive web app (mobile + desktop browser) and also be packaged as a Windows desktop app.
1. Tech Stack Requirements
Frontend: React (or Next.js) with a responsive, touch-friendly UI (Tailwind CSS)
Backend: Node.js/Express or similar REST/GraphQL API
Database: PostgreSQL or MySQL (relational, since billing/inventory need transactional integrity)
Desktop packaging: Electron (wraps the web app for Windows desktop, offline-capable)
Thermal printing: Support ESC/POS thermal printers (58mm/80mm) via USB/Bluetooth/network, using a library like node-thermal-printer or browser-based WebUSB/qz-tray for print jobs
Authentication: Role-based login (Admin, Manager, Cashier, Staff)
Offline support: Local caching/sync (IndexedDB) so billing can continue during internet outages
2. Core Modules
A. Product & Inventory Management
Categories: Men's, Women's, Kids (optional), with sub-categories (T-Shirts, Shirts, Trousers, Pants)
Product attributes: SKU/barcode, size (S/M/L/XL/XXL or numeric), color, brand, fabric, MRP, cost price, selling price, tax (GST/VAT %)
Variant management (size + color combinations as separate stock units)
Stock in/out tracking, low-stock alerts, stock adjustment/audit log
Multi-location/warehouse support (optional, for multiple store branches)
B1. Barcode Generation & Scanning
Auto-generate unique barcodes (CODE128/EAN-13) per product variant (size+color combo) at the time of stock creation
Bulk barcode label printing (with product name, price, size) on label/thermal printers, sheet or roll layout, adjustable label size
Barcode scanning via USB/Bluetooth handheld scanner (keyboard-emulation input) and via mobile camera (using device camera + a JS barcode-scanning library like quagga.js/zxing)
Instant "add to cart" on scan during billing, with sound/visual confirmation
Scan-to-search in inventory screen for quick stock lookup/edit
Support re-printing/regenerating barcode labels for existing SKUs
B. Billing & Invoicing
Fast POS billing screen: search by name/barcode, quantity, size/color selector
Auto-calculate tax, discounts (item-level & bill-level), round-off
Multiple payment modes: cash, card, UPI/wallet, split payment
Hold/resume bills (park a sale and return later)
Return/exchange & refund handling linked to original invoice
Print thermal receipt (auto and manual reprint) + optional A4/PDF invoice
Invoice numbering (auto sequence), GST-compliant invoice format if applicable
C. Cash Management
Cash drawer/register open & close (day-start, day-end reconciliation)
Track cash in, cash out, expenses, denominations count
Daily cash summary report (expected vs actual, discrepancy flagging)
D. Customer Management
Customer database: name, phone, email, address, purchase history
Loyalty points / membership tiers (optional)
Customer-wise outstanding/credit tracking (khata/udhaar system)
SMS/WhatsApp notification integration for bills (optional)
D1. Customer Discount Management
Per-customer default discount % (flat or category-wise, e.g. extra off on Men's wear)
Tiered/membership-based discounts (e.g. Silver/Gold/Platinum customers get different %)
Auto-apply eligible customer discount at billing when customer is selected, with option for cashier to override (with permission control)
Combine or restrict stacking with item-level/bill-level discounts and coupons (configurable rule)
Discount usage history per customer, visible in customer profile
Time-bound or occasion-based discounts (birthday, festival) tied to customer profile
E. Purchase Management
Supplier/vendor database
Purchase orders, goods received notes (GRN)
Purchase invoice entry (auto stock update on receipt)
Supplier payment tracking & outstanding dues
F. Profit & Loss / Reports
P&L statement (revenue, COGS, expenses, net profit) by day/week/month/year
Sales reports: by product, category, size, staff/cashier, payment mode
Inventory valuation report, fast/slow-moving item report
Tax reports (GST summary)
Exportable to Excel/PDF
3. Additional Features
Dashboard with KPIs (today's sales, top products, low stock, pending dues)
Discount/coupon/offer management
Multi-user roles & permissions, activity/audit logs
Barcode label printing (for new stock)
Data backup & export
Multi-store support with centralized reporting (if scalable)
Dark mode / theme customization
Notifications (low stock, pending payments)
4. Platform Requirements
Mobile compatibility: fully responsive UI, usable on phones/tablets for quick billing
Windows desktop compatibility: Electron-wrapped app with offline mode and local thermal printer access
Web deployment: hosted version accessible via browser for admin/reporting
5. Deliverables Expected
Database schema (ER diagram) covering products, inventory, sales, purchases, customers, suppliers, cash, users
REST API design/documentation for all modules
React frontend with POS billing screen, inventory screen, reports/dashboard
Electron build config for Windows desktop packaging
Thermal printer integration module (ESC/POS)
Sample seed data for testing (garment products, sizes, prices)
Build this step by step: first the database schema and API structure, then core billing + inventory, then purchase/customer/cash modules, then reports, and finally desktop packaging and thermal printing integration.