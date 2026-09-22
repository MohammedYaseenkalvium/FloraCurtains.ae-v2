"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentSchedule, PaymentScheduleDueType } from "@prisma/client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  projectId: string;
  contractValue: number;
  initialSchedules: PaymentSchedule[];
};

const DUE_TYPES: PaymentScheduleDueType[] = [
  "EXACT_DATE",
  "ON_APPROVAL",
  "BEFORE_PRODUCTION",
  "BEFORE_INSTALLATION",
  "ON_INSTALLATION",
  "ON_COMPLETION",
];

const emptyRow = {
  description: "",
  percentage: "",
  amount: "",
  dueType: "EXACT_DATE" as PaymentScheduleDueType,
  dueDate: "",
  notes: "",
};

const field =
  "border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface w-full";
const label = "text-[10px] uppercase tracking-widest text-flora-muted block mb-1";

export function PaymentScheduleManager({ projectId, contractValue, initialSchedules }: Props) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<PaymentSchedule[]>(initialSchedules);
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState([emptyRow]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const planned = schedules
    .filter((s) => s.status !== "CANCELLED")
    .reduce((sum, s) => sum + s.amount, 0);

  function setRow(i: number, patch: Partial<typeof emptyRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function savePlan() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedules: rows.map((r) => ({
            description: r.description,
            percentage: r.percentage === "" ? undefined : Number(r.percentage),
            amount: Number(r.amount),
            dueType: r.dueType,
            dueDate: r.dueDate || undefined,
            notes: r.notes || undefined,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to save payment schedule.");
        return;
      }
      setSchedules(data);
      setEditing(false);
      setRows([emptyRow]);
      router.refresh();
    } catch {
      setError("Failed to save payment schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: PaymentSchedule["status"]) {
    setError("");
    const res = await fetch(`/api/schedules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Failed to update milestone.");
      return;
    }
    setSchedules((prev) => prev.map((s) => (s.id === id ? data : s)));
    router.refresh();
  }

  async function deleteMilestone(id: string) {
    setError("");
    const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Failed to delete milestone.");
      setPendingDeleteId(null);
      return;
    }
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setPendingDeleteId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-flora-muted">
          Planned{" "}
          <span className="font-semibold text-flora-foreground">
            AED {planned.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-flora-foreground">
            AED {contractValue.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
          </span>
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setEditing(true);
            }}
            className="rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary transition-colors hover:bg-flora-surface"
          >
            {schedules.length > 0 ? "Replace plan" : "Create plan"}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {schedules.length === 0 && !editing && (
        <p className="text-sm text-flora-muted">No payment milestones yet.</p>
      )}

      {schedules.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-flora-border/60 text-left text-[10px] uppercase tracking-widest text-flora-muted">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Milestone</th>
                <th className="px-3 py-2 font-semibold">Due</th>
                <th className="px-3 py-2 font-semibold text-right">Amount</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-flora-border/60 last:border-b-0">
                  <td className="px-3 py-3 text-flora-muted">{s.sequence}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{s.description}</p>
                    {s.percentage != null && (
                      <p className="text-xs text-flora-muted">{s.percentage}% of contract</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-flora-muted">
                    {s.dueDate
                      ? new Date(s.dueDate).toLocaleDateString("en-AE")
                      : s.dueType.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">
                    AED {s.amount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      aria-label={`Status for ${s.description}`}
                      value={s.status}
                      onChange={(e) => setStatus(s.id, e.target.value as PaymentSchedule["status"])}
                      className="rounded-lg border border-flora-border bg-flora-surface px-2 py-1 text-xs"
                    >
                      {["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"].map((st) => (
                        <option key={st} value={st}>
                          {st.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(s.id)}
                      aria-label={`Delete milestone ${s.description}`}
                      className="text-xs text-[#991B1B] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="mt-4 space-y-3 rounded-xl border border-flora-border bg-[#FCFAF8] p-4">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 border-b border-flora-border/60 pb-3 last:border-b-0 last:pb-0 md:grid-cols-4">
              <div className="col-span-2">
                <label className={label}>Description *</label>
                <input className={field} value={row.description} onChange={(e) => setRow(i, { description: e.target.value })} placeholder="e.g. Advance on approval" />
              </div>
              <div>
                <label className={label}>Amount (AED) *</label>
                <input type="number" min="0" step="0.01" className={field} value={row.amount} onChange={(e) => setRow(i, { amount: e.target.value })} />
              </div>
              <div>
                <label className={label}>% (optional)</label>
                <input type="number" min="0" max="100" step="0.01" className={field} value={row.percentage} onChange={(e) => setRow(i, { percentage: e.target.value })} />
              </div>
              <div>
                <label className={label}>Due</label>
                <select className={field} value={row.dueType} onChange={(e) => setRow(i, { dueType: e.target.value as PaymentScheduleDueType })}>
                  {DUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Date (if exact)</label>
                <input type="date" className={field} value={row.dueDate} onChange={(e) => setRow(i, { dueDate: e.target.value })} />
              </div>
              <div className="col-span-2 flex items-end justify-between gap-2">
                <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} disabled={rows.length === 1} className="text-xs text-[#991B1B] hover:underline disabled:opacity-40">
                  Remove
                </button>
                {i === rows.length - 1 && (
                  <button type="button" onClick={() => setRows((prev) => [...prev, emptyRow])} className="text-xs font-medium text-flora-primary hover:underline">
                    + Add milestone
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-flora-muted">
            Total must equal the contract value. Milestones cannot be replaced once any of them is being paid.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={savePlan} disabled={saving} className="rounded-lg bg-flora-primary px-4 py-2 text-sm font-medium text-white hover:bg-flora-primary-hover disabled:opacity-50">
              {saving ? "Saving…" : "Save plan"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setError(""); setRows([emptyRow]); }} className="rounded-lg border border-flora-border px-4 py-2 text-sm text-flora-muted hover:bg-flora-surface">
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title="Delete milestone?"
        description="This action cannot be undone. Paid milestones cannot be deleted."
        confirmLabel="Delete milestone"
        onConfirm={() => {
          if (pendingDeleteId) deleteMilestone(pendingDeleteId);
        }}
      />
    </div>
  );
}
