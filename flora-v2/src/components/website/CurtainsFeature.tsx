"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/website/Container";
import { Reveal } from "@/components/ui/Reveal";

const types = [
  "Blackout",
  "Sheer",
  "Motorized",
  "Roller",
  "Roman",
  "Venetian",
  "Wooden",
  "Custom",
];

/** Cinematic curtains band with subtle horizontal drift on scroll. */
export function CurtainsFeature() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".curtains-media",
        { xPercent: -4 },
        {
          xPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, root.current ?? undefined);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-flora-ink text-white">
      <div className="curtains-media absolute inset-0 scale-110" aria-hidden="true">
        <Image
          src="/images/service-curtains.jpg"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#1C0A0C]/60" />
      </div>

      <Container className="relative py-24 text-center lg:py-32">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-flora-gold">
            Curtains &amp; Blinds
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Designed around your space.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/75">
            {types.join(" · ")}
          </p>
          <Link
            href="/services#curtains-blinds"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-flora-primary transition-all hover:-translate-y-0.5 hover:bg-flora-surface"
          >
            Explore
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
