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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/warehouse/shipments/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setShipments(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load shipments. Check login, permissions, and API."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markDelivered = async (shipment: Shipment) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.patch(`/warehouse/shipments/${shipment.id}/`, { status: "DELIVERED" });
      setMessage(`${shipment.shipment_number} marked delivered.`);
      load();
    } catch (err: any) {
      setError(JSON.stringify(err?.response?.data) || "Could not mark this shipment delivered.");
    } finally {
      setBusy(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-neutral-950">Shipments</h1>
        <p className="text-sm text-neutral-600">Outbound deliveries. Mark delivered when the client has signed.</p>
      </div>

      {loading && <p className="text-neutral-500">Loading shipments...</p>}
      {message && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Shipment #</th>
                <th className="px-4 py-3 text-left font-semibold">Sales Order</th>
                <th className="px-4 py-3 text-left font-semibold">Warehouse</th>
                <th className="px-4 py-3 text-left font-semibold">Carrier</th>
                <th className="px-4 py-3 text-left font-semibold">Tracking</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No shipments found</td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{shipment.shipment_number}</td>
                    <td className="px-4 py-3">{shipment.order_number || "—"}</td>
                    <td className="px-4 py-3">{shipment.warehouse_code || "—"}</td>
                    <td className="px-4 py-3">{shipment.carrier || "—"}</td>
                    <td className="px-4 py-3">{shipment.tracking_number || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor(shipment.status)}`}>{shipment.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {shipment.status !== "DELIVERED" && shipment.status !== "CANCELLED" && (
                        <button disabled={busy} onClick={() => markDelivered(shipment)} className="rounded bg-neutral-950 px-3 py-2 text-xs font-semibold text-amber-300 disabled:opacity-40">
                          Mark delivered
                        </button>
                      )}
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