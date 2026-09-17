"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["all"] },
  { href: "/products", label: "Products", roles: ["all"] },
  {
    href: "/inventory",
    label: "Inventory",
    roles: ["Super Admin", "Admin", "Director", "Warehouse", "Sales", "Finance"],
  },
  {
    href: "/sales-orders",
    label: "Sales Orders",
    roles: ["Super Admin", "Admin", "Director", "Sales", "Finance"],
  },
  {
    href: "/purchase-orders",
    label: "Purchase Orders",
    roles: ["Super Admin", "Admin", "Director", "Warehouse", "Finance"],
  },
  {
    href: "/shipments",
    label: "Shipments",
    roles: ["Super Admin", "Admin", "Warehouse", "Sales", "Finance"],
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <p className="text-neutral-600 font-body">Loading...</p>
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
    <div className="min-h-screen bg-neutral-100 text-black flex font-body">
      {/* Sidebar — Luna Soft black / gold */}
      <aside className="w-64 bg-black text-white flex flex-col border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/Luna_Soft_Essentials_logo.jpeg"
              alt="Luna Soft Essentials"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="font-display font-semibold text-sm tracking-wide text-white">
                LUNA SOFT
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-amber-400">
                Essentials
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-amber-400 text-black font-medium"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium text-white">{user.username}</p>
          <p className="text-xs text-amber-400/90 mb-3">{roleNames.join(", ")}</p>
          <button
            onClick={logout}
            className="w-full text-sm bg-white/10 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition border border-white/10"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}