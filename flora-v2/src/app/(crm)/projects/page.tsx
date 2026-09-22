import Link from "next/link";
import {
  ArrowUpRight,
  CircleDollarSign,
  FolderKanban,
  Search,
} from "lucide-react";
import type { ProjectStatus } from "@prisma/client";

import { db } from "@/lib/db";

const PAGE_SIZE = 20;

const statuses: ProjectStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "INSTALLATION",
  "SNAGGING",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
];

const statusLabels: Record<ProjectStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  INSTALLATION: "Installation",
  SNAGGING: "Snagging",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<
  ProjectStatus,
  {
    background: string;
    text: string;
    border: string;
  }
> = {
  NOT_STARTED: {
    background: "#F8F5F2",
    text: "#6B625A",
    border: "#D8C9BC",
  },
  IN_PROGRESS: {
    background: "#EEF4FA",
    text: "#185FA5",
    border: "#B8D0E5",
  },
  INSTALLATION: {
    background: "#FEF9E7",
    text: "#854D0E",
    border: "#E6D19B",
  },
  SNAGGING: {
    background: "#F1F0FC",
    text: "#7F77DD",
    border: "#C9C5F0",
  },
  COMPLETED: {
    background: "#EDF7F3",
    text: "#166534",
    border: "#B7D8CC",
  },
  ON_HOLD: {
    background: "#FEF2F2",
    text: "#991B1B",
    border: "#E8BDBD",
  },
  CANCELLED: {
    background: "#F5F5F4",
    text: "#57534E",
    border: "#D6D3D1",
  },
};

function isProjectStatus(value: string): value is ProjectStatus {
  return statuses.includes(value as ProjectStatus);
}

function formatAED(value: number) {
  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildProjectsUrl({
  search,
  status,
  page,
}: {
  search?: string;
  status?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("q", search);
  }

  if (status) {
    params.set("status", status);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/projects?${query}` : "/projects";
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.q?.trim() ?? "";
  const requestedStatus = params.status ?? "";

  const selectedStatus = isProjectStatus(requestedStatus)
    ? requestedStatus
    : undefined;

  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const baseWhere = {
    deletedAt: null,
  };

  const where = {
    ...baseWhere,

    ...(selectedStatus
      ? {
          status: selectedStatus,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              enquiry: {
                contact: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              enquiry: {
                contact: {
                  phone: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              enquiry: {
                contact: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              enquiry: {
                company: {
                  tradeName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              enquiry: {
                serviceWanted: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              enquiry: {
                projectName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              poNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [
    projects,
    totalCount,
    allCount,
    notStartedCount,
    inProgressCount,
    installationCount,
    snaggingCount,
    completedCount,
    onHoldCount,
    cancelledCount,
  ] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        enquiry: {
          include: {
            contact: true,
            company: true,
          },
        },
        quotation: true,
        payments: true,
      },
    }),

    db.project.count({
      where,
    }),

    db.project.count({
      where: baseWhere,
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "NOT_STARTED",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "IN_PROGRESS",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "INSTALLATION",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "SNAGGING",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "COMPLETED",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "ON_HOLD",
      },
    }),

    db.project.count({
      where: {
        ...baseWhere,
        status: "CANCELLED",
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const contractValue = projects.reduce(
    (sum, project) =>
      sum + project.totalContractValue,
    0
  );

  const paidAmount = projects.reduce(
    (sum, project) =>
      sum +
      project.payments.reduce(
        (paymentSum, payment) =>
          paymentSum + payment.amount,
        0
      ),
    0
  );

  const outstandingAmount = Math.max(
    contractValue - paidAmount,
    0
  );

  const statusCounts: Record<
    ProjectStatus,
    number
  > = {
    NOT_STARTED: notStartedCount,
    IN_PROGRESS: inProgressCount,
    INSTALLATION: installationCount,
    SNAGGING: snaggingCount,
    COMPLETED: completedCount,
    ON_HOLD: onHoldCount,
    CANCELLED: cancelledCount,
  };

  const currentFrom =
    totalCount === 0
      ? 0
      : (safePage - 1) * PAGE_SIZE + 1;

  const currentTo = Math.min(
    safePage * PAGE_SIZE,
    totalCount
  );

  return (
    <div className="min-h-full bg-flora-background">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban
              size={22}
              className="text-flora-primary"
            />

            <h1 className="text-2xl font-bold tracking-tight text-flora-foreground">
              Projects
            </h1>
          </div>

          <p className="mt-1 text-sm text-flora-muted">
            Manage active projects, installations, and
            completed work.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
            Total Projects
          </p>

          <p className="mt-2 text-2xl font-bold text-flora-foreground">
            {allCount}
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
            Contract Value
          </p>

          <p className="mt-2 text-xl font-bold text-flora-primary">
            {formatAED(contractValue)}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Current page
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center gap-2">
            <CircleDollarSign
              size={15}
              className="text-[#0F6E56]"
            />

            <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
              Payments Received
            </p>
          </div>

          <p className="mt-2 text-xl font-bold text-[#0F6E56]">
            {formatAED(paidAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-flora-muted">
            Outstanding
          </p>

          <p className="mt-2 text-xl font-bold text-[#991B1B]">
            {formatAED(outstandingAmount)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 rounded-xl border border-flora-border bg-white p-4">
        <form
          method="GET"
          action="/projects"
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-flora-muted"
            />

            <input
              name="q"
              defaultValue={search}
              placeholder="Search client, company, service, project or PO..."
              className="w-full rounded-lg border border-flora-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-flora-primary"
            />
          </div>

          {selectedStatus && (
            <input
              type="hidden"
              name="status"
              value={selectedStatus}
            />
          )}

          <button
            type="submit"
            className="rounded-lg bg-flora-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover"
          >
            Search
          </button>

          {search && (
            <Link
              href={buildProjectsUrl({
                status: selectedStatus,
              })}
              className="inline-flex items-center justify-center rounded-lg border border-flora-border bg-white px-5 py-2.5 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={buildProjectsUrl({
            search,
          })}
          className={[
            "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            !selectedStatus
              ? "border-flora-primary bg-flora-primary text-white"
              : "border-flora-border bg-white text-flora-muted hover:bg-flora-surface",
          ].join(" ")}
        >
          All ({allCount})
        </Link>

        {statuses.map((status) => {
          const style = statusStyles[status];

          return (
            <Link
              key={status}
              href={buildProjectsUrl({
                search,
                status,
              })}
              className={[
                "whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                selectedStatus === status
                  ? "text-white"
                  : "bg-white hover:bg-flora-surface",
              ].join(" ")}
              style={
                selectedStatus === status
                  ? {
                      backgroundColor: style.text,
                      borderColor: style.text,
                    }
                  : {
                      borderColor: style.border,
                      color: style.text,
                    }
              }
            >
              {statusLabels[status]} (
              {statusCounts[status]})
            </Link>
          );
        })}
      </div>

      {/* Project Table */}
      <div className="overflow-hidden rounded-xl border border-flora-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="bg-flora-surface text-[10px] uppercase tracking-widest text-flora-muted">
                <th className="px-4 py-3 text-left font-medium">
                  Project / Client
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Company
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Service
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Contract Value
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Quote
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Installation
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => {
                const style =
                  statusStyles[project.status];

                return (
                  <tr
                    key={project.id}
                    className="border-t border-flora-border/60 transition-colors hover:bg-flora-background"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-flora-foreground hover:text-flora-primary"
                        >
                          {project.enquiry.projectName ??
                            "Untitled Project"}
                        </Link>

                        <Link
                          href={`/customers/${project.enquiry.contact.id}`}
                          className="mt-1 block text-xs text-flora-muted hover:text-flora-primary hover:underline"
                        >
                          {project.enquiry.contact.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-flora-muted">
                      {project.enquiry.company
                        ?.tradeName ?? "—"}
                    </td>

                    <td className="px-4 py-4 text-flora-muted">
                      {project.enquiry.serviceWanted}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            style.background,
                          color: style.text,
                          borderColor: style.border,
                        }}
                      >
                        {statusLabels[
                          project.status
                        ]}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-semibold text-flora-foreground">
                      {formatAED(
                        project.totalContractValue
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {project.quotation ? (
                        <Link
                          href={`/quotations/${project.quotation.id}`}
                          className="text-xs font-medium text-flora-primary hover:underline"
                        >
                          {
                            project.quotation
                              .quoteNumber
                          }
                        </Link>
                      ) : (
                        <span className="text-xs text-flora-muted">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-flora-muted">
                      {project.installationDate
                        ? new Date(
                            project.installationDate
                          ).toLocaleDateString(
                            "en-AE"
                          )
                        : "Not scheduled"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-flora-primary hover:underline"
                      >
                        View
                        <ArrowUpRight
                          size={13}
                        />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-14 text-center"
                  >
                    <FolderKanban
                      size={28}
                      className="mx-auto mb-3 text-[#D8C9BC]"
                    />

                    <p className="text-sm font-semibold text-flora-foreground">
                      No projects found
                    </p>

                    <p className="mt-1 text-xs text-flora-muted">
                      {search || selectedStatus
                        ? "Try changing your search or status filter."
                        : "Approved quotations can be converted into projects."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-flora-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-flora-muted">
              Showing {currentFrom}–{currentTo} of{" "}
              {totalCount} projects
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  href={buildProjectsUrl({
                    search,
                    status: selectedStatus,
                    page: safePage - 1,
                  })}
                  className="rounded-lg border border-flora-border bg-white px-3 py-2 text-xs font-medium text-flora-muted hover:bg-flora-surface"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-flora-border/60 px-3 py-2 text-xs text-[#C5B8AE]">
                  Previous
                </span>
              )}

              <span className="rounded-lg bg-flora-primary px-3 py-2 text-xs font-semibold text-white">
                {safePage} / {totalPages}
              </span>

              {safePage < totalPages ? (
                <Link
                  href={buildProjectsUrl({
                    search,
                    status: selectedStatus,
                    page: safePage + 1,
                  })}
                  className="rounded-lg border border-flora-border bg-white px-3 py-2 text-xs font-medium text-flora-muted hover:bg-flora-surface"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-lg border border-flora-border/60 px-3 py-2 text-xs text-[#C5B8AE]">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}