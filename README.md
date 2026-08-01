# Garment POS Monorepo

Production-oriented POS foundation for garments retail with web + API + desktop wrapper.

## Workspace layout

- `/apps/api` - Node.js + Express + Prisma backend
- `/apps/web` - React + Vite responsive POS frontend
- `/apps/desktop` - Electron Windows desktop wrapper
- `/packages/shared` - Shared TypeScript contracts
- `/docs` - Database and API architecture deliverables

## Quick start

```bash
npm install
```

### API

```bash
cp /home/runner/work/pos/pos/apps/api/.env.example /home/runner/work/pos/pos/apps/api/.env
npm run prisma:generate -w apps/api
npm run dev:api
```

### Web

```bash
npm run dev:web
```

### Desktop

```bash
POS_WEB_URL=http://localhost:5173 npm run dev:desktop
```

## Deliverables included

- Relational schema for inventory, billing, purchase, customer, supplier, cash, reporting, and sync events
- Seed data for garments (T-shirts, Shirts, Trousers) with size/color variants and stock
- REST API module scaffolding with validation and JWT auth
- Responsive POS screens for dashboard, inventory scan/search, and billing cart summary
- Offline caching scaffolding with IndexedDB (Dexie)
- Electron desktop wrapper and thermal print service module
- Database ERD + API contract documentation
