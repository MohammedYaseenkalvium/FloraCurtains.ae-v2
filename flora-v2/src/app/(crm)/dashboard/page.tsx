import Link from "next/link";
import { db } from "@/lib/db";
import { calcOutstanding, formatAED, sumPayments } from "@/lib/finance";
import { Reveal } from "@/components/ui/Reveal";

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
] as const;

const statusStyles: Record<string, string> = {
  NEW: "bg-stone-100 text-stone-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  VISIT_SCHEDULED: "bg-amber-50 text-amber-700",
  QUOTED: "bg-emerald-50 text-emerald-700",
  NEGOTIATING: "bg-violet-50 text-violet-700",
  WON: "bg-green-50 text-green-700",
  LOST: "bg-red-50 text-red-700",
};

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

  const [
    activeLeads,
    totalCustomers,
    recentEnquiries,
    upcomingVisits,
    projects,
    payments,
    recentActivity,
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
      },
    }),

    db.payment.findMany({
      where: { projectId: { not: null } },
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
   * Payment calculations — project-scoped (Phase 15).
   * Quotation-linked payments (write-orphans, no create endpoint) must NOT
   * deflate project outstanding. Canonical helpers in src/lib/finance.ts.
   */
  const totalPaymentsReceived = sumPayments(payments);

  const outstandingAmount = calcOutstanding(totalContractValue, totalPaymentsReceived);

  /*
   * Lead pipeline
   */
  const leadPipeline = await Promise.all(
    leadStatuses.map(async (status) => ({
      status,
      count: await db.enquiry.count({
        where: {
          deletedAt: null,
          status,
        },
      }),
    })),
  );

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
    },
    {
      label: "Ongoing Projects",
      value: ongoingProjects.toString(),
      description: "Currently in progress",
      href: "/projects",
    },
    {
      label: "Pending Installations",
      value: pendingInstallations.toString(),
      description: "Installation stage",
      href: "/projects",
    },
    {
      label: "Customers",
      value: totalCustomers.toString(),
      description: "Contacts in CRM",
      href: "/customers",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-flora-gold">
            FloraFlow
          </p>

          <h1 className="font-display text-4xl font-semibold tracking-tight text-flora-foreground">
            Operations Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-flora-muted">
            A live overview of your leads, projects, installations and
            financial operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/enquiries/new"
            className="rounded-lg border border-flora-border bg-white px-4 py-2.5 text-sm font-medium text-flora-foreground transition hover:bg-flora-surface"
          >
            + New Lead
          </Link>

          <Link
            href="/quotations/new"
            className="rounded-lg bg-flora-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-flora-primary-hover"
          >
            + Create Quote
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <Reveal>
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group rounded-xl border border-flora-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
                  {kpi.label}
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-flora-foreground">
                  {kpi.value}
                </p>

                <p className="mt-1 text-xs text-flora-muted">
                  {kpi.description}
                </p>
              </div>

              <span className="text-flora-primary transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>
        ))}
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
            Total project value (all statuses)
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
            Recorded payments
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
            Contract value less recorded payments
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
              className="text-xs font-medium text-flora-primary hover:underline"
            >
              View all →
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
                  <tr className="bg-flora-surface text-left text-[10px] uppercase tracking-wider text-flora-muted">
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
                      className="border-t border-flora-surface transition hover:bg-flora-background"
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
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[enquiry.status] ??
                            "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {statusLabels[enquiry.status] ??
                            enquiry.status.replace(/_/g, " ")}
                        </span>
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
              className="text-xs font-medium text-flora-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {upcomingVisits.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-flora-muted">
              No upcoming site visits.
            </div>
          ) : (
            <div className="divide-y divide-flora-surface">
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

          <div className="divide-y divide-flora-surface">
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
                        ? "bg-green-600"
                        : item.status === "ON_HOLD"
                          ? "bg-red-500"
                          : item.status === "INSTALLATION"
                            ? "bg-amber-500"
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
            <div className="divide-y divide-flora-surface">
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