"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConvertToProject({ enquiryId, quoteTotal }: { enquiryId: string; quoteTotal?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    totalContractValue: quoteTotal ? String(quoteTotal) : "",
    startDate: "",
    endDate: "",
    installationDate: "",
    siteAddress: "",
    poNumber: "",
    poDate: "",
    notes: "",
  });

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  async function handleConvert() {
    setLoading(true);
    const res = await fetch(`/api/enquiries/${enquiryId}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        totalContractValue: Number(form.totalContractValue),
      }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } else {
      setLoading(false);
      alert("Failed to convert. Project may already exist.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-[#0F6E56] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#0D5A45] transition-colors"
      >
        ✓ Convert to Project
      </button>
    );
  }

  return (
    <div className="bg-white border border-[#D8C9BC] rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-sm text-[#5A0E12]">Convert Enquiry to Project</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Contract Value (AED) *</label>
          <input
            type="number"
            className={field}
            value={form.totalContractValue}
            onChange={e => setForm(f => ({ ...f, totalContractValue: e.target.value }))}
          />
        </div>
        <div>
          <label className={label}>PO Number</label>
          <input className={field} value={form.poNumber} onChange={e => setForm(f => ({ ...f, poNumber: e.target.value }))} />
        </div>
        <div>
          <label className={label}>Start Date</label>
          <input type="date" className={field} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label className={label}>End Date</label>
          <input type="date" className={field} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <div>
          <label className={label}>Installation Date</label>
          <input type="date" className={field} value={form.installationDate} onChange={e => setForm(f => ({ ...f, installationDate: e.target.value }))} />
        </div>
        <div>
          <label className={label}>PO Date</label>
          <input type="date" className={field} value={form.poDate} onChange={e => setForm(f => ({ ...f, poDate: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className={label}>Site Address</label>
          <input className={field} value={form.siteAddress} onChange={e => setForm(f => ({ ...f, siteAddress: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className={label}>Notes</label>
          <textarea className={field} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleConvert}
          disabled={loading || !form.totalContractValue}
          className="bg-[#0F6E56] text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-[#0D5A45] disabled:opacity-50 transition-colors"
        >
          {loading ? "Converting…" : "Confirm & Create Project"}
        </button>
        <button onClick={() => setOpen(false)} className="bg-[#EFE7DF] text-[#6B625A] rounded-lg px-6 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}