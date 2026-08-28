
"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";

type Measurement = {
     id: string;
    roomName: string;
     openingName: string | null;
      openingType: string | null;
       width: number; height: number;
        unit: string;
         trackType: string | null;
          remarks: string | null; 
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
  initialVisits: SiteVisit[];
  defaultAddress?: string | null;
};

const field =
  "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";

const label =
  "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

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
  initialVisits,
  defaultAddress,
}: Props) {
  const router = useRouter();

  const [visits, setVisits] = useState<SiteVisit[]>(initialVisits);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    scheduledAt: "",
    assignedTo: "",
    siteAddress: defaultAddress ?? "",
    notes: "",
  });

  async function createVisit() {
    if (!form.scheduledAt) {
      alert("Please select a visit date and time.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/site-visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enquiryId,
          scheduledAt: form.scheduledAt,
          assignedTo: form.assignedTo || undefined,
          siteAddress: form.siteAddress || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Failed to schedule site visit.");
        return;
      }

      const visit = await res.json();

      setVisits((current) => [visit, ...current]);

      setForm({
        scheduledAt: "",
        assignedTo: "",
        siteAddress: defaultAddress ?? "",
        notes: "",
      });

      setShowForm(false);
      router.refresh();
    } catch {
      alert("Failed to schedule site visit.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    visitId: string,
    status: SiteVisit["status"]
  ) {
    setLoading(true);

    try {
      const res = await fetch(`/api/site-visits/${visitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Failed to update site visit.");
        return;
      }

      const updated = await res.json();

      setVisits((current) =>
        current.map((visit) =>
          visit.id === visitId ? { ...visit, ...updated } : visit
        )
      );

      router.refresh();
    } catch {
      alert("Failed to update site visit.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVisit(visitId: string) {
    const confirmed = window.confirm(
      "Delete this site visit? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/site-visits/${visitId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Failed to delete site visit.");
        return;
      }

      setVisits((current) =>
        current.filter((visit) => visit.id !== visitId)
      );

      router.refresh();
    } catch {
      alert("Failed to delete site visit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#D8C9BC] rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-semibold text-sm text-[#5A0E12]">
            Site Visits
          </h3>

          <p className="text-xs text-[#6B625A] mt-1">
            Schedule visits, record measurements and track site progress.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-[#5A0E12] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#7A1E22] transition-colors"
          >
            + Schedule Visit
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border border-[#D8C9BC] rounded-xl p-4 mb-5 bg-[#FCFAF8]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-[#5A0E12]">
              Schedule Site Visit
            </h4>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#6B625A] hover:text-[#5A0E12] text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                    scheduledAt: e.target.value,
                  }))
                }
              />
            </div>

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
                    assignedTo: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-span-2">
              <label className={label}>
                Site Address
              </label>

              <input
                className={field}
                value={form.siteAddress}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    siteAddress: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-span-2">
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
                    notes: e.target.value,
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
              className="bg-[#0F6E56] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#0D5A45] disabled:opacity-50"
            >
              {loading ? "Saving…" : "Schedule Visit"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-[#EFE7DF] text-[#6B625A] rounded-lg px-5 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {visits.length === 0 && !showForm && (
        <div className="border border-dashed border-[#D8C9BC] rounded-xl p-8 text-center">
          <div className="text-2xl mb-2">📐</div>

          <p className="text-sm font-medium text-[#5A0E12]">
            No site visits scheduled
          </p>

          <p className="text-xs text-[#6B625A] mt-1">
            Schedule the first site visit to start capturing measurements.
          </p>
        </div>
      )}

      {/* Visit List */}
      {visits.length > 0 && (
        <div className="space-y-4">
          {visits.map((visit) => {
            const style = statusStyles[visit.status];

            return (
              <div
                key={visit.id}
                className="border border-[#D8C9BC] rounded-xl p-4"
              >
                {/* Visit header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2E2925]">
                        Site Visit
                      </span>

                      <span
                        className="px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide"
                        style={{
                          background: style.bg,
                          color: style.text,
                        }}
                      >
                        {visit.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-sm text-[#6B625A] mt-1">
                      {formatDate(visit.scheduledAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {visit.status === "SCHEDULED" && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            updateStatus(visit.id, "COMPLETED")
                          }
                          className="text-xs bg-[#ECFDF5] text-[#166534] rounded-lg px-3 py-1.5 hover:bg-[#D1FAE5] disabled:opacity-50"
                        >
                          ✓ Complete
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            updateStatus(visit.id, "RESCHEDULED")
                          }
                          className="text-xs bg-[#EFF6FF] text-[#185FA5] rounded-lg px-3 py-1.5 hover:bg-[#DBEAFE] disabled:opacity-50"
                        >
                          Reschedule
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => deleteVisit(visit.id)}
                      className="text-xs text-[#991B1B] border border-[#FECACA] rounded-lg px-3 py-1.5 hover:bg-[#FEF2F2] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Visit details */}
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                      Assigned To
                    </p>

                    <p className="font-medium mt-1">
                      {visit.assignedTo ?? "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                      Completed
                    </p>

                    <p className="font-medium mt-1">
                      {formatDate(visit.completedAt)}
                    </p>
                  </div>

                  {visit.siteAddress && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                        Site Address
                      </p>

                      <p className="font-medium mt-1">
                        {visit.siteAddress}
                      </p>
                    </div>
                  )}
                </div>

                {visit.notes && (
                  <div className="mt-4 pt-4 border-t border-[#EFE7DF]">
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">
                      Notes
                    </p>

                    <p className="text-sm text-[#6B625A] whitespace-pre-wrap">
                      {visit.notes}
                    </p>
                  </div>
                )}

                {/* Measurements */}
                <div className="mt-4 pt-4 border-t border-[#EFE7DF]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-semibold text-sm text-[#5A0E12]">
                        Measurements
                      </p>

                      <p className="text-xs text-[#6B625A]">
                        {visit.measurements.length} measurement
                        {visit.measurements.length === 1 ? "" : "s"} recorded
                      </p>
                    </div>

                    <LinkButton
                      href={`/site-visits/${visit.id}`}
                    >
                      Open Visit →
                    </LinkButton>
                  </div>

                  {visit.measurements.length === 0 ? (
                    <div className="bg-[#F8F5F2] rounded-lg px-4 py-3 text-xs text-[#6B625A]">
                      No measurements recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-widest text-[#6B625A] border-b border-[#D8C9BC]">
                            <th className="py-2 pr-3">
                              Room
                            </th>
                            <th className="py-2 pr-3">
                              Opening
                            </th>
                            <th className="py-2 pr-3">
                              Type
                            </th>
                            <th className="py-2 pr-3">
                              Width
                            </th>
                            <th className="py-2">
                              Height
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {visit.measurements.map((measurement) => (
                            <tr
                              key={measurement.id}
                              className="border-b border-[#EFE7DF] last:border-0"
                            >
                              <td className="py-2 pr-3 font-medium">
                                {measurement.roomName}
                              </td>

                              <td className="py-2 pr-3">
                                {measurement.openingName ?? "—"}
                              </td>

                              <td className="py-2 pr-3">
                                {measurement.openingType ?? "—"}
                              </td>

                              <td className="py-2 pr-3">
                                {measurement.width}{" "}
                                {measurement.unit}
                              </td>

                              <td className="py-2">
                                {measurement.height}{" "}
                                {measurement.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {visit.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#EFE7DF]">
                    <p className="font-semibold text-sm text-[#5A0E12] mb-2">
                      Attachments
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {visit.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-[#D8C9BC] rounded-lg px-3 py-2 text-xs text-[#5A0E12] hover:bg-[#F8F5F2]"
                        >
                          📎 {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-xs text-[#5A0E12] hover:underline"
    >
      {children}
    </a>
  );
}

