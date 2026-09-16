import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#D8C9BC]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-[#D8C9BC] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
            Bespoke Window Solutions
          </span>

          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.98] tracking-tight text-[#1E1B18] sm:text-6xl lg:text-7xl">
            Windows,
            <br />
            <span className="text-[#5A0E12]">
              beautifully finished.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-[#6B625A] sm:text-lg">
            Bespoke curtains, blinds and window treatments
            designed around the way you live and work.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5A0E12] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#74171C]"
            >
              Get a Quote
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-lg border border-[#D8C9BC] bg-white px-6 py-3.5 text-sm font-semibold text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
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
                className="inline-flex items-center gap-2 text-xs font-medium text-[#6B625A]"
              >
                <CheckCircle2
                  size={14}
                  className="text-[#5A0E12]"
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[#D8C9BC] bg-[#F8F5F2]">
            <img
              src="/images/hero-curtains.jpg"
              alt="Bespoke curtain interior"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-5 -left-5 max-w-xs rounded-xl border border-[#D8C9BC] bg-white p-5 shadow-sm">
            <p className="font-serif text-xl text-[#5A0E12]">
              Made for your space.
            </p>

            <p className="mt-2 text-xs leading-5 text-[#6B625A]">
              From consultation and measurement to
              installation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}