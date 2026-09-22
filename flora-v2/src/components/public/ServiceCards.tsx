import Link from "next/link";
import {
  ArrowUpRight,
  Blinds,
  Home,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";

import { services } from "@/lib/public/services";

const icons = [
  PanelsTopLeft,
  Blinds,
  Sparkles,
  Home,
];

export function ServiceCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {services.map((service, index) => {
        const Icon = icons[index];

        return (
          <Link
            key={service.title}
            href="/contact"
            className="group rounded-xl border border-flora-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#C8A97E]"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
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
          </Link>
        );
      })}
    </div>
  );
}