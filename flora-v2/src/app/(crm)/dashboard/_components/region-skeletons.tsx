import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shape-matched Suspense fallbacks for the dashboard home regions.
 * Each skeleton reuses its host card frame
 * (rounded-flora-md border border-flora-border bg-white shadow-flora-sm)
 * so blocks pop in without restyle. Built only from the Skeleton primitive
 * plus a single sr-only Loading note per card. Reduced-motion users get
 * static blocks (a no-pulse override on every Skeleton).
 */

const frame = "rounded-flora-md border border-flora-border bg-white shadow-flora-sm";

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={[frame, "p-5"].join(" ")}>
          <Skeleton className="h-3 w-24 motion-reduce:animate-none" />
          <Skeleton className="mt-3 h-9 w-20 motion-reduce:animate-none" />
          <Skeleton className="mt-1 h-3 w-32 motion-reduce:animate-none" />
        </div>
      ))}
      <p className="sr-only">Loading…</p>
    </div>
  );
}

export function HeroChipsSkeleton() {
  return (
    <section
      aria-label="Overview"
      className="relative overflow-hidden rounded-flora-xl bg-gradient-to-br from-flora-primary to-flora-ink p-6 text-white shadow-flora-sm sm:p-8 lg:p-12 on-dark"
    >
      <div className="relative z-10">
        <Skeleton className="h-4 w-32 bg-white/20 motion-reduce:animate-none" />
        <Skeleton className="mt-2 h-12 w-64 bg-white/20 motion-reduce:animate-none" />
        <Skeleton className="mt-2 h-5 w-40 bg-white/20 motion-reduce:animate-none" />
        <div className="mt-5 flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-6 w-28 rounded-full bg-white/20 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
      <p className="sr-only">Loading…</p>
    </section>
  );
}

export function ListSkeleton() {
  return (
    <div className={frame}>
      <div className="border-b border-flora-border px-5 py-4">
        <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
        <Skeleton className="mt-1 h-3 w-56 motion-reduce:animate-none" />
      </div>
      <div className="divide-y divide-flora-border/50">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-3">
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading…</p>
    </div>
  );
}

export function PaymentSkeleton() {
  return (
    <div className={frame}>
      <div className="border-b border-flora-border px-5 py-4">
        <Skeleton className="h-5 w-40 motion-reduce:animate-none" />
        <Skeleton className="mt-1 h-3 w-56 motion-reduce:animate-none" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="h-3 w-28 motion-reduce:animate-none" />
            <Skeleton className="mt-3 h-9 w-32 motion-reduce:animate-none" />
            <Skeleton className="mt-1 h-3 w-40 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading…</p>
    </div>
  );
}
