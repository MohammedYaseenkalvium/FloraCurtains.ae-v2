import { db } from "@/lib/db";
import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";

const statuses: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "QUOTED",
  "NEGOTIATING",
  "WON",
  "LOST",
];

const statusStyles: Record<EnquiryStatus, string> = {
  NEW: "bg-stone-100 text-stone-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  VISIT_SCHEDULED: "bg-amber-50 text-amber-700",
  QUOTED: "bg-emerald-50 text-emerald-700",
  NEGOTIATING: "bg-violet-50 text-violet-700",
  WON: "bg-green-50 text-green-700",
  LOST: "bg-red-50 text-red-700",
};

const statusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit Scheduled",
  QUOTED: "Quoted",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost",
};

function isValidStatus(value: string | undefined): value is EnquiryStatus {
  return Boolean(value && statuses.includes(value as EnquiryStatus));
}

function getPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function buildPageUrl(
  page: number,
  status?: EnquiryStatus,
  search?: string,
) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return query ? `/enquiries?${query}` : "/enquiries";
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const {
    status: statusParam,
    page: pageParam,
    search: searchParam,
  } = await searchParams;

  const enquiryStatus = isValidStatus(statusParam)
    ? statusParam
    : undefined;

  const search = searchParam?.trim() ?? "";
  const page = getPage(pageParam);
  const pageSize = 20;

  const where = {
    deletedAt: null,
    ...(enquiryStatus ? { status: enquiryStatus } : {}),
    ...(search
      ? {
          OR: [
            {
              contact: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              contact: {
                phone: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              contact: {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              serviceWanted: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              projectName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [data, total, statusCounts] = await Promise.all([
    db.enquiry.findMany({
      where,
      include: {
        contact: true,
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),

    db.enquiry.count({
      where,
    }),

    Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await db.enquiry.count({
          where: {
            deletedAt: null,
            status,
          },
        }),
      })),
    ),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /*
   * If someone manually enters a page beyond the available range,
   * keep the page usable instead of showing confusing pagination.
   */
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-flora-gold">
            Sales
          </p>

          <h1 className="font-display text-4xl font-semibold tracking-tight text-flora-foreground">
            Leads & Enquiries
          </h1>

          <p className="mt-2 text-sm text-flora-muted">
            Manage incoming opportunities and move them through the sales
            pipeline.
          </p>
        </div>

        <Link
          href="/enquiries/new"
          className="inline-flex w-fit items-center rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-flora-primary-hover"
        >
          + Log Call / Lead
        </Link>
      </header>

      {/* Search */}
      <form
        action="/enquiries"
        method="GET"
        className="rounded-xl border border-flora-border bg-white p-4"
      >
        {enquiryStatus && (
          <input
            type="hidden"
            name="status"
            value={enquiryStatus}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search by client, phone, service or project..."
            className="min-w-0 flex-1 rounded-lg border border-flora-border bg-flora-surface px-4 py-2.5 text-sm text-flora-foreground outline-none transition placeholder:text-flora-muted focus:border-flora-primary"
          />

          <button
            type="submit"
            className="rounded-lg border border-flora-border bg-white px-5 py-2.5 text-sm font-medium text-flora-foreground transition hover:bg-flora-surface"
          >
            Search
          </button>

          {search && (
            <Link
              href={buildPageUrl(1, enquiryStatus)}
              className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-flora-muted transition hover:bg-flora-surface hover:text-flora-foreground"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Status Filters */}
      <section className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          <Link
            href={buildPageUrl(1, undefined, search)}
            className={[
              "rounded-lg border px-3.5 py-2 text-xs font-medium transition mx-0.5",
              !enquiryStatus
                ? "border-flora-primary bg-flora-primary text-white"
                : "border-flora-border bg-white text-flora-muted hover:border-flora-primary hover:text-flora-primary",
            ].join(" ")}
          >
            All
            <span className="ml-1.5 opacity-70">
              {statusCounts.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </Link>

          {statusCounts.map(({ status, count }) => (
            <Link
              key={status}
              href={buildPageUrl(1, status, search)}
              className={[
                "rounded-lg border px-3.5 py-2 text-xs font-medium transition",
                enquiryStatus === status
                  ? "border-flora-primary bg-flora-primary text-white"
                  : "border-flora-border bg-white text-flora-muted hover:border-flora-primary hover:text-flora-primary",
              ].join(" ")}
            >
              {statusLabels[status]}
              <span className="ml-1.5 opacity-70">{count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Lead Table */}
      <section className="overflow-hidden rounded-xl border border-flora-border bg-white">
        <div className="flex flex-col gap-2 border-b border-flora-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-flora-foreground">
              {enquiryStatus
                ? `${statusLabels[enquiryStatus]} Leads`
                : "All Leads"}
            </h2>

            <p className="mt-1 text-xs text-flora-muted">
              {total} {total === 1 ? "enquiry" : "enquiries"} found
              {search ? ` for "${search}"` : ""}
            </p>
          </div>

          {enquiryStatus && (
            <Link
              href={buildPageUrl(1, undefined, search)}
              className="text-xs font-medium text-flora-primary hover:underline"
            >
              View all leads →
            </Link>
          )}
        </div>

        {data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface text-xl text-flora-primary">
              +
            </div>

            <h3 className="mt-4 font-semibold text-flora-foreground">
              No enquiries found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-flora-muted">
              {search
                ? "Try a different search term or clear the current filter."
                : enquiryStatus
                  ? `There are currently no ${statusLabels[
                      enquiryStatus
                    ].toLowerCase()} leads.`
                  : "Start building your pipeline by logging a new lead."}
            </p>

            {!search && !enquiryStatus && (
              <Link
                href="/enquiries/new"
                className="mt-5 inline-flex rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-flora-primary-hover"
              >
                + Log Call / Lead
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-flora-surface text-left text-[10px] uppercase tracking-[0.14em] text-flora-muted">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Assigned To</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Interest</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="border-t border-flora-surface transition hover:bg-flora-background"
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/enquiries/${enquiry.id}`}
                        className="font-medium text-flora-primary hover:underline"
                      >
                        {enquiry.contact.name}
                      </Link>

                      <p className="mt-1 text-xs text-flora-muted">
                        {enquiry.contact.phone}
                      </p>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4 text-xs text-flora-muted">
                      {enquiry.company?.tradeName ?? "—"}
                    </td>

                    {/* Service */}
                    <td className="max-w-[220px] px-5 py-4 text-flora-muted">
                      <div className="truncate">
                        {enquiry.serviceWanted}
                      </div>

                      {enquiry.projectName && (
                        <div className="mt-1 truncate text-xs text-flora-muted/70">
                          {enquiry.projectName}
                        </div>
                      )}
                    </td>

                    {/* Assigned */}
                    <td className="px-5 py-4 text-flora-muted">
                      {enquiry.assignedTo ?? "Unassigned"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
                          statusStyles[enquiry.status],
                        ].join(" ")}
                      >
                        {statusLabels[enquiry.status]}
                      </span>
                    </td>

                    {/* Interest */}
                    <td className="px-5 py-4">
                      <div
                        className="flex gap-1"
                        aria-label={`Interest level ${
                          enquiry.interestLevel ?? 0
                        } out of 5`}
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <span
                            key={level}
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              level <= (enquiry.interestLevel ?? 0)
                                ? "bg-flora-primary"
                                : "bg-flora-border",
                            ].join(" ")}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-flora-muted">
                      {formatDate(new Date(enquiry.createdAt))}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <Link
                          href={`/enquiries/${enquiry.id}`}
                          className="text-xs font-medium text-flora-primary hover:underline"
                        >
                          View →
                        </Link>

                        <Link
                          href={`/customers/${enquiry.contact.id}`}
                          className="text-xs text-flora-muted hover:text-flora-primary"
                        >
                          Financial
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col gap-3 text-sm text-flora-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-medium text-flora-foreground">
              {(currentPage - 1) * pageSize + 1}
            </span>
            {"–"}
            <span className="font-medium text-flora-foreground">
              {Math.min(currentPage * pageSize, total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-flora-foreground">
              {total}
            </span>
          </p>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(
                  currentPage - 1,
                  enquiryStatus,
                  search,
                )}
                className="rounded-lg border border-flora-border bg-white px-3.5 py-2 text-xs font-medium transition hover:bg-flora-surface"
              >
                ← Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2 text-xs font-medium text-flora-muted/50">
                ← Previous
              </span>
            )}

            <span className="rounded-lg bg-flora-primary px-3.5 py-2 text-xs font-medium text-white">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(
                  currentPage + 1,
                  enquiryStatus,
                  search,
                )}
                className="rounded-lg border border-flora-border bg-white px-3.5 py-2 text-xs font-medium transition hover:bg-flora-surface"
              >
                Next →
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2 text-xs font-medium text-flora-muted/50">
                Next →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}