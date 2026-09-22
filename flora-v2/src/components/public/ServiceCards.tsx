import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  PaintRoller,
  PanelsTopLeft,
  Sofa,
  Sparkles,
} from "lucide-react";

import { services } from "@/lib/public/services";

const icons = [
  PanelsTopLeft,
  PaintRoller,
  Sofa,
  Sparkles,
  Layers,
];

export function ServiceCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const Icon = icons[index % icons.length];

        return (
          <Link
            key={service.slug}
            href={`/services#${service.slug}`}
            className="group overflow-hidden rounded-xl border border-flora-border bg-white transition-all hover:-translate-y-1 hover:border-flora-gold hover:shadow-flora-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-flora-surface">
              <Image
                src={service.image}
                alt={service.title}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <Icon size={21} />
              </div>

              <h3 className="text-lg font-semibold text-flora-foreground">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-flora-muted">
                {service.description}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-flora-primary">
                Learn more
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </Link>
        );
      })}

      {/* CTA tile */}
      <Link
        href="/get-quote"
        className="group flex flex-col justify-between rounded-xl bg-flora-primary p-6 text-white transition-all hover:-translate-y-1 hover:bg-flora-primary-hover"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-flora-gold">
            Free consultation
          </p>

          <h3 className="mt-3 font-display text-2xl">
            Not sure where
            <br />
            to start?
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/75">
            Tell us about your space and we&apos;ll
            recommend the right solution.
          </p>
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
          Get a Quote
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </div>
  );
}
