# API Audit — Flora CRM (Phase 3)

> Verified 2026-09-22 after hardening pass. Convention: `withErrorHandling` + `requireAuth`/`requireRole` + `parseBody(Zod)` + `db.$transaction` + `logActivity`. Error shape `{ error }`, validation 422 (canonical), 401/403/404/409/500 via `ApiError`.

## Auth model

- Roles: `ADMIN`, `STAFF` (plain `User.role` string in DB; enforced as `z.enum(["ADMIN","STAFF"])` on staff APIs — no migration, smallest safe change).
- ADMIN-only: enquiry DELETE, task DELETE, site-visit DELETE (new), settings PATCH, staff GET/POST/PATCH.
- Any-staff (intentional, single-tenant CRM): quote create/edit/status/revise, enquiry create/edit/convert, project payments/status, tasks create/toggle, visits/measurements, settings GET, financial GET. All audited.
- No `middleware.ts`/`proxy.ts` by decision: per-handler `requireAuth` + `(crm)/layout.tsx` guard. Rationale: avoid Next 16 proxy pitfalls; protection verified per route below.

## Route table

| Route | Method | Auth | Validation | DB | Audit | Notes |
|---|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET,POST | NextAuth login, rate-limited 5/15min per email | credentials | `user.findUnique` | No (login) | OK |
| `/api/public/enquiries` | POST | Public + IP+phone throttle 10/15min → 429 | Zod inline, 400 | contact match (email→phone), create/update, `enquiry.create` | Yes `PUBLIC_ENQUIRY_CREATED` | Fixed: was unthrottled |
| `/api/enquiries` | GET | `requireAuth` | query unvalidated (status/page passthrough) | `findMany+count` paginated | No (read) | Known: validate filters later, low risk |
| `/api/enquiries` | POST | `requireAuth` | `enquiryFormSchema` 422 | txn company/contact/enquiry | Yes CREATE | OK; contact overwrite risk documented in plan |
| `/api/enquiries/[id]` | GET | `requireAuth` | id passthrough | `findFirst` + includes, `deletedAt:null` | No | OK |
| `/api/enquiries/[id]` | PATCH | `requireAuth` | `patchSchema` (all statuses incl. CONTACTED/VISIT_SCHEDULED/NEGOTIATING/LOST) 422 | `update` | Yes UPDATE | Canonical edit path |
| `/api/enquiries/[id]` | DELETE | `requireRole(ADMIN)` | — | soft-delete | Yes DELETE | OK |
| `/api/enquiries/[id]/edit` | PATCH | `requireAuth` | `editSchema` (duplicate of patchSchema) | `update` | Yes UPDATE | **Deprecated duplicate — use `[id]` PATCH**; kept for compat |
| `/api/enquiries/[id]/convert` | POST | `requireAuth` | `convertSchema` | guards (exists, no dup `enquiryId@unique`, quote APPROVED+belongs, not attached) + create + WON | Yes CREATE/Project | OK |
| `/api/quotations` | POST | `requireAuth` | `quotationFormSchema` | `calcTotals` + `generateQuoteNumber` in txn + enquiry→QUOTED | Yes | OK |
| `/api/quotations/[id]` | PATCH | `requireAuth` | `quotationFormSchema` | `findFirst(deletedAt:null)` + server `calcTotals` | Yes | OK |
| `/api/quotations/[id]/status` | PATCH | `requireAuth` | `statusSchema` + `allowedTransitions` | txn + enquiry side-effects | Yes STATUS_CHANGE | Any-staff intentional |
| `/api/quotations/[id]/revise` | POST | `requireAuth` | No body (clone op, no Zod needed) | `calcTotals` + new number, lineage in `ActivityLog.meta` | Yes CREATE | OK; direct PATCH→REVISED path documented as API-only |
| `/api/quotations/[id]/pdf` | GET | `requireAuth` | id passthrough | `findFirst(deletedAt:null)` + includes | No | **Fixed: was `findUnique` without soft-delete filter**; logo fallback added |
| `/api/projects/[id]/payments` | POST | `requireAuth` | `paymentSchema` (`amount>0`) | txn + overpay guard `contract−paid` | Yes CREATE | Canonical payment path (project scope). Duplicate `(crm)/projects/[id]/payments` REMOVED 2026-09-22 (no guards) |
| `/api/projects/[id]/schedules` | GET, POST | `requireAuth` | replace-plan Zod + `validatePaymentSchedule` (total == contract) | txn replace + audit | Yes | **Added 2026-09-22 — ships the dead PaymentSchedule model** |
| `/api/schedules/[id]` | PATCH, DELETE | `requireAuth` / `requireRole(ADMIN)` (DELETE) | Zod + plan-total recheck on amount change | txn + audit, visiting paid guard | Yes | **Added 2026-09-22** |
| `/api/site-visits/[id]/attachments` | POST | `requireAuth` | Zod (URL-based, no binary — no object storage) | create + audit | Yes | **Added 2026-09-22 — was list-only UI** |
| `/api/attachments/[id]` | DELETE | `requireRole(ADMIN)` | — | delete + audit | Yes | **Added 2026-09-22** |
| `/api/projects/[id]/status` | PATCH | `requireAuth` | `statusSchema` + transitions | `findFirst(deletedAt:null)` + update | Yes STATUS_CHANGE | OK |
| `/api/customers/[id]/financial` | GET | `requireAuth` (via wrapper) | id passthrough | `getCustomerFinancialSummary` | No | **Fixed: was manual `auth()` without wrapper** |
| `/api/measurements` | GET | `requireAuth` | `siteVisitId` required | `findMany` | No | **Fixed: was 500 on missing param, now 400** |
| `/api/measurements` | POST | `requireAuth` | `createMeasurementSchema` | visit check + create | Yes | OK |
| `/api/measurements/[id]` | PATCH,DELETE | `requireAuth` | PATCH Zod; DELETE id only | `update` / hard `delete` | Yes | OK |
| `/api/site-visits` | GET,POST | `requireAuth` | GET filters passthrough; POST `createSiteVisitSchema` | enquiry/project checks + create | POST Yes | OK |
| `/api/site-visits/[id]` | GET,PATCH | `requireAuth` | PATCH Zod (SCHEDULED/COMPLETED/CANCELLED) | `getSiteVisit` / update + auto `completedAt` | PATCH Yes | OK |
| `/api/site-visits/[id]` | DELETE | `requireRole(ADMIN)` | — | cascade delete | Yes DELETE | **Added: UI called it, route 405'd** |
| `/api/tasks` | GET | `requireAuth` | filters passthrough | deterministic order `done,dueDate,createdAt` | No | **Fixed: was enum `priority:desc` ordering** |
| `/api/tasks` | POST | `requireAuth` | `taskSchema` | **FK existence checks + require enquiry or project** | Yes | **Fixed: was orphan-capable** |
| `/api/tasks/[id]` | PATCH | `requireAuth` | `patchSchema` | `update` + `doneAt` | Yes | OK |
| `/api/tasks/[id]` | DELETE | `requireRole(ADMIN)` | — | hard delete | Yes | OK |
| `/api/settings` | GET | `requireAuth` | — | `findFirst` + defaults | No | OK |
| `/api/settings` | PATCH | `requireRole(ADMIN)` | `settingsSchema` | upsert | Yes | OK |
| `/api/staff` | GET,POST | `requireRole(ADMIN)` via wrapper | `createStaffSchema` (`role: ADMIN\|STAFF`, pw min 8) 422 | safe `select`, bcrypt(12), dup-email 409 | Yes | **Fixed: was manual auth + `session!` + no wrapper** |
| `/api/staff/[id]` | GET,PATCH | `requireRole(ADMIN)` via wrapper | update schema (pw optional but min 8 if set) | dup-email check, hash, safe select | Yes | **Fixed: was 1-char password capable** |

## Duplicates resolved / documented

- Enquiry edit: `[id]/edit PATCH` marked deprecated duplicate of `[id] PATCH` (kept for compat, same fields).
- List GETs (`enquiries`, `tasks`, `site-visits`, `measurements`) validate query via shared `parseQuery` (422 on bad status/page/ids) — added 2026-09-22.
- Payments: project API is canonical. `lib/actions/payments.ts` (`quotationId` scope, zero UI callers) retained read-only for legacy quotation ledger display; **duplicate `(crm)/projects/[id]/payments` deleted**; `payment-schedule.ts roundMoney` re-exports `lib/finance` (single source).
- Quotation math: server `calcTotals` authoritative; builder preview now calls it (was 4th implementation).
- Outstanding: single formula in `src/lib/finance.ts` reused by customer summary + dashboard (was ×3).
- Ledger: debits mirror `lifetimeRevenue` (converted quotes excluded — was double-counted).

## Remaining low-risk gaps (accepted)

- GET filter/id validation passthrough on list/detail routes (no injection — Prisma parameterization; strict Zod later).
- `User.role` stays String in DB (validated at API boundary; enum migration deferred — needs DB migration + backfill).
- `PaymentSchedule` model + validator retained but unwired — ship-or-delete decision deferred to business (no safe auto-choice).
