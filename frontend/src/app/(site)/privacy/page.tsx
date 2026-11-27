/*
  DRAFT — must be reviewed before launch.
  This privacy notice was written as a starting point. Have it checked against
  Kenya's Data Protection Act, 2019 (and by whoever handles legal matters for
  Luna Soft) before the site goes live, and update the date below when approved.
*/

import Link from "next/link";
import { EditorialHeading, PageHero, focusRing } from "@/components/site/ui";
import { pageMetadata } from "@/lib/seo";
import { mailtoHref, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy notice",
  description: "What Luna Soft Essentials collects through the website feedback form, why, and how to ask for it to be removed.",
  path: "/privacy",
});

const link = `rounded-sm font-medium text-neutral-950 underline decoration-amber-600/60 underline-offset-4 hover:decoration-amber-600 ${focusRing}`;

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy notice"
        lead="How we use the details you send us through this website."
        glow="80% 50%"
      />

      <section aria-label="Privacy notice" className="bg-white">
        <div className="mx-auto max-w-3xl space-y-14 px-5 py-16 md:py-20">
          <div>
            <EditorialHeading title="What we collect" />
            <p className="mt-6 leading-relaxed text-neutral-700">
              When you use our <Link href="/feedback" className={link}>feedback form</Link>, we keep what you enter:
            </p>
            <ul className="mt-4 space-y-2 text-neutral-700">
              {[
                "your name",
                "your business name, if you give it",
                "your phone number or email, if you give it",
                "your rating and your message",
                "whether you agreed to your name and message being shown on our website",
                "the date you sent it",
              ].map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-neutral-700">
              If you send us feedback on Instagram, Facebook, TikTok or WhatsApp, our team may add it to the same
              records. We show it on the website only if you give us permission.
            </p>
          </div>

          <div>
            <EditorialHeading title="Why we use it" />
            <p className="mt-6 leading-relaxed text-neutral-700">
              We use your details only to read your feedback, improve our products and service, and reply to you if you
              gave us a phone number or email.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-700">
              We show your name and message on our website only if you ticked the box to agree, and only after our
              team has checked it. Your phone number, email and business name are never shown on the website.
            </p>
          </div>

          <div>
            <EditorialHeading title="Removing your details" />
            <p className="mt-6 leading-relaxed text-neutral-700">
              You can ask us at any time to remove your feedback from the website, or to delete your details completely.
              Email <a href={mailtoHref} className={link}>{site.email}</a> with your name and roughly when you sent
              your feedback, and we will remove it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
