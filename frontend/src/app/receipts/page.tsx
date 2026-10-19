"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Receipt {
  id: number;
  receipt_number: string;
  invoice_number?: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference?: string | null;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/finance/receipts/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        setReceipts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load receipts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Receipts</h1>
        <p className="text-gray-600 text-sm">Payments recorded against invoices</p>
      </div>

      {loading && <p className="text-gray-500">Loading receipts...</p>}
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
                <th className="text-left px-4 py-3 font-semibold">Receipt</th>
                <th className="text-left px-4 py-3 font-semibold">Invoice</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Method</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No receipts yet
                  </td>
                </tr>
              )}
              {receipts.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/receipts/${r.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {r.receipt_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.invoice_number || "—"}</td>
                  <td className="px-4 py-3">{r.payment_date}</td>
                  <td className="px-4 py-3">{r.payment_method}</td>
                  <td className="px-4 py-3 text-right">{r.amount}</td>
                  <td className="px-4 py-3">{r.reference || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}