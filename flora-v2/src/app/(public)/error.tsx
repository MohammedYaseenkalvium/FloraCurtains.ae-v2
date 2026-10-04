"use client";

import { useEffect } from "react";
import { Container } from "@/components/website/Container";
import { PageHero } from "@/components/website/PageHero";

/**
 * Branded error fallback for public routes. Generic copy only —
 * raw errors go to console.error, never into rendered output.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHero
        eyebrow="Something went wrong"
        title="This page could not be loaded."
        description="Please try again — if the problem continues, contact us and we will help."
      />
      <section>
        <Container className="flex flex-col items-center gap-3 pb-20 text-center sm:flex-row sm:justify-center lg:pb-28">
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-flora-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-flora-primary-hover sm:w-auto"
          >
            Try again
          </button>
        </Container>
      </section>
    </>
  );
}
