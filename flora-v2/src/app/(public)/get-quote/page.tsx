import type { Metadata } from "next";
import { FloraLogo } from "@/components/public/FloraLogo";
import { QuoteWizard } from "@/components/public/QuoteWizard";
import { PageHero } from "@/components/website/PageHero";

export const metadata: Metadata = {
  title: "Get a Quote | Flora Curtains Abu Dhabi",
  description:
    "Request a quotation in a few steps: tell us about your space, choose a service and get a fast, no-obligation response from Flora Curtains.",
  alternates: {
    canonical: "/get-quote",
  },
  openGraph: {
    title: "Get a Quote | Flora Curtains Abu Dhabi",
    description:
      "Tell us about your space in a few steps and get a fast, no-obligation quotation.",
  },
};

export default function GetQuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Get a quote"
        title={<>Get a Quote</>}
        description="Tell us about your project in a few steps. Your answers are kept as you move back and forth — nothing is lost until you submit."
      >
        <FloraLogo
          width={220}
          height={56}
          priority
          className="mb-8 h-14 w-auto object-contain"
        />
      </PageHero>

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <QuoteWizard />
      </section>
    </>
  );
}
