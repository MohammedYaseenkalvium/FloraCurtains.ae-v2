import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="bg-flora-footer text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/images/Flora quotation logo.png"
              alt="Flora Curtains"
              width={192}
              height={48}
              loading="lazy"
              className="mb-5 h-12 w-auto object-contain"
            />

            <p className="max-w-md text-sm leading-6 text-white/65">
              Bespoke curtains, blinds and window solutions
              designed to bring comfort, privacy and character
              to your spaces.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Explore
            </h3>

            <div className="space-y-3 text-sm text-white/65">
              <Link
                href="/"
                className="block hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/services"
                className="block hover:text-white"
              >
                Services
              </Link>

              <Link
                href="/portfolio"
                className="block hover:text-white"
              >
                Portfolio
              </Link>

              <Link
                href="/about"
                className="block hover:text-white"
              >
                About
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Contact
            </h3>

            <div className="space-y-3 text-sm text-white/65">
              <p>
                Murur Road, Opp. Mubadala Tower,
                <br />
                Abu Dhabi, UAE
              </p>

              <a
                href="tel:+97125864545"
                className="block hover:text-white"
              >
                +971 2 586 4545
              </a>

              <a
                href="https://wa.me/971557464100"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white"
              >
                WhatsApp: +971 55 746 4100
              </a>

              <a
                href="mailto:sayedflora1@gmail.com"
                className="block hover:text-white"
              >
                sayedflora1@gmail.com
              </a>

              <Link
                href="/contact"
                className="block text-flora-gold hover:text-white"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/45">
          © {new Date().getFullYear()} Flora Curtains.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}