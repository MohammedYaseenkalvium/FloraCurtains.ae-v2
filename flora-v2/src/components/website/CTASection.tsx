import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/website/Container";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

/** Full-width dark burgundy CTA band (one shared component everywhere). */
export function CTASection({
  eyebrow = "Start your project",
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className="bg-flora-ink text-white">
      <Container className="py-20 text-center lg:py-28">
        <p className="font-display text-lg italic text-flora-gold">Flora</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/70">
          {eyebrow} — {description}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-flora-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-flora-primary-hover sm:w-auto"
          >
            {primaryLabel}
            <ArrowRight size={15} />
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
