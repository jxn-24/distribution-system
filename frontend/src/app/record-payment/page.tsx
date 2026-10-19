"use client";

import { FormEvent, useEffect, useState } from "react";
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
  payment_reference?: string;
}

const PAYBILL = "400200";
const ACCOUNT = "61611501";

export default function RecordPaymentPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("MOBILE_MONEY");
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
      const due = selected.balance_due ?? selected.total_amount;
      setAmount(due);
    } else {
      setAmount("");
    }
  }, [selected]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!invoiceId || !amount) {
      setError("Select an invoice and enter the amount.");
      return;
    }
    if (method === "MOBILE_MONEY" && !reference.trim()) {
      setError("Enter the M-Pesa code for Co-op paybill.");
      return;
    }

    setSaving(true);
    api
      .post("/finance/receipts/", {
        invoice: Number(invoiceId),
        amount,
        payment_method: method,
        reference: reference.trim(),
        payment_date: new Date().toISOString().slice(0, 10),
      })
      .then(() => {
        setMessage("Payment recorded.");
        setInvoiceId("");
        setAmount("");
        setReference("");
        loadInvoices();
      })
      .catch((err) => {
        const detail = err.response?.data?.detail || err.response?.data;
        setError(
          typeof detail === "string"
            ? detail
            : "Could not record payment. Check the amount and try again."
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Record payment</h1>
        <p className="text-gray-600 text-sm">
          All customers pay before delivery. Co-op paybill uses the fixed account below.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl shadow p-6 max-w-lg space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Invoice</label>
          <select
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
            disabled={loading}
          >
            <option value="">Select invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} — {inv.customer_name || "Customer"} — KES{" "}
                {inv.balance_due ?? inv.total_amount}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="rounded-lg bg-neutral-50 p-4 text-sm space-y-1">
            <p>
              <span className="text-neutral-500">Order:</span>{" "}
              {selected.order_number || "—"}
            </p>
            <p>
              <span className="text-neutral-500">Invoice:</span>{" "}
              {selected.invoice_number}
            </p>
            <p>
              <span className="text-neutral-500">Paid:</span>{" "}
              {selected.amount_paid} of {selected.total_amount}
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="font-medium">Co-op Lipa Na M-Pesa</p>
              <p>Paybill: <span className="font-mono">{PAYBILL}</span></p>
              <p>Account: <span className="font-mono">{ACCOUNT}</span></p>
              <p className="text-neutral-500 text-xs">
                Customer pays, then you enter the M-Pesa code below.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
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
            <option value="MOBILE_MONEY">Co-op paybill</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {method === "MOBILE_MONEY"
              ? "M-Pesa code (required)"
              : "Reference (optional)"}
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder={
              method === "MOBILE_MONEY" ? "e.g. QK12345678" : "Optional"
            }
            required={method === "MOBILE_MONEY"}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-950 text-amber-300 font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Record payment"}
        </button>
      </form>
    </AppShell>
  );
}