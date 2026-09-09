"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface InventoryRow {
  id: number;
  product_sku: string;
  product_name: string;
  batch_number: string | null;
  warehouse_code: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
}

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/inventory/inventory/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load inventory. Check login and permissions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Inventory</h1>
        <p className="text-gray-600 text-sm">
          Current stock levels (on-hand, reserved, available)
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading inventory...</p>}
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
                <th className="text-left px-4 py-3 font-semibold">SKU</th>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">Batch</th>
                <th className="text-left px-4 py-3 font-semibold">Warehouse</th>
                <th className="text-right px-4 py-3 font-semibold">On Hand</th>
                <th className="text-right px-4 py-3 font-semibold">Reserved</th>
                <th className="text-right px-4 py-3 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.product_sku}</td>
                    <td className="px-4 py-3">{row.product_name}</td>
                    <td className="px-4 py-3">{row.batch_number || "—"}</td>
                    <td className="px-4 py-3">{row.warehouse_code}</td>
                    <td className="px-4 py-3 text-right">{row.quantity_on_hand}</td>
                    <td className="px-4 py-3 text-right">{row.quantity_reserved}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {row.quantity_available}
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