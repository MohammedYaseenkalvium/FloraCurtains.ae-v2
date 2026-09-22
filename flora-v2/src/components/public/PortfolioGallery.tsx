"use client";

import Image from "next/image";
import { useState } from "react";

interface PortfolioProject {
  title: string;
  category: string;
  image: string;
}

const filters = ["All", "Residential", "Commercial", "Interior"] as const;

export function PortfolioGallery({ projects }: { projects: PortfolioProject[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");

  const visible =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by category">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active === filter}
            onClick={() => setActive(filter)}
            className={[
              "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-primary focus-visible:ring-offset-2",
              active === filter
                ? "border-flora-primary bg-flora-primary text-white"
                : "border-flora-border bg-white text-flora-muted hover:border-flora-primary hover:text-flora-primary",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-flora-border bg-white px-6 py-16 text-center text-sm text-flora-muted">
          No projects in this category yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <article
              key={project.title}
              className="overflow-hidden rounded-xl border border-flora-border bg-white"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-flora-surface">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-flora-muted">
                  {project.category}
                </p>

                <h2 className="mt-2 font-semibold text-flora-foreground">
                  {project.title}
                </h2>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
