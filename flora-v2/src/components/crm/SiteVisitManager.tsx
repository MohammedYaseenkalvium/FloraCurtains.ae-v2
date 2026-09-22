"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MeasurementManager } from "@/components/crm/MeasurementManager";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Measurement = {
  id: string;
  siteVisitId: string;
  roomName: string;
  openingName: string | null;
  openingType: string | null;
  width: number;
  height: number;
  unit: "MM" | "CM" | "M" | "FT" | "IN";
  quantity: number;
  curtainType: string | null;
  trackType: string | null;
  remarks: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string | null;
  caption: string | null;
};

type SiteVisit = {
  id: string;
  enquiryId: string;
  projectId: string | null;
  scheduledAt: Date | string | null;
  completedAt: Date | string | null;
  assignedTo: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  siteAddress: string | null;
  notes: string | null;
  measurements: Measurement[];
  attachments: Attachment[];
  createdAt: Date | string;
};

type Props = {
  enquiryId: string;
  projectId?: string;
  initialVisits: SiteVisit[];
  defaultAddress?: string | null;
};

const field =
  "border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-flora-surface w-full";

const label =
  "text-[10px] uppercase tracking-widest text-flora-muted block mb-1";

const statusStyles: Record<
  SiteVisit["status"],
  { bg: string; text: string }
> = {
  SCHEDULED: {
    bg: "#FFF7ED",
    text: "#9A3412",
  },

  COMPLETED: {
    bg: "#ECFDF5",
    text: "#166534",
  },

  CANCELLED: {
    bg: "#FEF2F2",
    text: "#991B1B",
  },

  RESCHEDULED: {
    bg: "#EFF6FF",
    text: "#185FA5",
  },
};

function formatDate(value: Date | string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SiteVisitManager({
  enquiryId,
  projectId,
  initialVisits,
  defaultAddress,
}: Props) {
  const router = useRouter();

  const [visits, setVisits] =
    useState<SiteVisit[]>(initialVisits);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [actionError, setActionError] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [attachFormFor, setAttachFormFor] = useState<string | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [attachForm, setAttachForm] = useState({
    fileName: "",
    fileUrl: "",
    fileType: "PHOTO",
    caption: "",
  });

  const [form, setForm] = useState({
    scheduledAt: "",
    assignedTo: "",
    siteAddress: defaultAddress ?? "",
    notes: "",
  });

  async function createVisit() {
    if (!form.scheduledAt) {
      setActionError("Please select a visit date and time.");
      return;
    }

    setActionError("");
    setLoading(true);

    try {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enquiryId,
          projectId: projectId || undefined,
          scheduledAt: new Date(
            form.scheduledAt
          ).toISOString(),
          assignedTo:
            form.assignedTo || undefined,
          siteAddress:
            form.siteAddress || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => null);

        setActionError(
          data?.error ??
            "Failed to schedule site visit."
        );

        return;
      }

      const visit = await res.json();

      setVisits((current) => [
        visit,
        ...current,
      ]);

      setForm({
        scheduledAt: "",
        assignedTo: "",
        siteAddress:
          defaultAddress ?? "",
        notes: "",
      });

      setShowForm(false);

      router.refresh();
    } catch {
      setActionError(
        "Failed to schedule site visit."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    visitId: string,
    status:
      | "SCHEDULED"
      | "COMPLETED"
      | "CANCELLED"
      | "RESCHEDULED",
    scheduledAt?: string
  ) {
    setActionError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/site-visits/${visitId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            ...(scheduledAt ? { scheduledAt } : {}),
          }),
        }
      );

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => null);

        setActionError(
          data?.error ??
            "Failed to update site visit."
        );

        return;
      }

      const updated = await res.json();

      setVisits((current) =>
        current.map((visit) =>
          visit.id === visitId
            ? {
                ...visit,
                ...updated,
              }
            : visit
        )
      );

      setRescheduleFor(null);
      router.refresh();
    } catch {
      setActionError(
        "Failed to update site visit."
      );
    } finally {
      setLoading(false);
    }
  }

  async function addAttachment(visitId: string) {
    if (!attachForm.fileName.trim() || !attachForm.fileUrl.trim()) {
      setActionError("File name and URL are required to attach a file.");
      return;
    }
    setActionError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/site-visits/${visitId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: attachForm.fileName.trim(),
          fileUrl: attachForm.fileUrl.trim(),
          fileType: attachForm.fileType,
          caption: attachForm.caption.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionError(data?.error ?? "Failed to attach file.");
        return;
      }
      setVisits((current) =>
        current.map((visit) =>
          visit.id === visitId
            ? { ...visit, attachments: [...visit.attachments, data] }
            : visit
        )
      );
      setAttachForm({ fileName: "", fileUrl: "", fileType: "PHOTO", caption: "" });
      setAttachFormFor(null);
      router.refresh();
    } catch {
      setActionError("Failed to attach file.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAttachment(visitId: string, attachmentId: string) {
    setActionError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionError(data?.error ?? "Failed to remove attachment.");
        return;
      }
      setVisits((current) =>
        current.map((visit) =>
          visit.id === visitId
            ? { ...visit, attachments: visit.attachments.filter((a) => a.id !== attachmentId) }
            : visit
        )
      );
      router.refresh();
    } catch {
      setActionError("Failed to remove attachment.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVisit(
    visitId: string
  ) {
    setActionError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/site-visits/${visitId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => null);

        setActionError(
          data?.error ??
            "Failed to delete site visit."
        );

        return;
      }

      setVisits((current) =>
        current.filter(
          (visit) =>
            visit.id !== visitId
        )
      );

      router.refresh();
    } catch {
      setActionError(
        "Failed to delete site visit."
      );
    } finally {
      setLoading(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="bg-white border border-flora-border rounded-xl p-5 mb-6">
      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {actionError}
        </p>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-sm text-flora-primary">
            Site Visits
          </h3>

          <p className="text-xs text-flora-muted mt-1">
            Schedule visits, record measurements and
            track site progress.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="bg-flora-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-flora-primary-hover transition-colors"
          >
            + Schedule Visit
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border border-flora-border rounded-xl p-4 mb-5 bg-[#FCFAF8]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-sm text-flora-primary">
                Schedule Site Visit
              </h4>

              <p className="text-xs text-flora-muted mt-1">
                Add the visit schedule and site
                instructions.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              disabled={loading}
              className="text-flora-muted hover:text-flora-primary text-lg"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className={label}>
                Visit Date & Time *
              </label>

              <input
                type="datetime-local"
                className={field}
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    scheduledAt:
                      e.target.value,
                  }))
                }
              />
            </div>

            {/* Assigned Staff */}
            <div>
              <label className={label}>
                Assigned Staff
              </label>

              <input
                className={field}
                placeholder="Staff name"
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    assignedTo:
                      e.target.value,
                  }))
                }
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className={label}>
                Site Address
              </label>

              <input
                className={field}
                value={form.siteAddress}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    siteAddress:
                      e.target.value,
                  }))
                }
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={label}>
                Visit Notes
              </label>

              <textarea
                className={field}
                rows={3}
                placeholder="Access instructions, customer requirements, parking details..."
                value={form.notes}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    notes:
                      e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={createVisit}
              disabled={loading}
              className="bg-flora-primary text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-flora-primary-hover disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Schedule Visit"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              disabled={loading}
              className="bg-[#EFE7DF] text-flora-muted rounded-lg px-5 py-2 text-sm hover:bg-[#E7DDD3]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {visits.length === 0 &&
        !showForm && (
          <div className="border border-dashed border-flora-border rounded-xl p-8 text-center">
            <div className="text-2xl mb-2">
              📐
            </div>

            <p className="text-sm font-medium text-flora-primary">
              No site visits scheduled
            </p>

            <p className="text-xs text-flora-muted mt-1">
              Schedule the first site visit to
              start capturing measurements.
            </p>
          </div>
        )}

      {/* Visit List */}
      {visits.length > 0 && (
        <div className="space-y-4">
          {visits.map((visit) => {
            const style =
              statusStyles[
                visit.status
              ];

            return (
              <div
                key={visit.id}
                className="border border-flora-border rounded-xl p-4"
              >
                {/* Visit Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-[#2E2925]">
                        Site Visit
                      </span>

                      <span
                        className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide"
                        style={{
                          background:
                            style.bg,
                          color:
                            style.text,
                        }}
                      >
                        {visit.status.replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-flora-muted mt-1">
                      {formatDate(
                        visit.scheduledAt
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {visit.status ===
                      "SCHEDULED" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          updateStatus(
                            visit.id,
                            "COMPLETED"
                          )
                        }
                        className="text-xs bg-[#ECFDF5] text-[#166534] rounded-lg px-3 py-1.5 hover:bg-[#D1FAE5] disabled:opacity-50"
                      >
                        ✓ Complete
                      </button>
                    )}

                    {visit.status ===
                      "SCHEDULED" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setActionError("");
                          setRescheduleDate(
                            visit.scheduledAt
                              ? new Date(visit.scheduledAt).toISOString().slice(0, 16)
                              : ""
                          );
                          setRescheduleFor(
                            rescheduleFor === visit.id ? null : visit.id
                          );
                        }}
                        className="text-xs bg-[#EFF6FF] text-[#185FA5] rounded-lg px-3 py-1.5 hover:bg-[#DBEAFE] disabled:opacity-50"
                      >
                        Reschedule
                      </button>
                    )}

                    {(visit.status === "RESCHEDULED" ||
                      visit.status === "CANCELLED") && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          updateStatus(
                            visit.id,
                            "SCHEDULED"
                          )
                        }
                        className="text-xs bg-[#EFF6FF] text-[#185FA5] rounded-lg px-3 py-1.5 hover:bg-[#DBEAFE] disabled:opacity-50"
                      >
                        Re-schedule
                      </button>
                    )}

                    {visit.status ===
                      "SCHEDULED" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          updateStatus(
                            visit.id,
                            "CANCELLED"
                          )
                        }
                        className="text-xs bg-[#FEF2F2] text-[#991B1B] rounded-lg px-3 py-1.5 hover:bg-[#FEE2E2] disabled:opacity-50"
                      >
                        Cancel Visit
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        setPendingDeleteId(
                          visit.id
                        )
                      }
                      aria-label={`Delete site visit ${visit.id}`}
                      className="text-xs text-[#991B1B] border border-[#FECACA] rounded-lg px-3 py-1.5 hover:bg-[#FEF2F2] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>

                  {rescheduleFor === visit.id && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 rounded-lg bg-[#FCFAF8] border border-flora-border p-3">
                      <input
                        type="datetime-local"
                        aria-label="New visit date and time"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading || !rescheduleDate}
                          onClick={() =>
                            updateStatus(
                              visit.id,
                              "RESCHEDULED",
                              new Date(rescheduleDate).toISOString()
                            )
                          }
                          className="rounded-lg bg-flora-primary px-4 py-2 text-sm font-medium text-white hover:bg-flora-primary-hover disabled:opacity-50"
                        >
                          Confirm new date
                        </button>
                        <button
                          type="button"
                          onClick={() => setRescheduleFor(null)}
                          className="rounded-lg border border-flora-border px-4 py-2 text-sm text-flora-muted hover:bg-flora-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visit Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-flora-muted">
                      Assigned To
                    </p>

                    <p className="font-medium mt-1">
                      {visit.assignedTo ??
                        "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-flora-muted">
                      Completed
                    </p>

                    <p className="font-medium mt-1">
                      {formatDate(
                        visit.completedAt
                      )}
                    </p>
                  </div>

                  {visit.siteAddress && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-flora-muted">
                        Site Address
                      </p>

                      <p className="font-medium mt-1">
                        {visit.siteAddress}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {visit.notes && (
                  <div className="mt-4 pt-4 border-t border-flora-border/60">
                    <p className="text-[10px] uppercase tracking-widest text-flora-muted mb-1">
                      Notes
                    </p>

                    <p className="text-sm text-flora-muted whitespace-pre-wrap">
                      {visit.notes}
                    </p>
                  </div>
                )}

                {/* Measurements */}
                <MeasurementManager
                  siteVisitId={visit.id}
                  initialMeasurements={
                    visit.measurements
                  }
                />

                {/* Attachments */}
                <div className="mt-5 pt-5 border-t border-flora-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-flora-primary">
                        Attachments
                      </p>

                      <p className="text-xs text-flora-muted mt-1">
                        {visit.attachments.length === 0
                          ? "No files linked yet"
                          : `${visit.attachments.length} file${
                              visit.attachments.length === 1 ? "" : "s"
                            } attached`}
                      </p>
                    </div>

                    {attachFormFor !== visit.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError("");
                          setAttachForm({ fileName: "", fileUrl: "", fileType: "PHOTO", caption: "" });
                          setAttachFormFor(visit.id);
                        }}
                        className="text-xs font-medium text-flora-primary hover:underline"
                      >
                        + Link file
                      </button>
                    )}
                  </div>

                  {visit.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {visit.attachments.map((attachment) => (
                        <span
                          key={attachment.id}
                          className="inline-flex items-center gap-2 border border-flora-border rounded-lg px-3 py-2 text-xs text-flora-primary"
                        >
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-flora-surface hover:underline"
                          >
                            📎 {attachment.fileName}
                          </a>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => deleteAttachment(visit.id, attachment.id)}
                            aria-label={`Remove attachment ${attachment.fileName}`}
                            title="Remove attachment (admin only)"
                            className="text-[#991B1B] hover:underline disabled:opacity-50"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {attachFormFor === visit.id && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-[#FCFAF8] border border-flora-border p-3">
                      <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-widest text-flora-muted block mb-1">
                          File name *
                        </label>
                        <input
                          className="border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-white w-full"
                          value={attachForm.fileName}
                          onChange={(e) =>
                            setAttachForm((f) => ({ ...f, fileName: e.target.value }))
                          }
                          placeholder="e.g. Living room photo"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-widest text-flora-muted block mb-1">
                          File URL *
                        </label>
                        <input
                          className="border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-white w-full"
                          value={attachForm.fileUrl}
                          onChange={(e) =>
                            setAttachForm((f) => ({ ...f, fileUrl: e.target.value }))
                          }
                          placeholder="https://…"
                          inputMode="url"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-flora-muted block mb-1">
                          Type
                        </label>
                        <select
                          className="border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-white w-full"
                          value={attachForm.fileType}
                          onChange={(e) =>
                            setAttachForm((f) => ({ ...f, fileType: e.target.value }))
                          }
                        >
                          {["PHOTO", "DOCUMENT", "MEASUREMENT", "OTHER"].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-flora-muted block mb-1">
                          Caption
                        </label>
                        <input
                          className="border border-flora-border rounded-lg px-3 py-2 text-sm outline-none focus:border-flora-primary bg-white w-full"
                          value={attachForm.caption}
                          onChange={(e) =>
                            setAttachForm((f) => ({ ...f, caption: e.target.value }))
                          }
                          placeholder="Optional note"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => addAttachment(visit.id)}
                          className="rounded-lg bg-flora-primary px-4 py-2 text-sm font-medium text-white hover:bg-flora-primary-hover disabled:opacity-50"
                        >
                          Attach file
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachFormFor(null)}
                          className="rounded-lg border border-flora-border px-4 py-2 text-sm text-flora-muted hover:bg-flora-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title="Delete site visit?"
        description="This action cannot be undone. Measurements linked to this visit will also be deleted."
        confirmLabel="Delete visit"
        loading={loading}
        onConfirm={() => {
          if (pendingDeleteId) deleteVisit(pendingDeleteId);
        }}
      />
    </div>
  );
}