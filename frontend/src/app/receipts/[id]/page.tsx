"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Item {
  product_sku: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

interface Receipt {
  id: number;
  receipt_number: string;
  invoice_number?: string;
  order_number?: string;
  customer_name?: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference?: string | null;
  notes?: string | null;
  items?: Item[];
}

const PAYBILL = "400200";
const ACCOUNT = "61611501";

export default function ReceiptPrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/finance/receipts/${id}/`)
      .then((res) => setReceipt(res.data))
      .catch(() => setError("Could not load receipt."));
  }, [id]);

  if (error) {
    return (
      <AppShell>
        <p className="text-red-600">{error}</p>
      </AppShell>
    );
  }
  if (!receipt) {
    return (
      <AppShell>
        <p className="text-gray-500">Loading receipt...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <a href="/receipts" className="text-sm text-blue-700 hover:underline">
            ← Back to receipts
          </a>
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
              <h1 className="text-2xl font-bold">Luna Soft Essentials</h1>
              <p className="text-sm text-gray-500">Payment receipt</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{receipt.receipt_number}</p>
              <p>{receipt.payment_date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{receipt.customer_name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Invoice</p>
              <p className="font-medium">{receipt.invoice_number || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Order</p>
              <p className="font-medium">{receipt.order_number || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Method</p>
              <p className="font-medium">{receipt.payment_method}</p>
            </div>
          </div>

          {receipt.payment_method === "PAYBILL" || receipt.payment_method === "MOBILE_MONEY" ? (
            <div className="mb-6 text-sm bg-neutral-50 rounded-lg p-3">
              <p>Paybill: <span className="font-mono">{PAYBILL}</span></p>
              <p>Account: <span className="font-mono">{ACCOUNT}</span></p>
              <p>M-Pesa code: <span className="font-mono">{receipt.reference || "—"}</span></p>
            </div>
          ) : (
            <p className="text-sm mb-6">
              Reference: {receipt.reference || "—"}
            </p>
          )}

          <table className="w-full text-sm mb-6">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(receipt.items || []).map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.product_sku}</td>
                  <td className="py-2">{item.product_name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{item.unit_price}</td>
                  <td className="py-2 text-right">{item.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right text-lg font-semibold">
            Amount received: KES {receipt.amount}
          </div>

          {receipt.notes && (
            <p className="mt-4 text-sm text-gray-600">Notes: {receipt.notes}</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}