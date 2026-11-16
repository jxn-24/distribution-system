import Image from "next/image";
import Link from "next/link";

const products = [
  {
    kicker: "Sanitary care",
    name: "Luna Soft Pads 290mm",
    file: "/images/LS-PAD-290.jpg",
    note: "Ultra soft · Leak protection · Breathable comfort",
    crop: true,
  },
  {
    kicker: "Sanitary care",
    name: "Luna Soft Pads 240mm",
    file: "/images/LS-PAD-240.jpg",
    note: "Ultra soft · Leak protection · Breathable comfort",
    crop: true,
  },
  {
    kicker: "Adult care",
    name: "Adult Tape Diapers",
    file: "/images/LS-ADT-L(2).png",
    note: "Max absorbency · Overnight protection · Secure fit",
    crop: false,
  },
  {
    kicker: "Adult care",
    name: "Adult Pants",
    file: "/images/LS-ADP-XL(2).png",
    note: "Flexible fit · Discreet comfort · All-day wear",
    crop: false,
  },
];

const objectives = [
  ["Quality & Safety", "Reliable, high-quality products that meet customer needs and applicable standards."],
  ["Customer Satisfaction", "Exceptional service and long-term relationships with customers and partners."],
  ["Market Growth", "A wider distribution network across Kenya and other African markets."],
  ["Innovation & Product Development", "Products that respond to changing consumer needs."],
  ["Operational Excellence", "Best business and industry practices."],
  ["Sustainable Growth", "A profitable company that creates opportunities for employees, partners, and communities."],
  ["Social Impact", "Dignity, comfort, and a better everyday life through accessible hygiene products."],
];

const steps = [
  ["Open an account", "Contact our sales team. We set up wholesale and retail accounts for approved partners."],
  ["Place your order", "Sign in, pick your products and quantities, and send the order straight to our team."],
  ["We confirm and deliver", "Stock is reserved, packed and shipped from our warehouse, and you can follow it to your door."],
];

const navLinks = [
  ["About", "#about"],
  ["Products", "#products"],
  ["How it works", "#how"],
  ["Contact", "#contact"],
];

export default function HomePage() {
  return (
    <main className="lg-page font-sans text-white">
      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-30 px-3 pt-3 md:px-5">
        <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2 md:px-5">
          <Link href="/" className="lg-focus flex items-center gap-3 rounded-full">
            <Image
              src="/images/Luna_Soft_Essentials_logo.jpeg"
              alt="Luna Soft Essentials Ltd."
              width={100}
              height={100}
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-gold/50"
            />
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold tracking-wide">LUNA SOFT</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-gold">Essentials Ltd.</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className="lg-focus rounded transition hover:text-gold-light">
                {label}
              </a>
            ))}
          </nav>

          <Link href="/login" className="btn-gold !min-h-10 !px-5">
            Sign in
          </Link>
        </div>
        <nav aria-label="Sections" className="mx-auto mt-2 flex max-w-6xl justify-center gap-5 text-xs font-medium text-white/75 md:hidden">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} className="py-1 hover:text-gold-light">
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
        <div className="lg-rise">
          <p className="lg-eyebrow">Gentle Care. Strong Protection</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Softness you feel.
            <br />
            <span className="gold-text">Confidence you keep.</span>
          </h1>
          <p className="lg-muted mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
            Luna Soft Essentials Ltd. brings everyday hygiene products designed for comfort, dignity, and reliable
            protection, for every body, every day.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#products" className="btn-gold">
              View products
            </a>
            <Link href="/login" className="btn-glass">
              Wholesaler &amp; retailer login
            </Link>
          </div>
        </div>

        <div className="lg-rise lg-rise-delay relative mx-auto w-full max-w-sm">
          <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gold/20 blur-3xl" />
          <div className="glass-gold relative rounded-[2rem] p-4">
            <div className="rounded-3xl bg-white p-3">
              <Image
                src="/images/product-all-removebg-preview.png"
                alt="Luna Soft Essentials pads, adult pants and adult tape diapers"
                width={640}
                height={760}
                className="h-80 w-full object-contain"
                priority
              />
            </div>
            <div className="mt-4 flex items-center justify-between px-2 text-xs text-white/75">
              <span>Pads · Adult pants · Adult diapers</span>
              <span className="text-gold">Kenya</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- about ---------- */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-16">
        <p className="lg-eyebrow">About us</p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Dignity, comfort and everyday well-being</h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="glass rounded-3xl p-7">
            <h3 className="font-display text-xl text-gold">Vision</h3>
            <p className="lg-muted mt-3 leading-relaxed">
              To be a leading and trusted provider of quality essential care and hygiene products across Africa,
              improving comfort, dignity, health, and everyday well-being.
            </p>
          </article>
          <article className="glass rounded-3xl p-7">
            <h3 className="font-display text-xl text-gold">Mission</h3>
            <p className="lg-muted mt-3 leading-relaxed">
              To provide high-quality, affordable, and reliable personal care, adult care, and hygiene products through
              efficient distribution, excellent customer service, and trusted partnerships, while creating lasting value
              for our customers, employees, and communities.
            </p>
          </article>
        </div>

        <h3 className="mt-12 font-display text-lg text-white/90">Core objectives</h3>
        <ol className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {objectives.map(([title, text], index) => (
            <li key={title} className="glass glass-hover flex gap-4 rounded-2xl p-5">
              <span className="font-display text-2xl font-semibold text-gold/90">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="lg-muted mt-1.5 text-sm leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- products ---------- */}
      <section id="products" className="mx-auto max-w-6xl px-5 py-16">
        <p className="lg-eyebrow">Products</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Care that shows up.</h2>
          <Link href="/login" className="btn-glass">
            Sign in to order
          </Link>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.file} className="glass glass-hover rounded-3xl p-4">
              <p className="lg-eyebrow !text-[0.65rem]">{product.kicker}</p>
              <div className="relative mt-3 h-44 overflow-hidden rounded-2xl bg-white">
                <Image
                  src={product.file}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 90vw"
                  className={product.crop ? "scale-[1.75] object-cover object-[50%_45%]" : "object-contain p-2"}
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{product.name}</h3>
              <p className="lg-muted mt-2 text-sm leading-relaxed">{product.note}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <p className="lg-eyebrow">For wholesalers &amp; retailers</p>
        <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">How ordering works</h2>
        <ol className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <li key={title} className="glass-gold rounded-3xl p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-display font-semibold text-ink">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="lg-muted mt-2 text-sm leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- contact ---------- */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-16">
        <div className="glass-strong rounded-[2rem] px-6 py-12 text-center md:px-12">
          <p className="lg-eyebrow">Contact</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Let’s work together</h2>
          <p className="lg-muted mx-auto mt-4 max-w-xl">
            Wholesalers and retailers: contact our sales team to open an account and place orders.
          </p>
          <div className="mt-9 grid gap-4 text-left md:grid-cols-3">
            <article className="glass rounded-2xl px-6 py-5">
              <p className="text-sm text-gold">Location</p>
              <p className="mt-2 font-medium">Kikuyu, Kenya</p>
            </article>
            <article className="glass rounded-2xl px-6 py-5">
              <p className="text-sm text-gold">Email</p>
              <a
                className="lg-focus mt-2 block break-all font-medium hover:text-gold-light"
                href="mailto:lunasoftlimited@gmail.com?subject=Enquiry%20from%20the%20website"
              >
                lunasoftlimited@gmail.com
              </a>
            </article>
            <article className="glass rounded-2xl px-6 py-5">
              <p className="text-sm text-gold">Phone</p>
              <a className="lg-focus mt-2 block font-medium hover:text-gold-light" href="tel:+254721669664">
                +254 721 669 664
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Luna_Soft_Essentials_logo.jpeg"
              alt="Luna Soft Essentials"
              width={42}
              height={42}
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-gold/40"
            />
            <div>
              <p className="text-sm font-semibold tracking-wide">LUNA SOFT ESSENTIALS</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">Gentle care. Strong protection.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-white/65">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>TikTok</span>
          </div>
          <p className="text-sm text-white/50">© 2026 Luna Soft Essentials. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
