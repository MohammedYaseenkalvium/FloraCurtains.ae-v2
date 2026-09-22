import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

/** Standard section card: rounded-xl border, white, consistent padding. */
export function Card({ title, description, action, children, className = "", padded = true }: CardProps) {
  return (
    <section className={`rounded-xl border border-flora-border bg-white ${className}`}>
      {(title || action) && (
        <div className="flex flex-col gap-2 border-b border-flora-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="font-semibold text-flora-foreground">{title}</h2>}
            {description && <p className="mt-1 text-xs text-flora-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
