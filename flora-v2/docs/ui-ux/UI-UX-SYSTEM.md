# Flora UI/UX System

Visual source-of-truth: the approved UI/UX reference package (brand board + page mockups), interpreted through `docs/design-system.md` (authoritative tokens).

- `00-brand/` — logo usage, palette, type. Logo files are sacred; this doc records placement rules.
- `01-public-website/` — page inventory: purpose, sections, CTAs per route.
- `02-crm/` — module inventory: shell, tabs, key widgets per module.
- `03-components/` — reusable `ui/` catalog with usage rules.
- `04-responsive/` — breakpoints, table strategy, drawer + bottom-space rules.
- `05-states/` — loading/empty/error/success patterns per surface.

Rule: update the relevant file when adding a page, component or state. No mockup binaries are stored; the reference board image is the visual companion.
