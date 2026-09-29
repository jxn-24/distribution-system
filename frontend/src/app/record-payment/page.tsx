"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  order_number?: string;
  customer_name?: string;
  status: string;
  total_amount: string;
  amount_paid: string;
  balance_due?: string;
}

export default function RecordPaymentPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInvoices = () => {
    setLoading(true);
    api
      .get("/finance/invoices/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        const list = Array.isArray(data) ? data : [];
        setInvoices(
          list.filter((inv: Invoice) =>
            ["ISSUED", "PARTIALLY_PAID", "DRAFT"].includes(inv.status)
          )
        );
      })
      .catch(() => setError("Could not load invoices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const selected = invoices.find((i) => String(i.id) === invoiceId);

  useEffect(() => {
    if (selected) {
      setAmount(String(selected.balance_due || selected.total_amount || ""));
    }
  }, [invoiceId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!invoiceId) {
      setError("Select an invoice.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(
        `/finance/invoices/${invoiceId}/record-payment/`,
        {
          amount,
          payment_method: method,
          reference,
        }
      );
      setMessage(
        `Receipt ${res.data.receipt_number} saved. Invoice ${res.data.invoice_status}. Order ${res.data.order_number} → ${res.data.order_status}.`
      );
      setInvoiceId("");
      setReference("");
      loadInvoices();
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { detail?: string } } };
      setError(e2?.response?.data?.detail || "Could not record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black font-display">
          Record payment
        </h1>
        <p className="text-neutral-600 text-sm">
          Finance confirms cash, paybill, or card payment. Creates a receipt and
          moves a fully paid order to Ready to Pack.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 bg-emerald-50 text-emerald-800 text-sm p-3 rounded-lg">
          {message}
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white border border-neutral-100 rounded-xl p-5 max-w-xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Invoice</label>
          {loading ? (
            <p className="text-sm text-neutral-500">Loading invoices...</p>
          ) : (
            <select
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select invoice</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {inv.customer_name || "Customer"} —{" "}
                  {inv.status} — KES {inv.total_amount}
                </option>
              ))}
            </select>
          )}
        </div>

        {selected && (
          <p className="text-xs text-neutral-500">
            Order {selected.order_number || "—"} · Paid {selected.amount_paid} /
            {selected.total_amount}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Mobile money / Paybill</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Reference (M-Pesa code / bank ref)
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-amber-400 text-black font-medium px-4 py-2 rounded-lg hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Record payment"}
        </button>
      </form>
    </AppShell>
  );
}