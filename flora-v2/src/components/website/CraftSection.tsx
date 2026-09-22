import Image from "next/image";
import { Container } from "@/components/website/Container";
import { SectionHeading } from "@/components/website/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const shots = [
  { src: "/images/craft-fabric.jpg", alt: "Curtain fabric texture" },
  { src: "/images/craft-detail.jpg", alt: "Stitching and finishing detail" },
  { src: "/images/showcase-living.jpg", alt: "Finished curtain installation" },
];

/** Material close-ups: fabric, stitching, finished installation. */
export function CraftSection() {
  return (
    <section className="bg-flora-surface">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Craftsmanship"
            title={<>Crafted down to the detail.</>}
            description="Premium materials. Precise workmanship. Elegant finishing."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {shots.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 0.06}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-flora-lg">
                <Image src={shot.src} alt={shot.alt} fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
