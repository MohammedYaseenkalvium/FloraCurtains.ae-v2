import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Source-contract battery for Phase 4 Plan 01 (home loading/empty/error
// states): the dashboard page and its region components are async server
// components (never imported — they await auth()/Prisma at render scope and
// TESTING.md forbids module mocks). Reading normalized source text is the
// sanctioned substitute, mirroring src/lib/customer-financial.test.ts: one
// readFileSync per file at module scope, whitespace normalized, exact-literal
// assertions scoped to the smallest meaningful segment — never whole-file
// occurrence counts where a segment pins intent (a count of `take: 5` passed
// while the wrong entity was gated; see CR-01/WR-01). Zero mocks, zero
// fixture data.

const normalize = (source: string): string => source.replace(/\s+/g, " ");

const segment = (source: string, from: string, to?: string): string => {
  const start = source.indexOf(from);
  if (start < 0) return "";
  if (to === undefined) return source.slice(start);
  const end = source.indexOf(to, start + from.length);
  return source.slice(start, end < 0 ? source.length : end);
};

const countOccurrences = (haystack: string, pattern: RegExp): number => {
  const matches = haystack.match(pattern);
  return matches === null ? 0 : matches.length;
};

const file = (relative: string): string =>
  fileURLToPath(new URL(`../app/${relative}`, import.meta.url));

const pageSource = normalize(readFileSync(file("(crm)/dashboard/page.tsx"), "utf8"));

const regionsSource = normalize(
  readFileSync(file("(crm)/dashboard/_components/regions.tsx"), "utf8")
);

const skeletonsSource = normalize(
  readFileSync(file("(crm)/dashboard/_components/region-skeletons.tsx"), "utf8")
);

const errorCardSource = normalize(
  readFileSync(file("(crm)/dashboard/_components/RegionErrorCard.tsx"), "utf8")
);

const activitySegment = segment(regionsSource, "export async function RecentActivity");

describe("home loading states (STAT-01)", () => {
  it("page streams all seven regions behind their own Suspense fallback, with no page-level Promise.all", () => {
    expect(countOccurrences(pageSource, /<Suspense/g)).toBe(7);
    expect(pageSource).not.toContain("Promise.all");
  });

  it("every region gets its shape-matched skeleton (hero, KPI, 4x list, payment)", () => {
    expect(pageSource).toContain("fallback={<HeroChipsSkeleton />}");
    expect(pageSource).toContain("fallback={<KpiSkeleton />}");
    expect(countOccurrences(pageSource, /fallback=\{<ListSkeleton \/>\}/g)).toBe(4);
    expect(pageSource).toContain("fallback={<PaymentSkeleton />}");
  });

  it("skeletons are built only from the Skeleton primitive with reduced-motion static fallback", () => {
    expect(skeletonsSource).toContain('import { Skeleton } from "@/components/ui/Skeleton"');
    expect(countOccurrences(skeletonsSource, /<Skeleton/g)).toBeGreaterThanOrEqual(10);
    expect(countOccurrences(skeletonsSource, /motion-reduce:animate-none/g)).toBe(
      countOccurrences(skeletonsSource, /<Skeleton/g)
    );
  });

  it("each skeleton card exposes a single sr-only Loading note", () => {
    expect(countOccurrences(skeletonsSource, /sr-only">Loading/g)).toBe(4);
  });
});

describe("home empty states (STAT-02)", () => {
  it("the four lists render quiet neutral EmptyState titles (shipped strings kept)", () => {
    expect(regionsSource).toContain("No enquiries yet.");
    expect(regionsSource).toContain("No active projects yet.");
    expect(regionsSource).toContain("No pending quotations yet.");
    expect(regionsSource).toContain("No activity recorded yet.");
    expect(countOccurrences(regionsSource, /<EmptyState/g)).toBe(4);
  });

  it("empty branches stay length === 0 with hint omitted (CTA does the guiding, D-12)", () => {
    expect(countOccurrences(regionsSource, /length === 0/g)).toBe(4);
    expect(regionsSource).not.toContain("hint=");
  });

  it("creation CTAs point only at routes that exist", () => {
    expect(regionsSource).toContain('href="/enquiries/new"');
    expect(regionsSource).toContain('href="/quotations/new"');
    expect(regionsSource).toContain('href="/projects"');
    expect(regionsSource).toContain("New enquiry");
    expect(regionsSource).toContain("New quotation");
    expect(regionsSource).toContain("View projects");
  });

  it("Recent Activity carries no CTA (no module route, Ph2 D-09 amendment)", () => {
    expect(countOccurrences(activitySegment, /href=/g)).toBe(0);
    expect(activitySegment).toContain("No activity recorded yet.");
  });
});

describe("home error states (STAT-03)", () => {
  it("every region boundary carries a friendly generic title plus Retry (never raw errors)", () => {
    expect(pageSource).toContain("Couldn't load recent enquiries");
    expect(pageSource).toContain("Couldn't load active projects");
    expect(pageSource).toContain("Couldn't load pending quotations");
    expect(pageSource).toContain("Couldn't load recent activity");
    expect(pageSource).toContain("Couldn't load key metrics");
    expect(pageSource).toContain("Couldn't load payment overview");
    expect(countOccurrences(pageSource, /<RegionBoundary/g)).toBe(7);
  });

  it("error card uses role=alert with the danger triple and a real Retry button", () => {
    expect(errorCardSource).toContain('role="alert"');
    expect(errorCardSource).toContain(
      "text-flora-danger bg-flora-danger-surface border border-flora-danger/30"
    );
    expect(errorCardSource).toContain("> Retry <");
  });

  it("retry is a keyed remount through the server path (minimal use-client boundary, no client fetch)", () => {
    expect(errorCardSource).toContain('"use client"');
    expect(errorCardSource).toContain("getDerivedStateFromError");
    expect(errorCardSource).toContain("key={");
    expect(errorCardSource).not.toMatch(/fetch\s*\(/);
    expect(regionsSource).not.toMatch(/fetch\s*\(/);
    expect(pageSource).not.toMatch(/fetch\s*\(/);
  });
});

describe("home state guards (scope fence + token/money discipline)", () => {
  it("route-level loading.tsx stays untouched as first-paint cover only", () => {
    expect(existsSync(file("(crm)/loading.tsx"))).toBe(true);
    const loadingSource = normalize(readFileSync(file("(crm)/loading.tsx"), "utf8"));
    expect(loadingSource).toContain("CRMLoading");
    expect(loadingSource).toContain('aria-busy="true"');
    expect(loadingSource).not.toContain("Suspense");
  });

  it("quick-action strip keeps its four static destinations (D-06, byte-identical)", () => {
    expect(pageSource).toContain('href="/enquiries/new"');
    expect(pageSource).toContain('href="/quotations/new"');
    expect(pageSource).toContain('href="/payments"');
    expect(pageSource).toContain('href="/site-visits"');
  });

  it("zero raw hex across the touched home files (flora-* tokens only)", () => {
    for (const source of [pageSource, regionsSource, skeletonsSource, errorCardSource]) {
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("formatAED stays the only money renderer; zero figures never become empties or dashes", () => {
    expect(regionsSource).toContain("formatAED");
    expect(regionsSource).not.toContain("toLocaleString");
    expect(regionsSource).not.toContain('"—"');
    expect(regionsSource).not.toContain("> — <");
  });

  it("raw errors and stacks never render in the error card (no-leak rule)", () => {
    expect(errorCardSource).not.toContain("error.message");
    expect(errorCardSource).not.toContain("stack");
  });

  it("use client appears exactly once, only in the retry boundary", () => {
    expect(countOccurrences(errorCardSource, /use client/g)).toBe(1);
    expect(pageSource).not.toContain("use client");
    expect(regionsSource).not.toContain("use client");
    expect(skeletonsSource).not.toContain("use client");
  });
});

const outstandingPageSource = normalize(
  readFileSync(file("(crm)/dashboard/outstanding/page.tsx"), "utf8")
);

const outstandingRegionsSource = normalize(
  readFileSync(file("(crm)/dashboard/outstanding/_components/regions.tsx"), "utf8")
);

const outstandingSkeletonsSource = normalize(
  readFileSync(
    file("(crm)/dashboard/outstanding/_components/region-skeletons.tsx"),
    "utf8"
  )
);

const dashboardErrorSource = normalize(
  readFileSync(file("(crm)/dashboard/error.tsx"), "utf8")
);

const outstandingTableSegment = segment(
  outstandingRegionsSource,
  "export async function OutstandingTable"
);

const outstandingEmptySegment = segment(
  outstandingTableSegment,
  "length === 0",
  "<table"
);

describe("outstanding loading states (STAT-01)", () => {
  it("outstanding headers and table stream behind their own Suspense fallback, with no page-level Promise.all", () => {
    expect(countOccurrences(outstandingPageSource, /<Suspense/g)).toBe(2);
    expect(outstandingPageSource).toContain("fallback={<OutstandingHeadersSkeleton />}");
    expect(outstandingPageSource).toContain("fallback={<OutstandingTableSkeleton />}");
    expect(outstandingPageSource).not.toContain("Promise.all");
  });

  it("outstanding skeletons reuse the shipped frames with title lines and full-width table rows", () => {
    expect(outstandingSkeletonsSource).toContain('import { Skeleton } from "@/components/ui/Skeleton"');
    expect(outstandingSkeletonsSource).toContain("h-5 w-40");
    expect(outstandingSkeletonsSource).toContain("[0, 1, 2].map");
    expect(outstandingSkeletonsSource).toContain("px-5 py-3");
    expect(outstandingSkeletonsSource).toContain("[0, 1, 2, 3, 4, 5, 6, 7].map");
    expect(countOccurrences(outstandingSkeletonsSource, /motion-reduce:animate-none/g)).toBe(
      countOccurrences(outstandingSkeletonsSource, /<Skeleton/g)
    );
  });

  it("each outstanding skeleton card exposes a single sr-only Loading note", () => {
    expect(countOccurrences(outstandingSkeletonsSource, /sr-only">Loading/g)).toBe(2);
  });

  it("queries move verbatim into their regions with the overdue and stale derivations intact", () => {
    expect(outstandingRegionsSource).toContain(
      "await Promise.all([getPortfolioFinancialSummary(), getAllOutstandingBalances()])"
    );
    expect(outstandingTableSegment).toContain("const customers = await getAllOutstandingBalances();");
    expect(countOccurrences(outstandingRegionsSource, /daysSincePayment \?\? 0\) > 30/g)).toBe(2);
    expect(countOccurrences(outstandingRegionsSource, /daysSincePayment \?\? 0\) > 14/g)).toBe(1);
  });

  it("outstanding table keeps its shipped thead labels and formatAED-only money rendering", () => {
    for (const label of [
      "Customer",
      "Company",
      "Lifetime Value",
      "Total Paid",
      "Outstanding",
      "Last Payment",
      "Actions",
    ]) {
      expect(outstandingTableSegment).toContain(label);
    }
    expect(outstandingTableSegment).toContain("formatAED");
    expect(outstandingTableSegment).not.toContain("toLocaleString");
  });
});

describe("outstanding empty and error states (STAT-02/STAT-03)", () => {
  it("zero balances render a purposeful empty table state with no CTA", () => {
    expect(outstandingRegionsSource).toContain("No outstanding balances.");
    expect(outstandingTableSegment).toContain('<EmptyState title="No outstanding balances." />');
    expect(outstandingEmptySegment).not.toContain("href=");
  });

  it("failed outstanding reads render scoped generic errors reusing the shared retry boundary", () => {
    expect(outstandingPageSource).toContain("Couldn't load outstanding summary");
    expect(outstandingPageSource).toContain("Couldn't load outstanding balances");
    expect(countOccurrences(outstandingPageSource, /<RegionBoundary/g)).toBe(2);
    expect(outstandingPageSource).toContain('from "../_components/RegionErrorCard"');
  });

  it("summary figures use semibold with zero extrabold figures; money stays formatAED-only", () => {
    expect(countOccurrences(outstandingRegionsSource, /text-3xl font-semibold/g)).toBe(4);
    expect(outstandingRegionsSource).not.toMatch(/font-extrabold text-flora-/);
    expect(outstandingRegionsSource).toContain("formatAED");
    expect(outstandingRegionsSource).not.toContain("toLocaleString");
  });
});

describe("dashboard total-failure fallback (D-07)", () => {
  it("dashboard error boundary renders generic copy with a working Try again path", () => {
    expect(dashboardErrorSource).toContain('"use client"');
    expect(dashboardErrorSource).toContain("Something went wrong loading the dashboard.");
    expect(dashboardErrorSource).toContain("Try again");
    expect(dashboardErrorSource).toContain("reset");
  });

  it("fallback leaks no raw errors and keeps the danger marker on flora tokens", () => {
    expect(dashboardErrorSource).not.toContain("error.message");
    expect(dashboardErrorSource).not.toContain("stack");
    expect(dashboardErrorSource).toContain("text-flora-danger");
    expect(dashboardErrorSource).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("outstanding composition adds no client boundaries and no client fetch for page data", () => {
    expect(outstandingPageSource).not.toContain("use client");
    expect(outstandingRegionsSource).not.toContain("use client");
    expect(outstandingSkeletonsSource).not.toContain("use client");
    expect(outstandingPageSource).not.toMatch(/fetch\s*\(/);
    expect(outstandingRegionsSource).not.toMatch(/fetch\s*\(/);
  });
});

describe("retry genuine re-request wiring (STAT-03 gap closure)", () => {
  it("RegionBoundary Retry is wired to a server re-request via next/navigation router.refresh", () => {
    expect(errorCardSource).toContain('from "next/navigation"');
    expect(errorCardSource).toContain("useRouter");
    expect(errorCardSource).toContain("router.refresh");
    expect(errorCardSource).toContain("key={");
  });

  it("mechanism comment names refresh plus remount, not a bare-remount re-stream", () => {
    expect(errorCardSource).toContain("genuine server re-request via router.refresh()");
    expect(errorCardSource).toContain("keyed");
  });

  it("hero overview retry title is pinned (IN-01)", () => {
    expect(pageSource).toContain("Couldn't load overview");
  });

  it("retry fix preserves the no-leak contract in RegionErrorCard", () => {
    expect(errorCardSource).not.toContain("error.message");
    expect(errorCardSource).not.toContain("stack");
  });
});
