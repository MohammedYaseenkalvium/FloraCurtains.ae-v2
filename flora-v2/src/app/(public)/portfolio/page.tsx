import type { Metadata } from "next";
import { PageHero } from "@/components/website/PageHero";
import { PortfolioGallery } from "@/components/public/PortfolioGallery";

export const metadata: Metadata = {
  title: "Selected Work | Flora Curtains Portfolio",
  description:
    "Selected residential and commercial curtain, blinds and interior projects by Flora Curtains LLC in Abu Dhabi and across the UAE.",
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Selected Work | Flora Curtains Portfolio",
    description:
      "Curtain, blinds and interior projects in Abu Dhabi and across the UAE.",
  },
};

const projects = [
  {
    title: "Residential Interiors",
    category: "Residential",
    image: "/images/portfolio-1.jpg",
    alt: "Curtained residential interior with natural daylight in Abu Dhabi",
  },
  {
    title: "Contemporary Window Treatments",
    category: "Interior",
    image: "/images/portfolio-2.jpg",
    alt: "Contemporary layered window treatments in a modern UAE home",
  },
  {
    title: "Commercial Spaces",
    category: "Commercial",
    image: "/images/portfolio-3.jpg",
    alt: "Curtains and blinds fitted in a commercial office space",
  },
  {
    title: "Custom Curtain Installation",
    category: "Residential",
    image: "/images/portfolio-4.jpg",
    alt: "Custom-made curtains installed in a villa bedroom",
  },
  {
    title: "Elegant Living Spaces",
    category: "Residential",
    image: "/images/portfolio-5.jpg",
    alt: "Elegant sheer curtains in a bright family living room",
  },
  {
    title: "Modern Office Treatments",
    category: "Commercial",
    image: "/images/portfolio-6.jpg",
    alt: "Modern blinds and drapes in an office meeting room",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={<>Selected work.</>}
        description="A selection of spaces and window treatments created with attention to proportion, material and function."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <PortfolioGallery projects={projects} />
      </section>
    </>
  );
}