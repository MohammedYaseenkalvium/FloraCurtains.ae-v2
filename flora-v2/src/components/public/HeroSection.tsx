"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { GlassCard } from "@/components/website/GlassCard";

/**
 * Full-screen editorial hero: photographic backdrop (image stays visible
 * under a restrained burgundy-tinted grade), staggered entrance, glass
 * experience card, scroll cue. Static when reduced motion is preferred.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-media",
        { scale: 1.05 },
        { scale: 1, duration: 1.6, ease: "power2.out" }
      );
      gsap.fromTo(
        ".hero-rise",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        ".hero-fade",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out", delay: 0.7 }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-svh items-center overflow-hidden bg-flora-ink text-white">
      {/* Backdrop */}
      <div className="hero-media absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-curtains.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Restrained grade: image stays visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A0E11]/80 via-[#2A0E11]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C0A0C]/70 via-transparent to-[#1C0A0C]/25" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-36 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="max-w-2xl">
          <p className="hero-rise text-xs font-semibold uppercase tracking-[0.28em] text-flora-gold">
            Flora Curtains
          </p>

          <h1 className="hero-rise mt-6 font-display text-[2.75rem] leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Transforming Spaces
            <br />
            with Style, Comfort
            <br />
            <span className="text-flora-gold">&amp; Elegance.</span>
          </h1>

          <p className="hero-rise mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            Premium curtains, interiors and customized
            furnishing solutions across the UAE.
          </p>

          <div className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-flora-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-flora-lg transition-all hover:-translate-y-0.5 hover:bg-flora-primary-hover"
            >
              Explore Services
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/get-quote"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        {/* Floating glass card */}
        <div className="hero-fade mt-14 max-w-xs sm:absolute sm:bottom-24 sm:right-5 lg:right-8">
          <GlassCard
            eyebrow="Experience"
            value="25+ Years"
            description="Interior craftsmanship rooted in experience."
          />
        </div>

        {/* Scroll cue */}
        <a
          href="#experience"
          aria-label="Scroll to experience section"
          className="hero-fade absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors hover:text-white md:flex"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Scroll</span>
          <ArrowDown size={16} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
