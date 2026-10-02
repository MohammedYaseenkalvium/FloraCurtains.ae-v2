import { Suspense } from "react";
import {
  Banknote,
  MapPin,
  Plus,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
  ActiveProjects,
  HeroChips,
  KpiCards,
  PaymentOverview,
  PendingQuotations,
  RecentActivity,
  RecentEnquiries,
} from "./_components/regions";
import {
  HeroChipsSkeleton,
  KpiSkeleton,
  ListSkeleton,
  PaymentSkeleton,
} from "./_components/region-skeletons";
import { RegionBoundary } from "./_components/RegionErrorCard";

/**
 * Dashboard home — pure streaming composition. Each of the seven data
 * regions reads server-side inside its own async server component and pops
 * in independently behind a shape-matched skeleton; a per-region error
 * boundary offers Retry that re-streams just that region. The route-level
 * (crm)/loading.tsx stays untouched (first-paint cover only) and the
 * quick-action strip below is static links with no data behind it.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero — greeting + business overview (PRD §4 regions 1-2) */}
      <RegionBoundary region="hero" title="Couldn't load overview">
        <Suspense fallback={<HeroChipsSkeleton />}>
          <HeroChips />
        </Suspense>
      </RegionBoundary>

      {/* KPI Cards */}
      <RegionBoundary region="key-metrics" title="Couldn't load key metrics">
        <Suspense fallback={<KpiSkeleton />}>
          <KpiCards />
        </Suspense>
      </RegionBoundary>

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

      {/* Row A — Recent Enquiries + Active Projects */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RegionBoundary region="recent-enquiries" title="Couldn't load recent enquiries">
          <Suspense fallback={<ListSkeleton />}>
            <RecentEnquiries />
          </Suspense>
        </RegionBoundary>

        <RegionBoundary region="active-projects" title="Couldn't load active projects">
          <Suspense fallback={<ListSkeleton />}>
            <ActiveProjects />
          </Suspense>
        </RegionBoundary>
      </div>

      {/* Row B — Pending Quotations + Payment Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RegionBoundary region="pending-quotations" title="Couldn't load pending quotations">
          <Suspense fallback={<ListSkeleton />}>
            <PendingQuotations />
          </Suspense>
        </RegionBoundary>

        <RegionBoundary region="payment-overview" title="Couldn't load payment overview">
          <Suspense fallback={<PaymentSkeleton />}>
            <PaymentOverview />
          </Suspense>
        </RegionBoundary>
      </div>

      {/* Recent Activity */}
      <RegionBoundary region="recent-activity" title="Couldn't load recent activity">
        <Suspense fallback={<ListSkeleton />}>
          <RecentActivity />
        </Suspense>
      </RegionBoundary>
    </div>
  );
}
