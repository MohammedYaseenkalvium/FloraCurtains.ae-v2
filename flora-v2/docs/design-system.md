# Flora Design System

> Single source of truth for Flora Curtains LLC visual language.
> Palette decision (2026-09-22): keep the shipped `flora-*` values (`#5A0E12` family) — the reference image is a render, not a spec, and 1170 usages were already migrated. The reference hexes (`#722537` etc.) live in the same families.

## Brand

- Logo master: `public/images/FLora quotation logo.png` — public header/footer, Get Quote, PDF, documents. **Never redesign, recolor or distort.**
- Compact lockup: `public/images/logo.png` — 36px CRM sidebar only. Same monogram + wordmark + maroon; appropriate at small sizes.
- Tagline: "Transforming Spaces with Style, Comfort & Elegance". Experience line: "Modern Interiors Backed by Decades of Experience" (LLC est. 2023; founder since 1997 — never conflate).

## Color tokens (`tailwind.config.ts` + `globals.css` vars)

| Token | Value | Use |
|---|---|---|
| `flora-primary` / `primary-hover` | `#5A0E12` / `#74171C` | CTAs, active states, brand text |
| `flora-gold` | `#C8A97E` | Eyebrows, accents, dividers |
| `flora-background` / `surface` / `surface-highest` | `#FFF8F5` / `#F8F5F2` / `#FFF` | Page / section / card |
| `flora-foreground` / `muted` / `border` | `#1E1B18` / `#6B625A` / `#D8C9BC` | Text / secondary / dividers |
| `flora-footer` | `#0F0C0B` | Footer ground |
| `flora-success[-surface]` | `#0F6E56` / `#EDF7F3` | Paid, completed, confirmations |
| `flora-warning[-surface]` | `#854D0E` / `#FEF9E7` | Pending, on-hold, due |
| `flora-danger[-surface]` | `#991B1B` / `#FEF2F2` | Errors, destructive, overdue |
| `flora-info[-surface]` | `#185FA5` / `#EEF4FA` | Informational states |

Rules: no hardcoded palette hex in `className` (runtime `style` maps excepted); state is never color-only (pair with label/icon).

## Glass (`glass-panel` utility)

- `rgba(255,255,255,0.55)` + `rgba(255,255,255,0.35)` border + `blur(16px)`.
- Allowed: sticky nav, floating hero card, overlays, dashboard widgets, dialogs, floating actions.
- Forbidden: body-copy sections, tables, forms (readability first).

## Radius / shadow / type

- Radius: `rounded-flora-sm` 0.5 (inputs/buttons) → `md` 0.75 (cards) → `lg` 1.0 → `xl` 1.25 (hero/media). Legacy `rounded-flora` == md.
- Shadows: `shadow-flora-sm/md/lg`, soft warm-tinted, restrained.
- Type: `font-display` (Cormorant Garamond) for display/H1/H2; `font-sans` (Inter) for everything else. Scale: hero `5xl→7xl`, section H2 `4xl→5xl`, card H3 `lg`, body `sm/base`, eyebrow `xs uppercase tracking-wider`.
- Eyebrow pattern: `text-xs font-semibold uppercase tracking-wider text-flora-primary`.

## Product split

- Public: emotional, editorial, photographic (warm luxury).
- CRM: operational, dense, solid surfaces (glass only on nav/dialogs/floating).
- Shared: tokens, spacing (`max-w-7xl`, `px-5 lg:px-8`, `py-20`), interaction quality.
