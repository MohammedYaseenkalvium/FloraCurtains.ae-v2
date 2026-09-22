"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FloraLogo } from "@/components/public/FloraLogo";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/portfolio"],
  ["Contact", "/contact"],
] as const;

/**
 * Transparent over the hero, glass on scroll (subtle blur + warm
 * translucent background + smooth transition). Mobile drawer included.
 * Logo asset is the approved master — never altered.
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = overHero && !scrolled && !open;
  const linkTone = transparent
    ? "text-white/85 hover:text-white"
    : "text-flora-foreground hover:text-flora-primary";

  return (
    <>
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-flora-border bg-flora-background/80 shadow-flora-sm backdrop-blur-[16px]",
      ].join(" ")}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
          aria-label="Flora Curtains — home"
        >
          <FloraLogo
            priority
            inverted={transparent}
            className="h-11 w-auto object-contain transition-all duration-300"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${linkTone}`}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/get-quote"
            className="rounded-full bg-flora-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-flora-primary-hover"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`rounded-lg p-2 md:hidden ${transparent ? "text-white" : "text-flora-primary"}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-flora-border bg-flora-background md:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col px-5 py-4">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-flora-border/60 py-4 text-sm font-medium text-flora-foreground"
              >
                {label}
              </Link>
            ))}

            <Link
              href="/get-quote"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full bg-flora-primary px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
    {/* Flow spacer on non-hero pages (home hero pads itself) */}
    {!overHero && <div aria-hidden="true" className="h-20" />}
    </>
  );
}
