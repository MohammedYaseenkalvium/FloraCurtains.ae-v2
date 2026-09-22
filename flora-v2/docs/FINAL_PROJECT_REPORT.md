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
- `next/image` for public header/footer logos (priority/lazy); hero/portfolio imagery still raw `<img>` (deferred, needs dimension audit).
- Payments table wrapped in `overflow-x-auto` with `min-w` (was squeeze/overflow on mobile like other tables).
- `(crm)/loading.tsx` skeleton + `not-found.tsx` added (CRM had neither).
- Duplicate payment route deleted (one less conflicting handler); no other bundle growth except `gsap` (reveal only).

## 9. UI/UX improvements (functionality-safe only)

No redesign. Added: `ui/ConfirmDialog` (Radix focus-trap/Esc) replacing `window.confirm` in visits/measurements with inline `role=alert` errors; `ui/Reveal` dashboard entrance; `(crm)` loading/not-found states; payments mobile overflow fix; search input label; `next/image` logos. Design-system token migration + full responsive overhaul explicitly deferred (see plan Phase 22) to avoid regressing working flows.

## 10. GSAP usage

`gsap` added for one purposeful pattern: `ui/Reveal` entrance on dashboard KPI + financial snapshot sections (0.45s opacity/y, staggered 0.08s, client-only after mount so no hydration mismatch, fully skipped under `prefers-reduced-motion`). `ui/ConfirmDialog` (Radix) intentionally has no entrance animation (fast destructive confirm). No animation in finance write flows.

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
