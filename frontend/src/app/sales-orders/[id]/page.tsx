"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Item {
  id: number;
  product_sku?: string;
  product_name?: string;
  quantity: number;
  entered_unit?: string;
  entered_quantity?: number;
  unit_price?: string;
  line_total?: string;
}

interface SalesOrder {
  id: number;
  order_number: string;
  customer_name?: string;
  sales_person_name?: string | null;
  order_date: string;
  status: string;
  total_amount: string | number;
  notes?: string | null;
  items?: Item[];
}

export default function SalesOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/sales/sales-orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Could not load order."));
  }, [id]);

  if (error) {
    return (
      <AppShell>
        <p className="text-red-600">{error}</p>
      </AppShell>
    );
  }
  if (!order) {
    return (
      <AppShell>
        <p className="text-neutral-500">Loading order...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/sales-orders" className="text-sm text-blue-700 hover:underline">
            ← Back to sales orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{order.order_number}</h1>
              <p className="text-sm text-neutral-500">{order.status}</p>
            </div>
            <div className="text-right text-sm">
              <p>{order.order_date}</p>
              <p className="font-semibold">Total: {order.total_amount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-neutral-500">Customer</p>
              <p className="font-medium">{order.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-neutral-500">Sales person</p>
              <p className="font-medium">{order.sales_person_name || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-neutral-500">Notes</p>
              <p className="font-medium">{order.notes || "—"}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit price</th>
                <th className="text-right py-2">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.product_sku || "—"}</td>
                  <td className="py-2">{item.product_name || "—"}</td>
                  <td className="py-2 text-right">
                    {item.entered_quantity ?? item.quantity}
                    {item.entered_unit ? ` ${item.entered_unit}` : ""}
                  </td>
                  <td className="py-2 text-right">{item.unit_price || "—"}</td>
                  <td className="py-2 text-right">{item.line_total || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.status === "DRAFT" && (
            <p className="text-sm text-neutral-600">
              Review the lines above. If correct, go back and click Confirm. If wrong, cancel and recreate.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}