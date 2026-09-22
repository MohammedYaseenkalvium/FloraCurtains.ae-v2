/**
 * Canonical financial semantics for Flora CRM.
 *
 * Source of truth for:
 * - totalQuoted: sum of ALL quotation totals (any status)
 * - totalContractValue / projectValues: sum of project.totalContractValue
 * - totalPaid: sum of ALL payment amounts (project + quotation scoped)
 * - lifetimeRevenue: projectValues + approved quotes WITHOUT a project
 *   (avoids double-counting a converted quote -> project)
 * - outstanding: max(0, lifetimeRevenue - totalPaid)
 *
 * Rules:
 * - Outstanding never goes negative in UI (overpayment is blocked at write
 *   time, but quotation+project combos can exceed; clamp to 0 and surface
 *   credit separately if needed).
 * - Ledger debits mirror lifetimeRevenue: approved standalone quotes + all
 *   projects. Converted quotes MUST NOT appear twice.
 * - All AED formatting goes through formatAED (en-AE).
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

export function sumPayments(payments: Array<{ amount: number }>): number {
  return roundMoney(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
}
