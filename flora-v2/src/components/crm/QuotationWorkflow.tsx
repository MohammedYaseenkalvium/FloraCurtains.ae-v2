"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuotationStatus } from "@prisma/client";

const flow: { status: QuotationStatus; label: string; color: string }[] = [
  { status: "DRAFT", label: "Draft", color: "#8B8178" },
  { status: "SENT", label: "Sent", color: "#185FA5" },
  { status: "APPROVED", label: "Approved", color: "#0F6E56" },
  { status: "REJECTED", label: "Rejected", color: "#991B1B" },
  { status: "REVISED", label: "Revised", color: "#854D0E" },
];

export function QuotationStatusWorkflow({
  quotationId,
  currentStatus,
}: {
  quotationId: string;
  currentStatus: QuotationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: QuotationStatus) {
    setLoading(true);
    const res = await fetch(`/api/quotations/${quotationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {flow.map((step, i) => {
        const isActive = step.status === status;
        const isPast = flow.findIndex(s => s.status === status) > i;
        return (
          <div key={step.status} className="flex items-center gap-2">
            <button
              onClick={() => updateStatus(step.status)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: isActive ? `${step.color}18` : isPast ? `${step.color}10` : "white",
                color: isActive || isPast ? step.color : "#6B625A",
                borderColor: isActive ? step.color : "#D8C9BC",
              }}
            >
              {step.label}
            </button>
            {i < flow.length - 1 && (
              <span className="text-[#D8C9BC]">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}