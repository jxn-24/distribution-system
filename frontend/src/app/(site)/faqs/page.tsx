import FaqAccordion from "@/components/site/FaqAccordion";
import { PageHero, SalesButtons, focusRing } from "@/components/site/ui";
import { faqs } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQs",
  description:
    "Answers about Luna Soft products and bale sizes, who can order, how to order, invoices, collection and delivery, receipts, and where we are.",
  path: "/faqs",
});

export default function FaqsPage() {
  return (
    <>
      <PageHero
        title="Frequently asked questions"
        lead="Quick answers for wholesalers and retailers. Can't find yours? Ask our sales team."
        glow="80% 40%"
      >
        <nav aria-label="Questions on this page" className="site-glass mt-10 rounded-2xl p-5 sm:p-7">
          <ol className="grid gap-x-8 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <li key={faq.id} className="border-b border-white/10 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                <a
                  href={`#${faq.id}`}
                  className={`flex min-h-12 items-baseline gap-3 rounded-md py-2.5 text-neutral-200 transition-colors hover:text-amber-200 ${focusRing}`}
                >
                  <span aria-hidden="true" className="w-6 shrink-0 font-display text-sm font-semibold tabular-nums text-amber-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PageHero>

      <section aria-label="Answers" className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
          <FaqAccordion faqs={faqs} headingLevel={2} />
        </div>
      </section>

      <section aria-labelledby="ask-title" className="site-night" style={{ "--glow-x": "20%", "--glow-y": "50%" } as React.CSSProperties}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <h2 id="ask-title" className="max-w-md font-display text-3xl font-semibold tracking-[-0.015em]">
            Still have a question?
          </h2>
          <SalesButtons />
        </div>
      </section>
    </>
  );
}
