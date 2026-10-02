import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Source-contract guards for DSH-01/DSH-02 structure + NAV-01 navigation:
// the dashboard page is a Next.js async server component (never imported —
// it awaits auth()/Prisma at module scope and TESTING.md forbids module
// mocks). Reading normalized source text is the sanctioned substitute,
// mirroring src/lib/customer-financial.test.ts: one readFileSync at module
// scope, whitespace normalized, exact-literal assertions pinned to CURRENT
// source values (re-derived 2026-10-02; do not relax counts to >= when the
// contract demands an exact inventory).

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

const routeFile = (relative: string): string =>
  fileURLToPath(new URL(`../app/${relative}`, import.meta.url));

describe("dashboard structure (DSH-01/DSH-02) region order", () => {
  it("DSH-02: hero renders before KPI before quick-actions before row A (enquiries|projects) before row B (quotations|payment overview) before activity", () => {
    const markers = [
      'aria-label="Overview"',
      'aria-label="Key metrics"',
      'aria-label="Quick actions"',
      "Latest customer opportunities",
      "Latest projects in progress",
      "Latest quotations awaiting response",
      "Contract value, payments received and outstanding",
      "Latest CRM activity",
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
});

describe("dashboard structure (DSH-01/DSH-02) token discipline", () => {
  it("DSH-01: zero raw radii, zero gap-6, zero arbitrary 10/11px text, exactly one font-display", () => {
    expect(
      countOccurrences(dashboardSource, /rounded-xl|rounded-lg|rounded-2xl|rounded-3xl/g)
    ).toBe(0);
    expect(countOccurrences(dashboardSource, /gap-6/g)).toBe(0);
    expect(countOccurrences(dashboardSource, /text-\[10px\]|text-\[11px\]/g)).toBe(0);
    expect(countOccurrences(dashboardSource, /font-display/g)).toBe(1);
  });

  it("DSH-01: token shadows present and balanced two-column region rows intact", () => {
    expect(countOccurrences(dashboardSource, /shadow-flora-sm/g)).toBeGreaterThanOrEqual(1);
    expect(countOccurrences(dashboardSource, /md:grid-cols-2/g)).toBeGreaterThanOrEqual(1);
  });
});

describe("dashboard structure (DSH-01/DSH-02) list cards", () => {
  it("DSH-02: all four list reads take exactly 5 rows", () => {
    expect(countOccurrences(dashboardSource, /take: 5/g)).toBe(4);
  });

  it("DSH-02: enquiry, project and quotation rows each carry a StatusBadge chip", () => {
    expect(countOccurrences(dashboardSource, /StatusBadge domain=/g)).toBe(3);
    expect(dashboardSource).toContain('StatusBadge domain="enquiry"');
    expect(dashboardSource).toContain('StatusBadge domain="project"');
    expect(dashboardSource).toContain('StatusBadge domain="quotation"');
  });

  it("DSH-02: activity rows are plain divs, never links (D-09 amendment)", () => {
    expect(countOccurrences(dashboardSource, /rowHref/g)).toBe(0);
    expect(countOccurrences(dashboardSource, /entityId/g)).toBe(0);
    expect(countOccurrences(dashboardSource, /\/site-visits\//g)).toBe(0);
  });
});

describe("dashboard navigation (NAV-01) href inventory", () => {
  it("NAV-01: the exact quoted-href set pins the nine known static destinations (12 occurrences)", () => {
    const quoted = dashboardSource.match(/"(\/[a-z0-9/-]*)"/g) ?? [];
    const counts = new Map<string, number>();
    quoted.forEach((literal) => {
      counts.set(literal, (counts.get(literal) ?? 0) + 1);
    });
    const expected = new Map([
      ['"/customers"', 1],
      ['"/dashboard/outstanding"', 1],
      ['"/enquiries"', 2],
      ['"/enquiries/new"', 1],
      ['"/payments"', 1],
      ['"/projects"', 3],
      ['"/quotations"', 1],
      ['"/quotations/new"', 1],
      ['"/site-visits"', 1],
    ]);
    expect([...counts.keys()].sort()).toEqual([...expected.keys()].sort());
    expected.forEach((occurrences, literal) => {
      expect(counts.get(literal), `occurrence drift: ${literal}`).toBe(occurrences);
    });
    expect(quoted.length).toBe(12);
  });

  it("NAV-01: exactly the three list-row template families deep-link to [id] pages", () => {
    expect(dashboardSource).toContain("href={`/enquiries/${enquiry.id}`}");
    expect(dashboardSource).toContain("href={`/projects/${project.id}`}");
    expect(dashboardSource).toContain("href={`/quotations/${quotation.id}`}");
    expect(countOccurrences(dashboardSource, /href=\{`\//g)).toBe(3);
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
    ];
    idRoutes.forEach((route) => {
      expect(existsSync(routeFile(route)), `missing route file: ${route}`).toBe(true);
    });
  });

  it("NAV-01: no /site-visits/{id}-style links exist anywhere on the dashboard", () => {
    expect(countOccurrences(dashboardSource, /href=\{`\/site-visits\//g)).toBe(0);
    expect(countOccurrences(dashboardSource, /\/customers\/\$\{/g)).toBe(0);
  });
});
