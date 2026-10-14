"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface SalesOrder {
  id: number;
  order_number: string;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: number;
}
interface Option {
  id: number;
  name?: string;
  company_name?: string;
  sku?: string;
  selling_price?: string;
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [customer, setCustomer] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/sales/sales-orders/"),
      api.get("/sales/customers/"),
      api.get("/inventory/warehouses/"),
      api.get("/inventory/products/"),
    ])
      .then(([ordersRes, customersRes, warehousesRes, productsRes]) => {
        const rows = ordersRes.data.results ?? ordersRes.data;
        setOrders(Array.isArray(rows) ? rows : []);
        setCustomers(customersRes.data.results ?? customersRes.data);
        setWarehouses(warehousesRes.data.results ?? warehousesRes.data);
        setProducts(productsRes.data.results ?? productsRes.data);
      })
      .catch(() => setError("Could not load sales orders. Check login and permissions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onProduct = (id: string) => {
    setProduct(id);
    const match = products.find((item) => String(item.id) === id);
    if (match?.selling_price) setUnitPrice(match.selling_price);
  };

  const createOrder = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/sales/sales-orders/", {
        customer: Number(customer),
        warehouse: Number(warehouse),
        notes,
        items: [
          {
            product: Number(product),
            quantity: Number(quantity),
            unit_price: unitPrice,
          },
        ],
      });
      setMessage(`Draft saved: ${res.data.order_number}`);
      setQuantity(1);
      setNotes("");
      load();
    } catch (err: any) {
      const detail = err?.response?.data;
      setError(
        typeof detail === "string"
        ? detail
        : JSON.stringify(detail) || "Could not save the order."
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
        <p className="text-sm text-neutral-600">Create a draft, then confirm it to reserve stock.</p>
      </div>

      <form onSubmit={createOrder} className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-2">
        <label className="text-sm font-medium text-neutral-800">
          Customer
          <select value={customer} onChange={(event) => setCustomer(event.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
            <option value="">Select a customer</option>
            {customers.map((item) => (
              <option key={item.id} value={item.id}>{item.company_name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Warehouse
          <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
            <option value="">Select a warehouse</option>
            {warehouses.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Product
          <select value={product} onChange={(event) => onProduct(event.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
            <option value="">Select a product</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Quantity in packages
          <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Unit price, KES
          <input value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Notes
          <input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <button disabled={busy} className="min-h-11 rounded-md bg-neutral-950 px-4 font-semibold text-amber-300 disabled:opacity-40 md:col-span-2">
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
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No sales orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">{order.customer_name || "—"}</td>
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