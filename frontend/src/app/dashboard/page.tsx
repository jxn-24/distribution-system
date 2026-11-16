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
      <div className="lg-page flex items-center justify-center">
        <p className="lg-muted">Loading dashboard...</p>
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
      <div className="glass-gold mb-8 rounded-3xl p-6 sm:p-8">
        <p className="lg-eyebrow mb-3">☾ Luna Soft Essentials</p>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{content.title}</h2>
        <p className="lg-muted mt-1">{content.subtitle}</p>
        <p className="mt-4 text-sm text-white/80">
          Signed in as <span className="font-semibold text-gold-light">{user.first_name || user.username}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.quickLinks.map((link, index) =>
              quickActionRoutes[link] ? (
                <Link
                  key={`${link}-${index}`}
                  href={quickActionRoutes[link]}
                  className="glass glass-hover lg-focus flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-medium"
                >
                  {link}
                  <span aria-hidden className="text-gold">→</span>
                </Link>
              ) : (
                <span key={`${link}-${index}`} className="rounded-2xl border border-white/10 px-4 py-4 text-sm text-white/40">
                  {link}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="mb-3 font-display text-lg font-semibold">Access Notes</h3>
          <p className="lg-muted text-sm leading-relaxed">{content.notes}</p>
        </div>
      </div>
    </AppShell>
  );
}