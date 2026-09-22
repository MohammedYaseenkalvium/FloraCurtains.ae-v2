"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-flora-border bg-flora-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/Flora quotation logo.png"
            alt="Flora Curtains"
            width={176}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-flora-foreground transition-colors hover:text-flora-primary"
          >
            Home
          </Link>

          <Link
            href="/services"
            className="text-sm font-medium text-flora-foreground transition-colors hover:text-flora-primary"
          >
            Services
          </Link>

          <Link
            href="/portfolio"
            className="text-sm font-medium text-flora-foreground transition-colors hover:text-flora-primary"
          >
            Portfolio
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-flora-foreground transition-colors hover:text-flora-primary"
          >
            About
          </Link>

          <Link
            href="/get-quote"
            className="rounded-full bg-flora-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flora-primary-hover"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-flora-primary md:hidden"
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
            {[
              ["Home", "/"],
              ["Services", "/services"],
              ["Portfolio", "/portfolio"],
              ["About", "/about"],
            ].map(([label, href]) => (
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
  );
}