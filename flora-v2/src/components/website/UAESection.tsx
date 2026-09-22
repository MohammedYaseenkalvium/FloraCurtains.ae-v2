import { MapPin } from "lucide-react";
import { Container } from "@/components/website/Container";
import { SectionHeading } from "@/components/website/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const emirates = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Fujairah",
  "Ras Al Khaimah",
];

/** Service-area strip: type-led, no gimmicky map graphic. */
export function UAESection() {
  return (
    <section className="bg-white">
      <Container className="py-20 text-center lg:py-24">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Service area"
            title={<>Proudly serving the UAE.</>}
            description="Complete interior solutions, wherever your project takes us."
          />
        </Reveal>
        <Reveal>
          <ul className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {emirates.map((emirate) => (
              <li key={emirate} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-flora-foreground">
                <MapPin size={14} aria-hidden="true" className="text-flora-primary" />
                {emirate}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
