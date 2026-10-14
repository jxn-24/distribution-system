"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  payment_reference?: string;
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
        setInvoices(list.filter((inv: Invoice) => ["ISSUED", "PARTIALLY_PAID", "DRAFT"].includes(inv.status)));
      })
      .catch(() => setError("Could not load invoices."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const selected = invoices.find((invoice) => String(invoice.id) === invoiceId);

  useEffect(() => {
    if (!selected) return;
    setAmount(String(selected.balance_due || selected.total_amount || ""));
    if (method === "MOBILE_MONEY") setReference(selected.payment_reference || "");
  }, [invoiceId, method]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!invoiceId) {
      setError("Select an invoice.");
      return;
    }
    if (method !== "CASH" && !reference.trim()) {
      setError("Enter the paybill account number or the bank or card reference.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/finance/invoices/${invoiceId}/record-payment/`, {
        amount,
        payment_method: method,
        reference,
      });
      setMessage(`Receipt ${res.data.receipt_number} saved. Invoice ${res.data.invoice_status}. Order ${res.data.order_number} → ${res.data.order_status}.`);
      setInvoiceId("");
      setReference("");
      loadInvoices();
    } catch (err: unknown) {
      const detail = err as { response?: { data?: { detail?: string } } };
      setError(detail?.response?.data?.detail || "Could not record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Record payment</h1>
        <p className="text-sm text-neutral-600">Cash is typed in. Paybill uses the invoice account number. A full payment moves the order to Ready to Pack.</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-neutral-100 bg-white p-5">
        <label className="block text-sm font-medium text-neutral-800">
          Invoice
          {loading ? <p className="mt-1 text-sm text-neutral-500">Loading invoices...</p> : (
            <select value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-neutral-950">
              <option value="">Select invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} — {invoice.customer_name || "Customer"} — KES {invoice.total_amount}
                </option>
              ))}
            </select>
          )}
        </label>

        {selected && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
            <p>Order {selected.order_number || "—"}</p>
            <p>Paid {selected.amount_paid} of {selected.total_amount}</p>
            <p className="font-semibold">Paybill account: {selected.payment_reference || "Not set"}</p>
          </div>
        )}

        <label className="block text-sm font-medium text-neutral-800">
          Amount (KES)
          <input type="number" step="0.01" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} required className="mt-1 min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-neutral-950" />
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          Method
          <select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-neutral-950">
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Co-op paybill</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          {method === "MOBILE_MONEY" ? "Paybill account number" : "Reference"}
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder={method === "CASH" ? "Optional" : "Required"} className="mt-1 min-h-11 w-full rounded-lg border border-neutral-300 px-3 text-neutral-950" />
        </label>

        <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-neutral-950 px-4 font-semibold text-amber-300 disabled:opacity-50">
          {saving ? "Saving..." : "Record payment"}
        </button>
      </form>
    </AppShell>
  );
}