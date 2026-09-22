import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ContactCTA() {
  return (
    <section className="bg-flora-primary">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-flora-gold">
              Start your project
            </p>

            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Ready to transform
              your windows?
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Tell us about your space and requirements.
              We&apos;ll take it from there.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-flora-primary transition-colors hover:bg-flora-surface sm:w-auto"
          >
            Request a Quote
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}