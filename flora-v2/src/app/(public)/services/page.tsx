import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ServiceCards } from "@/components/public/ServiceCards";
import { CTASection } from "@/components/website/CTASection";
import { PageHero } from "@/components/website/PageHero";
import { services } from "@/lib/public/services";

export const metadata: Metadata = {
  title: "Services | Curtains, Wallpaper, Sofas, Interiors, Flooring",
  description:
    "Curtains & blinds, wallpaper, customized sofas & upholstery, interior decoration, carpet & wooden flooring — complete interior solutions across the UAE.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Curtains, Wallpaper, Sofas, Interiors, Flooring",
    description:
      "Curtains, blinds, wallpaper, sofas, flooring and interior decoration across the UAE.",
  },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            Interiors designed
            <br />
            around your space.
          </>
        }
        description="From curtains and blinds to wallpaper, sofas and flooring — one team for complete interior solutions across the UAE."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <ServiceCards />
      </section>

      {/* Service detail */}
      {services.map((service, index) => (
        <section
          key={service.slug}
          id={service.slug}
          className={`scroll-mt-24 border-t border-flora-border ${
            index % 2 === 1 ? "bg-flora-cream" : "bg-white"
          }`}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="eyebrow text-flora-gold">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h2 className="mt-3 font-display text-4xl text-flora-foreground">
                {service.title}
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-flora-muted">
                {service.description}
              </p>

              <p className="mt-4 text-sm font-medium text-flora-foreground">
                {service.emphasis}
              </p>
            </div>

            <ul className="grid content-start gap-3 sm:grid-cols-2">
              {service.offerings.map((offering) => (
                <li
                  key={offering}
                  className="flex items-start gap-2.5 rounded-lg border border-flora-border bg-white px-4 py-3 text-sm text-flora-foreground"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-flora-primary"
                  />
                  {offering}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <CTASection
        title="Ready to transform your windows?"
        description="Tell us about your space and requirements. We'll take it from there."
        primaryHref="/get-quote"
        primaryLabel="Request a Quote"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  );
}
