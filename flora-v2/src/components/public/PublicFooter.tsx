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

export function PublicFooter() {
  return (
    <footer className="bg-flora-footer text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <FloraLogo width={200} height={50} className="mb-5 h-12 w-auto object-contain" />
            <p className="mt-6 max-w-xs font-display text-2xl leading-snug text-white">
              Bringing Style, Comfort &amp; Luxury to Every Space.
            </p>
          </div>

          <nav aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-flora-gold">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              {explore.map(([label, href]) => (
                <li key={href + label}>
                  <Link href={href} className="transition-colors hover:text-white">
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
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services#${service.slug}`}
                    className="transition-colors hover:text-white"
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
            <address className="mt-5 space-y-3 text-sm not-italic leading-6 text-white/80">
              <p>
                Flora Curtains LLC
                <br />
                Murur Road, Opp. Mubadala Tower
                <br />
                Abu Dhabi, United Arab Emirates
              </p>
              <p>
                <a href="tel:+97125864545" className="transition-colors hover:text-white">
                  +971 2 586 4545
                </a>
                <br />
                <a
                  href="https://wa.me/971557464100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp: +971 55 746 4100
                </a>
                <br />
                <a
                  href="mailto:sayedflora1@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  sayedflora1@gmail.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Flora Curtains LLC. All rights reserved.</p>
          <p className="uppercase tracking-[0.18em]">
            Abu Dhabi | Dubai | Sharjah | All Emirates
          </p>
        </div>
      </div>
    </footer>
  );
}
