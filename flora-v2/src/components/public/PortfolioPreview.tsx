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
          className="group overflow-hidden rounded-xl border border-[#D8C9BC] bg-white"
        >
          <div className="aspect-[4/3] overflow-hidden bg-[#F8F5F2]">
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
              {project.category}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#1E1B18]">
                {project.title}
              </h3>

              <ArrowUpRight
                size={16}
                className="shrink-0 text-[#5A0E12]"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}