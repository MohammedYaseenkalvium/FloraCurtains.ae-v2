import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  href: string;
  icon?: LucideIcon;
}

/** Dashboard KPI card (reference: CRM Dashboard widgets). */
export function MetricCard({ label, value, description, href, icon: Icon }: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-flora-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-flora-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-flora-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-flora-foreground">{value}</p>
          <p className="mt-1 text-xs text-flora-muted">{description}</p>
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
            <Icon size={17} aria-hidden="true" />
          </span>
        ) : (
          <span aria-hidden="true" className="text-flora-primary transition-transform group-hover:translate-x-0.5">
            →
          </span>
        )}
      </div>
    </Link>
  );
}
