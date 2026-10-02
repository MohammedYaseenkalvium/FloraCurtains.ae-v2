import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Users,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getPortfolioFinancialSummary } from "@/lib/customer-financial";
import { formatAED } from "@/lib/finance";
import { formatFullDate, formatRowDate } from "@/lib/format";
import { statusStyles } from "@/lib/status-styles";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
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

function formatActivityAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Hero greeting + business-overview chips.
 * Queries moved byte-identical from dashboard/page.tsx (grouped enquiry
 * pipeline, pending-quotation count, shared portfolio pipeline).
 */
export async function HeroChips() {
  const now = new Date();
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const hour = now.getHours();
  const daypart = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [leadGroups, pendingQuotationCount, portfolio] = await Promise.all([
    // Enquiry pipeline — single GROUP BY instead of one COUNT per status
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

    db.quotation.count({
      where: {
        deletedAt: null,
        enquiry: { deletedAt: null },
        status: { in: ["DRAFT", "SENT", "REVISED"] },
      },
    }),

    // Portfolio money figures + the project list behind the KPI derives —
    // the ONE input-assembly this dashboard and /dashboard/outstanding share.
    getPortfolioFinancialSummary(),
  ]);

  const { projects, outstanding: outstandingAmount } = portfolio;

  const ongoingProjects = projects.filter((project) =>
    ["IN_PROGRESS", "INSTALLATION", "SNAGGING"].includes(project.status),
  ).length;

  /*
   * Enquiry pipeline — derived from the grouped counts fetched above.
   */
  const leadCountByStatus = new Map<string, number>(
    leadGroups.map((group) => [group.status, group._count._all])
  );

  const leadPipeline = leadStatuses.map((status) => ({
    status,
    count: leadCountByStatus.get(status) ?? 0,
  }));

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
  );
}

/**
 * KPI cards. Queries moved byte-identical from dashboard/page.tsx.
 * Reveal wraps already-loaded content only — it never gates Suspense pop-in.
 */
export async function KpiCards() {
  const [activeLeads, totalCustomers, portfolio] = await Promise.all([
    db.enquiry.count({
      where: {
        deletedAt: null,
        status: {
          notIn: ["WON", "LOST"],
        },
      },
    }),

    db.contact.count(),

    // Portfolio money figures + the project list behind the KPI derives —
    // the ONE input-assembly this dashboard and /dashboard/outstanding share.
    getPortfolioFinancialSummary(),
  ]);

  const { projects } = portfolio;

  /*
   * Project calculations
   */
  const ongoingProjects = projects.filter((project) =>
    ["IN_PROGRESS", "INSTALLATION", "SNAGGING"].includes(project.status),
  ).length;

  const pendingInstallations = projects.filter(
    (project) => project.status === "INSTALLATION",
  ).length;

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

  return (
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
  );
}

/**
 * Recent Enquiries list card. Query moved byte-identical from dashboard/page.tsx.
 */
export async function RecentEnquiries() {
  const recentEnquiries = await db.enquiry.findMany({
    take: 5,
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
  });

  return (
    <Reveal delay={0.12}>
    <div className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm">
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
        <div className="px-5 py-12 text-center text-base text-flora-muted">
          No enquiries yet.
        </div>
      ) : (
        <div className="divide-y divide-flora-border/50">
          {recentEnquiries.map((enquiry) => (
            <Link
              key={enquiry.id}
              href={`/enquiries/${enquiry.id}`}
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-flora-background"
            >
              <StatusBadge domain="enquiry" status={enquiry.status} />

              <span className="min-w-0 flex-1 truncate text-base font-normal text-flora-foreground">
                {enquiry.contact.name}
                <span className="text-flora-muted"> · {enquiry.serviceWanted}</span>
              </span>

              <span className="shrink-0 text-xs tabular-nums text-flora-muted">
                {formatRowDate(new Date(enquiry.createdAt))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
    </Reveal>
  );
}

/**
 * Active Projects list card — same status set as the ongoing-projects KPI.
 * Query moved byte-identical from dashboard/page.tsx.
 */
export async function ActiveProjects() {
  const activeProjects = await db.project.findMany({
    take: 5,
    where: {
      deletedAt: null,
      enquiry: { deletedAt: null },
      status: { in: ["IN_PROGRESS", "INSTALLATION", "SNAGGING"] },
    },
    include: {
      enquiry: {
        include: { contact: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Reveal delay={0.12}>
    <div className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm">
      <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-flora-foreground">
            Active Projects
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            Latest projects in progress
          </p>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-medium text-flora-primary hover:underline"
        >
          View all
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {activeProjects.length === 0 ? (
        <div className="px-5 py-12 text-center text-base text-flora-muted">
          No active projects yet.
        </div>
      ) : (
        <div className="divide-y divide-flora-border/50">
          {activeProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-flora-background"
            >
              <StatusBadge domain="project" status={project.status} />

              <span className="min-w-0 flex-1 truncate text-base font-normal text-flora-foreground">
                {project.enquiry.projectName ?? project.enquiry.contact.name}
              </span>

              <span className="shrink-0 text-base font-semibold tabular-nums text-flora-foreground">
                {formatAED(project.totalContractValue, { decimals: false })}
              </span>

              <span className="shrink-0 text-xs tabular-nums text-flora-muted">
                {formatRowDate(new Date(project.updatedAt))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
    </Reveal>
  );
}

/**
 * Pending Quotations list card — DRAFT/SENT/REVISED.
 * Query moved byte-identical from dashboard/page.tsx.
 */
export async function PendingQuotations() {
  const pendingQuotations = await db.quotation.findMany({
    take: 5,
    where: {
      deletedAt: null,
      enquiry: { deletedAt: null },
      status: { in: ["DRAFT", "SENT", "REVISED"] },
    },
    include: {
      enquiry: {
        include: { contact: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Reveal delay={0.18}>
    <div className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm">
      <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-flora-foreground">
            Pending Quotations
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            Latest quotations awaiting response
          </p>
        </div>

        <Link
          href="/quotations"
          className="inline-flex items-center gap-1 text-xs font-medium text-flora-primary hover:underline"
        >
          View all
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {pendingQuotations.length === 0 ? (
        <div className="px-5 py-12 text-center text-base text-flora-muted">
          No pending quotations yet.
        </div>
      ) : (
        <div className="divide-y divide-flora-border/50">
          {pendingQuotations.map((quotation) => (
            <Link
              key={quotation.id}
              href={`/quotations/${quotation.id}`}
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-flora-background"
            >
              <StatusBadge domain="quotation" status={quotation.status} />

              <span className="min-w-0 flex-1 truncate text-base font-normal text-flora-foreground">
                {quotation.quoteNumber}
                <span className="text-flora-muted"> · {quotation.enquiry.contact.name}</span>
              </span>

              <span className="shrink-0 text-base font-semibold tabular-nums text-flora-foreground">
                {formatAED(quotation.totalAmount, { decimals: false })}
              </span>

              <span className="shrink-0 text-xs tabular-nums text-flora-muted">
                {formatRowDate(new Date(quotation.createdAt))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
    </Reveal>
  );
}

/**
 * Payment Overview — figures come straight from the shared portfolio
 * pipeline; never re-summed here (Ph3 D-02 one-money-pipeline rule).
 * Zero figures render through formatAED (D-11).
 */
export async function PaymentOverview() {
  const portfolio = await getPortfolioFinancialSummary();

  /*
   * Money figures — canonical contract in src/lib/finance.ts, assembled by
   * getPortfolioFinancialSummary (src/lib/customer-financial.ts), the ONE
   * input-assembly this screen and /dashboard/outstanding both consume, so the
   * two totals cannot diverge. projectValues / totalPaid / outstandingAmount /
   * credit below come straight from that pipeline; do not re-sum them here.
   */
  const { projectValues, totalPaid, outstanding: outstandingAmount, credit } = portfolio;

  return (
    <Reveal delay={0.18}>
    <div className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm">
      <div className="flex items-center justify-between border-b border-flora-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-flora-foreground">
            Payment Overview
          </h2>

          <p className="mt-1 text-xs text-flora-muted">
            Contract value, payments received and outstanding
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Contract Value
          </p>

          <p className="mt-3 text-3xl font-semibold text-flora-foreground">
            {formatAED(projectValues, { decimals: false })}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            Sum of project contract values (all statuses)
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Payments Received
          </p>

          <p className="mt-3 text-3xl font-semibold text-flora-foreground">
            {formatAED(totalPaid, { decimals: false })}
          </p>

          <p className="mt-1 text-xs text-flora-muted">
            All recorded payments (project + quotation)
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
            Outstanding
          </p>

          <Link
            href="/dashboard/outstanding"
            className="mt-3 block text-3xl font-semibold text-flora-primary hover:underline"
          >
            {formatAED(outstandingAmount, { decimals: false })}
          </Link>

          <p className="mt-1 text-xs text-flora-muted">
            Lifetime revenue less all payments
          </p>
        </div>

        {credit > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">
              Credit
            </p>

            <p className="mt-3 text-3xl font-semibold text-flora-foreground">
              {formatAED(credit, { decimals: false })}
            </p>

            <p className="mt-1 text-xs text-flora-muted">
              Overpayment received above lifetime revenue
            </p>
          </div>
        )}
      </div>
    </div>
    </Reveal>
  );
}

/**
 * Recent Activity card. Query moved byte-identical from dashboard/page.tsx.
 */
export async function RecentActivity() {
  const recentActivity = await db.activityLog.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Reveal delay={0.24}>
    <section>
      <div className="rounded-flora-md border border-flora-border bg-white shadow-flora-sm">
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
          <div className="px-5 py-12 text-center text-base text-flora-muted">
            No activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-flora-border/50">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-flora-background"
              >
                <Badge tone="muted">{activity.entityType}</Badge>

                <span className="min-w-0 flex-1 truncate text-base font-normal text-flora-foreground">
                  {activity.summary ||
                    `${formatActivityAction(activity.action)} ${activity.entityType}`}
                  {activity.userName && (
                    <span className="text-flora-muted"> · {activity.userName}</span>
                  )}
                </span>

                <span className="shrink-0 text-xs tabular-nums text-flora-muted">
                  {formatRowDate(new Date(activity.createdAt))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    </Reveal>
  );
}
