import type { Metadata } from "next";
import { site } from "./site";

// The original logo, used as the sharing image for every public page.
const logo = {
  url: "/images/Luna_Soft_Essentials_logo.jpeg",
  width: 1254,
  height: 1254,
  alt: "Luna Soft Essentials logo",
};

// The public pages, in menu order. The sitemap is built from this list.
export const publicPages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/our-products", label: "Products" },
  { href: "/how-to-order", label: "How to order" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

/** Public pages not in the main menu (linked from the footer and page bodies). */
export const secondaryPages = [
  { href: "/feedback", label: "Share feedback" },
  { href: "/privacy", label: "Privacy" },
] as const;

/**
 * Title, description, canonical link and Open Graph / Twitter tags for one public page.
 * `title` is the short page name; the layout's template adds " · Luna Soft Essentials".
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_KE",
      url: path,
      title: fullTitle,
      description,
      images: [logo],
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: [logo.url],
    },
  };
}
