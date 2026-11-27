import type { MetadataRoute } from "next";
import { publicPages, secondaryPages } from "@/lib/seo";
import { site } from "@/lib/site";

// Only the public pages. Staff and app routes are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [...publicPages, ...secondaryPages].map((page) => ({
    url: `${site.url}${page.href === "/" ? "" : page.href}`,
    changeFrequency: "monthly",
    priority: page.href === "/" ? 1 : page.href === "/privacy" ? 0.3 : 0.8,
  }));
}
