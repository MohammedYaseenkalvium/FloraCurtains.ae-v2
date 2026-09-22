"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-flora-primary text-white hover:bg-flora-primary-hover shadow-flora-sm",
  secondary:
    "border border-flora-border bg-white text-flora-foreground hover:bg-flora-surface",
  outline:
    "border border-flora-primary text-flora-primary hover:bg-flora-surface",
  ghost: "text-flora-primary hover:bg-flora-surface",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

/**
 * Single button primitive (reference: Button Styles).
 * Renders a Link when `href` is provided, otherwise a <button>.
 */
export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-flora-md font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-primary focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
