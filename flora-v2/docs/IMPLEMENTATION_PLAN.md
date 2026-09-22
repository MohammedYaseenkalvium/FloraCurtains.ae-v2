# Flora Curtains CRM — Implementation Plan (Phase 0 Audit)

> Generated: 2026-09-21. Branch: `feature/security-hardening` (clean except untracked `repomix-output.xml`).
> Philosophy: functionality → correctness → security → tests → UI polish → GSAP. No UI redesign in backend phases.
> All claims verified by direct file reads on 2026-09-21. No code changed in Phase 0.

## 1. Current architecture

**Stack (verified `package.json`):** Next.js 16.2.6 (App Router, `output: standalone`), React 19.2.4, TypeScript 5 (strict), Tailwind 3.4.17, Prisma 6.8.2 + PostgreSQL, NextAuth 5 beta (credentials + JWT), Zod 4.4.3, react-hook-form 7.75 + @hookform/resolvers, @react-pdf/renderer 4.5.1, bcryptjs 3, Vitest 2.1.9. Radix dialog/dropdown/select + lucide-react installed but barely consumed by CRM.

**Route groups (`src/app`):**

- `(auth)/login` — credentials login.
- `(crm)/` — guarded by `src/app/(crm)/layout.tsx` (`auth()` + `redirect("/login")`): `dashboard`, `enquiries`, `quotations`, `projects`, `payments`, `customers/[id]`, `tasks`, `site-visits`, `staff`, `settings`, `inventory` (placeholder).
- `(public)/` — `PublicHeader/Footer` + public pages + `QuoteForm` → `POST /api/public/enquiries`.
- `api/**` — 23 route files (see §3). Primary write surface. Convention: `withErrorHandling` + `requireAuth`/`requireRole` + `parseBody(Zod)` + `db.$transaction` + `logActivity` (`src/lib/api.ts`, `src/lib/activity.ts`).

**Shared libs (`src/lib`):**

| Module | State |
|---|---|
| `db.ts` | Singleton Prisma client, query log in dev only. OK. |
| `api.ts` | `ApiError`, `requireAuth`, `requireRole`, `parseBody` (422), `withErrorHandling` (P2025→404, P2002→409, else 500, no leak). Canonical — use everywhere. |
| `auth.ts` | Credentials + bcrypt + per-email rate limit (5/15 min). No custom `secret` (Auth.js v5 auto-reads `AUTH_SECRET`). JWT → session (`id`, `role`). OK. |
| `activity.ts` | `logActivity(session, action, entityType, …)`, swallows audit failures. Used by all mutating routes. OK. |
| `quotation.ts` | `calcTotals` (rounded), `quoteNumberPrefix/nextQuoteNumber/generateQuoteNumber`. Unit-tested. Canonical for quotes. |
| `rate-limit.ts` | In-memory fixed-window + cleanup. **Only wired to login.** Single-instance safe; needs Redis for multi-instance (README already warns). |
| `customer-financial.ts` | `getCustomerFinancialSummary` (1 consumer: `api/customers/[id]/financial`), `getAllOutstandingBalances` (0 consumers). Contains **ledger double-count bug** (see §6). |
| `payment-schedule.ts` | `validatePaymentSchedule` + helpers. **Dead: zero imports** outside itself. |
| `site-visits.ts` | `getSiteVisits/getSiteVisit` used by site-visit routes. OK. |
| `actions/payments.ts` | `"use server"` `createPayment({quotationId…})` + `getPayments(quotationId)`. **Divergent duplicate** of project-payments API (see §6). |
| `pdf.tsx` | @react-pdf quotation PDF. `fs.readFileSync(logoPath)` at module load; hardcoded header address; unrounded line math. |
| `types/index.ts` | `enquiryFormSchema`, `quotationFormSchema`, `QuotationLineItem`, `EnquiryWithRelations/ProjectWithRelations` (latter two unused by pages — pages inline includes). |

**AuthZ model:** `User.role` is plain `String @default("STAFF")` (`prisma/schema.prisma:449-458`) — no enum. Only `ADMIN` is special-cased (enquiry DELETE, task DELETE, settings PATCH, staff routes). Everything else is any-authenticated-user. `assignedTo` on Enquiry/Task/SiteVisit is free-text `String?`, not a User FK. No `middleware.ts`/`proxy.ts` — protection is per-handler discipline only (verified: no such files).

**DB (`prisma/schema.prisma`, 489 lines):** Company → Contact → Enquiry → Quotation → Project → Payment (+ PaymentSchedule, SiteVisit → MeasurementSheet + SiteVisitAttachment, Task, User, AppSettings, ActivityLog). Soft-delete (`deletedAt` + index) on Enquiry/Quotation/Project only. No Customer model (Contact+Company ad-hoc). No Inventory model. `Payment.projectId` + `Payment.quotationId` both optional, no constraint/index. `Quotation.items` is Json (no line-item table). `PaymentSchedule` model exists, unwired. `SiteVisitStatus.RESCHEDULED` unreachable. `ProjectStatus` has no CANCELLED. `QuotationStatus.REVISED` is both a transition target and a new-row initial status (ambiguous).

**Tests/config/docs/git:** 1 test file (`src/lib/quotation.test.ts`, 12 tests for calc/quote-number only). `vitest.config.ts` includes `src/**/*.test.ts` only. `npm run lint` = bare `eslint`; no `typecheck` script; `tsconfig` strict but no `noUnusedLocals` etc. `.env` local-only, correctly git-ignored; no `.env.example`; env read only via `env("DATABASE_URL")` + implicit `AUTH_SECRET` + `NODE_ENV` — no zod env validation. README good (stack/domain/setup/arch/security) but missing test scope + middleware absence note. `AGENTS.md`/`CLAUDE.md` are boilerplate only. `docs/` did not exist before this plan. `config/` empty dir. `scripts/create-adminmama.ts` 0 bytes (dead); `create-user.ts` solid. `repomix-output.xml` (656 KB) untracked at repo root — delete + ignore, never commit. Root sibling `public/` alongside `flora-v2/public/` is confusing. TS hygiene good: 0 `any`, 0 suppressions; `!` only 6× in staff routes (`session!.user` — inconsistent auth pattern); `console.*` only errors + seed/create-user logs.

## 2. Current features — working / partial / missing

### Working (verify before regressing)

- Auth: login, JWT session, CRM layout guard, per-email login rate limit (`src/lib/auth.ts`, `src/app/(crm)/layout.tsx`).
- Enquiry create (CRM, transactional contact/company/enquiry + audit) + paginated list/filter (`src/app/api/enquiries/route.ts`).
- Enquiry detail PATCH, admin soft-delete, edit-route PATCH, convert-to-project with guards (dup project per `enquiryId @unique`, quote belongs + APPROVED, quote not already attached) + project create + enquiry→WON (`src/app/api/enquiries/[id]/*`).
- Quotation create/PATCH with server-authoritative `calcTotals`, quoteNumber in-txn + unique constraint, APPROVED lock, status machine w/ enquiry side-effects, revise-by-clone, PDF render (`src/app/api/quotations/**`, `src/lib/quotation.ts`).
- Project status machine mirrored in API + UI (`src/app/api/projects/[id]/status/route.ts`, `ProjectStatusWorkflow.tsx`).
- Project payment create w/ `amount>0` + overpay guard vs `contract − paid` + txn + audit (`src/app/api/projects/[id]/payments/route.ts`).
- Tasks: create/toggle/delete, per-enquiry/per-project embed + global list; DELETE admin-gated (`src/app/api/tasks/**`).
- Site visits + measurements CRUD w/ zod + visit/project/enquiries checks, auto `completedAt` (`src/app/api/site-visits/**`, `src/app/api/measurements/**`).
- Staff list/search/pagination behind admin gate; create/edit with bcrypt(12) + safe `select` + audit (`src/app/api/staff/**`).
- Settings GET-defaults + admin PATCH upsert + audit (`src/app/api/settings/route.ts`).
- Audit trail on all mutating routes (via `logActivity` or direct create in public/staff routes).
- Public enquiry POST w/ zod + email→phone contact match + enquiry create + activity log (`src/app/api/public/enquiries/route.ts`).
- Dashboard renders KPIs/pipelines/activity (`src/app/(crm)/dashboard/page.tsx`) — numbers suspect (see §6).

### Partially implemented (works but wrong/incomplete)

- **Enquiry lifecycle:** `CONTACTED / VISIT_SCHEDULED / NEGOTIATING / LOST` have no API/UI path; only `QUOTED` (on quote create), `WON` (on quote APPROVED — premature, before project exists; approved-but-unconverted leads vanish from `activeLeads`), `WON` (on convert), `QUOTED` (on REJECTED) are written. Contact dedupe by phone then unconditional `contact.update({name,email,companyId})` can reassign global company and corrupt prior enquiries (`src/app/api/enquiries/route.ts:62-76`); `companyId` on Contact vs Enquiry can diverge.
- **Customers/companies:** detail page + financial summary render, but `Statement PDF` / `Record Payment` buttons are dead (`CustomerFinancialDashboard.tsx:106-111`); no customer edit/delete; `View Leads` unfiltered; B2B badge uses `companyName != null` not `customerType`; financial route hand-rolls `auth()` instead of helpers (`src/app/api/customers/[id]/financial/route.ts:5-16`).
- **Quotations:** revision model flawed (see §6); no DELETE endpoint despite `deletedAt`; PDF route uses `findUnique` without `deletedAt` filter (renders soft-deleted); quote-number regex parses counter not year, lexicographic order breaks past 9999/non-padded (`src/lib/quotation.ts:23-40`); PDF logo `readFileSync` crashes if `public/images/Flora quotation logo.png` missing; header address hardcoded, ignores settings.
- **Projects:** `ON_HOLD → {IN_PROGRESS, INSTALLATION}` only (no resume to NOT_STARTED/SNAGGING, no hold→complete, pre-hold state lost); no CANCELLED, no delete, COMPLETED terminal (no reopen); `totalContractValue` freely editable at convert, not validated vs quote (silent variance); detail page duplicates badge/workflow/finance math locally.
- **Payments/financials:** highest-risk area — three outstanding formulas disagree; ledger double-counts converted quote→project; quotation payments are write-orphans (read but no create endpoint; UI only posts project payments); `PaymentSchedule` fully dead; `outstanding = max(0,…)` masks credit; payments page filter method-only (`src/lib/customer-financial.ts`, `dashboard/page.tsx:172-188`, `payments/page.tsx`, `PaymentLedger.tsx`).
- **Tasks:** schema/API allow `enquiryId=null, projectId=null` and both-set; global page creates floating tasks (`tasks/page.tsx:14`); `assignedTo` free text; `GET orderBy: {priority: desc}` on enum is DB-dependent; no overdue surfacing.
- **Site visits:** UI calls `DELETE /api/site-visits/:id` (`SiteVisitManager.tsx:246-293`) but route exports only GET/PATCH → 405; `RESCHEDULED` unreachable (schema has it, PATCH schema allows only SCHEDULED/COMPLETED/CANCELLED); attachments read-UI exists, upload API missing; measurements never feed QuotationBuilder (manual retype), no unit normalisation.
- **Staff:** only ADMIN special-cased; any other role string gets staff access; no deactivate/lock/`updatedAt`/last-login; roles not enum-validated server-side.
- **Settings:** `logoUrl`/`currency`/`defaultVatRate`/`quoteValidityDays` never consumed — formatters hardcode AED, builder hardcodes `vatRate: 5, validUntil: ""`, PDF header hardcoded.
- **Dashboard:** `Contract Value` labelled active-only but query has no status filter; finance recomputed inline (third formula); visits with null `scheduledAt` never surface; links to `/site-visits/${id}` 404 (no detail route); lead pipeline does 7 extra counts (fine at scale, `groupBy` later).

### Missing

- Inventory: placeholder page only (`src/app/(crm)/inventory/page.tsx` — "Coming Soon" + skeleton + disabled buttons). No model/API. Claim "structure already prepared" is aspirational.
- Payment schedules: model + validator exist, zero API/UI. Schedules can never be created or reconciled vs payments.
- Quotation DELETE; site-visit DELETE; attachment upload; customer edit/delete + statement PDF + record-payment; reschedule flow; project cancel/reopen; staff deactivate; settings consumers (VAT default, validity default, currency, logo); overdue/escalation surfacing; `loading.tsx`/skeletons + standardized empty/error states per page (only inventory has decorative skeleton).

## 3. API audit (23 files — full table in `docs/API_AUDIT.md` next)

Conventions: `withErrorHandling` + `requireAuth`/`requireRole` + `parseBody` + txn + `logActivity`. Deviations:

- **No middleware/proxy.** All protection is per-handler. No unauthenticated routes today except login + public enquiry POST (correct), but one forgotten `requireAuth()` in a future route is unprotected.
- **ADMIN-gated (4):** enquiry DELETE, task DELETE, settings PATCH, staff routes (staff via manual `auth()`+check + `session!`, no `withErrorHandling` — works but inconsistent; GET has no try/catch).
- **Any-staff-can-do:** quote APPROVE/REJECT, quote create/edit/revise, enquiry convert (creates project + WON), project payment (records money), project status, financial GET (all-customer PII), settings GET.
- **Validation gaps:** revise POST has no Zod/body at all; `measurements GET` missing `siteVisitId` throws plain Error → 500 not 400 (`src/app/api/measurements/route.ts:86`); tasks/site-visits/enquiries GET filters unvalidated; ids unvalidated on financial/staff-GET/pdf/DELETEs; staff PATCH `password` has no `min()` (1-char accepted — guarded only by blank-check); tasks POST accepts `enquiryId/projectId` without FK existence check (orphans); public enquiry + staff use manual `safeParse` → 400 vs canonical 422.
- **Duplicates:** enquiry PATCH (`[id]`) vs `edit/PATCH` (near-identical — consolidate); payments (project API vs quotation server action — consolidate, see §6).
- **Audit:** all mutating routes log. No gaps.

## 4. Duplicates / dead code / contradictions

1. **Totals math ×4:** `lib/quotation.ts` (rounded, authoritative) vs `QuotationBuilder.tsx:78-92` (unrounded preview → ±0.01 drift) vs `lib/pdf.tsx:929-933` (unrounded per-line) vs `quotations/[id]/page.tsx:345-348` (display). Server data safe; previews can mismatch.
2. **Outstanding math ×3:** dashboard (`Σ contract − Σ ALL payments`, unscoped — quotation payments deflate project outstanding) vs `getCustomerFinancialSummary` (`projectValues + standaloneApproved − allPayments`) vs `getAllOutstandingBalances` (`max(projectValues, totalApproved) − allPayments`). Any mixed quote+project customer → three pages disagree.
3. **Ledger double-count:** `buildLedger` debits all APPROVED quotes + all projects while `lifetimeRevenue` dedupes — converted quote appears twice → overstates debt (`src/lib/customer-financial.ts:303-331` vs `:240-253`). `LedgerEntry.type "INVOICE"` never emitted.
4. **Payments dual-write:** `api/projects/[id]/payments POST` (`payment{projectId}`) vs `actions/payments.createPayment` (`payment{quotationId}`) — copy-pasted guard/log, divergent models. `getPayments(quotationId)` has no API equivalent.
5. **Status/label maps redefined per page:** `statusLabels/statusStyles` (dashboard, ProjectStatusWorkflow, project detail, site-visits, CustomerFinancialDashboard, QuotationWorkflow), `methodIcons/typeColors/methodLabels` (payments page, PaymentLedger, financial dashboard). Extract once.
6. **Dead:** `payment-schedule.ts` + `PaymentSchedule` model; `Statement PDF`/`Record Payment` buttons; site-visit DELETE target; `RESCHEDULED`; attachment upload; inventory actions; settings `logoUrl/currency/defaultVatRate/quoteValidityDays` consumers; quotation `PATCH→REVISED` path (API-reachable, UI-unreachable); `LedgerEntry "INVOICE"`; `EnquiryWithRelations/ProjectWithRelations` (unused); `config/` (empty); `scripts/create-adminmama.ts` (0 bytes); `MobileMenu.tsx` (0 bytes, public header inlines menu); `src/app/page.tsx` 536-line duplicate of `(public)` pages (dead mobile `<Menu>`, divergent logo asset).
7. **UI-only bypasses:** floating tasks (global page), dead buttons above, site-visit DELETE 405, quotation PATCH→REVISED, `alert()/confirm()` in EnquiryForm/EnquiryEditForm/SiteVisitManager/MeasurementManager instead of toasts.

## 5. Security risks (fix in Phase 20 order, but note now)

- S1 (high): any STAFF can APPROVE quotes, convert enquiries (create projects), record payments, change project status. If business requires admin/finance gate, add `requireRole` — else formally accept any-staff model. Decide in Phase 2.
- S2 (high): `Payment` dual model + ledger/outstanding divergence → finance misstatement risk. Consolidate before any finance sign-off (Phase 8).
- S3 (med): contact overwrite by phone (`api/enquiries/route.ts:62-76`) + public-enquiry update path can reassign identity/attribution. Scope updates, prefer match-then-link, audit B2B merges (Phase 4/5).
- S4 (med): public enquiry POST has no rate limit (login does). Add throttle + honeypot/min-delay (Phase 4).
- S5 (med): staff PATCH weak password (`max(100)` only); no role enum; no deactivate. Harden (Phase 12).
- S6 (low-med): no middleware; per-handler auth only. Add `proxy.ts`/middleware edge guard or strict review checklist (Phase 2).
- S7 (low): `measurements GET` 500-on-bad-input leaks implementation shape; staff/financial/public routes skip `withErrorHandling` sanitization. Standardize (Phase 16).
- S8 (low): in-memory limiter breaks on multi-instance; PDF `readFileSync` crash-DoS if asset missing; quote-number ordering fragility. Harden in Phases 6/26.
- IDOR posture: routes scope by id + `deletedAt` but no ownership checks (single-tenant CRM — acceptable if any-staff model is intentional; document in Phase 20 with tests: cross-customer ID swap, non-admin mutating admin resources, unauthenticated API calls, client-manipulated totals).

## 6. Key file references (load-bearing)

- Money truth today: `src/lib/quotation.ts:7-20` (rounded, tested) vs `src/lib/customer-financial.ts:240-256,303-355,389-390` (buggy ledger) vs `src/app/(crm)/dashboard/page.tsx:172-188` (unscoped).
- Payments: `src/app/api/projects/[id]/payments/route.ts:30-36` (guard) vs `src/lib/actions/payments.ts:25-38` (duplicate guard, quotation scope).
- Lifecycle: `src/app/api/quotations/[id]/status/route.ts:74-83` (WON-on-APPROVE), `src/app/api/enquiries/[id]/convert/route.ts:35-160` (guards), `src/app/(crm)/dashboard/page.tsx:91-98` (WON/LOST excluded).
- Visits: `SiteVisitManager.tsx:246-293` (DELETE call) vs `src/app/api/site-visits/[id]/route.ts` (no DELETE).
- Auth helpers: `src/lib/api.ts:32-59,95-103`; login: `src/lib/auth.ts:21-44`; guards: `src/app/(crm)/layout.tsx:11-15`.

## 7. Proposed implementation order (with dependencies)

> Smallest safe change per phase. After each phase: `npm test` + `npm run lint` + `npm run build`. Commit per logical unit (never `.env`, secrets, dumps, `repomix-output.xml`).

1. **Phase 1 — DB/domain semantics (no migration unless proven needed).** Define: `totalPaid/outstanding/contractValue/quotationTotal/VAT/discount/lifetimeRevenue` semantics; decide quotation-payment vs project-payment canonical model; decide PaymentSchedule ship-or-delete; decide Customer = Contact(+Company) explicitly. Dependency: none. Unblocks 6/8/15.
2. **Phase 2 — AuthZ policy.** Formalize roles (keep `ADMIN` + `STAFF` unless proven otherwise; consider `UserRole` enum migration — smallest safe change); add `proxy.ts`/middleware or review gate; replace staff manual `auth()`+`session!` with helpers; decide admin-gates for approve/convert/payment/status. Unblocks 3/12/20.
3. **Phase 3 — API consolidation + `docs/API_AUDIT.md`.** Canonical table; merge enquiry edit duplicate; wrap staff/financial/public in shared helpers (or document deliberate deviations); fix `measurements GET` 400; validate ids + GET filters; add missing rate limit on public route. Unblocks 4-14.
4. **Phase 4 — Enquiries.** Status machine (CONTACTED/VISIT_SCHEDULED/NEGOTIATING/LOST paths), fix premature WON, scope contact updates, company-attribution integrity, delete/archive semantics, error/success states. Depends on 1-3.
5. **Phase 5 — Customers/companies.** Wire or remove dead buttons; customer edit/archive; filtered `View Leads`; B2B badge from `customerType`; helper-based financial route. Depends on 1/3/4.
6. **Phase 6 — Quotations.** Single calc import (builder preview + PDF + detail call `calcTotals`); REVISED semantics (row vs status — pick one, add `revisedFromId` or remove path); add DELETE or remove `deletedAt` read-filter lie; PDF `deletedAt` filter + settings-driven header + logo fallback; quote-number ordering hardening; edge-case tests (0/1/N items, 0%/5% VAT, discounts, decimals, large, invalid). Depends on 1/3.
7. **Phase 7 — Projects.** Hold/resume/cancel/reopen policy (add CANCELLED or document terminal COMPLETED); validate contract-vs-quote variance; dedupe detail math into helpers. Depends on 1/4/6.
8. **Phase 8 — Payments/financials (high priority).** One outstanding formula reused by dashboard/customer/lists; ledger dedupe mirroring `lifetimeRevenue`; resolve quotation-payment orphan (endpoint or remove relation/UI); overpay/negative/zero/missing-project guards + `createdBy` + audit + idempotency key/double-submit guard; no edit/delete or secured + documented. Depends on 1-3/6/7.
9. **Phase 9 — Schedules.** Ship (CRUD + sequence/%/amount/due/status + reconcile vs payments, never conflated) or delete model+lib. Depends on 8.
10. **Phase 10 — Tasks.** FK existence checks; forbid floating tasks (require enquiry or project); explicit priority sort; overdue surfacing; keep admin DELETE. Depends on 3.
11. **Phase 11 — Visits/measurements.** Add `DELETE` or remove UI call; implement RESCHEDULED or remove enum; attachment upload or remove UI; measure→quote handoff or explicit manual step; unit handling. Depends on 3/4/7.
12. **Phase 12 — Staff.** Enum-validate roles; deactivate/lock; `updatedAt`/last-login; resolve `assignedTo` strategy. Depends on 2/3.
13. **Phase 13 — Inventory.** Scope to existing model (none) → keep placeholder, remove "structure prepared" claim, unlink quotation items; or new minimal model only if business demands. Depends on 1.
14. **Phase 14 — Settings.** Consume VAT default/validity/currency/logo everywhere or remove fields; protect sensitive keys. Depends on 3/6.
15. **Phase 15 — Dashboard.** Authoritative queries, correct labels/filters, reuse finance helpers, `groupBy` pipelines, null-`scheduledAt` handling, fix dead `/site-visits/${id}` links. Depends on 8/11.
16. **Phase 16-18 — Errors/loading/validation.** Standardize 401/403/404/422/409/500 (no leaks); loading/skeleton + empty + error per data screen; server-side validation + edge-case matrix. Depends on 3-15.
17. **Phase 19 — Tests.** Add: quotation calc (extend), payment guards/overpay, task authZ, status transitions, API validation, finance consistency, authN/Z. Fix `lint` path + add `typecheck`. Depends on all above.
18. **Phase 20 — Security audit.** IDOR/ownership, role escalation, financial manipulation, unauth calls, XSS/CSRF, secrets, abuse/rate limits. Depends on 2/3/8/12/19.
19. **Phase 21 — QA + `docs/QA_REPORT.md`.** Full lifecycle walk PUBLIC→ENQUIRY→CUSTOMER→QUOTE→APPROVAL→PROJECT→VISIT→MEASURE→TASK→PAYMENT→COMPLETION. Depends on all functional phases.
20. **Phase 22-26 — UI/RWD/a11y/GSAP/perf.** Only after QA passes. Hierarchy/spacing/typography/tables/forms/nav/mobile; contrast/labels/focus/semantics/`next/image`; subtle GSAP w/ `prefers-reduced-motion` (never in critical finance flows); N+1/bundle/image/server-client audit. Depends on 21.
21. **Phase 27 — Final audit + `docs/FINAL_PROJECT_REPORT.md`.** Tests/lint/build green, diff clean, no secrets/logs/temp artifacts/dead code/duplicates/accidental schema changes.

## 8. Dependency graph

```
Phase 1 (domain semantics)
 ├─→ 6 (quotes) ─→ 7 (projects) ─→ 8 (payments) ─→ 9 (schedules) ─→ 15 (dashboard)
 ├─→ 4 (enquiries) ─→ 5 (customers) ─→ 15
 ├─→ 10 (tasks) ─→ 15
 └─→ 11 (visits/measure) ─→ 15
Phase 2 (authZ) ─→ 3 (API) ─→ 4..14 ─→ 16/17/18 ─→ 19 (tests) ─→ 20 (sec) ─→ 21 (QA)
21 ─→ 22/23/24 ─→ 25 (GSAP) ─→ 26 (perf) ─→ 27 (final)
Cross-cutting: 12 (staff roles) blocks 2/20; 13 (inventory) isolated; 14 (settings) feeds 6/15.
```

## 9. Immediate next step (Phase 1 entry)

1. Freeze finance semantics doc (one paragraph per metric).
2. Decide: single payment scope (recommend: project-only; remove quotation-payment writes or ship endpoint — do not leave orphan).
3. Decide: PaymentSchedule ship-or-delete; RESCHEDULED/CANCELLED/REVISED semantics; Customer definition.
4. Only then write code — smallest migration (prefer `UserRole` enum + payment constraint/index + `revisedFromId` only if chosen).
