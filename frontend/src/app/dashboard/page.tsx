"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

const adminBaseUrl = new URL(
  "/admin/",
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
).toString();

const quickActionRoutes: Record<string, string> = {
  "Manage Users & Roles": `${adminBaseUrl}users/user/`,
  "Inventory Overview": "/inventory",
  "Inventory": "/inventory",
  "Sales Orders": "/sales-orders",
  "View Sales Orders": "/sales-orders",
  "Purchase Orders": "/purchase-orders",
  "Warehouse Tasks": "/warehouse/scan",
  "Receive Goods": "/warehouse/scan?mode=receive",
  "Scan to Pick": "/warehouse/scan?mode=pick",
  "Shipments": "/shipments",
  "View Shipments": "/shipments",
  "Products": "/products",
  "Browse Products": "/products",
  "Order History": "/sales-orders",
  "My Orders": "/sales-orders",
  "All Modules": "/dashboard",
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const roleNames = user.roles.map((r) => r.name);
  
  const getRoleContent = () => {
    if (roleNames.includes("Super Admin")) {
      return {
        title: "Super Admin Dashboard",
        subtitle: "Full system control and oversight",
        color: "bg-neutral-950",
        quickLinks: [
          "Manage Users & Roles",
          "Inventory",
          "Sales Orders",
          "Purchase Orders",
        ],
        notes: "You have unrestricted access to every part of the system.",
      };
    }

    if (roleNames.includes("Admin")) {
      return {
        title: "Admin Dashboard",
        subtitle: "Day-to-day operational control",
        color: "bg-neutral-950",
        quickLinks: [
          "Inventory Overview",
          "Sales Orders",
          "Purchase Orders",
          "Warehouse Tasks",
        ],
        notes: "You can manage operations across inventory, sales, warehouse and finance.",
      };
    }

    if (roleNames.includes("Director")) {
      return {
        title: "Director Dashboard",
        subtitle: "Strategic overview (Read-only)",
        color: "bg-neutral-950",
        quickLinks: [
          "Inventory",
          "Sales Orders",
          "Purchase Orders",
        ],
        notes: "You have read-only access to high-level reports and dashboards. No editing rights.",
      };
    }

    if (roleNames.includes("Warehouse")) {
      return {
        title: "Warehouse Dashboard",
        subtitle: "Today's operational tasks",
        color: "bg-neutral-950",
        quickLinks: [
          "Receive Goods",
          "Scan to Pick",
          "View Shipments",
          "Inventory",
        ],
        notes: "You only see warehouse tasks and stock movements. Pricing and financial data are hidden.",
      };
    }

    if (roleNames.includes("Sales")) {
      return {
        title: "Sales Dashboard",
        subtitle: "Orders and customer management",
        color: "bg-neutral-950",
        quickLinks: [
          "View Sales Orders",
          "Products",
        ],
        notes: "You can view stock availability and manage your customers and orders. Costs and full margins are restricted.",
      };
    }

    if (roleNames.includes("Finance")) {
      return {
        title: "Finance Dashboard",
        subtitle: "Invoicing, payments and profitability",
        color: "bg-neutral-950",
        quickLinks: [
          "Sales Orders",
          "Purchase Orders",
        ],
        notes: "You have full access to financial documents and reports. Warehouse floor actions are restricted.",
      };
    }

    if (roleNames.includes("Sales Agent")) {
      return {
        title: "Sales Agent Dashboard",
        subtitle: "Your deals and commissions",
        color: "bg-neutral-950",
        quickLinks: [
          "Browse Products",
          "My Orders",
        ],
        notes: "You can view product availability and track your own deals and commissions only.",
      };
    }

    if (roleNames.includes("Customer")) {
      return {
        title: "Customer Portal",
        subtitle: "Your orders and account",
        color: "bg-neutral-950",
        quickLinks: [
          "My Orders",
          "Browse Products",
        ],
        notes: "You only see your own orders, invoices and shipments. Internal company data is completely hidden.",
      };
    }

    return {
      title: "Dashboard",
      subtitle: "Welcome",
      color: "bg-neutral-950",
      quickLinks: [],
      notes: "No specific role dashboard configured.",
    };
  };

  const content = getRoleContent();

  return (
    <AppShell>
      <div className={`${content.color} text-white border-t-4 border-amber-400 rounded-lg p-6 mb-8`}>
        <p className="text-amber-300 text-xs font-semibold uppercase tracking-[0.18em] mb-2">☾ Luna Soft Essentials</p>
        <h2 className="text-2xl font-bold mb-1">{content.title}</h2>
        <p className="text-neutral-300">{content.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
          <h3 className="font-semibold text-neutral-950 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.quickLinks.map((link, index) => (
              quickActionRoutes[link] ? (
                <Link
                  key={`${link}-${index}`}
                  href={quickActionRoutes[link]}
                  className="block border border-neutral-200 border-l-2 border-l-amber-400 rounded-md px-4 py-3 text-sm text-neutral-700 hover:bg-amber-50 hover:border-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >{link}</Link>
              ) : (
                <span key={`${link}-${index}`} className="block border border-neutral-200 rounded-md px-4 py-3 text-sm text-neutral-400">{link}</span>
              )
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
          <h3 className="font-semibold text-neutral-950 mb-3">Access Notes</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">{content.notes}</p>
        </div>
      </div>
    </AppShell>
  );
}