# Flora CRM

Internal CRM for Flora Interior / Flora Curtains (Abu Dhabi, UAE). Tracks the
sales funnel from enquiry to quotation to project to payment, with PDF
quotations, tasks, and an activity audit trail.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Prisma 6** + PostgreSQL (Neon)
- **NextAuth 5** (credentials, JWT sessions)
- **Zod** validation, **react-hook-form**
- **@react-pdf/renderer** for quotation PDFs
- **Tailwind CSS 3**

## Domain model

`Company` → `Contact` → `Enquiry` → `Quotation` → `Project` → `Payment`, plus
`Task`, `User`, `AppSettings`, and `ActivityLog`. Enquiries, quotations, and
projects support soft-deletion (`deletedAt`) and carry `createdById` /
`updatedById` audit fields.

## Getting started

```bash
npm install                 # installs deps and runs `prisma generate`
```

Create a `.env` with:

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="<random 32-byte hex>"   # e.g. `openssl rand -hex 32`
```

Apply the database schema and seed:

```bash
npx prisma migrate dev      # creates/updates tables
npm run seed                # optional seed data
```

Create a login:

```bash
npx ts-node scripts/create-user.ts --email you@flora.com --name "You" --role ADMIN
```

Run the dev server:

```bash
npm run dev                 # http://localhost:3000
```

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the dev server                 |
| `npm run build`  | Production build                     |
| `npm start`      | Run the production server            |
| `npm run lint`   | ESLint                               |
| `npm test`       | Run unit tests (Vitest)              |
| `npm run seed`   | Seed the database                    |

## Architecture notes

- **API routes** under `src/app/api/**` are the primary write surface. Each
  handler is wrapped with `withErrorHandling` (`src/lib/api.ts`) and uses
  `requireAuth` / `requireRole` for access control and `parseBody` for Zod
  validation. Multi-table writes run inside `db.$transaction`.
- **Authorization**: every endpoint requires a session; settings changes and
  deletions require the `ADMIN` role.
- **Auditing**: mutations call `logActivity` (`src/lib/activity.ts`) to write an
  `ActivityLog` entry.
- **Quotation math** lives in `src/lib/quotation.ts` (pure, unit-tested).
- **Login** is rate-limited per email (`src/lib/rate-limit.ts`).

## Security

- The credentials provider hashes passwords with bcrypt and rate-limits login
  attempts. The in-memory limiter assumes a single server instance (the
  `output: "standalone"` build); move it to a shared store (Redis/Upstash) for
  multi-instance deployments.
- Never commit real secrets. Rotate any credentials that have been committed.
