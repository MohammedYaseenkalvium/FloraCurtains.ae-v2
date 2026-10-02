import { getAllOutstandingBalances, getPortfolioFinancialSummary } from "@/lib/customer-financial";
import { formatAED } from "@/lib/finance";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Outstanding header region: page heading plus the four summary cards.
 * Queries moved verbatim from outstanding/page.tsx (shared portfolio
 * pipeline plus the balances list behind the Overdue / Customers counts).
 * Money only through formatAED (Ph3 D-02 one-money-pipeline rule).
 */
export async function OutstandingHeaders() {
  const [portfolio, customers] = await Promise.all([getPortfolioFinancialSummary(), getAllOutstandingBalances()]);

  const overdueCustomers = customers.filter(c => (c.daysSincePayment ?? 0) > 30);

  return (
    <>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Outstanding Balances</h1>
          <p className="text-flora-muted text-sm mt-1">
            {customers.length} customers owing · {formatAED(portfolio.outstanding, { decimals: false })} total
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-flora-muted mb-2">Total Outstanding</div>
          <div className="text-3xl font-extrabold text-flora-danger">{formatAED(portfolio.outstanding, { decimals: false })}</div>
        </div>
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-flora-muted mb-2">Overdue (&gt;30 days)</div>
          <div className="text-3xl font-extrabold text-flora-warning">{overdueCustomers.length}</div>
        </div>
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-flora-muted mb-2">Customers</div>
          <div className="text-3xl font-extrabold text-flora-foreground">{customers.length}</div>
        </div>
        {portfolio.credit > 0 && (
          <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-flora-muted mb-2">Credit</div>
            <div className="text-3xl font-extrabold text-flora-foreground">{formatAED(portfolio.credit, { decimals: false })}</div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Outstanding table region: the balances ledger with overdue / stale row
 * tone. Query and daysSincePayment derivations moved verbatim from
 * outstanding/page.tsx. Zero balances render a purposeful empty table
 * state (no CTA — nothing to create; finance figures are trust-critical).
 */
export async function OutstandingTable() {
  const customers = await getAllOutstandingBalances();

  return (
    <div className="bg-white border border-flora-border rounded-xl overflow-hidden">
      {customers.length === 0 ? (
        <EmptyState title="No outstanding balances." />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-flora-cream text-flora-muted text-[10px] uppercase tracking-widest">
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-right px-5 py-3 font-medium">Lifetime Value</th>
              <th className="text-right px-5 py-3 font-medium">Total Paid</th>
              <th className="text-right px-5 py-3 font-medium">Outstanding</th>
              <th className="text-center px-5 py-3 font-medium">Last Payment</th>
              <th className="text-left px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => {
              const isOverdue = (c.daysSincePayment ?? 0) > 30;
              const isStale = (c.daysSincePayment ?? 0) > 14;

              return (
                <tr key={c.customerId} className="border-t border-flora-border/50 hover:bg-flora-surface/60">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.customerName}</div>
                    <div className="text-xs text-flora-muted flex items-center gap-1">
                      <Phone size={12} /> {c.customerPhone}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-flora-muted text-xs">{c.companyName ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatAED(c.lifetimeValue, { decimals: false })}
                  </td>
                  <td className="px-5 py-3 text-right text-flora-success">
                    {formatAED(c.totalPaid, { decimals: false })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-bold ${isOverdue ? "text-flora-danger" : "text-flora-foreground"}`}>
                      {formatAED(c.outstanding, { decimals: false })}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.lastPaymentDate ? (
                      <span className={`text-xs flex items-center justify-center gap-1 ${
                        isOverdue ? "text-flora-danger" : isStale ? "text-flora-warning" : "text-flora-muted"
                      }`}>
                        {isOverdue && <AlertTriangle size={12} />}
                        {isStale && !isOverdue && <Clock size={12} />}
                        {c.daysSincePayment}d ago
                      </span>
                    ) : (
                      <span className="text-xs text-flora-meta-text">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/customers/${c.customerId}`}
                      className="inline-flex items-center gap-1 text-flora-primary text-xs hover:underline font-medium"
                    >
                      View
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
