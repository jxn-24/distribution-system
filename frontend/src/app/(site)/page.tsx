import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/site/Testimonials";
import { ArrowLink, SalesButtons, buttonGhost, buttonGold, buttonInk } from "@/components/site/ui";
import { orderSteps } from "@/lib/products";
import { getTestimonials } from "@/lib/public-api";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: `${site.name} · ${site.tagline}`,
  absoluteTitle: true,
  description:
    "Luna Soft sanitary pads, adult diapers and adult pants for wholesalers and retailers in Kenya. Order through our sales team on WhatsApp, phone or email.",
  path: "/",
});

// Rebuild Home at most every 5 minutes so newly approved testimonials appear.
export const revalidate = 300;

export default async function HomePage() {
  const testimonials = (await getTestimonials(revalidate)).slice(0, 6);

  return (
    <>
      {/* Hero: the product group on a gold disc. */}
      <section className="site-night" style={{ "--glow-x": "72%", "--glow-y": "50%" } as React.CSSProperties}>
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-10 md:gap-12 sm:pt-16 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
          <div>
            <h1 className="text-balance font-display text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-6xl lg:text-7xl">
              Softness you feel.
              <span className="block text-amber-300">Confidence you keep.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-neutral-300 sm:mt-7 sm:text-lg">
              Luna Soft Essentials Ltd. brings everyday hygiene products designed for comfort, dignity and reliable
              protection, for every body, every day.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row sm:mt-9">
              <Link href="/our-products" className={buttonGold}>See our products</Link>
              <Link href="/how-to-order" className={buttonGhost}>How to order</Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[26rem]">
            <div aria-hidden="true" className="gold-disc absolute inset-[6%] rounded-full" />
            <Image
              src="/images/product-group-cutout.png"
              alt="Luna Soft Adult Pants, Adult Tape Diapers and sanitary pads, grouped together"
              width={427}
              height={278}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 640px) 28rem, 94vw"
              className="hero-rise absolute inset-x-0 bottom-[14%] w-full max-w-none sm:-inset-x-[3%] sm:w-[106%] drop-shadow-[0_22px_24px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </section>

      {/* Short introduction. */}
      <section aria-labelledby="intro-title" className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-24">
          <h2 id="intro-title" className="text-balance font-display text-3xl font-semibold leading-tight tracking-[-0.015em] sm:text-4xl">
            Gentle care. Strong protection.
          </h2>
          <div className="border-t border-amber-600/50 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <p className="text-pretty text-[17px] leading-relaxed text-neutral-700">
              We supply Luna Soft sanitary pads and adult care products to wholesalers and retailers. Our sales team
              takes your order on WhatsApp, by phone or by email, and you collect the goods or we deliver them.
            </p>
            <div className="mt-4">
              <ArrowLink href="/about">About Luna Soft</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      {/* How to order teaser. */}
      <section aria-labelledby="order-title" className="site-night" style={{ "--glow-x": "20%", "--glow-y": "60%" } as React.CSSProperties}>
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <h2 id="order-title" className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
            Ordering takes three steps
          </h2>
          <span aria-hidden="true" className="mt-5 block h-px w-12 bg-amber-300/70" />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {orderSteps.map((step, index) => (
              <li key={step.title} className="site-glass rounded-2xl p-6">
                <p aria-hidden="true" className="font-display text-4xl font-semibold tabular-nums text-amber-300">{index + 1}</p>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-neutral-300">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <ArrowLink href="/how-to-order" tone="night">More about ordering</ArrowLink>
          </div>
        </div>
      </section>

      {/* Testimonials (only when approved, consented ones exist) and the feedback invitation. */}
      <section aria-labelledby={testimonials.length ? "testimonials-title" : "feedback-title"} className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          {testimonials.length > 0 && (
            <div className="mb-16 md:mb-20">
              <h2 id="testimonials-title" className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
                What our customers say
              </h2>
              <span aria-hidden="true" className="mt-5 block h-px w-12 bg-amber-600" />
              <div className="mt-10">
                <Testimonials items={testimonials} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {testimonials.length > 0 ? (
                <h3 id="feedback-title" className="font-display text-2xl font-semibold tracking-[-0.015em]">
                  Share your experience
                </h3>
              ) : (
                <>
                  <h2 id="feedback-title" className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
                    Share your experience
                  </h2>
                  <span aria-hidden="true" className="mt-5 block h-px w-12 bg-amber-600" />
                </>
              )}
              <p className="mt-5 text-pretty text-[17px] leading-relaxed text-neutral-700">
                Have you used Luna Soft, or stocked it in your shop? Tell us what you think. Your feedback helps us
                serve you better.
              </p>
            </div>
            <Link href="/feedback" className={`${buttonInk} self-start md:self-auto`}>
              Share your experience
            </Link>
          </div>
        </div>
      </section>

      {/* Contact call to action. */}
      <section aria-labelledby="contact-title" className="site-night" style={{ "--glow-x": "85%", "--glow-y": "20%" } as React.CSSProperties}>
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <div className="site-glass rounded-3xl p-7 sm:p-10 md:flex md:items-center md:justify-between md:gap-10">
            <div className="max-w-xl">
              <h2 id="contact-title" className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
                Ready to order?
              </h2>
              <p className="mt-4 text-pretty text-[17px] leading-relaxed text-neutral-300">
                Wholesalers and retailers, talk to our sales team for prices and orders.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <SalesButtons />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
