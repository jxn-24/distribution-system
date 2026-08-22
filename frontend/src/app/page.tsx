"use client";

import Link from "next/link";

export default function HomePage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ========== HEADER ========== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
    TL
  </div>
  <span className="text-xl font-bold text-blue-800">
    Three-Level Distribution
  </span>
</div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-orange-500 transition"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("vision")}
              className="hover:text-orange-500 transition"
            >
              Vision & Mission
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-orange-500 transition"
            >
              Contact
            </button>

            <Link
              href="/login"
              className="text-blue-700 border border-blue-700 px-5 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Sign Up
            </Link>
          </nav>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-blue-700 border border-blue-700 px-3 py-1.5 rounded-lg text-sm"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Reliable Distribution. <br />
              <span className="text-orange-400">Strong Supply Chain.</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl">
              Three-Level Distribution specializes in the efficient supply of essential hygiene products 
              including sanitary pads, diapers, hair oil and more — connecting manufacturers to markets 
              with excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition"
              >
                Access Your Account
              </Link>
              <button
                onClick={() => scrollToSection("about")}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-800 transition"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center border-4 border-orange-400">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">TL</div>
                <p className="text-sm text-blue-100">Three-Level Distribution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-3">Who We Are</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are a distribution company focused on bridging the gap between manufacturers 
              and the market through efficient warehousing, logistics, and supply chain management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Our Products</h3>
              <p className="text-gray-600 text-sm">
                Essential hygiene products including sanitary pads, diapers, hair oil and related consumer goods.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Our Network</h3>
              <p className="text-gray-600 text-sm">
                We work with manufacturers, wholesalers, retailers and sales agents to ensure products reach the market efficiently.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Our Strength</h3>
              <p className="text-gray-600 text-sm">
                Strong inventory control, reliable logistics, and a technology-driven distribution system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VISION & MISSION ========== */}
      <section id="vision" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-blue-800 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Our Vision</h3>
            <p className="text-blue-100 leading-relaxed">
              To become the most reliable and efficient distribution partner for essential consumer products, 
              empowering businesses and improving product availability across the region.
            </p>
          </div>

          <div className="bg-orange-500 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="leading-relaxed">
              To deliver quality products through a well-managed supply chain, supported by technology, 
              strong partnerships, and a commitment to excellence in service and reliability.
            </p>
          </div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-3">Contact Us</h2>
            <p className="text-gray-600">We would love to hear from you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-orange-500 text-2xl mb-3">📍</div>
              <h4 className="font-semibold mb-1">Location</h4>
              <p className="text-sm text-gray-600">Nairobi, Kenya</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-orange-500 text-2xl mb-3">📧</div>
              <h4 className="font-semibold mb-1">Email</h4>
              <p className="text-sm text-gray-600">info@threelevel.com</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="text-orange-500 text-2xl mb-3">📞</div>
              <h4 className="font-semibold mb-1">Phone</h4>
              <p className="text-sm text-gray-600">+254 700 000 000</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
              TL
            </div>
            <span className="font-semibold">Three-Level Distribution</span>
          </div>

          <div className="flex gap-6 text-sm text-blue-200">
            <a href="#" className="hover:text-orange-400 transition">Facebook</a>
            <a href="#" className="hover:text-orange-400 transition">Instagram</a>
            <a href="#" className="hover:text-orange-400 transition">LinkedIn</a>
            <a href="#" className="hover:text-orange-400 transition">X (Twitter)</a>
          </div>

          <p className="text-sm text-blue-300">
            © {new Date().getFullYear()} Three-Level Distribution. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}