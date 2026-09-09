"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
    api
      .get("/inventory/products/")
      .then((res) => {
        const data = res.data.results || res.data;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Could not load products. Are you logged in?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Products</h1>
        <p className="text-gray-600 text-sm">Product catalog / SKUs</p>
      </div>

      {loading && <p className="text-gray-500">Loading products...</p>}
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
                <th className="text-left px-4 py-3 font-semibold">SKU</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Unit</th>
                <th className="text-right px-4 py-3 font-semibold">Price</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.sku}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.category_name || "—"}</td>
                  <td className="px-4 py-3">{p.unit}</td>
                  <td className="px-4 py-3 text-right">{p.selling_price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
        

    
      
            
         