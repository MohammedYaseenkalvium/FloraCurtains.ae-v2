export default function CRMLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-flora-surface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-flora-border bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-flora-border bg-white" />
      <p className="sr-only">Loading…</p>
    </div>
  );
}
