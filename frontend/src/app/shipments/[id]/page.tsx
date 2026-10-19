"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Item {
  id: number;
  product_sku: string;
  product_name: string;
  quantity: number;
}

interface Shipment {
  id: number;
  shipment_number: string;
  order_number?: string;
  warehouse_code?: string;
  carrier?: string | null;
  tracking_number?: string | null;
  status: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  customer_name?: string;
  delivery_address?: string | null;
  customer_phone?: string | null;
  items?: Item[];
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/warehouse/shipments/${id}/`)
      .then((res) => setShipment(res.data))
      .catch(() => setError("Could not load shipment."));
  }, [id]);

  if (error) {
    return (
      <AppShell>
        <p className="text-red-600">{error}</p>
      </AppShell>
    );
  }
  if (!shipment) {
    return (
      <AppShell>
        <p className="text-neutral-500">Loading shipment...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link href="/shipments" className="text-sm text-blue-700 hover:underline">
            ← Back to shipments
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-neutral-950 text-amber-300 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Print
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-8 print:shadow-none">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">Delivery note</h1>
              <p className="text-sm text-neutral-500">Luna Soft Essentials</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{shipment.shipment_number}</p>
              <p>{shipment.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-neutral-500">Customer</p>
              <p className="font-medium">{shipment.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Phone</p>
              <p className="font-medium">{shipment.customer_phone || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Order</p>
              <p className="font-medium">{shipment.order_number || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Warehouse</p>
              <p className="font-medium">{shipment.warehouse_code || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-neutral-500">Delivery address</p>
              <p className="font-medium">{shipment.delivery_address || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Carrier</p>
              <p className="font-medium">{shipment.carrier || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Tracking</p>
              <p className="font-medium">{shipment.tracking_number || "—"}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {(shipment.items || []).map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.product_sku}</td>
                  <td className="py-2">{item.product_name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {shipment.notes && (
            <p className="text-sm text-neutral-600">Notes: {shipment.notes}</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}