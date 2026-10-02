import Link from "next/link";
import { FloraLogo } from "@/components/public/FloraLogo";
import { services } from "@/lib/public/services";

const explore = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/portfolio"],
  ["Contact", "/contact"],
  ["Get Quote", "/get-quote"],
];

/**
 * Editorial dark footer — gold hairline, serif tagline, real contact data.
 * `on-dark` scopes gold keyboard-focus rings (see globals.css).
 */
export function PublicFooter() {
  return (
    <footer className="on-dark bg-flora-footer text-white">
      <div aria-hidden="true" className="h-px bg-flora-gold/60" />

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <FloraLogo width={200} height={50} className="h-12 w-auto object-contain" />
            <p className="mt-7 max-w-xs font-display text-[1.7rem] leading-snug text-white">
              Transforming Spaces with Style, Comfort &amp; Elegance.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-flora-gold">
              Experience Built Since 1997
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-flora-gold">
              Explore
            </h3>
            <ul className="mt-6 space-y-3.5 text-sm text-white/75">
              {explore.map(([label, href]) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="transition-colors duration-200 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-flora-gold">
              Services
            </h3>
            <ul className="mt-6 space-y-3.5 text-sm text-white/75">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="transition-colors duration-200 hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-flora-gold">
              Contact
            </h3>
            <address className="mt-6 space-y-4 text-sm not-italic leading-6 text-white/75">
              <p>
                Flora Curtains LLC
                <br />
                Murur Road, Opp. Mubadala Tower
                <br />
                Abu Dhabi, United Arab Emirates
              </p>
              <p>
                <a
                  href="tel:+97125864545"
                  className="transition-colors duration-200 hover:text-white"
                >
                  +971 2 586 4545
                </a>
                <br />
                <a
                  href="https://wa.me/971557464100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white"
                >
                  WhatsApp: +971 55 746 4100
                </a>
                <br />
                <a
                  href="mailto:sayedflora1@gmail.com"
                  className="transition-colors duration-200 hover:text-white"
                >
                  sayedflora1@gmail.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Flora Curtains LLC. All rights reserved.</p>
          <p className="uppercase tracking-[0.18em]">
            Abu Dhabi | Dubai | Sharjah | All Emirates
          </p>
        </div>
      </div>
    </footer>
  );
}
