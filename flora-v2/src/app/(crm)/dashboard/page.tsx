import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  FileText,
  FolderKanban,
  MapPin,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { calcLifetimeRevenue, calcOutstanding, formatAED, sumPayments } from "@/lib/finance";
import { formatFullDate } from "@/lib/format";
import { statusStyles } from "@/lib/status-styles";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

const leadStatuses = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "QUOTED",
  "NEGOTIATING",
  "WON",
  "LOST",
] as const;

const projectStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "INSTALLATION",
  "SNAGGING",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
] as const;

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit Scheduled",
  QUOTED: "Quoted",
  NEGOTIATING: "Negotiating",
  WON: "Won",
  LOST: "Lost",
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  INSTALLATION: "Installation",
  SNAGGING: "Snagging",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

function formatCurrency(value: number) {
  return formatAED(value, { decimals: false });
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-AE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatActivityAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function DashboardPage() {
  const now = new Date();
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const hour = now.getHours();
  const daypart = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [
    activeLeads,
    totalCustomers,
    recentEnquiries,
    upcomingVisits,
    projects,
    payments,
    recentActivity,
    leadGroups,
    approvedQuotations,
    pendingQuotationCount,
  ] = await Promise.all([
    db.enquiry.count({
      where: {
        deletedAt: null,
        status: {
          notIn: ["WON", "LOST"],
        },
      },
    }),

    db.contact.count(),

    db.enquiry.findMany({
      take: 8,
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        contact: true,
        company: true,
      },
    }),

    db.siteVisit.findMany({
      take: 5,
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          gte: now,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      include: {
        enquiry: {
          include: {
            contact: true,
          },
        },
      },
    }),

    db.project.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        totalContractValue: true,
        quotationId: true,
      },
    }),

    db.payment.findMany({
      select: {
        amount: true,
      },
    }),

    db.activityLog.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Lead pipeline — single GROUP BY instead of one COUNT per status
    // (was 7 sequential round trips on every dashboard load).
    db.enquiry.groupBy({
      by: ["status"],
      where: {
        deletedAt: null,
      },
      _count: {
        _all: true,
      },
    }),

    // Approved quotations without a project count as outstanding revenue —
    // canonical lifetime-revenue inputs for src/lib/finance.ts.
    db.quotation.findMany({
      where: {
        deletedAt: null,
        status: "APPROVED",
      },
      select: {
        id: true,
        totalAmount: true,
      },
    }),

    db.quotation.count({
      where: {
        deletedAt: null,
        status: { in: ["DRAFT", "SENT", "REVISED"] },
      },
    }),
  ]);

  /*
   * Project calculations
   */
  const ongoingProjects = projects.filter((project) =>
    ["IN_PROGRESS", "INSTALLATION", "SNAGGING"].includes(project.status),
  ).length;

  const pendingInstallations = projects.filter(
    (project) => project.status === "INSTALLATION",
  ).length;

  const totalContractValue = projects.reduce(
    (total, project) => total + project.totalContractValue,
    0,
  );

  /*
   * Payment calculations — canonical portfolio definition (src/lib/finance.ts).
   *
   * Lifetime revenue = project contract values + approved quotations that
   * never became a project. Payments = every recorded payment (project- and
   * quotation-scoped). This matches /dashboard/outstanding and
   * getCustomerFinancialSummary, so the KPI and the detail page agree.
   *
   * Residual difference: the detail page clamps each customer at 0, so any
   * pre-existing overpayment credit is invisible there but still reduces the
   * portfolio figure here (see CONCERNS — overpayment credit).
   */
  const totalPaymentsReceived = sumPayments(payments);

  const { lifetimeRevenue } = calcLifetimeRevenue({
    projects: projects.map((project) => ({
      totalContractValue: project.totalContractValue,
      quotationId: project.quotationId,
    })),
    approvedQuotations: approvedQuotations.map((quotation) => ({
      id: quotation.id,
      totalAmount: quotation.totalAmount,
    })),
  });

  const outstandingAmount = calcOutstanding(lifetimeRevenue, totalPaymentsReceived);

  /*
   * Lead pipeline — derived from the grouped counts fetched above.
   */
  const leadCountByStatus = new Map<string, number>(
    leadGroups.map((group) => [group.status, group._count._all])
  );

  const leadPipeline = leadStatuses.map((status) => ({
    status,
    count: leadCountByStatus.get(status) ?? 0,
  }));

  /*
   * Project pipeline
   */
  const projectPipeline = projectStatuses.map((status) => ({
    status,
    count: projects.filter((project) => project.status === status).length,
  }));

  const kpis = [
    {
      label: "Active Leads",
      value: activeLeads.toString(),
      description: "Open opportunities",
      href: "/enquiries",
      icon: FileText,
    },
    {
      label: "Ongoing Projects",
      value: ongoingProjects.toString(),
      description: "Currently in progress",
      href: "/projects",
      icon: FolderKanban,
    },
    {
      label: "Pending Installations",
      value: pendingInstallations.toString(),
      description: "Installation stage",
      href: "/projects",
      icon: Wrench,
    },
    {
      label: "Customers",
      value: totalCustomers.toString(),
      description: "Contacts in CRM",
      href: "/customers",
      icon: Users,
    },
  ];

  const overviewChips = [
    { figure: ongoingProjects.toString(), label: "Active Projects" },
    { figure: pendingQuotationCount.toString(), label: "Pending Quotations" },
    {
      figure: formatAED(outstandingAmount, { decimals: false }),
      label: "Outstanding",
    },
    ...leadPipeline
      .filter((item) => item.count > 0)
      .map((item) => ({
        figure: item.count.toString(),
        label: statusStyles.enquiry[item.status].label,
      })),
  ];

  return (
    <div className="space-y-8">
      {/* Hero — greeting + business overview (PRD §4 regions 1-2) */}
      <section
        aria-label="Overview"
        className="relative overflow-hidden rounded-flora-xl bg-gradient-to-br from-flora-primary to-flora-ink p-6 text-white shadow-flora-sm sm:p-8 lg:p-12 on-dark"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-flora-xl"
        >
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-flora-background/[0.08] blur-3xl" />
          <div className="absolute inset-y-0 right-[14%] w-px bg-flora-background/[0.07]" />
          <div className="absolute inset-y-0 right-[26%] w-px bg-flora-background/[0.05]" />
          <div className="absolute inset-y-0 right-[38%] w-px bg-flora-background/[0.04]" />
        </div>

        <div className="relative z-10">
          <p className="eyebrow text-xs text-flora-gold">Operations Dashboard</p>

          <h1 className="mt-2 font-display text-5xl leading-[1.05] text-white">{`${daypart}, ${firstName}`}</h1>

          <p className="mt-2 text-base text-flora-background/80">{formatFullDate(now)}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {overviewChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs"
              >
                <span className="font-semibold text-white">{chip.figure}</span>
                <span className="text-flora-background/85">{chip.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <Reveal>
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            description={kpi.description}
            href={kpi.href}
            icon={kpi.icon}
          />
        ))}
      </section>
      </Reveal>

      {/* Quick actions */}
      <Reveal delay={0.06}>
      <section
        aria-label="Quick actions"
        className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm"
      >
        <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
          <h2 className="font-semibold text-flora-foreground">Quick actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <Button variant="secondary" size="md" href="/enquiries/new">
            <Plus size={16} aria-hidden="true" />
            New Enquiry
          </Button>

          <Button variant="secondary" size="md" href="/quotations/new">
            <Plus size={16} aria-hidden="true" />
            New Quotation
          </Button>

          <Button variant="secondary" size="md" href="/payments">
            <Banknote size={16} aria-hidden="true" />
            Record Payment
          </Button>

          <Button variant="secondary" size="md" href="/site-visits">
            <MapPin size={16} aria-hidden="true" />
            New Site Visit
          </Button>
        </div>
      </section>
      </Reveal>

      {/* Financial Snapshot */}
      <Reveal delay={0.08}>
      <section aria-label="Financial snapshot" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Contract Value
          </p>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {formatCurrency(totalContractValue)}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Sum of project contract values (all statuses)
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Payments Received
          </p>

          <p className="mt-3 text-2xl font-semibold text-flora-foreground">
            {formatCurrency(totalPaymentsReceived)}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            All recorded payments (project + quotation)
          </p>
        </div>

        <div className="rounded-xl border border-flora-border bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Outstanding
          </p>

          <p className="mt-3 text-2xl font-semibold text-flora-primary">
            {formatCurrency(outstandingAmount)}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Lifetime revenue less all payments
          </p>
        </div>
      </section>
      </Reveal>

      {/* Lead Pipeline */}
      <section className="rounded-xl border border-flora-border bg-white">
        <div className="border-b border-flora-border px-5 py-4">
          <h2 className="font-semibold text-flora-foreground">
            Lead Pipeline
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            Current enquiry distribution across the sales process
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-flora-border md:grid-cols-4 xl:grid-cols-7">
          {leadPipeline.map((item) => (
            <Link
              key={item.status}
              href="/enquiries"
              className="group px-4 py-5 transition hover:bg-flora-background"
            >
              <p className="text-[10px] font-medium uppercase leading-4 tracking-wider text-flora-muted">
                {statusLabels[item.status]}
              </p>

              <p className="mt-3 text-2xl font-semibold text-flora-foreground">
                {item.count}
              </p>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-flora-surface">
                <div
                  className="h-full rounded-full bg-flora-primary transition-all group-hover:bg-flora-primary-hover"
                  style={{
                    width: `${Math.min(
                      item.count === 0
                        ? 0
                        : (item.count /
                            Math.max(
                              ...leadPipeline.map((pipeline) => pipeline.count),
                              1,
                            )) *
                          100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Operational Overview */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Recent Enquiries */}
        <div className="overflow-hidden rounded-xl border border-flora-border bg-white">
          <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-flora-foreground">
                Recent Enquiries
              </h2>

              <p className="mt-1 text-xs text-flora-muted">
                Latest customer opportunities
              </p>
            </div>

            <Link
              href="/enquiries"
              className="inline-flex items-center gap-1 text-xs font-medium text-flora-primary hover:underline"
            >
              View all
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-flora-muted">
              No enquiries yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead>
                  <tr className="bg-flora-cream text-left text-[10px] uppercase tracking-wider text-flora-muted">
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Service</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentEnquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="border-t border-flora-border/50 transition hover:bg-flora-background"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/enquiries/${enquiry.id}`}
                          className="font-medium text-flora-primary hover:underline"
                        >
                          {enquiry.contact.name}
                        </Link>

                        {enquiry.company && (
                          <p className="mt-0.5 text-xs text-flora-muted">
                            {enquiry.company.tradeName}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-flora-muted">
                        {enquiry.serviceWanted}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge domain="enquiry" status={enquiry.status} />
                      </td>

                      <td className="px-5 py-4 text-xs text-flora-muted">
                        {formatDate(new Date(enquiry.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Site Visits */}
        <div className="rounded-xl border border-flora-border bg-white">
          <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-flora-foreground">
                Upcoming Site Visits
              </h2>

              <p className="mt-1 text-xs text-flora-muted">
                Scheduled field operations
              </p>
            </div>

            <Link
              href="/site-visits"
              className="inline-flex items-center gap-1 text-xs font-medium text-flora-primary hover:underline"
            >
              View all
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-flora-muted">
              No upcoming site visits.
            </div>
          ) : (
            <div className="divide-y divide-flora-border/50">
              {upcomingVisits.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/site-visits/${visit.id}`}
                  className="block px-5 py-4 transition hover:bg-flora-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-flora-foreground">
                        {visit.enquiry.contact.name}
                      </p>

                      <p className="mt-1 text-xs text-flora-muted">
                        {visit.siteAddress}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {visit.scheduledAt ? (
                        <>
                          <p className="text-sm font-medium text-flora-primary">
                            {formatDate(new Date(visit.scheduledAt))}
                          </p>

                          <p className="mt-1 text-xs text-flora-muted">
                            {formatTime(new Date(visit.scheduledAt))}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-flora-muted">TBD</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Status + Activity */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Project Status */}
        <div className="rounded-xl border border-flora-border bg-white">
          <div className="border-b border-flora-border px-5 py-4">
            <h2 className="font-semibold text-flora-foreground">
              Project Status
            </h2>

            <p className="mt-1 text-xs text-flora-muted">
              Current project distribution
            </p>
          </div>

          <div className="divide-y divide-flora-border/50">
            {projectPipeline.map((item) => (
              <Link
                key={item.status}
                href="/projects"
                className="flex items-center justify-between px-5 py-3.5 transition hover:bg-flora-background"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.status === "COMPLETED"
                        ? "bg-flora-success"
                        : item.status === "ON_HOLD"
                          ? "bg-flora-warning"
                          : item.status === "CANCELLED"
                            ? "bg-flora-taupe"
                            : item.status === "INSTALLATION"
                              ? "bg-flora-gold"
                              : "bg-flora-primary"
                    }`}
                  />

                  <span className="text-sm text-flora-foreground">
                    {statusLabels[item.status]}
                  </span>
                </div>

                <span className="text-sm font-semibold text-flora-foreground">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-flora-border bg-white">
          <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-flora-foreground">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-flora-muted">
                Latest CRM activity
              </p>
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-flora-muted">
              No activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-flora-border/50">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-5 py-4">
                  <div className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flora-primary" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-flora-foreground">
                          {activity.summary ||
                            `${formatActivityAction(activity.action)} ${activity.entityType}`}
                        </p>

                        <span className="shrink-0 text-[11px] text-flora-muted">
                          {formatDate(new Date(activity.createdAt))}
                        </span>
                      </div>

                      {activity.userName && (
                        <p className="mt-1 text-xs text-flora-muted">
                          {activity.userName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}