import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
];

export function PortfolioPreview() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.title}
          href="/portfolio"
          className="group overflow-hidden rounded-xl border border-flora-border bg-white"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-flora-surface">
            <Image
              src={project.image}
              alt={project.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
              {project.category}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-flora-foreground">
                {project.title}
              </h3>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-flora-primary"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}