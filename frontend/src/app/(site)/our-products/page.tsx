import ProductImage from "@/components/site/ProductImage";
import { ArrowLink, PageHero, SalesButtons } from "@/components/site/ui";
import { products } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Luna Soft Pads 290mm and 240mm (50 pieces a bale), Adult Diapers XL and Adult Pants XL (10 pieces a bale). Contact us for wholesale and retail prices.",
  path: "/our-products",
});

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Our products"
        lead="Four Luna Soft products for shops and wholesalers, sold by the bale. Contact us for wholesale and retail prices."
        glow="80% 70%"
      >
        <div className="mt-9">
          <SalesButtons />
        </div>
      </PageHero>

      <section aria-label="Product range" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <ul>
            {products.map((product, index) => (
              <li
                key={product.slug}
                id={product.slug}
                className="grid items-center gap-8 border-b border-neutral-200 py-12 first:pt-0 last:border-b-0 md:grid-cols-2 md:gap-14"
              >
                <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                  <ProductImage
                    product={product}
                    sizes="(min-width: 768px) 34rem, 92vw"
                    className="aspect-[4/3]"
                  />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">{product.name}</h2>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-neutral-600">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-amber-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-8 border-y border-amber-600/40 py-5">
                    <dt className="text-sm text-neutral-600">1 bale</dt>
                    <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-3xl font-semibold tabular-nums text-amber-700">{product.baleTotal}</span>
                      {product.bale !== product.baleTotal && (
                        <span className="tabular-nums text-neutral-700">{product.bale}</span>
                      )}
                    </dd>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="prices-title" className="site-night" style={{ "--glow-x": "15%", "--glow-y": "50%" } as React.CSSProperties}>
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="site-glass rounded-3xl p-7 sm:p-10 md:flex md:items-center md:justify-between md:gap-10">
            <div className="max-w-xl">
              <h2 id="prices-title" className="font-display text-3xl font-semibold tracking-[-0.015em] sm:text-4xl">
                Contact us for wholesale and retail prices
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-neutral-300">
                Tell us which products and how many bales you need.
              </p>
              <div className="mt-3">
                <ArrowLink href="/how-to-order" tone="night">How ordering works</ArrowLink>
              </div>
            </div>
            <div className="mt-8 md:mt-0 md:shrink-0">
              <SalesButtons />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
