import type { Metadata } from "next";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { focusRing } from "@/components/site/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s · ${site.name}`,
    default: site.name,
  },
};

// Shared frame for the public pages: one header, one footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site flex min-h-dvh flex-col bg-neutral-950 font-sans text-neutral-950">
      <a
        href="#main"
        className={`sr-only z-50 rounded-full bg-amber-400 px-5 py-3 font-semibold text-neutral-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focusRing}`}
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
