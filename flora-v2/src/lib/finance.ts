/**
 * Canonical financial semantics for Flora CRM.
 *
 * Source of truth for (contract term → implementing function):
 * - totalQuoted: sum of ALL quotation totals (any status) → sumQuotationTotals
 * - totalContractValue / projectValues: sum of project.totalContractValue → calcLifetimeRevenue
 * - totalPaid: sum of ALL payment amounts (project + quotation scoped) → sumPayments
 * - lifetimeRevenue: projectValues + approved quotes WITHOUT a project → calcLifetimeRevenue
 *   (avoids double-counting a converted quote -> project)
 * - outstanding: max(0, lifetimeRevenue - totalPaid) → calcOutstanding
 * - credit: max(0, totalPaid - lifetimeRevenue) → calcCredit — the overpayment
 *   above lifetime revenue, surfaced separately so Outstanding never renders negative
 * - composed portfolio figures (projectValues, standaloneQuotes, lifetimeRevenue,
 *   totalPaid, outstanding, credit) → calcPortfolioSummary
 *
 * Rules:
 * - Outstanding never goes negative in UI (overpayment is blocked at write
 *   time, but quotation+project combos can exceed; clamp to 0 and surface
 *   credit separately if needed).
 * - Ledger debits mirror lifetimeRevenue: approved standalone quotes + all
 *   projects. Converted quotes MUST NOT appear twice.
 * - calcPortfolioSummary is the single composed formula: it runs
 *   calcLifetimeRevenue, sumPayments, calcOutstanding and calcCredit over one
 *   set of inputs and returns every portfolio money figure.
 *
 * One portfolio-level input-assembly: getPortfolioFinancialSummary (src/lib/customer-financial.ts)
 * is the only portfolio-level input assembly: projects and approved quotations gated with deletedAt: null under a surviving parent enquiry,
 * payment rows whose project or quotation parent survives plus orphan rows (both Payment FKs are optional in prisma/schema.prisma) — and
 * both /dashboard and /dashboard/outstanding consume its output rather than re-reading or re-summing. The per-customer assemblies
 * getAllOutstandingBalances and getCustomerFinancialSummary MUST apply the same soft-delete gates, so a soft-deleted enquiry retires its
 * financials on every reader and the outstanding headers and table describe the same record set.
 *
 * Parity invariant: the dashboard Payment Overview Outstanding, its hero
 * Outstanding chip and the /dashboard/outstanding Total Outstanding each render
 * formatAED(outstanding, { decimals: false }) from this pipeline and must be
 * byte-equal — character-identical strings for the same data set.
 *
 * Display rules:
 * - outstanding is clamped ≥ 0 by calcOutstanding; credit is clamped ≥ 0 by
 *   calcCredit and rendered only when > 0.
 * - All AED formatting goes through formatAED (en-AE).
 * - No page may inline a money sum: add call sites only through
 *   calcLifetimeRevenue / calcOutstanding / sumPayments / calcPortfolioSummary /
 *   sumQuotationTotals / calcCredit (CONCERNS: "never inline a new sum").
 */

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatAED(value: number, opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals ?? true;
  return `AED ${(Number(value) || 0).toLocaleString("en-AE", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

export interface RevenueInputs {
  projects: Array<{ totalContractValue: number; quotationId?: string | null }>;
  approvedQuotations: Array<{ id: string; totalAmount: number }>;
}

export function calcLifetimeRevenue({ projects, approvedQuotations }: RevenueInputs): {
  projectValues: number;
  standaloneQuotes: number;
  lifetimeRevenue: number;
} {
  const projectValues = roundMoney(
    projects.reduce((s, p) => s + (Number(p.totalContractValue) || 0), 0)
  );
  const projectQuotationIds = new Set(
    projects.map((p) => p.quotationId).filter(Boolean) as string[]
  );
  const standaloneQuotes = roundMoney(
    approvedQuotations
      .filter((q) => !projectQuotationIds.has(q.id))
      .reduce((s, q) => s + (Number(q.totalAmount) || 0), 0)
  );
  return {
    projectValues,
    standaloneQuotes,
    lifetimeRevenue: roundMoney(projectValues + standaloneQuotes),
  };
}

export function calcOutstanding(lifetimeRevenue: number, totalPaid: number): number {
  return Math.max(0, roundMoney(lifetimeRevenue - totalPaid));
}

export function calcCredit(lifetimeRevenue: number, totalPaid: number): number {
  return Math.max(0, roundMoney(totalPaid - lifetimeRevenue));
}

export function sumPayments(payments: Array<{ amount: number }>): number {
  return roundMoney(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
}

export function sumQuotationTotals(quotations: Array<{ totalAmount: number }>): number {
  return roundMoney(quotations.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0));
}

export interface PortfolioInputs extends RevenueInputs {
  payments: Array<{ amount: number }>;
}

export function calcPortfolioSummary({
  projects,
  approvedQuotations,
  payments,
}: PortfolioInputs): {
  projectValues: number;
  standaloneQuotes: number;
  lifetimeRevenue: number;
  totalPaid: number;
  outstanding: number;
  credit: number;
} {
  const { projectValues, standaloneQuotes, lifetimeRevenue } = calcLifetimeRevenue({
    projects,
    approvedQuotations,
  });
  const totalPaid = sumPayments(payments);
  return {
    projectValues,
    standaloneQuotes,
    lifetimeRevenue,
    totalPaid,
    outstanding: calcOutstanding(lifetimeRevenue, totalPaid),
    credit: calcCredit(lifetimeRevenue, totalPaid),
  };
}
