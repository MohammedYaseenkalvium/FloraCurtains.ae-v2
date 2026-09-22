import Image from "next/image";
import { Container } from "@/components/website/Container";
import { SectionHeading } from "@/components/website/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const works = [
  { image: "/images/showcase-villa.jpg", category: "Villa", title: "Villa interior", location: "Abu Dhabi" },
  { image: "/images/portfolio-4.jpg", category: "Residential", title: "Living space", location: "Abu Dhabi" },
  { image: "/images/portfolio-6.jpg", category: "Commercial", title: "Workspace", location: "Dubai" },
];

/**
 * Editorial showcase: one large feature + two supporting frames.
 * Labels describe photo content only — no invented clients or dates.
 */
export function ShowcaseSection() {
  const [feature, ...rest] = works;
  return (
    <section className="bg-white">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Recent projects"
            title={<>Spaces we&apos;ve transformed.</>}
            description="Large photography, honest labels, lots of whitespace."
          />
        </Reveal>

        <Reveal>
          <figure className="overflow-hidden rounded-flora-lg">
            <div className="relative aspect-[16/9] w-full">
              <Image src={feature.image} alt={feature.title} fill loading="lazy" sizes="100vw" className="object-cover" />
            </div>
            <figcaption className="flex items-baseline justify-between px-1 py-4">
              <span className="font-display text-2xl text-flora-foreground">{feature.title}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-flora-muted">
                {feature.category} · {feature.location}
              </span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((work, i) => (
            <Reveal key={work.image} delay={i * 0.06}>
              <figure className="overflow-hidden rounded-flora-lg">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={work.image} alt={work.title} fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
                <figcaption className="flex items-baseline justify-between px-1 py-4">
                  <span className="font-display text-xl text-flora-foreground">{work.title}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-flora-muted">
                    {work.category} · {work.location}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
