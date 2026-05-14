"use client";
import { useState } from "react";
import type { Payment } from "@prisma/client";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";

type Props = {
  projectId:          string;
  totalContractValue: number;
  payments:           Payment[];
};

export function PaymentLedger({ projectId, totalContractValue, payments: initial }: Props) {
  const [payments, setPayments] = useState(initial);
  const [open, setOpen]         = useState(false);
  const [form, setForm] = useState({ amount: "", type: "ADVANCE", method: "CASH", reference: "", notes: "" });

  const totalPaid    = payments.reduce((s, p) => s + p.amount, 0);
  const balance      = totalContractValue - totalPaid;
  const paidPct      = totalContractValue ? (totalPaid / totalContractValue) * 100 : 0;

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";

  async function addPayment() {
    const res = await fetch(`/api/projects/${projectId}/payments`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (res.ok) {
      const p = await res.json();
      setPayments(prev => [...prev, p]);
      setOpen(false);
      setForm({ amount: "", type: "ADVANCE", method: "CASH", reference: "", notes: "" });
    }
  }

  const typeColors: Record<string, string> = {
    ADVANCE: "bg-blue-50 text-blue-700",
    INSTALLMENT: "bg-yellow-50 text-yellow-700",
    BALANCE: "bg-green-50 text-green-700",
    RETENTION: "bg-purple-50 text-purple-700",
  };

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Contract Value",  value: `AED ${totalContractValue.toLocaleString()}`, color: "#1A1A1A" },
          { label: "Total Paid",      value: `AED ${totalPaid.toLocaleString()}`,          color: "#0F6E56" },
          { label: "Balance Due",     value: `AED ${balance.toLocaleString()}`,            color: balance > 0 ? "#991B1B" : "#0F6E56" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#F8F5F2] rounded-xl p-4 border border-[#D8C9BC]">
            <div className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">{label}</div>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#6B625A] mb-1">
          <span>Payment Progress</span><span>{paidPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-[#EFE7DF] rounded-full overflow-hidden">
          <div className="h-full bg-[#5A0E12] rounded-full transition-all" style={{ width: `${Math.min(paidPct, 100)}%` }} />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-[#D8C9BC] rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
              {["Date","Type","Method","Amount","Reference","Notes"].map(h => (
                <th key={h} className="text-left p-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-[#6B625A] text-sm">No payments recorded yet.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} className="border-t border-[#EFE7DF]">
                <td className="p-3">{format(new Date(p.paidAt), "dd MMM yyyy")}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[p.type] ?? ""}`}>{p.type}</span></td>
                <td className="p-3">{p.method.replace(/_/g, " ")}</td>
                <td className="p-3 font-semibold text-[#5A0E12]">AED {p.amount.toLocaleString()}</td>
                <td className="p-3 text-[#6B625A]">{p.reference ?? "—"}</td>
                <td className="p-3 text-[#6B625A]">{p.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Payment */}
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-[#5A0E12] text-sm hover:underline">
          <PlusCircle size={15} /> Record Payment
        </button>
      ) : (
        <div className="border border-[#D8C9BC] rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-sm text-[#5A0E12]">Record Payment</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1">Amount (AED) *</label>
              <input type="number" className={field} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1">Type</label>
              <select className={field} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["ADVANCE","INSTALLMENT","BALANCE","RETENTION"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1">Method</label>
              <select className={field} value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                {["CASH","CARD","BANK_TRANSFER","CHEQUE"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1">Reference / Cheque No.</label>
              <input className={field} value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1">Notes</label>
              <input className={field} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addPayment} className="bg-[#5A0E12] text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-[#7A1E22]">Save</button>
            <button onClick={() => setOpen(false)} className="bg-[#EFE7DF] text-[#6B625A] rounded-lg px-6 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}