"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface SalesOrder {
  id: number;
  order_number: string;
  customer_name: string;
  sales_person_name?: string | null;
  order_date: string;
  status: string;
  total_amount: number;
}
interface Option {
  id: number;
  name?: string;
  company_name?: string;
  sku?: string;
  wholesale_price?: string;
  retail_price?: string;
}
interface Line {
  product: string;
  priceType: string;
  enteredUnit: string;
  enteredQuantity: number;
  overridePrice: string;
}

const emptyLine = (): Line => ({
  product: "",
  priceType: "WHOLESALE",
  enteredUnit: "bale",
  enteredQuantity: 1,
  overridePrice: "",
});

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/sales/sales-orders/"),
      api.get("/inventory/warehouses/"),
      api.get("/inventory/products/"),
    ])
      .then(([ordersRes, warehousesRes, productsRes]) => {
        const rows = ordersRes.data.results ?? ordersRes.data;
        setOrders(Array.isArray(rows) ? rows : []);
        setWarehouses(warehousesRes.data.results ?? warehousesRes.data);
        setProducts(productsRes.data.results ?? productsRes.data);
      })
      .catch(() => setError("Could not load sales orders. Check login and permissions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateLine = (index: number, field: keyof Line, value: string | number) => {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  };

  const addLine = () => setLines((current) => [...current, emptyLine()]);
  const removeLine = (index: number) =>
    setLines((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));

  const linePrice = (line: Line) => {
    if (line.overridePrice) return line.overridePrice;
    const match = products.find((item) => String(item.id) === line.product);
    if (!match) return "";
    return line.priceType === "RETAIL" ? match.retail_price : match.wholesale_price;
  };

  const createOrder = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const customerRes = await api.post("/sales/customers/", {
        company_name: customerName,
        phone,
      });
      const customerId = customerRes.data.id;

      const items = lines
        .filter((line) => line.product)
        .map((line) => {
          const payload: Record<string, unknown> = {
            product: Number(line.product),
            price_type: line.priceType,
            entered_unit: line.enteredUnit,
            entered_quantity: Number(line.enteredQuantity),
          };
          if (line.overridePrice) {
            payload.unit_price = Number(line.overridePrice);
          }
          return payload;
        });

      if (items.length === 0) {
        setError("Add at least one product.");
        setBusy(false);
        return;
      }

      const res = await api.post("/sales/sales-orders/", {
        customer: customerId,
        warehouse: Number(warehouse),
        sales_person_name: salesPerson,
        notes,
        items,
      });
      setMessage(`Draft saved: ${res.data.order_number} for ${customerName}`);
      setCustomerName("");
      setPhone("");
      setSalesPerson("");
      setNotes("");
      setLines([emptyLine()]);
      load();
    } catch (err: any) {
      const detail = err?.response?.data;
      setError(
        typeof detail === "string" ? detail : JSON.stringify(detail) || "Could not save the order."
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmOrder = async (order: SalesOrder) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.patch(`/sales/sales-orders/${order.id}/`, { status: "CONFIRMED" });
      setMessage(`${order.order_number} confirmed and stock reserved.`);
      load();
    } catch {
      setError("Could not confirm. The product needs available stock on a batch.");
    } finally {
      setBusy(false);
    }
  };

  const cancelOrder = async (order: SalesOrder) => {
    if (!confirm(`Cancel ${order.order_number}? It will stay on the list as cancelled.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.patch(`/sales/sales-orders/${order.id}/`, { status: "CANCELLED" });
      setMessage(`${order.order_number} cancelled.`);
      load();
    } catch {
      setError("Could not cancel the order.");
    } finally {
      setBusy(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "READY_TO_PACK":
        return "bg-amber-100 text-amber-900";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";
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
        <h1 className="text-2xl font-bold text-neutral-950">Sales Orders</h1>
        <p className="text-sm text-neutral-600">
          Type the customer and the sales person. Add one line per product. Leave override blank to use the list price.
        </p>
      </div>

      <form onSubmit={createOrder} className="mb-6 space-y-4 rounded-xl bg-white p-4 shadow">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm font-medium text-neutral-800">
            Customer name
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
          </label>
          <label className="text-sm font-medium text-neutral-800">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
          </label>
          <label className="text-sm font-medium text-neutral-800">
            Sales person
            <input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} placeholder="Name of who took the order" className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
          </label>
          <label className="text-sm font-medium text-neutral-800">
            Warehouse
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
              <option value="">Select a warehouse</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-6">
              <label className="text-sm font-medium text-neutral-800 md:col-span-2">
                Product
                <select value={line.product} onChange={(e) => updateLine(index, "product", e.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
                  <option value="">Select a product</option>
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-neutral-800">
                Price type
                <select value={line.priceType} onChange={(e) => updateLine(index, "priceType", e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="RETAIL">Retail</option>
                </select>
              </label>
              <label className="text-sm font-medium text-neutral-800">
                Unit
                <select value={line.enteredUnit} onChange={(e) => updateLine(index, "enteredUnit", e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
                  <option value="bale">Bale</option>
                  <option value="polybag">Polybag</option>
                  <option value="pcs">Pieces</option>
                </select>
              </label>
              <label className="text-sm font-medium text-neutral-800">
                Quantity
                <input type="number" min={1} value={line.enteredQuantity} onChange={(e) => updateLine(index, "enteredQuantity", Number(e.target.value))} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
              </label>
              <label className="text-sm font-medium text-neutral-800">
                Override price
                <input
                  type="number"
                  step="0.01"
                  value={line.overridePrice}
                  onChange={(e) => updateLine(index, "overridePrice", e.target.value)}
                  placeholder="Optional"
                  className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950"
                />
              </label>
              <div className="flex items-end gap-2 md:col-span-6">
                <label className="flex-1 text-sm font-medium text-neutral-800">
                  Price used per piece, KES
                  <input value={linePrice(line) || ""} readOnly className="mt-1 min-h-11 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-neutral-700" />
                </label>
                {lines.length > 1 && (
                  <button type="button" onClick={() => removeLine(index)} className="mb-0.5 rounded-md border border-red-300 px-3 py-2 text-xs text-red-700">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addLine} className="rounded-md border border-neutral-400 px-3 py-2 text-sm font-medium text-neutral-800">
          Add line
        </button>

        <label className="block text-sm font-medium text-neutral-800">
          Notes
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>

        <button disabled={busy} className="min-h-11 w-full rounded-md bg-neutral-950 px-4 font-semibold text-amber-300 disabled:opacity-40">
          {busy ? "Saving…" : "Save draft"}
        </button>
      </form>

      {loading && <p className="text-neutral-500">Loading sales orders...</p>}
      {message && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Order #</th>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Sales person</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No sales orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/sales-orders/${order.id}`} className="text-blue-700 hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customer_name || "—"}</td>
                    <td className="px-4 py-3">{order.sales_person_name || "—"}</td>
                    <td className="px-4 py-3">{order.order_date}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{order.total_amount}</td>
                    <td className="px-4 py-3 text-right">
                      {order.status === "DRAFT" && (
                        <button disabled={busy} onClick={() => confirmOrder(order)} className="rounded bg-neutral-950 px-3 py-2 text-xs font-semibold text-amber-300 disabled:opacity-40">
                          Confirm
                        </button>
                      )}
                      {(order.status === "DRAFT" || order.status === "CONFIRMED") && (
                        <button
                          disabled={busy}
                          onClick={() => cancelOrder(order)}
                          className="ml-2 rounded border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                        >
                          Cancel
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