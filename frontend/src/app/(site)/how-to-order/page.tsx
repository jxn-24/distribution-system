import FaqAccordion from "@/components/site/FaqAccordion";
import { EditorialHeading, PageHero, SalesButtons } from "@/components/site/ui";
import { faqs } from "@/lib/faqs";
import { orderSteps } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How to order",
  description:
    "Order Luna Soft products in three steps: talk to our sales team, we confirm and send an invoice, then collect or we deliver.",
  path: "/how-to-order",
});

export default function HowToOrderPage() {
  return (
    <>
      <PageHero
        title="How to order"
        lead="Wholesalers and retailers order through our sales team. It takes three steps."
        glow="70% 80%"
      >
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {orderSteps.map((step, index) => (
            <li key={step.title} className="site-glass rounded-2xl p-6 sm:p-7">
              <p aria-hidden="true" className="font-display text-5xl font-semibold tabular-nums text-amber-300">{index + 1}</p>
              <h2 className="mt-5 font-display text-xl font-semibold">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h2>
              <p className="mt-2 leading-relaxed text-neutral-300">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <SalesButtons />
        </div>
      </PageHero>

      <section aria-labelledby="payment-title" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-24">
          <EditorialHeading id="payment-title" title="Invoice and payment" />
          <p className="max-w-2xl text-pretty font-display text-xl leading-snug text-neutral-950 sm:text-2xl md:pt-1">
            Our sales team will give you the invoice and payment details when you place your order.
          </p>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-24">
          <EditorialHeading id="faq-title" title="Questions buyers ask" />
          <FaqAccordion faqs={faqs} idPrefix="faq-" />
        </div>
      </section>
    </>
  );
}
