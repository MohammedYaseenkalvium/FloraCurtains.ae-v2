import type { ReactNode } from "react";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "gold"
  | "muted";

const tones: Record<BadgeTone, string> = {
  success: "bg-flora-success-surface text-flora-success",
  warning: "bg-flora-warning-surface text-flora-warning",
  danger: "bg-flora-danger-surface text-flora-danger",
  info: "bg-flora-info-surface text-flora-info",
  primary: "bg-flora-primary text-white",
  gold: "bg-flora-gold/15 text-flora-primary",
  muted: "bg-flora-surface text-flora-muted",
};

const dotTones: Record<BadgeTone, string> = {
  success: "bg-flora-success",
  warning: "bg-flora-warning",
  danger: "bg-flora-danger",
  info: "bg-flora-info",
  primary: "bg-flora-primary",
  gold: "bg-flora-gold",
  muted: "bg-flora-muted",
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Pill badge. State is never color-only — always pair with a text label. */
export function Badge({ tone = "muted", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotTones[tone]}`} />}
      {children}
    </span>
  );
}
