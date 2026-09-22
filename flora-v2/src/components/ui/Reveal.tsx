"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Subtle entrance reveal for dashboard metrics and section cards.
 * - Runs only on the client after mount (no hydration mismatch: initial
 *   state is fully visible; animation starts from a gsap.set).
 * - Disabled entirely under prefers-reduced-motion.
 * - Fast (0.45s) single transform+opacity tween, no loops or scroll traps.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, delay, ease: "power2.out", overwrite: true }
      );
    }, el);
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
