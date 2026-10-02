import { Suspense } from "react";
import { RegionBoundary } from "../_components/RegionErrorCard";
import { OutstandingHeaders, OutstandingTable } from "./_components/regions";
import {
  OutstandingHeadersSkeleton,
  OutstandingTableSkeleton,
} from "./_components/region-skeletons";

/**
 * Outstanding balances — pure streaming composition. The header cards and
 * the balances table each read server-side inside their own async server
 * component and pop in independently behind a shape-matched skeleton.
 * Zero balances render "No outstanding balances." (no CTA) inside
 * OutstandingTable; failures stay scoped — "Couldn't load outstanding
 * summary" / "Couldn't load outstanding balances" each retry only their
 * own region through the existing server read path.
 */
export default function OutstandingBalancesPage() {
  return (
    <div>
      <RegionBoundary region="outstanding-headers" title="Couldn't load outstanding summary">
        <Suspense fallback={<OutstandingHeadersSkeleton />}>
          <OutstandingHeaders />
        </Suspense>
      </RegionBoundary>

      <RegionBoundary region="outstanding-table" title="Couldn't load outstanding balances">
        <Suspense fallback={<OutstandingTableSkeleton />}>
          <OutstandingTable />
        </Suspense>
      </RegionBoundary>
    </div>
  );
}
