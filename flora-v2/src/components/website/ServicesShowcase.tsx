import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/website/Container";
import { SectionHeading } from "@/components/website/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/lib/public/services";

/**
 * Asymmetric editorial grid: 2 + 2 + 1 full-width.
 * Same data source as the services page — one system, two layouts.
 */
export function ServicesShowcase() {
  const [first, second, third, fourth, fifth] = services;
  const pair = [first, second];
  const pair2 = [third, fourth];

  return (
    <section className="bg-flora-background">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Our services"
            title={<>Complete interior solutions</>}
            description="From window treatments to complete interior styling, we create spaces designed around you."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {pair.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.06}>
              <ServiceTile index={i} slug={service.slug} title={service.title} description={service.description} image={service.image} />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {pair2.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.06}>
              <ServiceTile index={i + 2} slug={service.slug} title={service.title} description={service.description} image={service.image} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-5">
          <Link
            href={`/services#${fifth.slug}`}
            className="group relative block overflow-hidden rounded-flora-lg"
          >
            <div className="relative aspect-[16/8] w-full md:aspect-[21/8]">
              <Image
                src={fifth.image}
                alt={fifth.title}
                fill
                loading="lazy"
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flora-gold">
                  05 — Flooring
                </p>
                <h3 className="mt-2 font-display text-3xl text-white md:text-4xl">
                  {fifth.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                  {fifth.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Explore
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

function ServiceTile({
  index,
  slug,
  title,
  description,
  image,
}: {
  index: number;
  slug: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <Link
      href={`/services#${slug}`}
      className="group relative block overflow-hidden rounded-flora-lg"
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={title}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-colors group-hover:from-black/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-flora-gold">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 font-display text-2xl text-white md:text-3xl">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
            Explore
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
