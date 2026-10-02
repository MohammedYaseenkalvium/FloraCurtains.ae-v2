import type { Metadata } from "next";
import { PageHero } from "@/components/website/PageHero";
import { PortfolioGallery } from "@/components/public/PortfolioGallery";

export const metadata: Metadata = {
  title: "Selected Work | Flora Curtains Portfolio",
  description:
    "A selection of residential and commercial curtain and interior projects across the UAE.",
};

const projects = [
  {
    title: "Residential Interiors",
    category: "Residential",
    image: "/images/portfolio-1.jpg",
  },
  {
    title: "Contemporary Window Treatments",
    category: "Interior",
    image: "/images/portfolio-2.jpg",
  },
  {
    title: "Commercial Spaces",
    category: "Commercial",
    image: "/images/portfolio-3.jpg",
  },
  {
    title: "Custom Curtain Installation",
    category: "Residential",
    image: "/images/portfolio-4.jpg",
  },
  {
    title: "Elegant Living Spaces",
    category: "Residential",
    image: "/images/portfolio-5.jpg",
  },
  {
    title: "Modern Office Treatments",
    category: "Commercial",
    image: "/images/portfolio-6.jpg",
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