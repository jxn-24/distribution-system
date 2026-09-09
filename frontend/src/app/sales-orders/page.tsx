"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface SalesOrder {
    id: number;
    order_number: string;
    customer_name: string;
    order_date: string;
    status: string;
    total_amount: number;   
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/sales/sales-orders/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() =>
        setError("Could not load sales orders. Check login and permissions.")
      )
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PICKING":
      case "PACKED":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Sales Orders</h1>
        <p className="text-gray-600 text-sm">Customer orders and fulfillment status</p>
      </div>

      {loading && <p className="text-gray-500">Loading sales orders...</p>}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order #</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No sales orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">{order.customer_name || "—"}</td>
                    <td className="px-4 py-3">{order.order_date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{order.total_amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
