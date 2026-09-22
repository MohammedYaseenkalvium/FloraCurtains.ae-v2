# QA Report — Functional Walkthrough (Phase 21, updated 2026-09-22)

> Date: 2026-09-22 (brand/content pass). Method: code-path walk + targeted reads (no prod DB). Build/lint/tests verified after changes.
> Brand rule verified: the two logo assets are the SAME identity (F-leaf monogram + FLORA CURTAINS wordmark, same maroon) — `FLora quotation logo.png` (large master: public header/footer/PDF/Get Quote) and `logo.png` (compact lockup: 36px CRM sidebar). No logo was redesigned, replaced or altered.

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

## Remaining known limitations (accepted, documented) — superceded where noted 2026-09-22

- ~~`User.role` String in DB~~ → DONE: `UserRole` enum migrated (data-preserving).
- ~~`PaymentSchedule` unwired~~ → DONE: shipped (replace-plan API + per-milestone edit/delete + project UI).
- ~~Attachments upload missing~~ → DONE: URL-linking POST + ADMIN unlink + visit UI.
- ~~`RESCHEDULED`/`CANCELLED` unreachable~~ → DONE: `RESCHEDULED` with new-date flow; `CANCELLED` terminal project status.
- ~~GET filters/ids passthrough~~ → DONE: shared `parseBody`-style `parseQuery` (422).
- ~~No `loading.tsx` skeletons~~ → DONE: route-level `(crm)/loading.tsx` + `not-found.tsx` (per-page skeletons still minimal).
- ~~GSAP not added~~ → DONE: `gsap` + reduced-motion-aware `Reveal` on dashboard metrics only.

## 2026-09-22 brand/content addendum (all CLOSED)

- Public images were 404 (hero + 6 portfolio referenced but absent) → localized under `public/images/` instead of hotlinking.
- Reference repo studied (React/Vite old app): palette matches ours; harvested verified phones/address/1997 story; its testimonials are invented → NOT copied, section omitted.
- Contact/footer now carry showroom, direct line, WhatsApp, email; About carries the verified 1997→2023 story; services expanded to the 5 real offerings; QuoteForm options aligned; zero `window.confirm`/`alert` remain in `src/`.
