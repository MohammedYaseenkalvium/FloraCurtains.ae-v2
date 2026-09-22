import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Ruler,
  Sparkles,
  Wrench,
} from "lucide-react";

const trust = [
  { icon: BadgeCheck, label: "Premium Quality" },
  { icon: Sparkles, label: "Custom Designs" },
  { icon: Wrench, label: "Professional Team" },
  { icon: Ruler, label: "UAE Wide Service" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-flora-footer text-white">
      {/* Full-bleed photographic backdrop */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-curtains.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-flora-gold">
            Flora Curtains LLC — Abu Dhabi
          </p>

          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Transforming Spaces
            <br />
            with Style, Comfort
            <br />
            <span className="text-flora-gold">&amp; Elegance.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Premium curtains, wallpaper, upholstery,
            flooring and complete interior solutions —
            modern interiors backed by decades of
            experience.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-flora-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-flora-lg transition-all hover:-translate-y-0.5 hover:bg-flora-primary-hover"
            >
              Explore Services
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Get a Quote
            </Link>
          </div>

          {/* Trust row */}
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-7 sm:grid-cols-4">
            {trust.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5">
                <item.icon size={17} aria-hidden="true" className="shrink-0 text-flora-gold" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/85">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
