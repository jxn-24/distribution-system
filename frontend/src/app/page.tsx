"use client";

import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon from "@/components/SocialIcon";
import { mailtoHref, site, socialLinks, telHref } from "@/lib/site";

const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

const products = [
  {
    kicker: "Sanitary care",
    name: "Luna Soft Pads 290mm",
    file: "/images/LS-PAD-290.jpg",
    note: "Ultra soft · Leak protection · Breathable comfort",
  },
  {
    kicker: "Sanitary care",
    name: "Luna Soft Pads 240mm",
    file: "/images/LS-PAD-240.jpg",
    note: "Ultra soft · Leak protection · Breathable comfort",
  },
  {
    kicker: "Adult care",
    name: "Adult Tape Diapers",
    file: "/images/LS-ADT-L(2).png",
    note: "Max absorbency · Overnight protection · Secure fit",
  },
  {
    kicker: "Adult care",
    name: "Adult Pants",
    file: "/images/LS-ADP-XL(2).png",
    note: "Flexible fit · Discreet comfort · All-day wear",
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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export default function HomePage() {
  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + window.scrollY - 80;
    const duration = 2000;
    const begin = performance.now();
    function step(now: number) {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <main className="bg-neutral-950 font-sans text-white">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:grid md:grid-cols-3 md:items-center md:px-5 md:py-4">
          <Link href="/" aria-label={`${site.name} home`} className={`flex items-center gap-3 self-start rounded-md ${focusRing}`}>
            <BrandLogo height={44} alt="" preload />
            <span className="border-l border-neutral-700 pl-3 text-[10px] uppercase leading-tight tracking-[0.2em] text-amber-300">
              Essentials<br />Ltd.
            </span>
          </Link>
          <nav className="flex justify-start gap-5 text-sm font-bold md:justify-center md:gap-8">
            <button onClick={() => scrollToSection("about")}>About Us</button>
            <button onClick={() => scrollToSection("products")}>Products</button>
            <button onClick={() => scrollToSection("contact")}>Contact</button>
          </nav>
          <div className="hidden md:block" />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Gentle Care. Strong Protection</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight">
            Softness you feel.<br /><span className="text-amber-300">Confidence you keep.</span>
          </h1>
          <p className="mt-6 max-w-xl text-neutral-300">
            Luna Soft Essentials Ltd. brings everyday hygiene products designed for comfort, dignity, and reliable protection — for every body, every day.
          </p>
        </div>
        <div className="hero-rise mx-auto w-full max-w-xs">
          <Image src="/images/product-all.jpg" alt="Luna Soft Essentials products" width={640} height={640} className="h-72 w-full rounded-3xl object-contain shadow-[0_0_40px_rgba(251,191,36,0.28)]" preload />
        </div>
      </section>

      <section id="about" className="bg-white text-neutral-950">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold">About Us</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h3 className="font-display text-amber-700">Vision</h3>
              <p className="mt-3 text-neutral-800">To be a leading and trusted provider of quality essential care and hygiene products across Africa, improving comfort, dignity, health, and everyday well-being.</p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h3 className="font-display text-amber-700">Mission</h3>
              <p className="mt-3 text-neutral-800">To provide high-quality, affordable, and reliable personal care, adult care, and hygiene products through efficient distribution, excellent customer service, and trusted partnerships — while creating lasting value for our customers, employees, and communities.</p>
            </article>
          </div>
          <h3 className="mt-10 font-serif text-xl italic underline">Core objectives</h3>
          <ol className="mt-4 grid gap-4 md:grid-cols-2">
            {objectives.map(([title, text], index) => (
              <li key={title} className="rounded-2xl border border-neutral-300 p-5">
                <p className="font-serif text-base font-bold italic">{index + 1}. {title}</p>
                <p className="mt-2 text-sm text-neutral-700">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="products" className="bg-white text-neutral-950">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-700">PRODUCTS</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold">Care that shows up.</h2>

            </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.file} className="rounded-3xl bg-neutral-950 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300">{product.kicker}</p>
                <div className="mt-3 flex h-40 items-center justify-center rounded-2xl border border-amber-400/30">
                  <Image src={product.file} alt={product.name} width={700} height={300} className="max-h-36 w-full object-contain" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-neutral-400">{product.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white text-neutral-950">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Contact</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">Let’s work together</h2>
          <p className="mt-4 text-neutral-600">Wholesalers and retailers — contact our sales team to place orders.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="flex flex-col items-center rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Location</p>
              <p className="mt-2 font-medium">{site.location}</p>
              <a
                href={site.directions}
                {...newTab}
                aria-label={`Get directions to ${site.location} on Google Maps (opens in a new tab)`}
                className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-semibold text-neutral-950 ring-1 ring-amber-500 transition-colors hover:bg-amber-300 ${focusRing}`}
              >
                <PinIcon className="h-[18px] w-[18px]" />
                Get directions
              </a>
            </article>
            <article className="rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Email</p>
              <a className="mt-2 block break-words font-medium underline-offset-4 hover:underline" href={mailtoHref}>{site.email}</a>
            </article>
            <article className="rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Phone</p>
              <a className="mt-2 block font-medium underline-offset-4 hover:underline" href={telHref}>{site.phone.display}</a>
            </article>
          </div>

          <figure className="mt-6 rounded-3xl border border-amber-400/30 bg-neutral-950/90 p-2 shadow-[0_0_40px_rgba(251,191,36,0.18)] backdrop-blur">
            <iframe
              src={site.mapEmbed}
              title={`Map showing Luna Soft Essentials at ${site.location}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-64 w-full rounded-2xl border-0 sm:h-80 md:h-96"
            />
            <figcaption className="px-3 py-3 text-sm text-neutral-300">
              {site.location}
            </figcaption>
          </figure>
        </div>
      </section>

      <footer className="border-t border-neutral-800 bg-neutral-950">
        {/* Extra bottom padding on phones keeps the floating WhatsApp button clear of the footer text. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 pb-24 pt-6 md:pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <BrandLogo height={40} alt={site.name} />
              <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">Gentle care.<br />Strong protection.</p>
            </div>
            <a
              href={site.directions}
              {...newTab}
              aria-label={`Directions to ${site.location} on Google Maps (opens in a new tab)`}
              className={`inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm text-neutral-300 underline decoration-neutral-600 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300 ${focusRing}`}
            >
              <PinIcon className="h-4 w-4 shrink-0 text-amber-300" />
              {site.location}
            </a>
          </div>
          <ul aria-label="Luna Soft on social media" className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-300">
            {socialLinks.map((link) => (
              <li key={link.network}>
                <a
                  href={link.href}
                  {...newTab}
                  aria-label={`Luna Soft on ${link.label} (opens in a new tab)`}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-md transition-colors hover:text-amber-300 ${focusRing}`}
                >
                  <SocialIcon network={link.network} className="h-[18px] w-[18px]" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-neutral-400">© 2026 {site.name}. All rights reserved.</p>
        </div>
      </footer>

      {/* Phones only: always-reachable WhatsApp shortcut. */}
      <a
        href={site.social.whatsapp}
        {...newTab}
        aria-label="Chat with Luna Soft on WhatsApp (opens in a new tab)"
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-black/20 transition-colors hover:bg-amber-300 md:hidden ${focusRing}`}
      >
        <SocialIcon network="whatsapp" className="h-6 w-6" />
      </a>
    </main>
  );
}