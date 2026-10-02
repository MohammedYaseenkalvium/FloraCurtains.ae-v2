import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Source-contract guards: the module under test is NEVER imported —
// src/lib/db.ts instantiates PrismaClient at module scope and no database
// runs in tests, and TESTING.md forbids module mocks. Reading normalized
// source text is the sanctioned substitute for mocking. Assertions are
// scoped to one reader's function segment and use exact clause literals —
// never a whole-file occurrence count (a count of `deletedAt: null` passed
// while the wrong entity was gated; see CR-01/WR-01).

const normalize = (source: string): string => source.replace(/\s+/g, " ");

const segment = (source: string, from: string, to?: string): string => {
  const start = source.indexOf(from);
  if (start < 0) return "";
  if (to === undefined) return source.slice(start);
  const end = source.indexOf(to, start + from.length);
  return source.slice(start, end < 0 ? source.length : end);
};

const financialSource = normalize(
  readFileSync(fileURLToPath(new URL("./customer-financial.ts", import.meta.url)), "utf8")
);

const dashboardSource = normalize(
  readFileSync(fileURLToPath(new URL("../app/(crm)/dashboard/page.tsx", import.meta.url)), "utf8")
);

// Phase 4 Plan 01 moved the dashboard reads from page.tsx into per-region
// async server components; the parity segments follow the queries.
const regionsSource = normalize(
  readFileSync(
    fileURLToPath(new URL("../app/(crm)/dashboard/_components/regions.tsx", import.meta.url)),
    "utf8"
  )
);

const portfolioSegment = segment(
  financialSource,
  "export async function getPortfolioFinancialSummary",
  "export async function getCustomerFinancialSummary"
);

const summarySegment = segment(
  financialSource,
  "export async function getCustomerFinancialSummary",
  "export async function getAllOutstandingBalances"
);

const rowsSegment = segment(financialSource, "export async function getAllOutstandingBalances");

const heroSegment = segment(
  regionsSource,
  "export async function HeroChips",
  "export async function KpiCards"
);

const activeProjectsSegment = segment(
  regionsSource,
  "export async function ActiveProjects",
  "export async function PendingQuotations"
);

const pendingQuotationsSegment = segment(
  regionsSource,
  "export async function PendingQuotations",
  "export async function PaymentOverview"
);

describe("getPortfolioFinancialSummary soft-delete gates", () => {
  it("excludes projects and approved quotations whose parent enquiry was soft-deleted", () => {
    expect(portfolioSegment).toContain(
      "where: { deletedAt: null, enquiry: { deletedAt: null } }"
    );
    expect(portfolioSegment).toContain(
      'where: { deletedAt: null, status: "APPROVED", enquiry: { deletedAt: null } }'
    );
  });

  it("excludes payments under retired parents while keeping orphan payments", () => {
    expect(portfolioSegment).toContain("OR: [");
    expect(portfolioSegment).toContain("{ projectId: null, quotationId: null }");
    expect(portfolioSegment).toContain(
      "{ project: { deletedAt: null, enquiry: { deletedAt: null } } }"
    );
    expect(portfolioSegment).toContain(
      "{ quotation: { deletedAt: null, enquiry: { deletedAt: null } } }"
    );
  });
});

describe("getAllOutstandingBalances soft-delete gates", () => {
  it("walks only live enquiries, quotations and projects for the balances table", () => {
    expect(rowsSegment).toContain("enquiries: { where: { deletedAt: null },");
    expect(rowsSegment).toContain("quotations: { where: { deletedAt: null },");
    expect(rowsSegment).toContain("project: { where: { deletedAt: null },");
  });
});

describe("dashboard record-set parity with the portfolio assembly", () => {
  it("gates the pending-quotation count and the two list reads on live enquiries", () => {
    expect(heroSegment).toContain("enquiry: { deletedAt: null }");
    expect(activeProjectsSegment).toContain("enquiry: { deletedAt: null }");
    expect(pendingQuotationsSegment).toContain("enquiry: { deletedAt: null }");
  });

  it(
    "DATA-04: dashboard presents no hardcoded or placeholder business figures " +
      "(whole-file absence battery over the KPI/chip render path, deliberately not segment-scoped)",
    () => {
      for (const source of [dashboardSource, regionsSource]) {
        expect(source).not.toContain('value: "');
        expect(source).not.toContain('figure: "');
        expect(source).not.toMatch(/AED [0-9]/);
        expect(source).not.toContain("toLocaleString");
      }
    }
  );
});

describe("getCustomerFinancialSummary soft-delete gates", () => {
  it("walks only live enquiries, quotations and projects for a customer summary", () => {
    expect(summarySegment).toContain("enquiries: { where: { deletedAt: null },");
    expect(summarySegment).toContain("quotations: { where: { deletedAt: null },");
    expect(summarySegment).toContain("project: { where: { deletedAt: null },");
  });
});
