# 02 — CRM Modules

Shell: dark sidebar (drawer on mobile) + topbar + content. Solid surfaces; glass only on drawer overlay/dialogs.

| Module | Structure |
|---|---|
| Dashboard | Greeting header, 4 icon MetricCards, finance snapshot, pipelines, visits, activity |
| Customers | Breadcrumb + CustomerHeader + 4 stat cards + tabs (Overview/Enquiries/Payments/Projects/Quotations/Ledger) |
| Enquiries | Filter chips + Card table shell + EmptyState + pagination |
| Quotations | Icon-pill list; builder = Details/Items/Review&Send stepper (logic untouched) |
| Projects | Header + finance cards (+progress) + tabs (Overview/Tasks&Visits/Payments incl. schedules) |
| Payments | Filter + scroll table; ledger shows contract/paid/balance/progress |
| Tasks | Manager list (parent-required); global page read-only |
| Site Visits | Table + manager (schedule/reschedule/complete/cancel/delete, measurements, URL attachments) |
| Inventory | Placeholder (no tables in DB) — intentional read-only |
| Staff | ADMIN list/search; role shown; permission-aware pages |
| Settings | ADMIN writes; single-column sections |

Rules: `StatusBadge` for plain pills; page headers via `PageHeader`; destructive acts need ConfirmDialog + ADMIN server gate.
