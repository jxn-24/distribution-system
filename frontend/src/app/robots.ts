import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Crawlers may read the public pages only. Every staff and app route is blocked.
// Keep this list in step with the folders under src/app that are not in (site).
const appRoutes = [
  "/staff",
  "/dashboard",
  "/inventory",
  "/invoices",
  "/products",
  "/purchase-orders",
  "/ready-to-pack",
  "/receipts",
  "/record-payment",
  "/reports",
  "/sales-orders",
  "/shipments",
  "/warehouse",
  "/api",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: appRoutes,
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
