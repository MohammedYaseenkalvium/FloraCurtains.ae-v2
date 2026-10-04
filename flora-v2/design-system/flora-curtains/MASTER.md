# Design System Master File

> For token values, docs/design-system.md wins.
> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Flora Curtains
**Generated:** 2026-09-27 00:38:04
**Category:** Home Decoration & Interior Design
**Design Dials:** Motion 4/10 (Standard)

---

## FLORA BRAND OVERRIDES (NON-NEGOTIABLE — this section wins over anything below)

These rules come from the repository's `RULES.md` / `DESIGN.md`. Where the generated
specs below (colors, buttons, fonts) conflict, **this section is authoritative**.

### Brand Color Palette (replaces generated palette)

| Role | Hex | Usage |
|------|-----|-------|
| Primary / Flora Burgundy | `#5A0E12` | Primary buttons, links, brand accents, focus rings |
| Deep Burgundy | `#3D080B` | Dark sections, hover depths, CTA bands |
| Primary Hover | `#74171C` | Hover state of primary |
| Warm Ivory | `#F8F5F2` | Page background |
| Cream | `#EFE7DF` | Alternate section surface |
| Taupe | `#D8C9BC` | Borders, dividers |
| Gold | `#C8A97E` | Eyebrows, hairline accents, focus on dark surfaces |
| Ink | `#1A1A1A` | Headings, primary text |
| Muted Text | `#6B625A` | Secondary text (must keep ≥4.5:1 on ivory) |
| Success | `#0F6E56` muted green | Completed / won states |
| Warning | `#854D0E` muted amber | Pending / overdue states |
| Danger | `#991B1B` burgundy-red | Destructive / urgent states |
| Info | `#185FA5` blue | Informational distinction only |

Never introduce colors outside this palette.

### Logo

- Use ONLY the official asset via `src/components/public/FloraLogo.tsx`
  (`FLORA_LOGO_SRC`). Never recreate, recolor, distort, or replace it.

### Typography

- Body/UI: self-hosted **Inter** (`src/app/fonts.css`) — offline-safe.
- Display/headings: **Georgia-based editorial serif** (`font-display` token) —
  elegant serif per DESIGN.md §3. The skill's Cinzel/Josefin Sans suggestion is
  deferred until fonts can be self-hosted (next/font/google breaks offline builds).
- Eyebrow labels: uppercase, `tracking-[0.18em]`, 10–12px, gold or burgundy.

### Buttons (overrides generated .btn-primary spec)

- Primary: burgundy background `#5A0E12` + light text, 8px radius, 200ms ease.
- Secondary: light neutral (ivory/cream) + ink text + taupe border.
- Ghost: transparent, ink text.
- Danger: reserved for destructive actions only.
- All clickable elements: `cursor-pointer`, visible focus, 150–300ms transition.

### Company Facts (never conflate)

- Flora Curtains LLC established **2023**; "Experience Built Since 1997" is the
  founder's journey (Blue Star Curtains). Never claim the company existed in 1997.

### Spacing / Radius / Shadow

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120 (generous whitespace).
- Radius: 8 (small) / 12 (medium) / 16 (large) / 24+ (hero). Never excessive.
- Shadows: subtle only (`flora-sm/md/lg`). No glowing cards.

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#78716C` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#A8A29E` | `--color-secondary` |
| On Secondary | `#000000` | `--color-on-secondary` |
| Accent/CTA | `#D97706` | `--color-accent` |
| On Accent/CTA | `#000000` | `--color-on-accent` |
| Background | `#FAF5F2` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#0F172A` | `--color-card-foreground` |
| Muted | `#F6F6F6` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#EEEDED` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#78716C` | `--color-ring` |

**Color Notes:** Interior warm grey + gold accent

### Typography

- **Heading Font:** Cinzel
- **Body Font:** Josefin Sans
- **Mood:** real estate, luxury, elegant, sophisticated, property, premium
- **Google Fonts:** [Cinzel + Josefin Sans](https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #D97706;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #78716C;
  border: 2px solid #78716C;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FAF5F2;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #78716C;
  outline: none;
  box-shadow: 0 0 0 3px #78716C20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger; Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Excessive decoration

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
