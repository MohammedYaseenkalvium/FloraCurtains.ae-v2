import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-flora-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-flora-border bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-flora-primary">
            Bespoke Window Solutions
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.98] tracking-tight text-flora-foreground sm:text-6xl lg:text-7xl">
            Windows,
            <br />
            <span className="text-flora-primary">
              beautifully finished.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-flora-muted sm:text-lg">
            Bespoke curtains, blinds and window treatments
            designed around the way you live and work.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-flora-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover"
            >
              Get a Quote
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-lg border border-flora-border bg-white px-6 py-3.5 text-sm font-semibold text-flora-primary transition-colors hover:bg-flora-surface"
            >
              View Our Work
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {[
              "Custom made",
              "Professional measurement",
              "Installation support",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 text-xs font-medium text-flora-muted"
              >
                <CheckCircle2
                  size={14}
                  className="text-flora-primary"
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-flora-border bg-flora-surface">
            <Image
              src="/images/hero-curtains.jpg"
              alt="Bespoke curtain interior"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-5 -left-5 max-w-xs rounded-xl border border-flora-border bg-white p-5 shadow-sm">
            <p className="font-display text-xl text-flora-primary">
              Made for your space.
            </p>

            <p className="mt-2 text-xs leading-5 text-flora-muted">
              From consultation and measurement to
              installation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}