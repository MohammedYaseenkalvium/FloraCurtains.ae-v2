import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhyFlora } from "@/components/public/WhyFlora";

export const metadata: Metadata = {
  title: "About Flora Curtains | Abu Dhabi Interior Craft Since 1997",
  description:
    "Flora Curtains LLC was established in 2023 in Abu Dhabi; our founder's curtain and interior journey began in 1997. Premium curtains, wallpaper, upholstery and flooring across the UAE.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-flora-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-flora-primary">
            About Flora
          </span>

          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-tight text-flora-foreground sm:text-6xl">
            Creating window
            <br />
            treatments with
            <br />
            <span className="text-flora-primary">
              purpose and character.
            </span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl text-flora-foreground">
              Our story
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-flora-muted">
            <p>
              Flora Curtains was established in 2023 in
              Abu Dhabi — but our founder&apos;s journey in
              the interior and curtain industry began in
              1997 with Blue Star Curtains.
            </p>

            <p>
              That combination of decades of hands-on
              experience with modern design and current
              interior trends shapes every project: careful
              measurement, premium fabrics, and attention
              to the details that make a finished interior
              feel complete.
            </p>

            <p>
              Our stitching and upholstery team works with
              premium curtain fabrics, sheer and blackout
              collections, wallpaper, carpets and flooring
              — serving villas, apartments, offices, cafés
              and commercial projects across all Emirates
              of the UAE.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-flora-border bg-flora-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-flora-primary">
              Why Flora
            </span>

            <h2 className="mt-3 font-display text-4xl text-flora-foreground sm:text-5xl">
              A considered process.
            </h2>
          </div>

          <WhyFlora />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
        <h2 className="font-display text-4xl text-flora-foreground sm:text-5xl">
          Let&apos;s talk about
          <br />
          your space.
        </h2>

        <Link
          href="/contact"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-flora-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-flora-primary-hover"
        >
          Start a Conversation
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}