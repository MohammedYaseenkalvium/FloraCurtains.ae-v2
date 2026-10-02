import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Source-contract guards for DSH-01/DSH-02 structure + NAV-01 navigation:
// the dashboard page is a streaming composition shell and its data regions
// are async server components (never imported — they await auth()/Prisma at
// render scope and TESTING.md forbids module mocks). Reading normalized
// source text is the sanctioned substitute, mirroring
// src/lib/customer-financial.test.ts: readFileSync at module scope,
// whitespace normalized, exact-literal assertions pinned to CURRENT source
// values (re-derived 2026-10-02 after the Phase 4 Plan 01 Suspense split;
// do not relax counts to >= when the contract demands an exact inventory).

const normalize = (source: string): string => source.replace(/\s+/g, " ");

const countOccurrences = (haystack: string, pattern: RegExp): number => {
  const matches = haystack.match(pattern);
  return matches === null ? 0 : matches.length;
};

const dashboardSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../app/(crm)/dashboard/page.tsx", import.meta.url)),
    "utf8"
  )
);

const regionsSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../app/(crm)/dashboard/_components/regions.tsx", import.meta.url)),
    "utf8"
  )
);

const skeletonsSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../app/(crm)/dashboard/_components/region-skeletons.tsx", import.meta.url)),
    "utf8"
  )
);

const homeSources = [dashboardSource, regionsSource, skeletonsSource].join(" ");

const routeFile = (relative: string): string =>
  fileURLToPath(new URL(`../app/${relative}`, import.meta.url));

describe("dashboard structure (DSH-01/DSH-02) region order", () => {
  it("DSH-02: page streams hero before attention before KPI before quick-actions before row A (enquiries|projects) before row B (quotations|payment overview) before activity", () => {
    const markers = [
      'region="hero"',
      'region="attention"',
      'region="key-metrics"',
      'aria-label="Quick actions"',
      'region="recent-enquiries"',
      'region="active-projects"',
      'region="pending-quotations"',
      'region="payment-overview"',
      'region="recent-activity"',
    ];
    const positions = markers.map((marker) => dashboardSource.indexOf(marker));
    positions.forEach((position, index) => {
      expect(position, `marker missing: ${markers[index]}`).toBeGreaterThan(-1);
    });
    for (let index = 0; index < positions.length - 1; index += 1) {
      expect(
        positions[index + 1] > positions[index],
        `region out of order: ${markers[index]} must precede ${markers[index + 1]}`
      ).toBe(true);
    }
  });

  it("DSH-02: region content keeps shipped order (hero, KPI, row A, row B, activity, attention)", () => {
    const markers = [
      'aria-label="Overview"',
      'aria-label="Key metrics"',
      "Latest customer opportunities",
      "Latest projects in progress",
      "Latest quotations awaiting response",
      "Contract value, payments received and outstanding",
      "Latest CRM activity",
      "Needs attention today",
    ];
    const positions = markers.map((marker) => regionsSource.indexOf(marker));
    positions.forEach((position, index) => {
      expect(position, `marker missing: ${markers[index]}`).toBeGreaterThan(-1);
    });
    for (let index = 0; index < positions.length - 1; index += 1) {
      expect(
        positions[index + 1] > positions[index],
        `region out of order: ${markers[index]} must precede ${markers[index + 1]}`
      ).toBe(true);
    }
  });
});

describe("dashboard structure (DSH-01/DSH-02) token discipline", () => {
  it("DSH-01: zero raw radii, zero gap-6, zero arbitrary 10/11px text, exactly one font-display across the home surface", () => {
    expect(
      countOccurrences(homeSources, /rounded-xl|rounded-lg|rounded-2xl|rounded-3xl/g)
    ).toBe(0);
    expect(countOccurrences(homeSources, /gap-6/g)).toBe(0);
    expect(countOccurrences(homeSources, /text-\[10px\]|text-\[11px\]/g)).toBe(0);
    expect(countOccurrences(homeSources, /font-display/g)).toBe(1);
  });

  it("DSH-01: token shadows present and balanced two-column region rows intact", () => {
    expect(countOccurrences(dashboardSource, /shadow-flora-sm/g)).toBeGreaterThanOrEqual(1);
    expect(countOccurrences(dashboardSource, /md:grid-cols-2/g)).toBeGreaterThanOrEqual(1);
  });
});

describe("dashboard structure (DSH-01/DSH-02) list cards", () => {
  it("DSH-02: all six list reads take exactly 5 rows", () => {
    expect(countOccurrences(regionsSource, /take: 5/g)).toBe(6);
  });

  it("DSH-02: enquiry, project, quotation and attention rows each carry a StatusBadge chip", () => {
    expect(countOccurrences(regionsSource, /StatusBadge domain=/g)).toBe(6);
    expect(regionsSource).toContain('StatusBadge domain="enquiry"');
    expect(regionsSource).toContain('StatusBadge domain="project"');
    expect(regionsSource).toContain('StatusBadge domain="quotation"');
    expect(regionsSource).toContain('StatusBadge domain="payment"');
  });

  it("DSH-02: activity rows are plain divs, never links (D-09 amendment)", () => {
    expect(countOccurrences(regionsSource, /rowHref/g)).toBe(0);
    expect(countOccurrences(regionsSource, /entityId/g)).toBe(0);
    expect(countOccurrences(regionsSource, /\/site-visits\//g)).toBe(0);
  });
});

describe("dashboard navigation (NAV-01) href inventory", () => {
  it("NAV-01: the page shell pins exactly the four quick-action destinations", () => {
    const quoted = dashboardSource.match(/"(\/[a-z0-9/-]*)"/g) ?? [];
    const counts = new Map<string, number>();
    quoted.forEach((literal) => {
      counts.set(literal, (counts.get(literal) ?? 0) + 1);
    });
    const expected = new Map([
      ['"/enquiries/new"', 1],
      ['"/payments"', 1],
      ['"/quotations/new"', 1],
      ['"/site-visits"', 1],
    ]);
    expect([...counts.keys()].sort()).toEqual([...expected.keys()].sort());
    expected.forEach((occurrences, literal) => {
      expect(counts.get(literal), `occurrence drift: ${literal}`).toBe(occurrences);
    });
    expect(quoted.length).toBe(4);
  });

  it("NAV-01: page shell plus region components preserve the full pre-split href multiset (15 occurrences)", () => {
    const combined = [dashboardSource, regionsSource].join(" ");
    const quoted = combined.match(/"(\/[a-z0-9/-]*)"/g) ?? [];
    const counts = new Map<string, number>();
    quoted.forEach((literal) => {
      counts.set(literal, (counts.get(literal) ?? 0) + 1);
    });
    const expected = new Map([
      ['"/customers"', 1],
      ['"/dashboard/outstanding"', 1],
      ['"/enquiries"', 2],
      ['"/enquiries/new"', 2],
      ['"/payments"', 1],
      ['"/projects"', 4],
      ['"/quotations"', 1],
      ['"/quotations/new"', 2],
      ['"/site-visits"', 1],
    ]);
    expect([...counts.keys()].sort()).toEqual([...expected.keys()].sort());
    expected.forEach((occurrences, literal) => {
      expect(counts.get(literal), `occurrence drift: ${literal}`).toBe(occurrences);
    });
    expect(quoted.length).toBe(15);
  });

  it("NAV-01: exactly the six list-row template families deep-link to [id] pages", () => {
    expect(regionsSource).toContain("href={`/enquiries/${enquiry.id}`}");
    expect(regionsSource).toContain("href={`/projects/${project.id}`}");
    expect(regionsSource).toContain("href={`/quotations/${quotation.id}`}");
    expect(regionsSource).toContain("href={`/customers/${balance.customerId}`}");
    expect(countOccurrences(regionsSource, /href=\{`\//g)).toBe(6);
  });
});

describe("dashboard navigation (NAV-01) route proofs", () => {
  it("NAV-01: every inventoried static href resolves to an existing route file", () => {
    const staticRoutes = [
      "(crm)/enquiries/page.tsx",
      "(crm)/enquiries/new/page.tsx",
      "(crm)/projects/page.tsx",
      "(crm)/customers/page.tsx",
      "(crm)/quotations/page.tsx",
      "(crm)/quotations/new/page.tsx",
      "(crm)/payments/page.tsx",
      "(crm)/site-visits/page.tsx",
      "(crm)/dashboard/outstanding/page.tsx",
    ];
    staticRoutes.forEach((route) => {
      expect(existsSync(routeFile(route)), `missing route file: ${route}`).toBe(true);
    });
  });

  it("NAV-01: every template family resolves to an existing [id] route file", () => {
    const idRoutes = [
      "(crm)/enquiries/[id]/page.tsx",
      "(crm)/projects/[id]/page.tsx",
      "(crm)/quotations/[id]/page.tsx",
      "(crm)/customers/[id]/page.tsx",
    ];
    idRoutes.forEach((route) => {
      expect(existsSync(routeFile(route)), `missing route file: ${route}`).toBe(true);
    });
  });

  it("NAV-01: no /site-visits/{id}-style links exist anywhere on the dashboard; exactly one legitimate /customers/{id} attention link", () => {
    expect(countOccurrences(regionsSource, /href=\{`\/site-visits\//g)).toBe(0);
    expect(countOccurrences(regionsSource, /\/customers\/\$\{/g)).toBe(1);
    expect(countOccurrences(dashboardSource, /href=\{`\/site-visits\//g)).toBe(0);
    expect(countOccurrences(dashboardSource, /\/customers\/\$\{/g)).toBe(0);
  });
});

// Source-contract battery for Phase 6 Plan 01 responsive navigation
// (NAV-02): hamburger-overlay below lg:, full Sidebar at lg:, condensed
// TopHeader, byte-identical BottomNav, bottom-bar clearance. Same sanctioned
// pattern as above (readFileSync at module scope, whitespace normalized,
// exact-literal counts re-derived from current source 2026-10-02 — never
// relaxed >= where the contract demands inventory). Segment scoping mirrors
// src/lib/dashboard-states.test.ts so aside-class pins cannot pass on
// hamburger-class matches and vice versa. Zero mocks, zero fixture data.

const sidebarSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../components/layout/Sidebar.tsx", import.meta.url)),
    "utf8"
  )
);

const topHeaderSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../components/layout/TopHeader.tsx", import.meta.url)),
    "utf8"
  )
);

const appShellSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../components/crm/layout/AppShell.tsx", import.meta.url)),
    "utf8"
  )
);

const bottomNavSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../components/crm/layout/BottomNav.tsx", import.meta.url)),
    "utf8"
  )
);

const chromeSegment = (source: string, from: string, to: string): string => {
  const start = source.indexOf(from);
  if (start < 0) return "";
  const end = source.indexOf(to, start + from.length);
  return source.slice(start, end < 0 ? source.length : end);
};

describe("responsive navigation (NAV-02)", () => {
  it("hamburger governs below lg: with a 44px hit area and labelled aria wiring", () => {
    const hamburger = chromeSegment(
      sidebarSource,
      'aria-label="Open navigation"',
      "</button>"
    );
    expect(hamburger).toContain("lg:hidden");
    expect(countOccurrences(hamburger, /lg:hidden/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /lg:hidden/g)).toBe(3);
    expect(countOccurrences(sidebarSource, /min-h-\[44px\]/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /min-w-\[44px\]/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /aria-expanded/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /aria-controls/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /crm-sidebar/g)).toBe(2);
  });

  it("overlay is a real dismiss button with Escape-to-close and body scroll-lock", () => {
    const overlay = chromeSegment(
      sidebarSource,
      'aria-label="Close navigation"',
      "/>"
    );
    expect(overlay).toContain("lg:hidden");
    expect(countOccurrences(overlay, /lg:hidden/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /Escape/g)).toBe(1);
    expect(sidebarSource).toContain('document.body.style.overflow = "hidden"');
    expect(sidebarSource).toContain(
      "document.body.style.overflow = previousOverflow"
    );
    expect(countOccurrences(sidebarSource, /addEventListener/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /removeEventListener/g)).toBe(1);
  });

  it("aside returns at lg: with shipped geometry, motion and stacking intact", () => {
    const asideClasses = chromeSegment(
      sidebarSource,
      "className={[",
      'open ? "translate-x-0"'
    );
    expect(countOccurrences(asideClasses, /lg:static/g)).toBe(1);
    expect(countOccurrences(asideClasses, /lg:z-auto/g)).toBe(1);
    expect(countOccurrences(asideClasses, /lg:translate-x-0/g)).toBe(1);
    expect(countOccurrences(asideClasses, /-translate-x-full/g)).toBe(1);
    expect(countOccurrences(asideClasses, /motion-reduce:transition-none/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /translate-x-0/g)).toBe(2);
    expect(countOccurrences(sidebarSource, /transition-transform duration-200/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /z-40/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /z-30/g)).toBe(2);
    expect(countOccurrences(sidebarSource, /w-64/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /h-screen/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /bg-flora-footer/g)).toBe(1);
  });

  it("zero md: remnants in Sidebar; X close button takes the lg: shift", () => {
    expect(countOccurrences(sidebarSource, /md:hidden/g)).toBe(0);
    expect(countOccurrences(sidebarSource, /md:static/g)).toBe(0);
    expect(countOccurrences(sidebarSource, /md:z-auto/g)).toBe(0);
    expect(countOccurrences(sidebarSource, /md:translate-x-0/g)).toBe(0);
    const closeButton = chromeSegment(
      sidebarSource,
      "rounded-lg p-1.5",
      "</button>"
    );
    expect(closeButton).toContain("lg:hidden");
    expect(countOccurrences(sidebarSource, /Open navigation/g)).toBe(1);
    expect(countOccurrences(sidebarSource, /Close navigation/g)).toBe(2);
  });

  it("header condenses on small screens while the sticky shell stands", () => {
    expect(countOccurrences(topHeaderSource, /hidden lg:block/g)).toBe(1);
    expect(countOccurrences(topHeaderSource, /lg:hidden/g)).toBe(1);
    expect(countOccurrences(topHeaderSource, /hidden sm:block/g)).toBe(1);
    expect(
      countOccurrences(topHeaderSource, /truncate max-w-\[140px\] sm:max-w-none/g)
    ).toBe(1);
    expect(countOccurrences(topHeaderSource, /md:hidden/g)).toBe(0);
    expect(countOccurrences(topHeaderSource, /hidden md:block/g)).toBe(0);
    expect(countOccurrences(topHeaderSource, /sticky top-0 z-20/g)).toBe(1);
    expect(countOccurrences(topHeaderSource, /bg-flora-cream/g)).toBe(1);
  });

  it("AppShell renders Sidebar with no display:none wrapper and keeps the clearance contract", () => {
    expect(countOccurrences(appShellSource, /hidden md:block/g)).toBe(0);
    expect(countOccurrences(appShellSource, /<Sidebar/g)).toBe(1);
    expect(countOccurrences(appShellSource, /<BottomNav/g)).toBe(1);
    expect(countOccurrences(appShellSource, /md:hidden/g)).toBe(1);
    expect(countOccurrences(appShellSource, /pb-28/g)).toBe(1);
    expect(countOccurrences(appShellSource, /md:pb-10/g)).toBe(1);
  });

  it("BottomNav keeps its 6 items, destinations, bar geometry and safe-area padding", () => {
    for (const href of [
      "/dashboard",
      "/enquiries",
      "/quotations",
      "/projects",
      "/payments",
      "/tasks",
    ]) {
      expect(countOccurrences(bottomNavSource, new RegExp(`"${href}"`, "g"))).toBe(1);
    }
    for (const label of ["Home", "Leads", "Quotes", "Projects", "Payments", "Tasks"]) {
      expect(countOccurrences(bottomNavSource, new RegExp(`"${label}"`, "g"))).toBe(1);
    }
    expect(countOccurrences(bottomNavSource, /grid-cols-6/g)).toBe(1);
    expect(
      countOccurrences(bottomNavSource, /fixed inset-x-0 bottom-0 z-50/g)
    ).toBe(1);
    expect(
      countOccurrences(bottomNavSource, /pb-\[env\(safe-area-inset-bottom\)\]/g)
    ).toBe(1);
    expect(bottomNavSource).toContain('aria-label="CRM"');
    expect(countOccurrences(bottomNavSource, /aria-current/g)).toBe(1);
    expect(countOccurrences(bottomNavSource, /md:hidden/g)).toBe(0);
    expect(countOccurrences(bottomNavSource, /lg:hidden/g)).toBe(0);
  });

  it("Sidebar href inventory stays byte-identical so no route entry rides the transform", () => {
    expect(countOccurrences(sidebarSource, new RegExp('"/dashboard"', "g"))).toBe(2);
    for (const href of [
      "/enquiries",
      "/customers",
      "/quotations",
      "/projects",
      "/site-visits",
      "/measurements",
      "/tasks",
      "/payments",
      "/inventory",
      "/staff",
      "/settings",
    ]) {
      expect(countOccurrences(sidebarSource, new RegExp(`"${href}"`, "g"))).toBe(1);
    }
    expect(countOccurrences(sidebarSource, /aria-current/g)).toBe(1);
    expect(
      countOccurrences(
        sidebarSource,
        /shadow-\[inset_3px_0_0_0_var\(--flora-gold\)\]/g
      )
    ).toBe(1);
    expect(countOccurrences(sidebarSource, /bg-flora-primary/g)).toBe(1);
  });
});
