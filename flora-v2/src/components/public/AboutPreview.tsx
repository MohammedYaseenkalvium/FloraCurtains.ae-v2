import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutPreview() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
          About Flora
        </span>

        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1E1B18] sm:text-5xl">
          Thoughtful window
          <br />
          solutions for
          <br />
          <span className="text-[#5A0E12]">
            considered spaces.
          </span>
        </h2>
      </div>

      <div>
        <p className="text-base leading-7 text-[#6B625A]">
          Flora Curtains creates bespoke window treatments
          for residential and commercial spaces. We combine
          careful measurement, considered design and
          practical installation to create solutions that
          work beautifully within each space.
        </p>

        <Link
          href="/about"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5A0E12]"
        >
          Discover Flora
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}