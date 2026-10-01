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

const pendingQuotationCountSegment = segment(
  dashboardSource,
  "db.quotation.count({",
  "db.project.findMany({"
);

const activeProjectsSegment = segment(
  dashboardSource,
  "db.project.findMany({",
  "db.quotation.findMany({"
);

const pendingQuotationsSegment = segment(dashboardSource, "db.quotation.findMany({");

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
    expect(pendingQuotationCountSegment).toContain("enquiry: { deletedAt: null }");
    expect(activeProjectsSegment).toContain("enquiry: { deletedAt: null }");
    expect(pendingQuotationsSegment).toContain("enquiry: { deletedAt: null }");
  });
});

describe("getCustomerFinancialSummary soft-delete gates", () => {
  it("walks only live enquiries, quotations and projects for a customer summary", () => {
    expect(summarySegment).toContain("enquiries: { where: { deletedAt: null },");
    expect(summarySegment).toContain("quotations: { where: { deletedAt: null },");
    expect(summarySegment).toContain("project: { where: { deletedAt: null },");
  });
});
