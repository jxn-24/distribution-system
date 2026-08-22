"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
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
  const mainRole = roleNames[0] || "User";

  // USER ROLES AND SPECIFICATIONS

  const getRoleContent = () => {
    // Super Admin
    if (roleNames.includes("Super Admin")) {
      return {
        title: "Super Admin Dashboard",
        subtitle: "Full system control and oversight",
        color: "bg-purple-700",
        cards: [
          { label: "Total Users", value: "8", desc: "Active accounts" },
          { label: "System Status", value: "Healthy", desc: "All services running" },
          { label: "Open Issues", value: "0", desc: "No critical alerts" },
          { label: "Roles Configured", value: "8", desc: "All roles active" },
        ],
        quickLinks: [
          "Manage Users & Roles",
          "System Settings",
          "View Audit Logs",
          "All Modules Access",
        ],
        notes: "You have unrestricted access to every part of the system.",
      };
    }

    // Admin
    if (roleNames.includes("Admin")) {
      return {
        title: "Admin Dashboard",
        subtitle: "Day-to-day operational control",
        color: "bg-blue-700",
        cards: [
          { label: "Open Sales Orders", value: "—", desc: "Awaiting processing" },
          { label: "Pending Receipts", value: "—", desc: "Goods to receive" },
          { label: "Low Stock Items", value: "—", desc: "Need attention" },
          { label: "Pending Invoices", value: "—", desc: "To be generated" },
        ],
        quickLinks: [
          "Inventory Overview",
          "Sales Orders",
          "Purchase Orders",
          "Warehouse Tasks",
          "Finance Summary",
        ],
        notes: "You can manage operations across inventory, sales, warehouse and finance.",
      };
    }

    // Director
    if (roleNames.includes("Director")) {
      return {
        title: "Director Dashboard",
        subtitle: "Strategic overview (Read-only)",
        color: "bg-indigo-700",
        cards: [
          { label: "Sales Performance", value: "—", desc: "This month" },
          { label: "Inventory Value", value: "—", desc: "Current valuation" },
          { label: "Gross Margin", value: "—", desc: "Overall %" },
          { label: "Order Fill Rate", value: "—", desc: "Fulfillment performance" },
        ],
        quickLinks: [
          "Sales Reports",
          "Inventory Valuation",
          "Profitability Overview",
          "Key Performance Indicators",
        ],
        notes: "You have read-only access to high-level reports and dashboards. No editing rights.",
      };
    }

    // Warehouse
    if (roleNames.includes("Warehouse")) {
      return {
        title: "Warehouse Dashboard",
        subtitle: "Today's operational tasks",
        color: "bg-orange-600",
        cards: [
          { label: "Goods to Receive", value: "—", desc: "Pending put-away" },
          { label: "Pick Lists", value: "—", desc: "Ready for picking" },
          { label: "Orders to Pack", value: "—", desc: "Waiting for packing" },
          { label: "Shipments Due", value: "—", desc: "To be dispatched" },
        ],
        quickLinks: [
          "Receive Goods",
          "View Pick Lists",
          "Packing Station",
          "Stock Adjustments",
          "Cycle Counts",
        ],
        notes: "You only see warehouse tasks and stock movements. Pricing and financial data are hidden.",
      };
    }

    // Sales
    if (roleNames.includes("Sales")) {
      return {
        title: "Sales Dashboard",
        subtitle: "Orders and customer management",
        color: "bg-green-700",
        cards: [
          { label: "Open Orders", value: "—", desc: "Your active orders" },
          { label: "Pending Quotes", value: "—", desc: "Awaiting confirmation" },
          { label: "Customers", value: "—", desc: "Under your account" },
          { label: "This Month Sales", value: "—", desc: "Your performance" },
        ],
        quickLinks: [
          "Create Sales Order",
          "Check Stock Availability",
          "My Customers",
          "Order History",
          "Quotes",
        ],
        notes: "You can view stock availability and manage your customers and orders. Costs and full margins are restricted.",
      };
    }

    // Finance
    if (roleNames.includes("Finance")) {
      return {
        title: "Finance Dashboard",
        subtitle: "Invoicing, payments and profitability",
        color: "bg-teal-700",
        cards: [
          { label: "Unpaid Invoices", value: "—", desc: "Accounts Receivable" },
          { label: "Pending Receipts", value: "—", desc: "To be recorded" },
          { label: "Gross Margin", value: "—", desc: "Current period" },
          { label: "Inventory Value", value: "—", desc: "Stock valuation" },
        ],
        quickLinks: [
          "Invoices",
          "Record Receipt",
          "Payments",
          "Margin Reports",
          "AR Aging",
        ],
        notes: "You have full access to financial documents and reports. Warehouse floor actions are restricted.",
      };
    }

    // Sales Agent
    if (roleNames.includes("Sales Agent")) {
      return {
        title: "Sales Agent Dashboard",
        subtitle: "Your deals and commissions",
        color: "bg-cyan-700",
        cards: [
          { label: "Active Deals", value: "—", desc: "In progress" },
          { label: "Closed This Month", value: "—", desc: "Successfully closed" },
          { label: "Estimated Commission", value: "—", desc: "Current period" },
          { label: "Product Availability", value: "—", desc: "Key items" },
        ],
        quickLinks: [
          "View Catalog",
          "My Deals",
          "Commission Statement",
          "Stock Availability",
        ],
        notes: "You can view product availability and track your own deals and commissions only.",
      };
    }

    // Customer
    if (roleNames.includes("Customer")) {
      return {
        title: "Customer Portal",
        subtitle: "Your orders and account",
        color: "bg-gray-800",
        cards: [
          { label: "Open Orders", value: "—", desc: "Currently processing" },
          { label: "Invoices", value: "—", desc: "Recent invoices" },
          { label: "Shipments", value: "—", desc: "In transit" },
          { label: "Account Status", value: "Active", desc: "Your account" },
        ],
        quickLinks: [
          "Place New Order",
          "Order History",
          "Track Shipment",
          "My Invoices",
          "My Catalog",
        ],
        notes: "You only see your own orders, invoices and shipments. Internal company data is completely hidden.",
      };
    }

    // Default fallback
    return {
      title: "Dashboard",
      subtitle: "Welcome",
      color: "bg-gray-700",
      cards: [],
      quickLinks: [],
      notes: "No specific role dashboard configured.",
    };
  };

  const content = getRoleContent();

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-black">Distribution System</h1>
            <p className="text-sm text-gray-600">Role-based Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-black">{user.username}</p>
              <p className="text-xs text-gray-500">{mainRole}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Role Banner */}
        <div className={`${content.color} text-white rounded-xl p-6 mb-8`}>
          <h2 className="text-2xl font-bold mb-1">{content.title}</h2>
          <p className="opacity-90">{content.subtitle}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {content.cards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-black">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Links + Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-black mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.quickLinks.map((link, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {link}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-black mb-3">Access Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{content.notes}</p>
          </div>
        </div>
      </main>
    </div>
  );
}