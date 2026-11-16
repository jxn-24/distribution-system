"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="lg-page flex items-center justify-center">
        <p className="lg-muted">Loading...</p>
      </div>
    );
  }

  const roleNames = user.roles.map((r) => r.name);
  const isFullAccess = roleNames.includes("Super Admin") || roleNames.includes("Admin");

  const visibleNav = navItems.filter((item) => {
    if (isFullAccess) return true;
    return item.roles.some((r) => roleNames.includes(r));
  });

  const brand = (
    <Link href="/dashboard" className="lg-focus flex items-center gap-3 rounded-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 bg-gold/10 font-display text-2xl leading-none text-gold">
        ☾
      </div>
      <div>
        <p className="font-display text-sm font-semibold tracking-wide">LUNA SOFT</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Essentials</p>
      </div>
    </Link>
  );

  return (
    <div className="lg-page flex">
      {/* mobile top bar */}
      <header className="glass-strong fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="btn-glass !min-h-10 !px-4"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`glass-strong fixed inset-y-0 left-0 z-40 flex w-64 flex-col rounded-none border-y-0 border-l-0 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 p-5">{brand}</div>

        <nav aria-label="App" className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gradient-to-r from-gold-light to-gold font-semibold text-ink shadow-[0_8px_24px_-10px_rgba(232,189,60,0.8)]"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-medium">{user.username}</p>
          <p className="mb-3 text-xs text-white/55">{roleNames.join(", ")}</p>
          <button onClick={logout} className="btn-glass w-full !min-h-10">
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="lg-legacy p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
