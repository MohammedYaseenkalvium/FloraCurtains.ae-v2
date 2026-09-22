import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutPreview() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-flora-primary">
          About Flora
        </span>

        <h2 className="mt-3 font-display text-4xl leading-tight text-flora-foreground sm:text-5xl">
          Thoughtful window
          <br />
          solutions for
          <br />
          <span className="text-flora-primary">
            considered spaces.
          </span>
        </h2>
      </div>

      <div>
        <p className="text-base leading-7 text-flora-muted">
          Flora Curtains creates bespoke curtains,
          wallpaper, sofas and flooring for residential
          and commercial spaces across the UAE — backed
          by industry experience since 1997.
        </p>

        <Link
          href="/about"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-flora-primary"
        >
          Discover Flora
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}