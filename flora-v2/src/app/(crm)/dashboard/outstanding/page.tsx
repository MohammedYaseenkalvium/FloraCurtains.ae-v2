import { getAllOutstandingBalances } from "@/lib/customer-financial";
import Link from "next/link";
import { AlertTriangle, Clock, Phone } from "lucide-react";

export default async function OutstandingBalancesPage() {
  const customers = await getAllOutstandingBalances();

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const overdueCustomers = customers.filter(c => (c.daysSincePayment ?? 0) > 30);

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Outstanding Balances</h1>
          <p className="text-[#6B625A] text-sm mt-1">
            {customers.length} customers owing · AED {totalOutstanding.toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">Total Outstanding</div>
          <div className="text-3xl font-extrabold text-[#991B1B]">AED {totalOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">Overdue (&gt;30 days)</div>
          <div className="text-3xl font-extrabold text-[#854D0E]">{overdueCustomers.length}</div>
        </div>
        <div className="bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">Customers</div>
          <div className="text-3xl font-extrabold text-[#1A1A1A]">{customers.length}</div>
        </div>
      </div>

      {/* Balances Table */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
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
                <tr key={c.customerId} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                  <td className="px-5 py-3">
                    <div className="font-medium">{c.customerName}</div>
                    <div className="text-xs text-[#6B625A] flex items-center gap-1">
                      <Phone size={12} /> {c.customerPhone}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B625A] text-xs">{c.companyName ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-medium">
                    AED {c.lifetimeValue.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right text-[#0F6E56]">
                    AED {c.totalPaid.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-bold ${isOverdue ? "text-[#991B1B]" : "text-[#1A1A1A]"}`}>
                      AED {c.outstanding.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {c.lastPaymentDate ? (
                      <span className={`text-xs flex items-center justify-center gap-1 ${
                        isOverdue ? "text-[#991B1B]" : isStale ? "text-[#854D0E]" : "text-[#6B625A]"
                      }`}>
                        {isOverdue && <AlertTriangle size={12} />}
                        {isStale && !isOverdue && <Clock size={12} />}
                        {c.daysSincePayment}d ago
                      </span>
                    ) : (
                      <span className="text-xs text-[#8B8178]">Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link 
                      href={`/customers/${c.customerId}`}
                      className="text-[#5A0E12] text-xs hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
