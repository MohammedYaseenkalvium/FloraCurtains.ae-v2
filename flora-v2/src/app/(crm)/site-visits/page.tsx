import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  XCircle,
} from "lucide-react";

import { db } from "@/lib/db";
import type { SiteVisitStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const statusLabels: Record<SiteVisitStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
};

const statusStyles: Record<
  SiteVisitStatus,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  SCHEDULED: {
    background: "#FFF7ED",
    text: "#9A3412",
    border: "#FED7AA",
  },

  COMPLETED: {
    background: "#ECFDF5",
    text: "#166534",
    border: "#BBE7D2",
  },

  CANCELLED: {
    background: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
  },

  RESCHEDULED: {
  background: "#EFF6FF",
  text: "#185FA5",
  border: "#BFDBFE",
  },
};

function formatDate(
  value: Date | null
) {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "en-AE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default async function SiteVisitsPage() {
  const visits = await db.siteVisit.findMany({
    orderBy: {
      scheduledAt: "desc",
    },

    include: {
      enquiry: {
        include: {
          contact: true,
          company: true,
        },
      },

      project: {
        select: {
          id: true,
          enquiry: {
            select: {
              projectName: true,
            },
          },
        },
      },

      measurements: {
        select: {
          id: true,
        },
      },

      attachments: {
        select: {
          id: true,
        },
      },
    },
  });

  const scheduledCount = visits.filter(
    (visit) =>
      visit.status === "SCHEDULED"
  ).length;

  const completedCount = visits.filter(
    (visit) =>
      visit.status === "COMPLETED"
  ).length;

  const cancelledCount = visits.filter(
    (visit) =>
      visit.status === "CANCELLED"
  ).length;

  const measurementCount =
    visits.reduce(
      (total, visit) =>
        total + visit.measurements.length,
      0
    );

  return (
    <div className="min-h-full bg-[#FFF8F5]">
      {/* Header */}
      <section className="mb-6 rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays
                size={19}
                className="text-[#5A0E12]"
              />

              <span className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                Operations
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1E1B18]">
              Site Visits
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B625A]">
              Schedule, track and review site visits
              and the measurements captured during
              each visit.
            </p>
          </div>

          <div className="rounded-lg border border-[#D8C9BC] bg-[#FFF8F5] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
              Total Visits
            </p>

            <p className="mt-1 text-xl font-bold text-[#5A0E12]">
              {visits.length}
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Scheduled */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <Clock3
              size={16}
              className="text-[#9A3412]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Scheduled
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {scheduledCount}
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={16}
              className="text-[#166534]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Completed
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {completedCount}
          </p>
        </div>

        {/* Cancelled */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <XCircle
              size={16}
              className="text-[#991B1B]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Cancelled
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {cancelledCount}
          </p>
        </div>

        {/* Measurements */}
        <div className="rounded-xl border border-[#D8C9BC] bg-white p-5">
          <div className="flex items-center gap-2">
            <MapPin
              size={16}
              className="text-[#5A0E12]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-[#6B625A]">
              Measurements
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-[#1E1B18]">
            {measurementCount}
          </p>
        </div>
      </section>

      {/* Visits */}
      <section className="rounded-xl border border-[#D8C9BC] bg-white">
        <div className="border-b border-[#D8C9BC] p-5">
          <div>
            <h2 className="text-sm font-semibold text-[#5A0E12]">
              All Site Visits
            </h2>

            <p className="mt-1 text-xs text-[#6B625A]">
              Review scheduled and completed site
              visits across leads and projects.
            </p>
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8F5F2]">
              <CalendarDays
                size={22}
                className="text-[#5A0E12]"
              />
            </div>

            <h3 className="text-sm font-semibold text-[#1E1B18]">
              No site visits yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#6B625A]">
              Site visits will appear here once they
              are scheduled from a lead or project.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#EFE7DF] text-left">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Project
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Visit
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Assigned To
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Measurements
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[#6B625A]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {visits.map((visit) => {
                  const style =
                    statusStyles[
                      visit.status
                    ];

                  const projectName =
                    visit.project
                      ?.enquiry
                      .projectName ??
                    "—";

                  return (
                    <tr
                      key={visit.id}
                      className="border-b border-[#EFE7DF] last:border-b-0"
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/customers/${visit.enquiry.contact.id}`}
                          className="font-semibold text-sm text-[#1E1B18] hover:text-[#5A0E12] hover:underline"
                        >
                          {
                            visit.enquiry
                              .contact.name
                          }
                        </Link>

                        {visit.enquiry.company && (
                          <p className="mt-1 text-xs text-[#6B625A]">
                            {
                              visit.enquiry
                                .company
                                .tradeName
                            }
                          </p>
                        )}
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4">
                        {visit.project ? (
                          <Link
                            href={`/projects/${visit.project.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-[#5A0E12] hover:underline"
                          >
                            {projectName}

                            <ArrowUpRight
                              size={12}
                            />
                          </Link>
                        ) : (
                          <span className="text-sm text-[#6B625A]">
                            Lead Visit
                          </span>
                        )}
                      </td>

                      {/* Date / Address */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#1E1B18]">
                          {formatDate(
                            visit.scheduledAt
                          )}
                        </p>

                        {visit.siteAddress && (
                          <div className="mt-1 flex max-w-[240px] items-start gap-1 text-xs text-[#6B625A]">
                            <MapPin
                              size={12}
                              className="mt-0.5 shrink-0"
                            />

                            <span className="truncate">
                              {
                                visit.siteAddress
                              }
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Assigned */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#1E1B18]">
                          {visit.assignedTo ??
                            "Not assigned"}
                        </span>
                      </td>

                      {/* Measurements */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#F8F5F2] px-2.5 py-1 text-xs font-medium text-[#6B625A]">
                          {
                            visit
                              .measurements
                              .length
                          }{" "}
                          {visit
                            .measurements
                            .length === 1
                            ? "measurement"
                            : "measurements"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor:
                              style.background,
                            color:
                              style.text,
                            borderColor:
                              style.border,
                          }}
                        >
                          {
                            statusLabels[
                              visit.status
                            ]
                          }
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {visit.project ? (
                          <Link
                            href={`/projects/${visit.project.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9BC] px-3 py-2 text-xs font-medium text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
                          >
                            Open Project

                            <ArrowUpRight
                              size={13}
                            />
                          </Link>
                        ) : (
                          <Link
                            href={`/enquiries/${visit.enquiryId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C9BC] px-3 py-2 text-xs font-medium text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
                          >
                            Open Lead

                            <ArrowUpRight
                              size={13}
                            />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}