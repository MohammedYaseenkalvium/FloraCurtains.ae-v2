import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

import { db } from "@/lib/db";
import type { QuotationStatus } from "@prisma/client";
import { statusStyles } from "@/lib/status-styles";

const PAGE_SIZE = 20;

const statuses: QuotationStatus[] = [
  "DRAFT",
  "SENT",
  "APPROVED",
  "REJECTED",
  "REVISED",
];

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISED: "Revised",
};

const statusIcons: Record<
  string,
  { icon: typeof FileText }
> = {
  DRAFT: {
    icon: FileText,
  },
  SENT: {
    icon: Send,
  },
  APPROVED: {
    icon: CheckCircle2,
  },
  REJECTED: {
    icon: XCircle,
  },
  REVISED: {
    icon: RotateCcw,
  },
};

function formatCurrency(value: number) {
  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const {
    status: rawStatus,
    q: rawQuery,
    page: rawPage,
  } = await searchParams;

  const query = rawQuery?.trim() ?? "";

  const status = statuses.includes(
    rawStatus as QuotationStatus
  )
    ? (rawStatus as QuotationStatus)
    : undefined;

  const parsedPage = Number.parseInt(rawPage ?? "1", 10);

  const page = Number.isFinite(parsedPage)
    ? Math.max(1, parsedPage)
    : 1;

  const where = {
    ...(status ? { status } : {}),

    ...(query
      ? {
          OR: [
            {
              quoteNumber: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              billedToName: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              enquiry: {
                contact: {
                  name: {
                    contains: query,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              enquiry: {
                contact: {
                  phone: {
                    contains: query,
                  },
                },
              },
            },
            {
              enquiry: {
                serviceWanted: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              enquiry: {
                projectName: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };

  // Tab counts respect the search query but not the selected status tab.
  // Prisma ignores `undefined` fields, so this equals `where` minus status.
  const countWhere = { ...where, status: undefined };

  const [quotations, total, statusGroups] = await Promise.all([
    db.quotation.findMany({
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

        payments: {
          select: {
            amount: true,
          },
        },
      },
    }),

    db.quotation.count({
      where,
    }),

    // Single GROUP BY instead of one COUNT per status (was 5 round trips).
    db.quotation.groupBy({
      by: ["status"],
      where: countWhere,
      _count: {
        _all: true,
      },
    }),
  ]);

  const countByStatus = new Map<string, number>(
    statusGroups.map((group) => [group.status, group._count._all])
  );

  const draftCount = countByStatus.get("DRAFT") ?? 0;
  const sentCount = countByStatus.get("SENT") ?? 0;
  const approvedCount = countByStatus.get("APPROVED") ?? 0;
  const rejectedCount = countByStatus.get("REJECTED") ?? 0;
  const revisedCount = countByStatus.get("REVISED") ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  const from =
    total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const to = Math.min(
    page * PAGE_SIZE,
    total
  );

  const totalValue = quotations.reduce(
    (sum, quotation) =>
      sum + quotation.totalAmount,
    0
  );

  // Note: quotation-level payments are read-only orphans (no create endpoint;
  // UI records project payments only). Totals below use project payments.
  function pageHref(nextPage: number) {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    if (query) {
      params.set("q", query);
    }

    params.set("page", String(nextPage));

    return `/quotations?${params.toString()}`;
  }

  function statusHref(nextStatus?: QuotationStatus) {
    const params = new URLSearchParams();

    if (nextStatus) {
      params.set("status", nextStatus);
    }

    if (query) {
      params.set("q", query);
    }

    const value = params.toString();

    return value
      ? `/quotations?${value}`
      : "/quotations";
  }

  const filters = [
    {
      label: "All",
      count:
        draftCount +
        sentCount +
        approvedCount +
        rejectedCount +
        revisedCount,
      value: undefined,
    },
    {
      label: "Draft",
      count: draftCount,
      value: "DRAFT" as QuotationStatus,
    },
    {
      label: "Sent",
      count: sentCount,
      value: "SENT" as QuotationStatus,
    },
    {
      label: "Approved",
      count: approvedCount,
      value: "APPROVED" as QuotationStatus,
    },
    {
      label: "Rejected",
      count: rejectedCount,
      value: "REJECTED" as QuotationStatus,
    },
    {
      label: "Revised",
      count: revisedCount,
      value: "REVISED" as QuotationStatus,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-flora-gold">
            Sales
          </p>

          <h1 className="mt-1 font-display text-4xl font-semibold leading-tight text-flora-foreground">
            Quotations
          </h1>

          <p className="mt-2 text-sm text-flora-muted">
            Create, track and manage customer quotations through approval.
          </p>
        </div>

        <Link
          href="/enquiries"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-flora-primary-hover"
        >
          <FileText size={16} />
          Create Quote
        </Link>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Total Quotes
            </p>

            <FileText
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {total}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Matching quotations
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Drafts
            </p>

            <FileText
              size={18}
              strokeWidth={1.8}
              className="text-flora-muted"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {draftCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Still being prepared
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Approved
            </p>

            <CheckCircle2
              size={18}
              strokeWidth={1.8}
              className="text-flora-success"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {approvedCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Ready for project conversion
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Quote Value
            </p>

            <CircleDollarSign
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {formatCurrency(totalValue)}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Current page value
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="rounded-xl border border-flora-border bg-white p-4">
        <form
          action="/quotations"
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          {status && (
            <input
              type="hidden"
              name="status"
              value={status}
            />
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2.5">
            <Search
              size={17}
              strokeWidth={1.8}
              className="shrink-0 text-flora-muted"
            />

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search quote number, customer, service or project..."
              className="w-full bg-transparent text-sm text-flora-foreground outline-none placeholder:text-flora-muted"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-flora-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-flora-primary-hover"
          >
            Search
          </button>

          {(query || status) && (
            <Link
              href="/quotations"
              className="inline-flex items-center justify-center rounded-lg border border-flora-border px-5 py-2.5 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface hover:text-flora-foreground"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active =
            filter.value === status ||
            (!filter.value && !status);

          return (
            <Link
              key={filter.label}
              href={statusHref(filter.value)}
              className={[
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "border-flora-primary bg-flora-primary text-white"
                  : "border-flora-border bg-white text-flora-muted hover:bg-flora-surface hover:text-flora-foreground",
              ].join(" ")}
            >
              {filter.label}{" "}
              <span
                className={
                  active
                    ? "ml-0.5 text-white/80"
                    : "ml-0.5 text-flora-muted"
                }
              >
                {filter.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-flora-border bg-white">
        <div className="flex flex-col gap-2 border-b border-flora-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-flora-foreground">
              {status
                ? `${getStatusLabel(status)} Quotations`
                : "All Quotations"}
            </h2>

            <p className="mt-1 text-xs text-flora-muted">
              {query
                ? `Results matching “${query}”`
                : `${total} quotation${total === 1 ? "" : "s"} found`}
            </p>
          </div>

          {total > 0 && (
            <span className="text-xs text-flora-muted">
              {from}–{to} of {total}
            </span>
          )}
        </div>

        {quotations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface">
              <FileText
                size={22}
                className="text-flora-muted"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-flora-foreground">
              No quotations found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-flora-muted">
              {query || status
                ? "Try changing your search or status filter."
                : "Quotations will appear here once they are created from enquiries."}
            </p>

            {(query || status) && (
              <Link
                href="/quotations"
                className="mt-4 inline-flex rounded-lg border border-flora-border px-4 py-2 text-xs font-medium text-flora-primary hover:bg-flora-surface"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="border-b border-flora-border bg-flora-cream text-left">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Quote
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Client
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Service
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Total
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Paid
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Valid Until
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {quotations.map((quotation) => {
                  const paid = quotation.payments.reduce(
                    (sum, payment) =>
                      sum + payment.amount,
                    0
                  );

                  const StatusIcon =
                    statusIcons[quotation.status]?.icon ??
                    FileText;

                  const quotationStatusStyle =
                    statusStyles.quotation[quotation.status] ?? {
                      background: "#F8F5F2",
                      text: "#6B625A",
                    };

                  return (
                    <tr
                      key={quotation.id}
                      className="border-b border-flora-border/50 last:border-b-0 transition-colors hover:bg-flora-background"
                    >
                      {/* Quote */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="font-semibold text-flora-primary hover:underline"
                        >
                          {quotation.quoteNumber}
                        </Link>

                        <p className="mt-1 text-[11px] text-flora-muted">
                          {quotation.items &&
                          Array.isArray(quotation.items)
                            ? `${quotation.items.length} line item${
                                quotation.items.length === 1
                                  ? ""
                                  : "s"
                              }`
                            : "Quotation"}
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/customers/${quotation.enquiry.contact.id}`}
                          className="font-medium text-flora-foreground hover:text-flora-primary"
                        >
                          {quotation.enquiry.contact.name}
                        </Link>

                        {quotation.enquiry.company && (
                          <p className="mt-1 text-[11px] text-flora-muted">
                            {quotation.enquiry.company.tradeName}
                          </p>
                        )}
                      </td>

                      {/* Service */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate text-flora-foreground">
                          {quotation.enquiry.serviceWanted}
                        </p>

                        {quotation.enquiry.projectName && (
                          <p className="mt-1 truncate text-[11px] text-flora-muted">
                            {quotation.enquiry.projectName}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            background:
                              quotationStatusStyle.background,
                            color:
                              quotationStatusStyle.text,
                          }}
                        >
                          <StatusIcon size={13} />
                          {getStatusLabel(
                            quotation.status
                          )}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-flora-foreground">
                          {formatCurrency(
                            quotation.totalAmount
                          )}
                        </span>
                      </td>

                      {/* Paid */}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={
                            paid > 0
                              ? "font-medium text-flora-success"
                              : "text-flora-muted"
                          }
                        >
                          {formatCurrency(paid)}
                        </span>
                      </td>

                      {/* Valid */}
                      <td className="px-5 py-4">
                        <span className="text-flora-muted">
                          {formatDate(
                            quotation.validUntil
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <span className="text-flora-muted">
                          {formatDate(
                            quotation.createdAt
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/quotations/${quotation.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary transition-colors hover:bg-flora-surface"
                          >
                            View
                            <ArrowUpRight size={13} />
                          </Link>

                          <a
                            href={`/api/quotations/${quotation.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-muted transition-colors hover:bg-flora-surface hover:text-flora-foreground"
                          >
                            PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col gap-3 text-sm text-flora-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing{" "}
            <span className="font-medium text-flora-foreground">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-medium text-flora-foreground">
              {total}
            </span>{" "}
            quotations
          </span>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-lg border border-flora-border bg-white px-3.5 py-2 text-xs font-medium text-flora-muted hover:bg-flora-surface hover:text-flora-foreground"
              >
                ← Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2 text-xs font-medium text-flora-muted/50">
                ← Previous
              </span>
            )}

            <span className="rounded-lg bg-flora-primary px-3.5 py-2 text-xs font-semibold text-white">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-flora-border bg-white px-3.5 py-2 text-xs font-medium text-flora-muted hover:bg-flora-surface hover:text-flora-foreground"
              >
                Next
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 cursor-not-allowed rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2 text-xs font-medium text-flora-muted/50">
                Next
                <ArrowRight size={12} aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}