"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FloraLogo } from "@/components/public/FloraLogo";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/portfolio"],
  ["Contact", "/contact"],
] as const;

/**
 * Editorial fixed header: transparent over the hero, ivory glass on scroll.
 * Letterspaced uppercase nav with an active gold hairline; full-screen
 * drawer on mobile. Logo asset is the approved master — never altered.
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation (React-sanctioned render adjustment).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Drawer a11y: Escape closes, Tab traps inside, focus returns to hamburger.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const hamburger = hamburgerRef.current;
    drawer?.querySelector("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      hamburger?.focus();
    };
  }, [open]);

  const transparent = overHero && !scrolled && !open;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkTone = (href: string) => {
    if (transparent) {
      return isActive(href) ? "text-white" : "text-white/70 hover:text-white";
    }
    return isActive(href)
      ? "text-flora-primary"
      : "text-flora-muted hover:text-flora-foreground";
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "border-b border-white/10 bg-transparent"
            : "border-b border-flora-border bg-flora-background/85 shadow-flora-sm backdrop-blur-[16px]",
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
              fetchPriority="high"
              inverted={transparent}
              className="h-11 w-auto object-contain transition-all duration-300"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${linkTone(
                  href
                )}`}
              >
                {label}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute -bottom-0.5 left-0 h-px bg-flora-gold transition-all duration-300",
                    isActive(href) ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </Link>
            ))}

            <Link
              href="/get-quote"
              className="rounded-lg bg-flora-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-flora-primary-hover"
            >
              Get a Quote
            </Link>
          </nav>

          <button
            type="button"
            ref={hamburgerRef}
            onClick={() => setOpen(!open)}
            className={`rounded-lg p-2 transition-colors md:hidden ${
              transparent ? "text-white" : "text-flora-primary"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>

        {/* Full-screen mobile drawer */}
        {open && (
          <div
            id="mobile-nav"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 top-20 z-40 overflow-y-auto border-t border-flora-border bg-flora-background md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="mx-auto flex max-w-7xl flex-col px-5 py-8"
            >
              {links.map(([label, href], index) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={[
                    "border-b border-flora-border/60 py-5 font-display text-3xl leading-tight transition-colors",
                    isActive(href)
                      ? "text-flora-primary"
                      : "text-flora-foreground hover:text-flora-primary",
                  ].join(" ")}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/get-quote"
                onClick={() => setOpen(false)}
                className="mt-8 rounded-lg bg-flora-primary px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-flora-primary-hover"
              >
                Get a Quote
              </Link>

              <p className="mt-10 text-xs uppercase tracking-eyebrow text-flora-muted">
                Abu Dhabi · United Arab Emirates
              </p>
            </nav>
          </div>
        )}
      </header>
      {/* Flow spacer on non-hero pages (home hero pads itself) */}
      {!overHero && <div aria-hidden="true" className="h-20" />}
    </>
  );
}
