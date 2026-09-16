import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Mail,
  Phone,
  Search,
  Users,
  BriefcaseBusiness,
  CircleDollarSign,
} from "lucide-react";

import { db } from "@/lib/db";

const PAGE_SIZE = 20;

function formatSource(source: string) {
  return source.replace(/_/g, " ");
}

function formatCurrency(value: number) {
  if (!value) return "—";

  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU"
  );
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const { q: rawQuery, page: rawPage } = await searchParams;

  const q = rawQuery?.trim() ?? "";

  const parsedPage = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsedPage)
    ? Math.max(1, parsedPage)
    : 1;

  const where = q
    ? {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: q,
            },
          },
          {
            email: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            company: {
              tradeName: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    db.contact.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: true,

        enquiries: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            status: true,
            createdAt: true,

            quotations: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                totalAmount: true,
                payments: {
                  select: {
                    amount: true,
                  },
                },
              },
            },

            project: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                status: true,
                totalContractValue: true,
                payments: {
                  select: {
                    amount: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    db.contact.count({
      where,
    }),
  ]);

  const customers = contacts.map((contact) => {
    const enquiries = contact.enquiries;

    const quotations = enquiries.flatMap(
      (enquiry) => enquiry.quotations
    );

    const projects = enquiries
      .map((enquiry) => enquiry.project)
      .filter(
        (
          project
        ): project is NonNullable<typeof project> =>
          Boolean(project)
      );

    const totalQuoted = quotations.reduce(
      (sum, quotation) => sum + quotation.totalAmount,
      0
    );

    const quotationPayments = quotations.flatMap(
      (quotation) => quotation.payments
    );

    const projectPayments = projects.flatMap(
      (project) => project.payments
    );

    const totalPaid = [
      ...quotationPayments,
      ...projectPayments,
    ].reduce((sum, payment) => sum + payment.amount, 0);

    const totalContractValue = projects.reduce(
      (sum, project) => sum + project.totalContractValue,
      0
    );

    const activeProjects = projects.filter(
      (project) =>
        !["COMPLETED"].includes(project.status)
    );

    const outstanding = Math.max(
      totalContractValue - totalPaid,
      0
    );

    const latestEnquiry = enquiries[0];

    return {
      ...contact,
      enquiryCount: enquiries.length,
      quotationCount: quotations.length,
      projectCount: projects.length,
      activeProjectCount: activeProjects.length,
      totalQuoted,
      totalPaid,
      totalContractValue,
      outstanding,
      latestEnquiry,
    };
  });

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

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    params.set("page", String(nextPage));

    return `/customers?${params.toString()}`;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-flora-gold">
            Sales
          </p>

          <h1 className="mt-1 font-display text-4xl font-semibold leading-tight text-flora-foreground">
            Customers
          </h1>

          <p className="mt-2 text-sm text-flora-muted">
            Manage customer relationships, projects and financial history.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-flora-border bg-white px-4 py-2.5">
          <Users
            size={17}
            strokeWidth={1.8}
            className="text-flora-primary"
          />

          <span className="text-sm font-medium text-flora-foreground">
            {total}
          </span>

          <span className="text-sm text-flora-muted">
            customer{total === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {/* Search */}
      <section className="rounded-xl border border-flora-border bg-white p-4">
        <form
          action="/customers"
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-flora-border bg-flora-surface px-3.5 py-2.5">
            <Search
              size={17}
              strokeWidth={1.8}
              className="shrink-0 text-flora-muted"
            />

            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name, phone, email or company..."
              className="w-full bg-transparent text-sm text-flora-foreground outline-none placeholder:text-flora-muted"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-flora-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-flora-primary-hover"
          >
            Search
          </button>

          {q && (
            <Link
              href="/customers"
              className="inline-flex items-center justify-center rounded-lg border border-flora-border px-5 py-2.5 text-sm font-medium text-flora-muted transition-colors hover:bg-flora-surface hover:text-flora-foreground"
            >
              Clear
            </Link>
          )}
        </form>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Customers
            </span>

            <Users
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {total}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Total customer records
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Leads
            </span>

            <BriefcaseBusiness
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {customers.reduce(
              (sum, customer) =>
                sum + customer.enquiryCount,
              0
            )}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Enquiries in this page
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Projects
            </span>

            <Building2
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {customers.reduce(
              (sum, customer) =>
                sum + customer.projectCount,
              0
            )}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Projects across this page
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Payments
            </span>

            <CircleDollarSign
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {formatCurrency(
              customers.reduce(
                (sum, customer) =>
                  sum + customer.totalPaid,
                0
              )
            )}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Received from customers on this page
          </p>
        </div>
      </section>

      {/* Customer table */}
      <section className="overflow-hidden rounded-xl border border-flora-border bg-white">
        <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-flora-foreground">
              Customer Directory
            </h2>

            <p className="mt-1 text-xs text-flora-muted">
              {q
                ? `Results matching “${q}”`
                : "All customers ordered by newest first"}
            </p>
          </div>

          <span className="text-xs text-flora-muted">
            {total} record{total === 1 ? "" : "s"}
          </span>
        </div>

        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface">
              <Users
                size={22}
                className="text-flora-muted"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-flora-foreground">
              No customers found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-flora-muted">
              {q
                ? "Try a different name, phone number, email or company."
                : "Customers will appear here when contacts are created."}
            </p>

            {q && (
              <Link
                href="/customers"
                className="mt-4 inline-flex rounded-lg border border-flora-border px-4 py-2 text-xs font-medium text-flora-primary hover:bg-flora-surface"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-flora-border bg-flora-surface text-left">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Company
                  </th>

                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Leads
                  </th>

                  <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Projects
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Paid
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Outstanding
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-flora-muted">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-flora-surface last:border-b-0 transition-colors hover:bg-flora-background"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flora-primary text-xs font-semibold text-white">
                          {getInitials(customer.name)}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="block truncate font-medium text-flora-foreground hover:text-flora-primary"
                          >
                            {customer.name}
                          </Link>

                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-flora-muted">
                            {formatSource(customer.source)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4">
                      {customer.company ? (
                        <div>
                          <p className="font-medium text-flora-foreground">
                            {customer.company.tradeName}
                          </p>

                          <p className="mt-0.5 text-[11px] text-flora-muted">
                            {customer.company.type.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-flora-muted">
                          Individual
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <a
                          href={`tel:${customer.phone}`}
                          className="flex items-center gap-2 text-xs text-flora-foreground hover:text-flora-primary"
                        >
                          <Phone
                            size={13}
                            className="text-flora-muted"
                          />
                          {customer.phone}
                        </a>

                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="flex max-w-[230px] items-center gap-2 truncate text-xs text-flora-muted hover:text-flora-primary"
                          >
                            <Mail
                              size={13}
                              className="shrink-0"
                            />

                            <span className="truncate">
                              {customer.email}
                            </span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Leads */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-flora-surface px-2 text-xs font-semibold text-flora-primary">
                        {customer.enquiryCount}
                      </span>
                    </td>

                    {/* Projects */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-flora-foreground">
                          {customer.projectCount}
                        </span>

                        {customer.activeProjectCount > 0 && (
                          <span className="mt-0.5 text-[10px] text-flora-primary">
                            {customer.activeProjectCount} active
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Paid */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-medium text-emerald-700">
                        {formatCurrency(customer.totalPaid)}
                      </span>
                    </td>

                    {/* Outstanding */}
                    <td className="px-5 py-4 text-right">
                      <span
                        className={
                          customer.outstanding > 0
                            ? "font-medium text-red-700"
                            : "text-flora-muted"
                        }
                      >
                        {formatCurrency(
                          customer.outstanding
                        )}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-flora-border px-3 py-2 text-xs font-medium text-flora-primary transition-colors hover:bg-flora-surface"
                      >
                        View Customer
                        <ArrowUpRight size={13} />
                      </Link>
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
          <span>
            Showing{" "}
            <span className="font-medium text-flora-foreground">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-medium text-flora-foreground">
              {total}
            </span>
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
                className="rounded-lg border border-flora-border bg-white px-3.5 py-2 text-xs font-medium text-flora-muted hover:bg-flora-surface hover:text-flora-foreground"
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