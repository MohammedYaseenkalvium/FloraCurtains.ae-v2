import type { ReactNode } from "react";
import { Container } from "@/components/website/Container";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  /** Extra content above the eyebrow (e.g. the logo on Get Quote). */
  children?: ReactNode;
}

/**
 * Canonical inner-page hero: ivory band, hairline bottom border,
 * gold eyebrow, display serif title, muted lede. One pattern for
 * every public page (DESIGN.md §22 — related pages feel like one product).
 */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-flora-border bg-flora-background">
      <Container className="py-20 lg:py-24">
        {children}
        <p className="eyebrow text-flora-gold">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.05] text-flora-foreground sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-7 text-flora-muted">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
