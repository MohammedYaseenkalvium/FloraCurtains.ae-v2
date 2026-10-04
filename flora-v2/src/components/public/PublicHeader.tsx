"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FloraLogo } from "@/components/public/FloraLogo";
import { services } from "@/lib/public/services";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/portfolio"],
  ["Contact", "/contact"],
] as const;

/**
 * Editorial fixed header: transparent over the hero, ivory glass on scroll.
 * Hamburger-primary navigation at ALL viewport widths: the button is always
 * visible and opens a full-screen drawer (plus dim backdrop) with the full
 * link set. Logo asset is the approved master — never altered.
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
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
    setServicesOpen(false);
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
        setServicesOpen(false);
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

  function closeMenu() {
    setOpen(false);
    setServicesOpen(false);
  }

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
        <div className="relative z-[60] mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
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

          <div className="flex items-center gap-3">
            <Link
              href="/get-quote"
              className="hidden rounded-lg bg-flora-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-flora-primary-hover sm:inline-flex"
            >
              Get a Quote
            </Link>

            <button
              type="button"
              ref={hamburgerRef}
              onClick={() => {
                setOpen(!open);
                setServicesOpen(false);
              }}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors ${
                transparent ? "text-white" : "text-flora-primary"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Navigation drawer (all viewport widths) */}
        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="fixed inset-0 z-40 cursor-default bg-black/40"
            />

            <div
              id="mobile-nav"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-0 top-20 z-50 overflow-y-auto border-t border-flora-border bg-flora-background"
            >
            <nav
              aria-label="Site"
              className="mx-auto flex max-w-7xl flex-col px-5 py-8"
            >
              {links.map(([label, href], index) => {
                if (label === "Services") {
                  return (
                    <div key={href} className="border-b border-flora-border/60">
                      <button
                        type="button"
                        onClick={() => setServicesOpen((v) => !v)}
                        aria-expanded={servicesOpen}
                        aria-controls="mobile-services-submenu"
                        className={[
                          "flex w-full items-center justify-between py-5 font-display text-3xl leading-tight transition-colors",
                          isActive(href)
                            ? "text-flora-primary"
                            : "text-flora-foreground hover:text-flora-primary",
                        ].join(" ")}
                      >
                        {label}
                        <ChevronDown
                          size={24}
                          aria-hidden="true"
                          className={`shrink-0 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {servicesOpen && (
                        <div
                          id="mobile-services-submenu"
                          className="flex flex-col pb-4"
                        >
                          <Link
                            href="/services"
                            onClick={() => {
                              setServicesOpen(false);
                              setOpen(false);
                            }}
                            className="py-2.5 pl-1 text-base font-semibold text-flora-primary"
                          >
                            All services
                          </Link>

                          {services.map((service) => (
                            <Link
                              key={service.slug}
                              href={`/services/${service.slug}`}
                              onClick={() => {
                                setServicesOpen(false);
                                setOpen(false);
                              }}
                              className="py-2.5 pl-1 text-base text-flora-muted transition-colors hover:text-flora-primary"
                            >
                              {service.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
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
                );
              })}

              <Link
                href="/get-quote"
                onClick={() => {
                  setServicesOpen(false);
                  setOpen(false);
                }}
                className="mt-8 rounded-lg bg-flora-primary px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-flora-primary-hover"
              >
                Get a Quote
              </Link>

              <p className="mt-10 text-xs uppercase tracking-eyebrow text-flora-muted">
                Abu Dhabi · United Arab Emirates
              </p>
            </nav>
            </div>
          </>
        )}
      </header>
      {/* Flow spacer on non-hero pages (home hero pads itself) */}
      {!overHero && <div aria-hidden="true" className="h-20" />}
    </>
  );
}
