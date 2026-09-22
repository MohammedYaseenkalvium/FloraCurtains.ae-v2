# 03 — Components (`src/components/ui/`)

| Component | Use for | Don't use for |
|---|---|---|
| `Button` (primary/secondary/outline/ghost, sm/md/lg) | All CTA/submit/link actions | Plain text links |
| `Badge` + `StatusBadge` | Domain statuses (6 maps centralized) | Icon-rich quotation pills (kept variant) |
| `Card` | Table shells, section cards | KPI numbers (`MetricCard`) |
| `EmptyState` | Zero-data tables/lists | Errors (use `role=alert`) |
| `Skeleton` | Loading placeholders | Spinners on buttons (inline `animate-spin`) |
| `Tabs` | Customer/project workspace sections | Wizard flows (use steppers) |
| `MetricCard` | Dashboard KPIs with icon + href | Finance snapshot (static cards) |
| `PageHeader` | CRM page eyebrows/titles/actions | Public editorial headers |
| `ConfirmDialog` | All destructive confirms (Radix, focus trap) | `window.confirm` (banned) |
| `Reveal` | Section/metric entrances only | Rows, buttons, finance flows |

Rules: no duplicate equivalents; server-safe except `Button`/`Tabs`/`Reveal`/`ConfirmDialog` (client); state never color-only.
