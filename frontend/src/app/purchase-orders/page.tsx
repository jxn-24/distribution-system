"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface PurchaseOrder {
    id: number;
    po_number: string;
    manufacturer_name: string;
    order_date: string;
    expected_date: string;
    status: string;
    total_amount: number;   
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/purchase/purchase-orders/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() =>
        setError("Could not load purchase orders. Check login and permissions.")
      )
      .finally(() => setLoading(false));
    }, []);

    const statusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "SENT":
        return "bg-blue-100 text-blue-700";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      case "RECEIVED":
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
        <h1 className="text-2xl font-bold text-blue-900">Purchase Orders</h1>
        <p className="text-gray-600 text-sm">
          Orders placed with manufacturers / suppliers
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading purchase orders...</p>}
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
                <th className="text-left px-4 py-3 font-semibold">PO #</th>
                <th className="text-left px-4 py-3 font-semibold">Manufacturer</th>
                <th className="text-left px-4 py-3 font-semibold">Order Date</th>
                <th className="text-left px-4 py-3 font-semibold">Expected</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.po_number}</td>
                    <td className="px-4 py-3">
                      {order.manufacturer_name || "—"}
                    </td>
                    <td className="px-4 py-3">{order.order_date}</td>
                    <td className="px-4 py-3">{order.expected_date || "—"}</td>
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