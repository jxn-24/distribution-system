"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import BrandLogo from "@/components/BrandLogo";
import SocialIcon from "@/components/SocialIcon";
import { publicPages } from "@/lib/seo";
import { site } from "@/lib/site";
import { CloseIcon, MenuIcon } from "./icons";
import { focusRing, newTab } from "./ui";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);

  // Close the phone menu whenever the page changes.
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-amber-400/40 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-5">
        <Link href="/" aria-label={`${site.name}, home`} className={`rounded-xl ${focusRing}`}>
          <BrandLogo height={34} alt="" preload />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {publicPages.map((page) => {
              const active = isActive(pathname, page.href);
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-md px-3 text-[15px] transition-colors ${focusRing} ${
                      active ? "font-semibold text-amber-300" : "text-neutral-200 hover:text-white"
                    }`}
                  >
                    {page.label}
                    {active && (
                      <span aria-hidden="true" className="absolute inset-x-3 bottom-1.5 h-px bg-amber-300" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => drawer.current?.showModal()}
          aria-haspopup="dialog"
          aria-controls="site-menu"
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-amber-200 ring-1 ring-inset ring-amber-300/40 transition-colors hover:bg-amber-300/10 lg:hidden ${focusRing}`}
        >
          <MenuIcon className="h-5 w-5" />
          Menu
        </button>
      </div>

      <dialog
        id="site-menu"
        ref={drawer}
        aria-label="Menu"
        className="site-drawer"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === event.currentTarget) drawer.current?.close();
        }}
      >
        <div className="flex h-full flex-col px-5 pb-8 pt-4">
          <div className="flex items-center justify-between">
            <BrandLogo height={30} alt={site.name} />
            <button
              type="button"
              onClick={() => drawer.current?.close()}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-200 ring-1 ring-inset ring-white/15 hover:text-white ${focusRing}`}
            >
              <CloseIcon className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Main" className="mt-10">
            <ul className="border-t border-white/10">
              {publicPages.map((page) => {
                const active = isActive(pathname, page.href);
                return (
                  <li key={page.href} className="border-b border-white/10">
                    <Link
                      href={page.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => drawer.current?.close()}
                      className={`flex min-h-14 items-center justify-between font-display text-xl ${focusRing} ${
                        active ? "font-semibold text-amber-300" : "text-white"
                      }`}
                    >
                      {page.label}
                      {active && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-300" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href={site.social.whatsapp}
            {...newTab}
            aria-label="Chat with our sales team on WhatsApp (opens in a new tab)"
            className={`mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 font-semibold text-neutral-950 hover:bg-amber-300 ${focusRing}`}
          >
            <SocialIcon network="whatsapp" className="h-5 w-5" />
            WhatsApp us
          </a>
        </div>
      </dialog>
    </header>
  );
}
