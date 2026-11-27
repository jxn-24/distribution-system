import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon from "@/components/SocialIcon";
import { publicPages } from "@/lib/seo";
import { mailtoHref, site, socialLinks, telHref } from "@/lib/site";
import { PinIcon } from "./icons";
import { focusRing, newTab } from "./ui";

const footerLink = `inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-neutral-300 transition-colors hover:text-amber-300 ${focusRing}`;

export default function SiteFooter() {
  return (
    <>
      <footer className="border-t border-white/10 bg-neutral-950 text-white">
        {/* Extra bottom padding on phones keeps the floating WhatsApp button clear of the footer text. */}
        <div className="mx-auto max-w-6xl px-5 pb-28 pt-14 md:pb-10">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <BrandLogo height={40} alt={site.name} className="w-fit" />
              <p className="mt-4 font-display text-sm tracking-wide text-amber-200/90">{site.tagline}</p>
              <a
                href={site.directions}
                {...newTab}
                aria-label={`Directions to ${site.location} on Google Maps (opens in a new tab)`}
                className={`${footerLink} mt-3 underline decoration-neutral-600 underline-offset-4 hover:decoration-amber-300`}
              >
                <PinIcon className="h-4 w-4 shrink-0 text-amber-300" />
                {site.location}
              </a>
              <div className="flex flex-col">
                <a href={telHref} className={footerLink}>{site.phone.display}</a>
                <a href={mailtoHref} className={`${footerLink} break-all`}>{site.email}</a>
              </div>
            </div>

            <nav aria-label="Footer">
              <h2 className="font-display text-sm font-semibold text-white">Pages</h2>
              <ul className="mt-2 grid grid-cols-2 gap-x-6 md:grid-cols-1">
                {publicPages.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className={footerLink}>{page.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="font-display text-sm font-semibold text-white">Follow us</h2>
              <ul aria-label="Luna Soft on social media" className="mt-2 grid grid-cols-2 gap-x-6 md:grid-cols-1">
                {socialLinks.map((link) => (
                  <li key={link.network}>
                    <a
                      href={link.href}
                      {...newTab}
                      aria-label={`Luna Soft on ${link.label} (opens in a new tab)`}
                      className={footerLink}
                    >
                      <SocialIcon network={link.network} className="h-[18px] w-[18px] text-amber-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <ul className="flex gap-6">
              <li><Link href="/feedback" className={footerLink}>Share feedback</Link></li>
              <li><Link href="/privacy" className={footerLink}>Privacy</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Phones only: an always-reachable WhatsApp shortcut. */}
      <a
        href={site.social.whatsapp}
        {...newTab}
        aria-label="Chat with Luna Soft on WhatsApp (opens in a new tab)"
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-[0_6px_20px_rgba(0,0,0,0.45)] ring-1 ring-black/20 transition-colors hover:bg-amber-300 md:hidden ${focusRing}`}
      >
        <SocialIcon network="whatsapp" className="h-6 w-6" />
      </a>
    </>
  );
}
