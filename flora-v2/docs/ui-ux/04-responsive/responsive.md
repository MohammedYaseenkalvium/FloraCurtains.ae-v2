# 04 — Responsive

Breakpoints: 390 mobile / 768 tablet / 1024 / 1280 / 1440 desktop.

- Nav: public hamburger + panel; CRM drawer (overlay, close-on-navigate, `aria-current`).
- Tables: intentional horizontal scroll (`overflow-x-auto` + `min-w`), never squeezed columns.
- Hero card stacks statically on mobile (absolute overlap desktop-only).
- CTA buttons `w-full sm:w-auto`; forms single-column → 2-col at `md`.
- Dialogs `w-[calc(100vw-2rem)] max-w-sm`; no page-level horizontal overflow.
