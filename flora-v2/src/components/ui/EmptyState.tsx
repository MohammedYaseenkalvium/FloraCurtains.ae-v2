import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/** Centered empty state (reference: UI States). */
export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-flora-surface text-xl text-flora-primary">
          {icon}
        </div>
      )}
      <h3 className="mt-4 font-semibold text-flora-foreground">{title}</h3>
      {hint && <p className="mx-auto mt-2 max-w-md text-sm text-flora-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
