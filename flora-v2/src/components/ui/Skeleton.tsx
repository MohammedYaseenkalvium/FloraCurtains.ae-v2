interface SkeletonProps {
  className?: string;
}

/** Pulse placeholder (reference: UI States → Loading). */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-flora-surface ${className}`} />;
}
