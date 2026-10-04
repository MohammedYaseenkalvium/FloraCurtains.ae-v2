import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { QuoteForm } from "@/components/public/QuoteForm";
import { PageHero } from "@/components/website/PageHero";

export const metadata: Metadata = {
  title: "Contact Flora Curtains | Abu Dhabi Showroom",
  description:
    "Visit our Abu Dhabi showroom on Murur Road, call +971 2 586 4545 or WhatsApp +971 55 746 4100. Send your project requirements for a fast response.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Flora Curtains | Abu Dhabi Showroom",
    description:
      "Murur Road showroom, Abu Dhabi — call, WhatsApp or send your project requirements for a fast response.",
  },
};

/**
 * LocalBusiness structured data. Every fact mirrors the visible
 * contact aside byte-for-byte — no new claims.
 */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Flora Curtains LLC",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Murur Road, Opp. Mubadala Tower",
    addressLocality: "Abu Dhabi",
    addressCountry: "AE",
  },
  telephone: "+97125864545",
  email: "sayedflora1@gmail.com",
  url: "https://floracurtains.ae/contact",
  areaServed: "United Arab Emirates",
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <PageHero
        eyebrow="Contact Flora"
        title={
          <>
            Tell us about
            <br />
            your space.
          </>
        }
        description="Share a few details about your project and requirements. Our team can then understand what you need and follow up with you."
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside>
          <h2 className="font-display text-3xl text-flora-foreground">
            Start a conversation.
          </h2>

          <p className="mt-4 text-sm leading-6 text-flora-muted">
            Whether you are planning a residential
            interior or a commercial project, send us your
            requirements and we&apos;ll take it from there.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  Showroom
                </p>

                <p className="mt-1 text-sm font-medium text-flora-foreground">
                  Murur Road, Opp. Mubadala Tower,
                  <br />
                  Abu Dhabi, UAE
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <Phone size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  Direct line
                </p>

                <a
                  href="tel:+97125864545"
                  className="mt-1 block text-sm font-medium text-flora-foreground hover:text-flora-primary"
                >
                  +971 2 586 4545
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <MessageSquare size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  WhatsApp
                </p>

                <a
                  href="https://wa.me/971557464100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-medium text-flora-foreground hover:text-flora-primary"
                >
                  +971 55 746 4100
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <Mail size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  Email
                </p>

                <a
                  href="mailto:sayedflora1@gmail.com"
                  className="mt-1 block text-sm font-medium text-flora-foreground hover:text-flora-primary"
                >
                  sayedflora1@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flora-surface text-flora-primary">
                <MessageSquare size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  Enquiries
                </p>

                <p className="mt-1 text-sm text-flora-muted">
                  Tell us what you are looking for and
                  where your project is located.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <QuoteForm />
      </section>
    </>
  );
}