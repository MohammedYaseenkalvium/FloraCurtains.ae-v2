import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shape-matched Suspense fallbacks for the /dashboard/outstanding regions.
 * Each skeleton reuses its shipped host frame so blocks pop in without
 * restyle. Built only from the Skeleton primitive plus a single sr-only
 * Loading note per card. Reduced-motion users get static blocks (a no-pulse
 * override on every Skeleton).
 */

const summaryCardFrame = "bg-white/70 backdrop-blur border border-black/5 rounded-xl p-5";

const tableFrame = "bg-white border border-flora-border rounded-xl overflow-hidden";

export function OutstandingHeadersSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <Skeleton className="h-8 w-56 motion-reduce:animate-none" />
          <Skeleton className="mt-1 h-4 w-72 motion-reduce:animate-none" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className={summaryCardFrame}>
            <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
            <Skeleton className="mt-2 h-9 w-32 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading…</p>
    </div>
  );
}

export function OutstandingTableSkeleton() {
  return (
    <div className={tableFrame}>
      <div className="divide-y divide-flora-border/50">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="px-5 py-3">
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading…</p>
    </div>
  );
}
