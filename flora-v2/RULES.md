# Flora Curtains — Development Rules

> For token values, docs/design-system.md wins.
## 1. Golden Rule

Do not break existing functionality while improving the UI.

Before modifying a feature:

- understand the existing implementation
- identify dependencies
- identify API routes
- identify database relationships
- preserve working behavior

---

# 2. Brand Rules

The Flora Curtains brand must remain consistent across:

- Public Website
- CRM
- PDFs
- Quotations
- Emails
- Forms

Primary brand direction:

- Deep burgundy
- Warm ivory
- Cream
- Taupe
- Charcoal
- Muted green for success

The Flora logo must NEVER be redesigned, recreated, recolored, distorted or replaced.

Use the original logo asset.

---

# 3. Design Rules

The product should feel:

- premium
- architectural
- elegant
- modern
- editorial
- trustworthy
- spacious

Avoid:

- generic SaaS dashboards
- template-looking interfaces
- excessive gradients
- excessive glassmorphism
- random colors
- excessive rounded cards
- excessive shadows
- visual clutter

Glassmorphism may be used selectively.

It must not become the entire design language.

---

# 4. Public Website Rules

The public website must communicate:

Flora Curtains LLC

"Transforming Spaces with Style, Comfort & Elegance"

Core services:

- Curtains & Blinds
- Wallpaper
- Customized Sofas & Upholstery
- Interior Decoration
- Carpet & Wooden Flooring

Important company story:

Flora Curtains was established in 2023.

The founder's industry journey began in 1997 with Blue Star Curtains.

Never state that Flora Curtains itself existed since 1997.

The correct positioning is:

"Experience Built Since 1997"

---

# 5. CRM Rules

CRM must prioritize operational clarity.

The dashboard must answer:

"What do I need to know or do today?"

within approximately five seconds.

Do not overload the dashboard with unnecessary data.

Detailed information belongs inside modules.

---

# 6. Navigation Rules

Public website:

Desktop:
- logo
- navigation
- CTA

Mobile:
- logo
- menu
- CTA where appropriate

CRM:

Desktop:
- persistent sidebar/navigation

Mobile:
- persistent mobile navigation/bottom navigation

Navigation must remain consistent between related pages.

---

# 7. Component Rules

Before creating a component:

Search the project.

If an equivalent component already exists:

REUSE IT.

Do not create:

Button2
Card2
NewCard
DashboardCardNew
PaymentTableNew

unless there is a genuine functional difference.

---

# 8. Page Rules

Every page should have:

- clear page purpose
- consistent header
- clear hierarchy
- loading state
- empty state where appropriate
- error state where appropriate
- responsive behavior

---

# 9. Forms

All forms must:

- have proper labels
- have name/id attributes
- support keyboard navigation
- provide validation
- show useful errors
- prevent invalid submission
- show loading state
- provide success feedback

---

# 10. Accessibility

Follow accessible HTML.

Use:

- semantic elements
- labels
- keyboard navigation
- focus states
- appropriate contrast
- alt text
- accessible buttons

Do not rely solely on color.

---

# 11. Data Rules

Never invent:

- customers
- testimonials
- client logos
- project statistics
- business claims
- awards
- reviews

Use real data or clearly marked placeholders.

---

# 12. Security

Never expose:

- passwords
- database credentials
- API keys
- environment variables
- secrets

Never commit:

.env
.env.local
credentials
database dumps
generated admin credentials

---

# 13. Authentication

Never bypass authentication for convenience.

Do not weaken authorization checks during UI development.

---

# 14. Financial Rules

Payments must be validated server-side.

Never trust the frontend for:

- payment amount
- payment ownership
- project ownership
- user identity
- authorization

Financial mutations should use transactions.

---

# 15. Git Rules

Before committing:

- run tests
- run build
- check git diff
- check git status
- verify no secrets
- verify no generated files

Never commit:

- node_modules
- .env
- temporary scripts
- AI-generated dumps
- repomix output
- debugging files

---

# 16. AI Agent Rules

Before changing code:

1. Inspect relevant files.
2. Understand current architecture.
3. Search for reusable components.
4. Check existing API/database functionality.
5. Implement the smallest correct change.
6. Test.
7. Build.
8. Report what changed.

Never blindly rewrite an entire feature.

---

# 17. UI Implementation Rule

Do not start by coding random screens.

First establish:

- design tokens
- typography
- spacing
- navigation
- reusable components
- page templates
- responsive behavior

Then build individual pages.

---

# 18. Final Rule

Quality > speed.

A smaller amount of clean, reusable code is better than a large amount of duplicated AI-generated code.