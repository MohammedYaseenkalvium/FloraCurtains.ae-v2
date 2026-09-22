# Final Project Report (Phases 1–27)

## 1. Architecture

Next.js 16 App Router + React 19 + TS strict + Tailwind 3 + Prisma 6/Postgres + NextAuth 5 credentials/JWT + Zod + RHF + @react-pdf. Write surface: `src/app/api/**` wrapped in `withErrorHandling` + `requireAuth`/`requireRole` + `parseBody` + txn + `logActivity`. Canonical libs: `api.ts`, `auth.ts` (login throttle), `activity.ts`, `quotation.ts` (tested), **`finance.ts` (new single source of truth)**, `rate-limit.ts` (login + public enquiry), `site-visits.ts`.

## 2. Features completed

- Enquiry lifecycle incl. all statuses at API level, convert guards, soft-delete (ADMIN).
- Quotations: server-authoritative totals, numbering, status machine, revise clone, PDF (soft-delete aware, logo fallback).
- Projects: status machine, convert validation, finance display.
- Payments: project-scoped create + overpay guard + audit; unified outstanding; deduped ledger.
- Tasks: parent-required + FK checks, deterministic order, ADMIN delete, a11y labels.
- Visits/measurements: full CRUD + new ADMIN DELETE for visits.
- Staff: ADMIN-gated, role enum `ADMIN|STAFF`, pw min 8, safe selects.
- Settings: ADMIN write, defaults read.
- Dashboard: project-scoped finance, correct labels, shared formatters.
- Public enquiry: throttled + validated + audited.

## 3. APIs

23 files — see `docs/API_AUDIT.md`. All mutating routes authenticated + validated + audited. ADMIN gates: enquiry delete, task delete, visit delete, settings write, staff all. Deviations documented (GET passthrough, no middleware by decision).

## 4. Database models

Prisma source of truth, no migration this pass (smallest safe change). Noted: no `Customer` (Contact+Company by design), `Payment` dual-FK (project canonical, quotation display-only), `PaymentSchedule` unwired (decision deferred), `User.role` String validated at boundary, `Quotation.items` Json, soft-delete on Enquiry/Quotation/Project.

## 5. Security changes

Login throttle (kept) + public throttle (added); staff hardening; financial/customer routes wrapped; measurements 400; task parent/FK enforcement; visit delete ADMIN; no secret leaks (error sanitizer kept); `session!` removed.

## 6. Financial logic

`src/lib/finance.ts`: `roundMoney/formatAED/calcLifetimeRevenue (projectValues + standalone approved)/calcOutstanding clamp/sumPayments`. Applied to `customer-financial.ts` (both summary + all-balances), dashboard. Ledger mirrors revenue (no double-count). Builder preview calls `calcTotals`.

## 7. Tests

`npm test`: 18/18 pass (12 quotation + 6 finance). `npm run lint`: 0 errors (pre-existing warnings only). `npm run build`: must be green before merge (run in CI/staging with DB env).

## 8. Performance

- Dashboard: scoped payment select, `groupBy` noted for later; lead pipeline still 7 counts (fine at CRM scale).
- PDF: logo read once at module load with existence guard.
- No new deps; no bundle growth except `finance.ts` (tiny).

## 9. UI/UX improvements (functionality-safe only)

No redesign. Fixed: dead buttons wired, task a11y labels + visible focus, public menu aria + form autocomplete/`tel` + `role=alert` error, inventory copy corrected, dashboard labels. Design-system token migration + responsive overhaul explicitly deferred (see plan Phase 22) to avoid regressing working flows.

## 10. GSAP usage

Evaluated, intentionally deferred. Rationale: no new dependency while financial/authZ work was load-bearing; CSS transitions already cover hover/focus; animation in finance flows risks usability; `prefers-reduced-motion` posture kept. Add GSAP in dedicated UI phase only for dashboard cards/modal/list entrances.

## 11. Known limitations

See QA report §Remaining. Top: PaymentSchedule ship-or-delete; attachment upload; role enum migration; GET strict validation; per-page skeletons; measurement→quote handoff manual.

## 12. Deployment checklist

- [ ] `DATABASE_URL`, `AUTH_SECRET` set (no `.env` committed; no example file — add one ops-side if needed)
- [ ] `npx prisma migrate deploy` (no new migration this pass; apply pending existing)
- [ ] `npm test && npm run lint && npm run build` green in CI
- [ ] Seed + create ADMIN via `scripts/create-user.ts`
- [ ] Verify `public/images/Flora quotation logo.png` present (fallback exists regardless)
- [ ] Single-instance limiter posture confirmed (standalone); add Redis before multi-instance
- [ ] Never commit `.env`, secrets, dumps, `repomix-output.xml` (untracked at root — delete)
- [ ] Review logical commits, not one giant commit
