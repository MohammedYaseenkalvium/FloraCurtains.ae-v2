import Link from "next/link";
import { Container } from "@/components/website/Container";
import { PageHero } from "@/components/website/PageHero";

/**
 * Branded 404 for unknown public URLs (including unknown service slugs
 * via notFound()). Single h1, quiet copy, conversion paths preserved.
 */
export default function PublicNotFound() {
  return (
    <>
      <PageHero
        eyebrow="Not found"
        title="This page is not here."
        description="The page you are looking for has moved or no longer exists."
      />
      <section>
        <Container className="flex flex-col items-center gap-3 pb-20 text-center sm:flex-row sm:justify-center lg:pb-28">
          <Link
            href="/services"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-flora-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-flora-primary-hover sm:w-auto"
          >
            Browse services
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-flora-border px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-flora-primary transition-colors duration-200 hover:bg-flora-cream sm:w-auto"
          >
            Contact us
          </Link>
        </Container>
      </section>
    </>
  );
}
