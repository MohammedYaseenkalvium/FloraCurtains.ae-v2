# 05 — States

- Loading: route `(crm)/loading.tsx` skeleton; button spinners (`Saving…`); form-local `loading` flags.
- Empty: `EmptyState` with icon/title/hint/action on every list (leads, quotes, projects, payments, tasks, visits, staff, ledger, schedules, attachments).
- Error: inline `role=alert` blocks (never `alert()`); API `{ error }` JSON (401/403/404/409/422/500, no leaks); `error.tsx` + `(crm)/not-found.tsx` boundaries.
- Success: confirmation panels (quote request, enquiry save tick, toasts intentionally absent — no toast lib; inline states instead).
- Confirmations: `ConfirmDialog` for delete/destructive; ADMIN server gates regardless.
