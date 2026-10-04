import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { services } from "@/lib/public/services";
import { Container } from "@/components/website/Container";
import { CTASection } from "@/components/website/CTASection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service | Flora Curtains LLC" };
  return {
    title: `${service.title} | Flora Curtains LLC`,
    description: service.description,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | Flora Curtains LLC`,
      description: service.description,
    },
  };
}

const process = [
  { n: "01", t: "Consultation", d: "Understand your space, style and requirements." },
  { n: "02", t: "Measurement", d: "Precise site measurement and requirement mapping." },
  { n: "03", t: "Material & design selection", d: "Curated fabrics, finishes and designs for your space." },
  { n: "04", t: "Customization", d: "Made-to-measure production with craftsmanship checks." },
  { n: "05", t: "Professional installation", d: "Clean installation and finishing support." },
];

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-flora-border bg-flora-background">
        <Container className="py-16 lg:py-24">
          <p className="eyebrow text-flora-gold">
            <Link href="/services" className="hover:underline">
              Services
            </Link>
            {" / "}
            {service.title}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-flora-foreground">
            {service.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-flora-muted">
            {service.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/get-quote"
              className="rounded-lg bg-flora-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-flora-primary-hover"
            >
              Get a Quote
            </Link>
            <Link
              href="/portfolio"
              className="rounded-lg border border-flora-border bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-flora-foreground transition-colors duration-200 hover:bg-flora-cream"
            >
              Explore Our Work
            </Link>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-14">
          <div className="overflow-hidden rounded-2xl border border-flora-border">
            <Image
              src={service.image}
                alt={service.imageAlt}
              width={1600}
              height={900}
              className="h-[320px] w-full object-cover sm:h-[440px]"
              priority
            />
          </div>
          <p className="mt-6 max-w-2xl text-sm font-medium text-flora-foreground">
            {service.emphasis}
          </p>
        </Container>
      </section>

      <section className="border-t border-flora-border bg-flora-cream">
        <Container className="grid gap-10 py-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-flora-foreground">
              What we offer
            </h2>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2">
            {service.offerings.map((o) => (
              <li
                key={o}
                className="flex items-start gap-2.5 rounded-lg border border-flora-border bg-white px-4 py-3 text-sm text-flora-foreground"
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-flora-primary" />
                {o}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-flora-border">
        <Container className="py-14">
          <h2 className="font-display text-3xl text-flora-foreground">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((p) => (
              <li key={p.n} className="rounded-xl border border-flora-border bg-white p-5">
                <p className="text-xs font-semibold text-flora-primary">{p.n}</p>
                <p className="mt-2 font-semibold text-flora-foreground">{p.t}</p>
                <p className="mt-2 text-sm leading-6 text-flora-muted">{p.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-flora-border bg-flora-cream">
        <Container className="py-14">
          <h2 className="font-display text-3xl text-flora-foreground">Related services</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/services/${r.slug}`}
                className="rounded-xl border border-flora-border bg-white p-5 hover:bg-flora-background"
              >
                <p className="font-semibold text-flora-foreground">{r.title}</p>
                <p className="mt-2 text-sm leading-6 text-flora-muted">{r.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Transform your space with Flora"
        description="Get a tailored quote for your curtains, blinds and interiors."
        primaryHref="/get-quote"
        primaryLabel="Get a Quote"
        secondaryHref="/portfolio"
        secondaryLabel="Explore Our Work"
      />
    </>
  );
}
