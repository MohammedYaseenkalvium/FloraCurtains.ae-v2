"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Enquiry, EnquiryStatus } from "@prisma/client";

const statuses: EnquiryStatus[] = ["NEW","CONTACTED","VISIT_SCHEDULED","QUOTED","NEGOTIATING","WON","LOST"];

const statusColors: Record<string, string> = {
  NEW: "#8B8178", CONTACTED: "#185FA5", VISIT_SCHEDULED: "#854D0E",
  QUOTED: "#0F6E56", NEGOTIATING: "#7F77DD", WON: "#166534", LOST: "#991B1B",
};

export function EnquiryEditForm({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    serviceWanted: enquiry.serviceWanted,
    remarks: enquiry.remarks ?? "",
    desiredBudget: enquiry.desiredBudget ? String(enquiry.desiredBudget) : "",
    interestLevel: String(enquiry.interestLevel),
    assignedTo: enquiry.assignedTo ?? "",
    followUpDate: enquiry.followUpDate ? new Date(enquiry.followUpDate).toISOString().split("T")[0] : "",
    status: enquiry.status,
    siteAddress: enquiry.siteAddress ?? "",
    projectName: enquiry.projectName ?? "",
  });

  const field = "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";
  const label = "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/enquiries/${enquiry.id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        desiredBudget: form.desiredBudget ? Number(form.desiredBudget) : undefined,
        interestLevel: Number(form.interestLevel),
        followUpDate: form.followUpDate || undefined,
      }),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert("Failed to save changes");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Service Wanted</label>
          <input
            className={field}
            value={form.serviceWanted}
            onChange={e => setForm(f => ({ ...f, serviceWanted: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className={label}>Site / Delivery Address</label>
          <input
            className={field}
            value={form.siteAddress}
            onChange={e => setForm(f => ({ ...f, siteAddress: e.target.value }))}
          />
        </div>
        <div>
          <label className={label}>Status</label>
          <select
            className={field}
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as EnquiryStatus }))}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Interest Level (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            className={field}
            value={form.interestLevel}
            onChange={e => setForm(f => ({ ...f, interestLevel: e.target.value }))}
          />
        </div>
        <div>
          <label className={label}>Budget (AED)</label>
          <input
            type="number"
            className={field}
            value={form.desiredBudget}
            onChange={e => setForm(f => ({ ...f, desiredBudget: e.target.value }))}
          />
        </div>
        <div>
          <label className={label}>Assigned To</label>
          <input
            className={field}
            value={form.assignedTo}
            onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
            placeholder="Staff name"
          />
        </div>
        <div>
          <label className={label}>Follow-up Date</label>
          <input
            type="date"
            className={field}
            value={form.followUpDate}
            onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))}
          />
        </div>
        <div>
          <label className={label}>Project / Tender Name</label>
          <input
            className={field}
            value={form.projectName}
            onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
          />
        </div>
        <div className="col-span-2">
          <label className={label}>Call Notes / Remarks</label>
          <textarea
            className={field}
            rows={3}
            value={form.remarks}
            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#5A0E12] text-white rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-[#7A1E22] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-[#0F6E56]">✓ Saved successfully</span>}
      </div>
    </div>
  );
}