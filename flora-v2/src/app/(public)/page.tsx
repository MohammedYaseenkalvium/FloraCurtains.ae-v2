import { HeroSection } from "@/components/public/HeroSection";
import { WhyFlora } from "@/components/public/WhyFlora";
import { Container } from "@/components/website/Container";
import { CTASection } from "@/components/website/CTASection";
import { CraftSection } from "@/components/website/CraftSection";
import { CurtainsFeature } from "@/components/website/CurtainsFeature";
import { ExperienceSection } from "@/components/website/ExperienceSection";
import { SectionHeading } from "@/components/website/SectionHeading";
import { ServicesShowcase } from "@/components/website/ServicesShowcase";
import { ShowcaseSection } from "@/components/website/ShowcaseSection";
import { UAESection } from "@/components/website/UAESection";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <ExperienceSection />

      <ServicesShowcase />

      <CurtainsFeature />

      {/* Why Flora */}
      <section className="bg-white">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Why Flora"
              title={
                <>
                  Designed with intention.
                  <br />
                  Crafted with experience.
                </>
              }
            />
          </Reveal>
          <Reveal>
            <WhyFlora />
          </Reveal>
        </Container>
      </section>

      <ShowcaseSection />

      <CraftSection />

      <UAESection />

      <CTASection
        title="Let's transform your space."
        description="Tell us about your project and let our team help bring your vision to life."
        primaryHref="/get-quote"
        primaryLabel="Get a Quote"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  );
}
