"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuotationStatus } from "@prisma/client";
import { Check, RotateCcw, Send, X } from "lucide-react";

type WorkflowAction = {
  status: QuotationStatus;
  label: string;
  icon: typeof Send;
};

const transitions: Record<QuotationStatus, WorkflowAction[]> = {
  DRAFT: [
    {
      status: "SENT",
      label: "Send Quotation",
      icon: Send,
    },
  ],

  SENT: [
    {
      status: "APPROVED",
      label: "Approve",
      icon: Check,
    },
    {
      status: "REJECTED",
      label: "Reject",
      icon: X,
    },
    {
      status: "REVISED",
      label: "Revise",
      icon: RotateCcw,
    },
  ],

  APPROVED: [],

  REJECTED: [
    {
      status: "REVISED",
      label: "Revise",
      icon: RotateCcw,
    },
  ],

  REVISED: [
    {
      status: "SENT",
      label: "Send Revised Quotation",
      icon: Send,
    },
  ],
};

const statusStyles: Record<
  QuotationStatus,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  DRAFT: {
    background: "#F8F5F2",
    text: "#6B625A",
    border: "#D8C9BC",
  },

  SENT: {
    background: "#EEF4FA",
    text: "#185FA5",
    border: "#B8D0E5",
  },

  APPROVED: {
    background: "#EDF7F3",
    text: "#0F6E56",
    border: "#B7D8CC",
  },

  REJECTED: {
    background: "#FEF2F2",
    text: "#991B1B",
    border: "#E8BDBD",
  },

  REVISED: {
    background: "#FEF9E7",
    text: "#854D0E",
    border: "#E6D19B",
  },
};

const statusLabels: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISED: "Revised",
};

export function QuotationStatusWorkflow({
  quotationId,
  currentStatus,
}: {
  quotationId: string;
  currentStatus: QuotationStatus;
}) {
  const router = useRouter();

  const [status, setStatus] =
    useState<QuotationStatus>(currentStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const actions = transitions[status];
  const currentStyle = statusStyles[status];

  async function updateStatus(
    newStatus: QuotationStatus
  ) {
    setLoading(true);
    setError("");

    try {
      /*
       * REVISE is different from the other workflow actions.
       *
       * It creates a NEW quotation instead of changing
       * the existing quotation.
       */
      if (newStatus === "REVISED") {
        const res = await fetch(
          `/api/quotations/${quotationId}/revise`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const message =
            data?.error?.message ??
            data?.error ??
            data?.message ??
            "Failed to create revised quotation.";

          throw new Error(message);
        }

        /*
         * The API returns the newly-created quotation.
         * Open the new quotation workspace.
         */
        if (data?.id) {
          router.push(`/quotations/${data.id}`);
          router.refresh();
          return;
        }

        throw new Error(
          "Revised quotation was created but its ID was not returned."
        );
      }

      /*
       * All other status changes continue using the
       * existing status endpoint.
       */
      const res = await fetch(
        `/api/quotations/${quotationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        let message =
          "Failed to update quotation status.";

        try {
          const data = await res.json();

          message =
            data?.error?.message ??
            data?.error ??
            data?.message ??
            message;
        } catch {
          // Keep default message.
        }

        throw new Error(message);
      }

      setStatus(newStatus);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update quotation status."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Current status */}
        <div
          className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: currentStyle.background,
            color: currentStyle.text,
            borderColor: currentStyle.border,
          }}
        >
          {statusLabels[status]}
        </div>

        {actions.length > 0 && (
          <>
            <span className="text-[#D8C9BC]">
              →
            </span>

            {actions.map((action) => {
              const Icon = action.icon;

              const isReject =
                action.status === "REJECTED";

              const isRevise =
                action.status === "REVISED";

              return (
                <button
                  key={action.status}
                  type="button"
                  onClick={() =>
                    updateStatus(action.status)
                  }
                  disabled={loading}
                  className={[
                    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",

                    isReject
                      ? "border border-[#E8BDBD] bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FDE8E8]"
                      : isRevise
                        ? "border border-[#E6D19B] bg-[#FEF9E7] text-[#854D0E] hover:bg-[#FDF3CF]"
                        : "bg-[#5A0E12] text-white hover:bg-[#74171C]",
                  ].join(" ")}
                >
                  <Icon size={13} />

                  {loading
                    ? isRevise
                      ? "Creating Revision..."
                      : "Updating..."
                    : action.label}
                </button>
              );
            })}
          </>
        )}
      </div>

      {error && (
        <p
          className="text-xs text-[#991B1B]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}