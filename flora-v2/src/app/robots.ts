import type { MetadataRoute } from "next";

/**
 * Crawlers may index the public marketing site only.
 * CRM, auth, and API routes are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/login"],
      },
    ],
    sitemap: "https://floracurtains.ae/sitemap.xml",
  };
}
