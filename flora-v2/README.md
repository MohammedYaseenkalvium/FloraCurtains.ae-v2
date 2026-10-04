# Flora Curtains — CRM + Public Website

Flora Curtains LLC (Abu Dhabi, UAE) — internal CRM for curtains & interior operations plus the public marketing website, in one Next.js monorepo (`flora-v2/`).

- **CRM** — dashboard, enquiries → quotations → projects → payments, customers, tasks, site visits, measurements, inventory, staff, settings, PDF quotations, activity audit trail.
- **Public website** — home, about, services (+ detail pages), portfolio, contact, get-quote wizard; enquiry submissions flow straight into the CRM pipeline.

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript (strict)
- **Prisma 6** + PostgreSQL · **Tailwind CSS 3** (flora-* design tokens)
- **Auth:** NextAuth 5 credentials (JWT) → **migrating to Clerk** (`@clerk/nextjs`, `proxy.ts`, Organizations + local access states). See `.planning/CLERK-MIGRATION-MAP.md`
- **Zod** validation · **react-hook-form** · **@react-pdf/renderer** (quotation PDFs) · **Vitest** · **GSAP** (website motion)

## Getting started

```bash
cd flora-v2
npm install                 # installs deps and runs `prisma generate`
```

Create `.env` (never commit):

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="<random 32-byte hex>"   # e.g. `openssl rand -hex 32` (NextAuth, until Clerk cutover)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."   # Clerk (migration in progress)
CLERK_SECRET_KEY="sk_..."                    # server-only, never expose/commit
```

```bash
npx prisma migrate dev      # creates/updates tables
npm run seed                # optional seed data
npm run dev                 # http://localhost:3000
```

Create a login (current NextAuth flow):

```bash
npx ts-node scripts/create-user.ts --email you@flora.com --name "You" --role ADMIN
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / run (standalone output) |
| `npm run lint` | ESLint (0 errors; 2 pre-existing warnings) |
| `npm test` | Unit + source-contract tests (Vitest) |
| `npm run seed` | Seed the database |
| `npx ts-node scripts/smoke-api.ts` | API smoke matrix (27 routes, kept artifact) |

## Architecture notes

- **API routes** (`src/app/api/**`) are the primary write surface: `withErrorHandling` + `requireAuth`/`requireRole` + Zod `parseBody`; multi-table writes in `db.$transaction`; `logActivity` audit trail.
- **Money math** lives in `src/lib/finance.ts` (single canonical pipeline); display via `formatAED`.
- **Server-first** pages (async server components, direct Prisma reads); `"use client"` only where interactivity requires it.
- **Route groups:** `(public)` marketing site · `(crm)` authenticated CRM · `(auth)` login.
- **Design system:** `docs/design-system.md` is the SSOT; flora-* Tailwind tokens only, no raw hex in class strings.
- **Planning docs:** `.planning/` (GSD phases 01–07 verified) and `.planning/website/` (W1–W5 website workstream).

## Security

- Never commit secrets (`.env` is gitignored). Rotate any credential that leaks.
- Login is rate-limited per email; the in-memory limiter assumes a single instance — use Redis/Upstash for multi-instance deploys.
- Destructive/admin operations require the `ADMIN` role, enforced server-side (never UI-only).

## Deployment

`output: "standalone"` build; needs `DATABASE_URL` (+ Clerk keys after cutover). Documented target: Vercel + PostgreSQL/Neon.
