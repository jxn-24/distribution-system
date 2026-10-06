"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    file: "/images/LS-ADT-L.jpg",
    note: "Max absorbency · Overnight protection · Secure fit",
  },
  {
    kicker: "Adult care",
    name: "Adult Pants",
    file: "/images/LS-ADP-L.jpg",
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

export default function HomePage() {
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHero(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/Luna_Soft_Essentials_logo.jpeg" alt="Luna Soft Essentials" width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
            <span>
              <span className="block font-display text-sm font-semibold tracking-wide">LUNA SOFT</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-300">Essentials</span>
            </span>
          </Link>
          <nav className="flex justify-center gap-8 text-sm font-bold">
            <button onClick={() => scrollToSection("about")}>About Us</button>
            <button onClick={() => scrollToSection("products")}>Products</button>
            <button onClick={() => scrollToSection("contact")}>Contact</button>
          </nav>
          <div />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Quality Care. Everyday Comfort. Trusted Essentials.</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight">
            Softness you feel.<br /><span className="text-amber-300">Confidence you keep.</span>
          </h1>
          <p className="mt-6 max-w-xl text-neutral-300">
            Luna Soft Essentials brings everyday hygiene products designed for comfort, dignity, and reliable protection — for every body, every day.
          </p>
        </div>
        <div className={`mx-auto w-full max-w-xs transition-all duration-700 ${showHero ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          <Image src="/images/product-all.jpg" alt="Luna Soft Essentials products" width={640} height={640} className="h-72 w-full rounded-3xl object-contain shadow-[0_0_40px_rgba(251,191,36,0.28)]" priority />
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
          <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Range</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold">Care that shows up.</h2>
            <p className="max-w-xs text-sm text-neutral-500">Bold on the outside. Soft where it matters. Designed for everyday confidence.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.file} className="rounded-3xl bg-neutral-950 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300">{product.kicker}</p>
                <div className="mt-3 flex h-40 items-center justify-center rounded-2xl border border-amber-400/30">
                  <Image src={product.file} alt={product.name} width={400} height={300} className="max-h-36 w-full object-contain" />
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
            <article className="rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Location</p>
              <p className="mt-2 font-medium">Kikuyu, Kenya</p>
            </article>
            <article className="rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Email</p>
              <a className="mt-2 block font-medium" href="mailto:lunasoftlimited@gmail.com?subject=Enquiry%20from%20the%20website">lunasoftlimited@gmail.com</a>
            </article>
            <article className="rounded-2xl bg-neutral-100 px-6 py-5">
              <p className="text-amber-700">Phone</p>
              <a className="mt-2 block font-medium" href="tel:+254721669664">+254 721 669 664</a>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-6">
          <div className="flex items-center gap-3">
            <Image src="/images/Luna_Soft_Essentials_logo.jpeg" alt="Luna Soft Essentials" width={42} height={42} className="h-10 w-10 rounded-md object-cover" />
            <div>
              <p className="text-sm font-semibold tracking-wide">LUNA SOFT ESSENTIALS</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">Gentle care. Strong protection.</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-neutral-300">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>TikTok</span>
          </div>
          <p className="text-sm text-neutral-400">© 2026 Luna Soft Essentials. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}