# 01 — Public Website

| Route | Sections | Primary CTA |
|---|---|---|
| `/` | Full-bleed photo hero (tagline, dual pill CTAs, trust row) → services → approach → work → about → CTA band | Get a Quote → `/get-quote` |
| `/about` | Story (verified 1997→2023), approach, CTA | Contact |
| `/services` | 5 cards + CTA tile; per-service anchored detail (offerings checklist) | Per-card → anchor; tile → `/get-quote` |
| `/portfolio` | Category filter tabs (All/Residential/Commercial/Interior), 4:3 imagery | Browse (no fake detail pages) |
| `/contact` | Showroom/phones/WhatsApp/email + single-form QuoteForm | Submit → CRM enquiry |
| `/get-quote` | Approved logo + 5-step wizard (customer, property, services, requirements, review) | Submit → success state |

Rules: pill CTAs for marketing actions; `next/image` with aspect containers; no testimonials/awards/stats (no verified data); `/contact` stays as the secondary single-form path.
