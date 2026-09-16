import { HeroSection } from "@/components/public/HeroSection";
import { ServiceCards } from "@/components/public/ServiceCards";
import { PortfolioPreview } from "@/components/public/PortfolioPreview";
import { WhyFlora } from "@/components/public/WhyFlora";
import { AboutPreview } from "@/components/public/AboutPreview";
import { ContactCTA } from "@/components/public/ContactCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
            What we do
          </span>

          <h2 className="mt-3 font-serif text-4xl text-[#1E1B18] sm:text-5xl">
            Window solutions
            <br />
            made around you.
          </h2>
        </div>

        <ServiceCards />
      </section>

      {/* Why Flora */}
      <section className="border-y border-[#D8C9BC] bg-[#F8F5F2]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
              The Flora approach
            </span>

            <h2 className="mt-3 font-serif text-4xl text-[#1E1B18] sm:text-5xl">
              From first measurement
              <br />
              to final installation.
            </h2>
          </div>

          <WhyFlora />
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
              Selected work
            </span>

            <h2 className="mt-3 font-serif text-4xl text-[#1E1B18] sm:text-5xl">
              Spaces we&apos;ve
              <br />
              helped shape.
            </h2>
          </div>
        </div>

        <PortfolioPreview />
      </section>

      {/* About */}
      <section className="border-y border-[#D8C9BC] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <AboutPreview />
        </div>
      </section>

      <ContactCTA />
    </>
  );
}