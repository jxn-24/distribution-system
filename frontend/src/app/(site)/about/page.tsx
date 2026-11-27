import { EditorialHeading, PageHero } from "@/components/site/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About us",
  description:
    "Luna Soft Essentials' vision, mission and seven core objectives: quality hygiene products that bring comfort and dignity across Kenya and Africa.",
  path: "/about",
});

const objectives = [
  ["Quality & Safety", "Reliable, high-quality products that meet customer needs and applicable standards."],
  ["Customer Satisfaction", "Exceptional service and long-term relationships with customers and partners."],
  ["Market Growth", "A wider distribution network across Kenya and other African markets."],
  ["Innovation & Product Development", "Products that respond to changing consumer needs."],
  ["Operational Excellence", "Best business and industry practices."],
  ["Sustainable Growth", "A profitable company that creates opportunities for employees, partners, and communities."],
  ["Social Impact", "Dignity, comfort, and a better everyday life through accessible hygiene products."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Care that brings comfort and dignity"
        lead="Luna Soft Essentials Ltd. supplies personal care, adult care and hygiene products to wholesalers and retailers."
        glow="85% 60%"
      >
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="site-glass rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Vision</h2>
            <span aria-hidden="true" className="mt-4 block h-px w-10 bg-amber-300/70" />
            <p className="mt-5 text-pretty font-display text-xl leading-snug text-white sm:text-2xl">
              To be a leading and trusted provider of quality essential care and hygiene products across Africa,
              improving comfort, dignity, health, and everyday well-being.
            </p>
          </article>
          <article className="site-glass rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Mission</h2>
            <span aria-hidden="true" className="mt-4 block h-px w-10 bg-amber-300/70" />
            <p className="mt-5 text-pretty leading-relaxed text-neutral-200 sm:text-lg">
              To provide high-quality, affordable, and reliable personal care, adult care, and hygiene products through
              efficient distribution, excellent customer service, and trusted partnerships, while creating lasting
              value for our customers, employees, and communities.
            </p>
          </article>
        </div>
      </PageHero>

      <section aria-labelledby="objectives-title" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <EditorialHeading id="objectives-title" title="Our core objectives" />
          <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
            {objectives.map(([title, text], index) => (
              <li key={title} className="flex gap-5 border-t border-amber-600/40 py-6">
                <span aria-hidden="true" className="w-10 shrink-0 font-display text-3xl font-semibold leading-none tabular-nums text-amber-700">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-neutral-950">{title}</h3>
                  <p className="mt-1.5 leading-relaxed text-neutral-700">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/*
        OUR STORY — not shown yet.
        When the copy is ready, add a white section here:
        <section aria-labelledby="story-title" className="border-t border-neutral-200 bg-white"> ...
          <EditorialHeading id="story-title" title="Our story" /> ... </section>
      */}

      {/*
        OUR DIRECTORS — not shown yet.
        When names, roles and photos are ready, add a night section here
        (site-night with site-glass cards, one per director).
      */}
    </>
  );
}
