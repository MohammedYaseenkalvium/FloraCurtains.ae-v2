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
            className="group rounded-xl border border-[#D8C9BC] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#C8A97E]"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
              <Icon size={21} />
            </div>

            <h3 className="text-lg font-semibold text-[#1E1B18]">
              {service.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#6B625A]">
              {service.description}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A0E12]">
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