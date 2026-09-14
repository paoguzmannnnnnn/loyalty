Customer Loyalty App — Digital Stamp Cards

A full-stack loyalty platform where customers collect digital stamps and redeem rewards, and businesses issue stamps by scanning a QR code. Built as an MVP and deployed end-to-end.

Stack: NestJS · TypeORM · PostgreSQL · React (Vite + TypeScript) · Docker

🔗 Live demo:[https://loyalty-web-chi.vercel.app] (Backend runs on a free tier and may take ~30–60s to wake up on the first request.)

What it does
Customers sign up, join a business, and get a digital stamp card. They collect stamps and bank rewards they can later redeem.
Businesses log in to an admin panel, scan the customer's QR code (or enter their ID), issue stamps, and redeem completed rewards.
Every action is recorded in an audit log the business can search and filter.

Key features
Auth with roles — JWT authentication with separate customer and business roles, and role-guarded actions.
Reliable stamp issuing — stamps are stored as an append-only ledger with idempotency keys and atomic transactions, so a double-tap or a retry never double-counts a stamp.
Rewards — completing a card banks a persistent reward that stays until the business redeems it (earning ≠ redeeming).
QR flow — the customer's card shows a QR code; the business scans it with the camera to load and stamp the card, with manual ID entry as a fallback.
Audit log — stamp issues, redemptions, and reversals are logged inside the same transaction as the action, with filters and search.
Reversible stamps — a stamp can be reverted (append a correcting entry, never delete), with a clear active/reverted status.
Session persistence — login is remembered across refreshes; the card auto-refreshes.
Themeable — re-skinning for a new business (logo, colors, fonts) is a single central config change.

Tech stack
Backend: NestJS, TypeORM, PostgreSQL, Docker (local via Docker Compose)
Frontend: React, Vite, TypeScript
Auth: JWT (customer / business roles)
Deployment: Backend on Render + Neon (PostgreSQL), frontend on Vercel

Architecture notes
Monorepo (pnpm + Turborepo): apps/api (backend) and apps/web (frontend).
The frontend is split into clear modules: API calls, screens (login / register / customer / business), theming, and session handling.
Data integrity is the priority: the stamp ledger is append-only and every write that changes a balance runs in a transaction alongside its audit-log entry.

Run it locally
1. Install (monorepo)
pnpm install
2. Start the database
docker compose up -d
3. Environment variables

Copy the example env file to .env and fill in your own values:

DATABASE_URL=your-postgres-url
JWT_SECRET=your-secret
NODE_ENV=development

.env is git-ignored — never commit real secrets.

4. Run backend and frontend
pnpm --filter api run start:dev
pnpm --filter web run dev
Deployment
Backend: Render (build pnpm install && pnpm --filter api run build, start pnpm --filter api run start:prod), connected to a Neon PostgreSQL database.
Frontend: Vercel (root apps/web, with VITE_API_URL pointing to the backend).
