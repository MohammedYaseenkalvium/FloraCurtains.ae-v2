"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

type Props = {
  enquiryId: string;
  quotationId: string;
  quoteTotal?: number;
};

export function ConvertToProject({
  enquiryId,
  quotationId,
  quoteTotal,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    totalContractValue:
      quoteTotal !== undefined ? String(quoteTotal) : "",
    startDate: "",
    endDate: "",
    installationDate: "",
    siteAddress: "",
    poNumber: "",
    poDate: "",
    notes: "",
  });

  const field =
    "w-full rounded-lg border border-[#D8C9BC] bg-[#F8F5F2] px-3 py-2 text-sm outline-none transition-colors focus:border-[#5A0E12] focus:bg-white";

  const label =
    "mb-1 block text-[10px] font-medium uppercase tracking-widest text-[#6B625A]";

  function updateField(
    key: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleConvert() {
    if (!form.totalContractValue) {
      setError("Contract value is required.");
      return;
    }

    const contractValue = Number(form.totalContractValue);

    if (!Number.isFinite(contractValue) || contractValue <= 0) {
      setError("Enter a valid contract value.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/enquiries/${enquiryId}/convert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            totalContractValue: contractValue,
            quotationId,
          }),
        }
      );

      if (!res.ok) {
        let message =
          "Failed to convert quotation to project.";

        try {
          const data = await res.json();

          message =
            data?.error?.message ??
            data?.message ??
            message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const project = await res.json();

      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to convert quotation to project."
      );
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D5A45]"
      >
        <CheckCircle2 size={15} />
        Convert to Project
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[#B7D8CC] bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1E1B18]">
            Convert to Project
          </h3>

          <p className="mt-1 text-xs text-[#6B625A]">
            Create a project from this approved quotation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          aria-label="Close conversion form"
          className="rounded-lg p-2 text-[#6B625A] transition-colors hover:bg-[#F8F5F2] disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border border-[#E8BDBD] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={label}>
            Contract Value (AED) *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            className={field}
            value={form.totalContractValue}
            onChange={(event) =>
              updateField(
                "totalContractValue",
                event.target.value
              )
            }
          />
        </div>

        <div>
          <label className={label}>PO Number</label>

          <input
            className={field}
            value={form.poNumber}
            onChange={(event) =>
              updateField("poNumber", event.target.value)
            }
            placeholder="Optional"
          />
        </div>

        <div>
          <label className={label}>Start Date</label>

          <input
            type="date"
            className={field}
            value={form.startDate}
            onChange={(event) =>
              updateField("startDate", event.target.value)
            }
          />
        </div>

        <div>
          <label className={label}>End Date</label>

          <input
            type="date"
            className={field}
            value={form.endDate}
            onChange={(event) =>
              updateField("endDate", event.target.value)
            }
          />
        </div>

        <div>
          <label className={label}>
            Installation Date
          </label>

          <input
            type="date"
            className={field}
            value={form.installationDate}
            onChange={(event) =>
              updateField(
                "installationDate",
                event.target.value
              )
            }
          />
        </div>

        <div>
          <label className={label}>PO Date</label>

          <input
            type="date"
            className={field}
            value={form.poDate}
            onChange={(event) =>
              updateField("poDate", event.target.value)
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className={label}>Site Address</label>

          <input
            className={field}
            value={form.siteAddress}
            onChange={(event) =>
              updateField(
                "siteAddress",
                event.target.value
              )
            }
            placeholder="Project site address"
          />
        </div>

        <div className="md:col-span-2">
          <label className={label}>Project Notes</label>

          <textarea
            className={field}
            rows={3}
            value={form.notes}
            onChange={(event) =>
              updateField("notes", event.target.value)
            }
            placeholder="Project-specific notes..."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#EFE7DF] pt-5">
        <button
          type="button"
          onClick={handleConvert}
          disabled={
            loading || !form.totalContractValue
          }
          className="rounded-lg bg-[#0F6E56] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0D5A45] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating Project..."
            : "Confirm & Create Project"}
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-lg bg-[#F8F5F2] px-6 py-2.5 text-sm font-medium text-[#6B625A] transition-colors hover:bg-[#EFE7DF] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}