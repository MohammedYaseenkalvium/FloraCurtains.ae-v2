import { ContactCTA } from "@/components/public/ContactCTA";
import { ServiceCards } from "@/components/public/ServiceCards";

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-flora-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-flora-primary">
            Our services
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-flora-foreground sm:text-6xl">
            Window treatments
            <br />
            designed for your space.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-flora-muted">
            Explore our range of bespoke curtains, blinds
            and window solutions for residential and
            commercial interiors.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <ServiceCards />
      </section>

      <ContactCTA />
    </>
  );
}