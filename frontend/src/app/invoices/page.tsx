"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  order_number: string;
  customer_name: string;
  invoice_date: string;
  status: string;
  total_amount: string;
  payment_reference: string;
}
interface OrderOption {
  id: number;
  order_number: string;
  customer: number;
  status: string;
  total_amount: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [salesOrder, setSalesOrder] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    Promise.all([api.get("/finance/invoices/"), api.get("/sales/sales-orders/")])
      .then(([invoiceRes, orderRes]) => {
        setInvoices(invoiceRes.data.results ?? invoiceRes.data);
        const rows = orderRes.data.results ?? orderRes.data;
        setOrders(rows.filter((order: OrderOption) => order.status === "CONFIRMED"));
      })
      .catch(() => setError("Could not load invoices."));
  };

  useEffect(() => {
    load();
  }, []);

  const createInvoice = async (event: FormEvent) => {
    event.preventDefault();
    const order = orders.find((item) => String(item.id) === salesOrder);
    if (!order) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/finance/invoices/", {
        sales_order: order.id,
        customer: order.customer,
        invoice_date: new Date().toISOString().slice(0, 10),
        status: "ISSUED",
      });
      setMessage(`${res.data.invoice_number} · paybill ${res.data.payment_reference} · KES ${res.data.total_amount}`);
      setSalesOrder("");
      load();
    } catch (err: any) {
      setError(JSON.stringify(err?.response?.data) || "Could not create the invoice.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Invoices</h1>
        <p className="text-sm text-neutral-600">Issue an invoice for a confirmed order. The paybill reference is the account number.</p>
      </div>

      <form onSubmit={createInvoice} className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow md:flex-row md:items-end">
        <label className="flex-1 text-sm font-medium text-neutral-800">
          Confirmed order
          <select value={salesOrder} onChange={(event) => setSalesOrder(event.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
            <option value="">Select an order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>{order.order_number} · KES {order.total_amount}</option>
            ))}
          </select>
        </label>
        <button disabled={busy} className="min-h-11 rounded-md bg-neutral-950 px-5 font-semibold text-amber-300 disabled:opacity-40">
          {busy ? "Saving…" : "Issue invoice"}
        </button>
      </form>

      {message && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Invoice</th>
              <th className="px-4 py-3 text-left font-semibold">Order</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Paybill ref</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b">
                <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                <td className="px-4 py-3">{invoice.order_number}</td>
                <td className="px-4 py-3">{invoice.customer_name}</td>
                <td className="px-4 py-3 font-semibold">{invoice.payment_reference}</td>
                <td className="px-4 py-3 text-right">{invoice.total_amount}</td>
                <td className="px-4 py-3">{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}