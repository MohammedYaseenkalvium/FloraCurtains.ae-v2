import type { Metadata } from "next";
import { FloraLogo } from "@/components/public/FloraLogo";
import { QuoteWizard } from "@/components/public/QuoteWizard";

export const metadata: Metadata = {
  title: "Get a Quote | Flora Curtains Abu Dhabi",
  description:
    "Request a quotation in a few steps: tell us about your space, choose a service and get a fast, no-obligation response from Flora Curtains.",
};

export default function GetQuotePage() {
  return (
    <>
      <section className="border-b border-flora-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <FloraLogo width={220} height={56} priority className="h-14 w-auto object-contain" />

          <h1 className="mt-8 max-w-3xl font-display text-5xl leading-tight text-flora-foreground sm:text-6xl">
            Get a Quote
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-flora-muted">
            Tell us about your project in a few steps.
            Your answers are kept as you move back and
            forth — nothing is lost until you submit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <QuoteWizard />
      </section>
    </>
  );
}
