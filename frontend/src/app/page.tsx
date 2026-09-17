"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-body">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Image
              src="/images/Luna_Soft_Essentials_logo.jpeg"
              alt="Luna Soft Essentials"
              width={56}
              height={56}
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
              priority
            />
            <div className="text-left">
              <p className="font-display font-semibold text-white text-sm tracking-wide">
                LUNA SOFT
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/90">
                Essentials
              </p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <button onClick={() => scrollTo("story")} className="hover:text-amber-400 transition">
              Our Story
            </button>
            <button onClick={() => scrollTo("products")} className="hover:text-amber-400 transition">
              Products
            </button>
            <button onClick={() => scrollTo("promise")} className="hover:text-amber-400 transition">
              Promise
            </button>
            <button onClick={() => scrollTo("contact")} className="hover:text-amber-400 transition">
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm bg-amber-400 text-black font-medium px-4 py-2 rounded-full hover:bg-amber-300 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-400 text-xs font-medium tracking-[0.25em] uppercase mb-4">
              Gentle care. Strong protection.
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] mb-6">
              Softness you feel.
              <span className="block text-amber-400">Confidence you keep.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md mb-8 font-body leading-relaxed">
              Luna Soft Essentials brings everyday hygiene products designed for
              comfort, dignity, and reliable protection — for every body, every day.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("products")}
                className="bg-amber-400 text-black font-medium px-6 py-3 rounded-full hover:bg-amber-300 transition"
              >
                Explore products
              </button>
              <Link
                href="/login"
                className="border border-white/30 text-white px-6 py-3 rounded-full hover:border-amber-400 hover:text-amber-400 transition"
              >
                Staff login
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-[2rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-black border border-amber-400/30 shadow-2xl shadow-amber-500/10 flex flex-col items-center justify-center text-center p-6 md:p-8">
              <Image
                src="/images/Luna_Soft_Essentials_logo.jpeg"
                alt="Luna Soft Essentials"
                width={220}
                height={220}
                className="h-24 w-24 object-contain mb-4"
              />
              <p className="font-display text-2xl text-white tracking-wide">LUNA SOFT</p>
              <p className="text-amber-400/90 text-xs tracking-[0.2em] uppercase mt-2">
                Essentials
              </p>
              <p className="text-white/50 text-sm mt-4">Sanitary care · Adult care</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section id="story" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="text-amber-600 text-xs tracking-[0.2em] uppercase mb-3">Our story</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-black leading-tight">
              Built for real life, not the shelf alone.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-4 text-neutral-600 text-lg leading-relaxed">
            <p>
              Luna Soft Essentials is a distribution-led brand focused on essential
              hygiene — from sanitary pads to adult care — with packaging and product
              quality that feel premium without being distant.
            </p>
            <p>
              We connect manufacturers to markets through careful warehousing,
              clear inventory, and partners who care about availability and trust.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section id="products" className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-amber-600 text-xs tracking-[0.2em] uppercase mb-3">Range</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-black">
                Care that shows up.
              </h2>
            </div>
            <p className="text-neutral-500 max-w-sm text-sm">
              Bold on the outside. Soft where it matters. Designed for everyday confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Luna Soft Pads",
                blurb: "Ultra soft · Leak protection · Breathable comfort",
                tag: "Sanitary care",
              },
              {
                title: "Adult Tape Diapers",
                blurb: "Max absorbency · Overnight protection · Secure fit",
                tag: "Adult care",
              },
              {
                title: "Adult Pants",
                blurb: "Flexible fit · Discreet comfort · All-day wear",
                tag: "Adult care",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group bg-black text-white rounded-3xl p-6 border border-white/5 hover:border-amber-400/40 transition shadow-lg"
              >
                <p className="text-amber-400 text-[10px] tracking-[0.2em] uppercase mb-4">
                  {item.tag}
                </p>
                <div className="h-28 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-amber-400/20 mb-5 flex items-center justify-center">
                  <Image
                    src="/images/Luna_Soft_Essentials_logo.jpeg"
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain opacity-90"
                  />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROMISE ===== */}
      <section id="promise" className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-amber-400 text-xs tracking-[0.2em] uppercase mb-3 text-center">
            Our promise
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-14">
            Soft on skin. Serious on quality.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: "Comfort first",
                d: "Materials and fit chosen for all-day wear without compromise.",
              },
              {
                t: "Reliable supply",
                d: "Distribution systems that keep partners stocked and shelves ready.",
              },
              {
                t: "Clear standards",
                d: "Batch tracking, expiry awareness, and accountable handling.",
              },
            ].map((x) => (
              <div key={x.t} className="text-center px-4">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-amber-400/40 flex items-center justify-center text-amber-400">
                  ✦
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{x.t}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-amber-600 text-xs tracking-[0.2em] uppercase mb-3">Contact</p>
          <h2 className="font-display text-3xl font-semibold text-black mb-4">
            Let’s work together
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto mb-10">
            Wholesalers and retailers — contact our sales team to place orders.
            Staff access the distribution system via Login.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm">
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <p className="text-amber-600 font-medium mb-1">Location</p>
              <p className="text-neutral-600">Kikuyu, Kenya</p>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <p className="text-amber-600 font-medium mb-1">Email</p>
              <p className="text-neutral-600">info@lunasoft.co.ke</p>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <p className="text-amber-600 font-medium mb-1">Phone</p>
              <p className="text-neutral-600">+254 7XX XXX XXX</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-black text-white border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Luna_Soft_Essentials_logo.jpeg"
              alt="Luna Soft Essentials"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-display font-semibold text-sm">LUNA SOFT ESSENTIALS</p>
              <p className="text-[10px] text-white/40 tracking-wider">
                GENTLE CARE. STRONG PROTECTION.
              </p>
            </div>
          </div>
          <div className="flex gap-5 text-sm text-white/50">
            <a href="#" className="hover:text-amber-400 transition">
              Instagram
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              Facebook
            </a>
            <a href="#" className="hover:text-amber-400 transition">
              TikTok
            </a>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Luna Soft Essentials. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
