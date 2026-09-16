import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  Ruler,
  Sparkles,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#1E1B18]">
      {/* Navigation */}
      <nav className="border-b border-[#D8C9BC] bg-[#FFF8F5]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/logo.png"
              alt="Flora Curtains"
              width={80}
              height={24}
              className="h-auto w-20 object-contain"
            />

            <span className="text-lg font-semibold tracking-[0.25em] text-[#5A0E12]">
              FLORA
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#services"
              className="text-sm font-medium text-[#1E1B18] transition-colors hover:text-[#5A0E12]"
            >
              Services
            </Link>

            <Link
              href="#portfolio"
              className="text-sm font-medium text-[#1E1B18] transition-colors hover:text-[#5A0E12]"
            >
              Portfolio
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-[#1E1B18] transition-colors hover:text-[#5A0E12]"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="rounded-lg bg-[#5A0E12] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#74171C]"
            >
              Get a Quote
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/contact"
              className="rounded-lg bg-[#5A0E12] px-4 py-2 text-xs font-semibold text-white"
            >
              Get a Quote
            </Link>

            <Menu
              size={21}
              className="text-[#5A0E12]"
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="border-b border-[#D8C9BC]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex rounded-full border border-[#D8C9BC] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
                Bespoke Window Solutions
              </span>

              <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-[1] tracking-tight text-[#1E1B18] sm:text-6xl lg:text-7xl">
                Curtains and
                <br />
                interiors with
                <br />
                <span className="text-[#5A0E12]">
                  character.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#6B625A] sm:text-lg">
                Bespoke curtains, blinds and window
                treatments designed around your space,
                lifestyle and interior.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5A0E12] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#74171C]"
                >
                  Start Your Project
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="#services"
                  className="inline-flex items-center justify-center rounded-lg border border-[#D8C9BC] bg-white px-6 py-3.5 text-sm font-semibold text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
                >
                  Explore Services
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Made to measure",
                  "Careful consultation",
                  "Installation support",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 text-xs font-medium text-[#6B625A]"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-[#5A0E12]"
                    />

                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[#D8C9BC] bg-[#F8F5F2]">
                <Image
                  src="/images/hero-curtains.jpg"
                  alt="Bespoke curtains in an elegant interior"
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 -left-5 max-w-xs rounded-xl border border-[#D8C9BC] bg-white p-5 shadow-sm">
                <p className="font-serif text-xl text-[#5A0E12]">
                  Made for your space.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#6B625A]">
                  From consultation and measurement to
                  the final installation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
        >
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
              What we do
            </span>

            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1E1B18] sm:text-5xl">
              Window solutions
              <br />
              made around you.
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#6B625A]">
              Thoughtfully designed solutions for
              residential and commercial interiors.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: PanelsTopLeft,
                title: "Curtains",
                description:
                  "Custom-made curtains tailored to your interior, privacy needs and preferred finish.",
              },
              {
                icon: Sparkles,
                title: "Blinds",
                description:
                  "Practical and refined blind solutions for homes, offices and commercial spaces.",
              },
              {
                icon: ShieldCheck,
                title: "Motorized Curtains",
                description:
                  "Convenient motorized window treatments designed for modern living and working.",
              },
              {
                icon: Ruler,
                title: "Custom Solutions",
                description:
                  "Measured and made-to-fit window treatments for unique spaces and requirements.",
              },
            ].map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.title}
                  href="/contact"
                  className="group rounded-xl border border-[#D8C9BC] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#C8A97E]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#6B625A]">
                    {service.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A0E12]">
                    Enquire
                    <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Approach */}
        <section className="border-y border-[#D8C9BC] bg-[#F8F5F2]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
                The Flora approach
              </span>

              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                From first measurement
                <br />
                to final installation.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="border-l border-[#C8A97E] pl-5">
                <span className="font-serif text-3xl text-[#C8A97E]">
                  01
                </span>

                <h3 className="mt-4 text-sm font-semibold">
                  Understand
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#6B625A]">
                  We begin by understanding your space,
                  requirements, style and practical needs.
                </p>
              </div>

              <div className="border-l border-[#C8A97E] pl-5">
                <span className="font-serif text-3xl text-[#C8A97E]">
                  02
                </span>

                <h3 className="mt-4 text-sm font-semibold">
                  Measure & Design
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#6B625A]">
                  Measurements, materials and finishes are
                  considered together to create the right
                  solution.
                </p>
              </div>

              <div className="border-l border-[#C8A97E] pl-5">
                <span className="font-serif text-3xl text-[#C8A97E]">
                  03
                </span>

                <h3 className="mt-4 text-sm font-semibold">
                  Install
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#6B625A]">
                  The finished treatment is installed with
                  attention to detail and the final result.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section
          id="portfolio"
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
        >
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
                Selected work
              </span>

              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Spaces we&apos;ve
                <br />
                helped shape.
              </h2>
            </div>

            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5A0E12]"
            >
              View Portfolio
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Residential Interiors",
                image: "/images/portfolio-1.jpg",
              },
              {
                title: "Contemporary Window Treatments",
                image: "/images/portfolio-2.jpg",
              },
              {
                title: "Commercial Spaces",
                image: "/images/portfolio-3.jpg",
              },
            ].map((project) => (
              <Link
                key={project.title}
                href="/portfolio"
                className="group overflow-hidden rounded-xl border border-[#D8C9BC] bg-white"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F8F5F2]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-semibold">
                    {project.title}
                  </h3>

                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#5A0E12]">
                    View project
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="border-y border-[#D8C9BC] bg-white"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
                About Flora
              </span>

              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Thoughtful window
                <br />
                solutions for
                <br />
                <span className="text-[#5A0E12]">
                  considered spaces.
                </span>
              </h2>
            </div>

            <div>
              <p className="text-base leading-7 text-[#6B625A]">
                Flora Curtains was established in 2023
                with a focus on creating bespoke curtains,
                blinds and window treatment solutions for
                residential and commercial spaces.
              </p>

              <p className="mt-5 text-base leading-7 text-[#6B625A]">
                Our approach combines practical experience,
                careful measurement and attention to the
                details that make a finished interior feel
                complete.
              </p>

              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5A0E12]"
              >
                Discover Flora
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#5A0E12]">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C8A97E]">
                Start your project
              </p>

              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
                Ready to transform
                your windows?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Tell us about your space and requirements.
                We&apos;ll take it from there.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#5A0E12] transition-colors hover:bg-[#F8F5F2]"
            >
              Request a Quote
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0F0C0B] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo.png"
                  alt="Flora Curtains"
                  width={80}
                  height={24}
                  className="h-auto w-20 object-contain brightness-0 invert"
                />

                <span className="text-lg font-semibold tracking-[0.25em] text-white">
                  FLORA
                </span>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                Bespoke curtains, blinds and window
                solutions designed around your space.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
              <Link
                href="/services"
                className="hover:text-white"
              >
                Services
              </Link>

              <Link
                href="/portfolio"
                className="hover:text-white"
              >
                Portfolio
              </Link>

              <Link
                href="/about"
                className="hover:text-white"
              >
                About
              </Link>

              <Link
                href="/contact"
                className="hover:text-white"
              >
                Contact
              </Link>

              <Link
                href="/login"
                className="hover:text-white"
              >
                Staff Login
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
            © {new Date().getFullYear()} Flora Curtains.
            All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}