"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useRef, useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["Super Admin", "Director", "Admin", "Warehouse", "Sales", "Sales / Account Managers", "Account Manager", "Finance"],
  },
  {
    href: "/products",
    label: "Products",
    roles: ["Super Admin", "Director", "Admin", "Sales", "Sales / Account Managers", "Account Manager"],
  },
  {
    href: "/inventory",
    label: "Inventory",
    roles: ["Super Admin", "Admin", "Director", "Warehouse", "Sales", "Sales / Account Managers", "Account Manager"],
  },
  {
    href: "/warehouse/scan",
    label: "Scan Stock",
    roles: ["Super Admin", "Admin", "Warehouse"],
  },
  {
    href: "/purchase-orders",
    label: "Purchase Orders",
    roles: ["Super Admin", "Admin", "Director", "Finance"],
  },
  {
    href: "/sales-orders",
    label: "Sales Orders",
    roles: ["Super Admin", "Admin", "Director", "Sales", "Sales / Account Managers", "Account Manager", "Finance"],
  },
  {
    href: "/invoices",
    label: "Invoices",
    roles: ["Super Admin", "Admin", "Director", "Finance"],
  },
  {
    href: "/ready-to-pack",
    label: "Ready to Pack",
    roles: ["Super Admin", "Admin", "Warehouse"],
  },
  {
    href: "/reports/margin",
    label: "Margin",
    roles: ["Super Admin", "Admin", "Director", "Finance"],
  },
  {
    href: "/record-payment",
    label: "Record Payment",
    roles: ["Super Admin", "Admin", "Finance"],
  },
  {
    href: "/receipts",
    label: "Receipts",
    roles: ["Super Admin", "Admin", "Director", "Finance", "Sales"],
  },
  {
    href: "/shipments",
    label: "Shipments",
    roles: ["Super Admin", "Admin", "Director", "Warehouse", "Sales", "Sales / Account Managers", "Account Manager"],
  },
];

type NavItem = (typeof navItems)[number];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <>
      <Image
        src="/images/luna-crescent.png"
        alt=""
        width={40}
        height={40}
        loading="eager"
        className="h-10 w-10 shrink-0"
      />
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold tracking-wide text-neutral-100">LUNA SOFT</span>
        <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-300">Essentials</span>
      </span>
    </>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors ${focusRing} ${
                active
                  ? "bg-amber-400 font-semibold text-neutral-950"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white active:bg-neutral-800"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AccountFooter({ username, roles, onLogout }: { username: string; roles: string[]; onLogout: () => void }) {
  return (
    <div className="border-t border-neutral-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <p className="truncate text-sm font-medium text-neutral-100">{username}</p>
      <p className="mb-3 text-xs text-neutral-400">{roles.join(", ")}</p>
      <button
        type="button"
        onClick={onLogout}
        className={`min-h-11 w-full rounded-md border border-neutral-600 px-3 text-sm text-neutral-200 transition-colors hover:border-amber-400 hover:text-amber-300 ${focusRing}`}
      >
        Logout
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  // Set when the drawer closes because a page link was chosen: the new page starts at
  // the top, so the old scroll position must not be restored over it.
  const navigatedFromDrawer = useRef(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/staff");
    }
  }, [user, isLoading, router]);

  // While the drawer is open: lock page scroll, keep Tab inside the drawer, close on
  // Escape, and close if the viewport grows to the desktop layout (no drawer there).
  useEffect(() => {
    if (!menuOpen) return;

    // iOS Safari ignores overflow:hidden on body for touch scrolling, so pin the body
    // in place instead and restore the scroll position afterwards.
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      Object.assign(body.style, previous);
      window.scrollTo(0, navigatedFromDrawer.current ? 0 : scrollY);
      navigatedFromDrawer.current = false;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  // Move focus into the drawer when it opens. When it closes, return focus to the
  // menu button, or, if the layout is now desktop (menu button hidden), to the
  // current page's link in the sidebar.
  useEffect(() => {
    if (menuOpen) {
      closeButtonRef.current?.focus();
    } else if (wasOpen.current) {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        const nav = desktopNavRef.current;
        (nav?.querySelector<HTMLElement>('[aria-current="page"]') ?? nav?.querySelector<HTMLElement>("a[href]"))?.focus();
      } else {
        menuButtonRef.current?.focus();
      }
    }
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const roleNames = user.roles.map((r) => r.name);
  const isFullAccess = roleNames.includes("Super Admin") || roleNames.includes("Admin");

  const visibleNav = navItems.filter((item) => {
    if (isFullAccess) return true;
    return item.roles.some((r) => roleNames.includes(r));
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950 lg:flex">
      {/* Desktop: persistent sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-100 lg:flex">
        <div className="border-b border-neutral-800 p-5">
          <Link href="/dashboard" className={`flex items-center gap-2 rounded-md ${focusRing}`}>
            <Wordmark />
          </Link>
        </div>
        <nav ref={desktopNavRef} aria-label="Main" className="flex-1 overflow-y-auto p-3">
          <NavList items={visibleNav} pathname={pathname} />
        </nav>
        <AccountFooter username={user.username} roles={roleNames} onLogout={logout} />
      </aside>

      {/* Phone and tablet: top bar */}
      <header inert={menuOpen} className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className={`flex h-11 w-11 items-center justify-center rounded-md text-neutral-100 active:bg-neutral-800 ${focusRing}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span className="sr-only">Open menu</span>
        </button>
        <Link href="/dashboard" className={`flex min-h-11 items-center gap-2 rounded-md pr-2 ${focusRing}`}>
          <Wordmark />
        </Link>
      </header>

      {/* Phone and tablet: navigation drawer */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 motion-reduce:transition-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={drawerRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        inert={!menuOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col bg-neutral-950 text-neutral-100 transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden ${
          menuOpen ? "translate-x-0 shadow-[8px_0_24px_rgba(0,0,0,0.35)]" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-800 pl-4 pr-2">
          <div className="flex items-center gap-2">
            <Wordmark />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenu}
            className={`flex h-11 w-11 items-center justify-center rounded-md text-neutral-300 active:bg-neutral-800 ${focusRing}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto overscroll-contain p-3">
          <NavList items={visibleNav} pathname={pathname} onNavigate={() => {
              navigatedFromDrawer.current = true;
              closeMenu();
            }}
          />
        </nav>
        <AccountFooter
          username={user.username}
          roles={roleNames}
          onLogout={() => {
            closeMenu();
            logout();
          }}
        />
      </div>

      <main inert={menuOpen} className="min-w-0 flex-1">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
