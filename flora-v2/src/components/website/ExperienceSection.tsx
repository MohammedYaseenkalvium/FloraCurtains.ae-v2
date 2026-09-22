import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/website/Container";
import { Reveal } from "@/components/ui/Reveal";

/** Editorial split: 1997 → 2023 → today (never conflated). */
export function ExperienceSection() {
  return (
    <section id="experience" className="scroll-mt-24 bg-white">
      <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-flora-lg">
            <Image
              src="/images/experience-atelier.jpg"
              alt="Flora Curtains atelier interior"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <p className="mt-4 font-display text-6xl leading-none text-flora-primary">
            1997
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-flora-gold">
            Experience built since 1997
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] text-flora-foreground sm:text-5xl">
            Modern interiors,
            <br />
            decades of craft.
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-7 text-flora-muted">
            <p>
              Although Flora Curtains was established in
              2023, our journey in the interior and curtain
              industry began much earlier.
            </p>
            <p>
              Our founder started his professional career
              with Blue Star Curtains in 1997, gaining
              decades of hands-on experience in curtains,
              upholstery, flooring and interior decoration.
            </p>
            <p>
              Today Flora Curtains combines that experience
              with modern design and trend-focused interior
              solutions across the UAE.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-flora-primary hover:underline"
          >
            Discover our story
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
