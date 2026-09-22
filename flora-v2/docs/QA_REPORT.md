# QA Report — Functional Walkthrough (Phase 21)

> Date: 2026-09-22. Method: code-path walk + targeted reads (no prod DB). Build/lint/tests verified after changes.

## Lifecycle trace

1. **Public website → enquiry**: `QuoteForm` posts to `POST /api/public/enquiries` (throttled 10/15min, Zod, email→phone match). PASS (logic verified; live submit needs staging).
2. **CRM enquiry**: list/filter/paginated; detail PATCH supports full lifecycle incl. CONTACTED/VISIT_SCHEDULED/NEGOTIATING/LOST (schema allows, UI edit form exposes). Convert guards verified. Known: contact phone-overwrite can reassign company — flagged, not auto-merged (needs business rule).
3. **Customer**: detail + `getCustomerFinancialSummary` renders; dead buttons wired (print + link to project). No customer edit/delete by design (Contact is identity).
4. **Quotation**: create/PATCH server `calcTotals`; preview now uses same function; status machine + revise clone; PDF soft-delete filtered + logo fallback. Known: direct PATCH→REVISED reachable via API only (documented).
5. **Approval → project**: convert requires APPROVED + belonging + unattached; contract value free-edit (variance allowed, recorded via quote link).
6. **Site visit → measurements**: create/PATCH/DELETE (DELETE added); measurements CRUD validated; measure→quote is manual retype (documented limitation).
7. **Tasks**: create requires enquiry/project + FK checks; global page read-only list; toggle/delete work; DELETE admin-only.
8. **Payment → completion**: project payments with overpay guard + audit; outstanding unified (`finance.ts`); dashboard scoped to project payments; ledger deduped. Quotation payments display-only (no create endpoint — intentional).
9. **Project completion**: status machine enforced; COMPLETED terminal (no reopen — documented); no CANCELLED (documented).

## Bugs found & fixed this pass

- Ledger double-count (converted quote debited twice) → fixed in `buildLedger`.
- Dashboard mixed quotation payments into project outstanding + mislabeled active value → scoped + relabeled.
- PDF crashed if logo missing; rendered soft-deleted quotes → fallback + `deletedAt` filter.
- `GET /api/measurements` 500 on missing param → 400.
- Staff APIs used manual auth + `session!`, weak password → `requireRole` + wrapper + `ADMIN|STAFF` enum + pw min 8.
- Financial API lacked wrapper → wrapped.
- Site-visit DELETE 405 → route added (ADMIN).
- Tasks allowed floating/orphan + unstable ordering → require parent + FK checks + deterministic order; global page read-only.
- Builder preview rounding drift → uses `calcTotals`.
- Quotations page dead `totalCollected` → removed.
- Customer dashboard dead buttons → wired; unused imports removed.
- Public form: phone `text` → `tel` + autocomplete; error box now `role=alert` red; menu `aria-expanded/controls`.
- Inventory false "structure prepared" claim → corrected.

## Remaining known limitations (accepted, documented)

- `User.role` String in DB (API-validated; enum migration deferred).
- `PaymentSchedule` unwired (ship-or-delete needs business call).
- Attachments upload missing (list-only).
- `RESCHEDULED`/`CANCELLED`/`REVISED` semantics partially unreachable (documented).
- GET filters/ids passthrough (low risk).
- No `loading.tsx` skeletons per page (empty states exist; loading deferred to UI phase).
- GSAP intentionally not added (no new dep; CSS transitions only — see final report).
