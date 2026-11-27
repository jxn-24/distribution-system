import SocialIcon from "@/components/SocialIcon";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/site/icons";
import { ArrowLink, EditorialHeading, PageHero, buttonGold, focusRing, newTab } from "@/components/site/ui";
import { pageMetadata } from "@/lib/seo";
import { mailtoHref, site, socialLinks, telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Contact Luna Soft Essentials at ${site.location}. Call ${site.phone.display}, email ${site.email}, or message our sales team on WhatsApp.`,
  path: "/contact",
});

const channelLink = `group flex min-h-11 items-start gap-4 rounded-lg ${focusRing}`;

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact us"
        lead="Wholesalers and retailers, talk to our sales team to place an order. WhatsApp is the quickest way to reach us."
        glow="75% 55%"
      >
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          <li className="site-glass rounded-2xl p-6">
            <a href={site.social.whatsapp} {...newTab} aria-label={`WhatsApp ${site.phone.display} (opens in a new tab)`} className={channelLink}>
              <SocialIcon network="whatsapp" className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
              <span>
                <span className="block font-display text-lg font-semibold">WhatsApp</span>
                <span className="mt-1 block text-neutral-300 group-hover:text-amber-200">Message our sales team</span>
              </span>
            </a>
          </li>
          <li className="site-glass rounded-2xl p-6">
            <a href={telHref} className={channelLink}>
              <PhoneIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
              <span>
                <span className="block font-display text-lg font-semibold">Phone</span>
                <span className="mt-1 block tabular-nums text-neutral-300 group-hover:text-amber-200">{site.phone.display}</span>
              </span>
            </a>
          </li>
          <li className="site-glass rounded-2xl p-6">
            <a href={mailtoHref} className={channelLink}>
              <MailIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
              <span className="min-w-0">
                <span className="block font-display text-lg font-semibold">Email</span>
                <span className="mt-1 block break-all text-neutral-300 group-hover:text-amber-200">{site.email}</span>
              </span>
            </a>
          </li>
        </ul>
      </PageHero>

      <section aria-labelledby="visit-title" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-24">
          <div>
            <EditorialHeading id="visit-title" title="Find us" />
            <address className="mt-6 flex items-start gap-3 not-italic">
              <PinIcon className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
              <span className="text-lg leading-relaxed text-neutral-950">{site.location}</span>
            </address>
            <a
              href={site.directions}
              {...newTab}
              aria-label={`Get directions to ${site.location} on Google Maps (opens in a new tab)`}
              className={`${buttonGold} mt-6 ring-1 ring-inset ring-amber-500`}
            >
              <PinIcon className="h-5 w-5" />
              Get directions
            </a>
            {/* Opening hours: left out until confirmed. */}

            <h3 className="mt-12 font-display text-lg font-semibold">Follow us</h3>
            <ul aria-label="Luna Soft on social media" className="mt-3 grid grid-cols-2 gap-x-6 border-t border-amber-600/40">
              {socialLinks.map((link) => (
                <li key={link.network} className="border-b border-amber-600/40">
                  <a
                    href={link.href}
                    {...newTab}
                    aria-label={`Luna Soft on ${link.label} (opens in a new tab)`}
                    className={`flex min-h-12 items-center gap-3 rounded-md text-neutral-950 transition-colors hover:text-amber-800 ${focusRing}`}
                  >
                    <SocialIcon network={link.network} className="h-5 w-5 text-amber-700" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="mt-12 font-display text-lg font-semibold">Share your experience</h3>
            <p className="mt-2 leading-relaxed text-neutral-700">Tell us what you think of our products and service.</p>
            <div className="mt-1">
              <ArrowLink href="/feedback">Give feedback</ArrowLink>
            </div>
          </div>

          <figure className="overflow-hidden rounded-2xl ring-1 ring-amber-600/40">
            <iframe
              src={site.mapEmbed}
              title={`Map showing Luna Soft Essentials at ${site.location}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-72 w-full border-0 sm:h-96 md:h-[28rem]"
            />
            <figcaption className="border-t border-amber-600/40 px-4 py-3 text-sm text-neutral-700">{site.location}</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
