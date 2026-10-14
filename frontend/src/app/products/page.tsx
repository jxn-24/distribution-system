"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";

interface Product {
  id: number;
  sku: string;
  name: string;
  category_name: string | null;
  unit: string;
  selling_price: string;
  is_active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pkg");
  const [sellingPrice, setSellingPrice] = useState("");
  const [packingNote, setPackingNote] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/inventory/products/")
      .then((res) => {
        const data = res.data.results || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load products. Are you logged in?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post("/inventory/products/", {
        sku: sku.trim(),
        name: name.trim(),
        unit,
        selling_price: sellingPrice,
        packing_note: packingNote,
        track_batches: true,
        is_active: true,
      });
      setMessage(`${sku.trim()} added. Receive stock on Scan Stock.`);
      setSku("");
      setName("");
      setSellingPrice("");
      setPackingNote("");
      load();
    } catch (err: any) {
      setError(JSON.stringify(err?.response?.data) || "Could not add the product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Products</h1>
        <p className="text-sm text-neutral-600">Add a SKU here. This does not add warehouse stock.</p>
      </div>

      <form onSubmit={createProduct} className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-2">
        <label className="text-sm font-medium text-neutral-800">
          SKU
          <input value={sku} onChange={(event) => setSku(event.target.value)} required placeholder="LS-PAD-290" className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Luna Soft Sanitary Pads 290mm" className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Unit
          <select value={unit} onChange={(event) => setUnit(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950">
            <option value="pkg">Package</option>
            <option value="pcs">Pieces</option>
            <option value="box">Box</option>
            <option value="carton">Carton</option>
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-800">
          Selling price, KES
          <input value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} required placeholder="120.00" className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <label className="text-sm font-medium text-neutral-800 md:col-span-2">
          Packing note
          <input value={packingNote} onChange={(event) => setPackingNote(event.target.value)} placeholder="8 pcs/bag, 10 bags/box" className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-neutral-950" />
        </label>
        <button disabled={busy} className="min-h-11 rounded-md bg-neutral-950 px-4 font-semibold text-amber-300 disabled:opacity-40 md:col-span-2">
          {busy ? "Saving…" : "Add product"}
        </button>
      </form>

      {loading && <p className="text-neutral-500">Loading products...</p>}
      {message && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && (
        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">SKU</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Unit</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{product.sku}</td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.category_name || "—"}</td>
                    <td className="px-4 py-3">{product.unit}</td>
                    <td className="px-4 py-3 text-right">{product.selling_price}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
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