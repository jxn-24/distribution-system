"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Shipment {
  id: number;
  shipment_number: string;
  order_number: string;
  warehouse_code: string;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/warehouse/shipments/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setShipments(Array.isArray(data) ? data : []);
      })
      .catch(() =>
        setError("Could not load shipments. Check login, permissions, and API.")
      )
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-700";
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
        <h1 className="text-2xl font-bold text-blue-900">Shipments</h1>
        <p className="text-gray-600 text-sm">
          Outbound deliveries and tracking
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading shipments...</p>}
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
                <th className="text-left px-4 py-3 font-semibold">Shipment #</th>
                <th className="text-left px-4 py-3 font-semibold">Sales Order</th>
                <th className="text-left px-4 py-3 font-semibold">Warehouse</th>
                <th className="text-left px-4 py-3 font-semibold">Carrier</th>
                <th className="text-left px-4 py-3 font-semibold">Tracking</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No shipments found
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.shipment_number}</td>
                    <td className="px-4 py-3">{s.order_number || "—"}</td>
                    <td className="px-4 py-3">{s.warehouse_code || "—"}</td>
                    <td className="px-4 py-3">{s.carrier || "—"}</td>
                    <td className="px-4 py-3">{s.tracking_number || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColor(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                    </td>
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