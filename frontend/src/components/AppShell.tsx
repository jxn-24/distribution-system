"use client";

import Link from "next/link";
import { usePathname , useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["all"] },
    { href: "/products", label: "Products", roles: ["all"] },
    { href: "/inventory", label: "Inventory", roles: ["Super Admin", "Admin", "Director", "Warehouse", "Sales", "Finance"] },
    { href: "/sales-orders", label: "Sales Orders", roles: ["Super Admin", "Admin", "Director", "Sales", "Finance", "Sales Agent", "Customer"] },
    { href: "/purchase-orders", label: "Purchase Orders", roles: ["Super Admin", "Admin", "Director", "Warehouse", "Finance"] },
    { href: "/shipments", label: "Shipments", roles: ["Super Admin", "Admin", "Warehouse", "Sales", "Finance"] },
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
    <div className="min-h-screen bg-gray-100 text-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-5 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">
              TL
            </div>
            <div>
              <p className="font-bold text-sm">Three-Level</p>
              <p className="text-xs text-blue-200">Distribution</p>
            </div>
          </div>
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
                    ? "bg-orange-500 text-white"
                    : "text-blue-100 hover:bg-blue-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-sm font-medium">{user.username}</p>
          <p className="text-xs text-blue-300 mb-3">
            {roleNames.join(", ")}
          </p>
          <button
            onClick={logout}
            className="w-full text-sm bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition"
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



