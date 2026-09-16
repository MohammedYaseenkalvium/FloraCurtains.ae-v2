import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { notFound } from "next/navigation";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";
import { CustomerFinancialDashboard } from "@/components/crm/CustomerFinancialDashboard";

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

export default async function CustomerWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const summary = await getCustomerFinancialSummary(id).catch(() =>
    notFound()
  );

  const initials = getInitials(summary.customerName);

  return (
    <div className="w-full max-w-[1400px] space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-flora-muted">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-flora-primary"
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Customers
        </Link>

        <span>/</span>

        <span className="truncate text-flora-foreground">
          {summary.customerName}
        </span>
      </div>

      {/* Customer Header */}
      <section className="rounded-xl border border-flora-border bg-white p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-flora-primary text-sm font-semibold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-semibold leading-none text-flora-foreground">
                  {summary.customerName}
                </h1>

                <span className="rounded-full bg-flora-surface px-3 py-1 text-xs font-semibold text-flora-muted">
                  Customer
                </span>

                {summary.companyName && (
                  <span className="rounded-full bg-flora-surface px-3 py-1 text-xs font-semibold text-flora-primary">
                    B2B
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-flora-muted">
                {summary.customerPhone && (
                  <a
                    href={`tel:${summary.customerPhone}`}
                    className="inline-flex items-center gap-1.5 hover:text-flora-primary"
                  >
                    <Phone size={14} />
                    {summary.customerPhone}
                  </a>
                )}

                {summary.customerEmail && (
                  <a
                    href={`mailto:${summary.customerEmail}`}
                    className="inline-flex max-w-full items-center gap-1.5 hover:text-flora-primary"
                  >
                    <Mail size={14} />

                    <span className="truncate">
                      {summary.customerEmail}
                    </span>
                  </a>
                )}

                {summary.companyName && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} />
                    {summary.companyName}
                  </span>
                )}
              </div>

              {summary.companyType && (
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-flora-muted">
                  {summary.companyType.replace(/_/g, " ")}
                </p>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/enquiries"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-flora-border bg-white px-4 py-2.5 text-sm font-medium text-flora-foreground transition-colors hover:bg-flora-surface"
            >
              <UserRound size={16} />
              View Leads
            </Link>

            {summary.customerPhone && (
              <a
                href={`tel:${summary.customerPhone}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-flora-primary-hover"
              >
                <Phone size={16} />
                Call Customer
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Relationship Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Enquiries
            </p>

            <UserRound
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {summary.enquiryCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Lead records
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Quotations
            </p>

            <ArrowUpRight
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {summary.quotationCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Quotes issued
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Projects
            </p>

            <Building2
              size={18}
              strokeWidth={1.8}
              className="text-flora-primary"
            />
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {summary.projectCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            {summary.activeProjectCount} active
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-flora-muted">
              Payments
            </p>

            <span className="text-flora-primary">
              AED
            </span>
          </div>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {summary.paymentCount}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Transactions recorded
          </p>
        </div>
      </section>

      {/* Existing financial workspace */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-flora-gold">
            Customer Operations
          </p>

          <h2 className="mt-1 font-display text-2xl font-semibold text-flora-foreground">
            Customer Workspace
          </h2>

          <p className="mt-1 text-sm text-flora-muted">
            Complete commercial history across enquiries, quotations,
            projects, payments and account ledger.
          </p>
        </div>

        <CustomerFinancialDashboard summary={summary} />
      </section>
    </div>
  );
}