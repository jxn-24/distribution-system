"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: [
      "Super Admin",
      "Director",
      "Admin",
      "Warehouse",
      "Sales / Account Managers",
      "Account Manager",
      "Finance",
      "Sales Agent",
      "Customer Portal (Wholesaler / Retailer)",
      "Customer",
    ],
  },
  {
    href: "/products",
    label: "Products",
    roles: [
      "Super Admin",
      "Director",
      "Admin",
      "Warehouse",
      "Sales / Account Managers",
      "Account Manager",
      "Sales Agent",
      "Customer Portal (Wholesaler / Retailer)",
      "Customer",
    ],
  },
  {
    href: "/inventory",
    label: "Inventory",
    roles: [
      "Super Admin",
      "Admin",
      "Director",
      "Warehouse",
      "Sales / Account Managers",
      "Account Manager",
      "Sales",
      "Sales Agent",
      "Customer Portal (Wholesaler / Retailer)",
      "Customer",
    ],
  },
  {
    href: "/warehouse/scan",
    label: "Scan Stock",
    roles: ["Super Admin", "Admin", "Warehouse"],
  },
  {
    href: "/purchase-orders",
    label: "Purchase Orders",
    roles: ["Super Admin", "Admin", "Director", "Warehouse", "Finance"],
  },
  {
    href: "/sales-orders",
    label: "Sales Orders",
    roles: [
      "Super Admin",
      "Admin",
      "Director",
      "Sales / Account Managers",
      "Account Manager",
      "Sales",
      "Finance",
      "Sales Agent",
      "Customer Portal (Wholesaler / Retailer)",
      "Customer",
    ],
  },
  {
    href: "/ready-to-pack",
    label: "Ready to Pack",
    roles: ["Super Admin", "Admin", "Warehouse"],
  },
  {
    href: "/record-payment",
    label: "Record Payment",
    roles: ["Super Admin", "Admin", "Finance"],
  },
  {
    href: "/shipments",
    label: "Shipments",
    roles: [
      "Super Admin",
      "Admin",
      "Director",
      "Warehouse",
      "Sales / Account Managers",
      "Account Manager",
      "Sales",
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const roleNames = user.roles.map((r) => r.name);

  const visibleNav = navItems.filter(
    (item) =>
      item.roles.includes("all") ||
      item.roles.some((r) => roleNames.includes(r)) ||
      roleNames.includes("Super Admin") ||
      roleNames.includes("Admin")
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950 flex">
      <aside className="w-64 bg-neutral-950 text-neutral-100 flex flex-col border-r border-neutral-800">
        <div className="p-5 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full border border-amber-400/60 bg-amber-400/10 flex items-center justify-center text-amber-300 font-display text-2xl leading-none">
              ☾
            </div>
            <div>
              <p className="font-display font-semibold text-sm tracking-wide">
                LUNA SOFT
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                Essentials
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-amber-400 text-neutral-950 font-semibold"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <p className="text-sm font-medium">{user.username}</p>
          <p className="text-xs text-neutral-400 mb-3">{roleNames.join(", ")}</p>
          <button
            onClick={logout}
            className="w-full text-sm border border-neutral-600 text-neutral-200 hover:border-amber-400 hover:text-amber-300 px-3 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}