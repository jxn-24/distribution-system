"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface SalesOrder {
    id: number;
    order_number: string;
    customer_name: string;
    order_date: string;
    status: string;
    total_amount: string;
}

export default function ReadyToPackPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/sales/sales-orders/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        const list = Array.isArray(data) ? data : [];
        // Only paid orders ready for warehouse
        setOrders(list.filter((o: SalesOrder) => o.status === "READY_TO_PACK"));
      })
      .catch(() =>
        setError("Could not load ready-to-pack orders. Check login and permissions.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black font-display">Ready to Pack</h1>
        <p className="text-neutral-600 text-sm">
          Orders that are paid and waiting for warehouse packing
        </p>
      </div>

      {loading && <p className="text-neutral-500">Loading orders...</p>}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-neutral-100">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order #</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Total (KES)</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    No orders ready to pack
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">{order.customer_name || "—"}</td>
                    <td className="px-4 py-3">{order.order_date}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-900">
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