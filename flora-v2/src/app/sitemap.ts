import type { MetadataRoute } from "next";
import { services } from "@/lib/public/services";

/**
 * Public sitemap: static marketing routes + generated service detail pages.
 * CRM (/dashboard, /login) and /api/** are intentionally excluded (see robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `https://floracurtains.ae/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: "https://floracurtains.ae",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://floracurtains.ae/services",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://floracurtains.ae/portfolio",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://floracurtains.ae/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: "https://floracurtains.ae/contact",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: "https://floracurtains.ae/get-quote",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    ...serviceEntries,
  ];
}
