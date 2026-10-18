"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface Row {
  sku: string;
  name: string;
  pieces: number;
  revenue: string;
  cost: string;
  margin: string;
  margin_pct: string;
}

const COLORS = ["#d4a017", "#1a1a1a", "#8a7340", "#4a4a4a", "#c9a227"];

export default function MarginPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/sales/margin-report/")
      .then((res) => setRows(res.data))
      .catch(() => setError("Could not load the report."))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0);
  const totalCost = rows.reduce((sum, r) => sum + Number(r.cost), 0);
  const totalMargin = totalRevenue - totalCost;
  const totalPieces = rows.reduce((sum, r) => sum + r.pieces, 0);
  const overallPct = totalRevenue ? ((totalMargin / totalRevenue) * 100).toFixed(1) : "0";

  const chartData = rows.map((r) => ({
    name: r.sku,
    revenue: Number(r.revenue),
    cost: Number(r.cost),
    margin: Number(r.margin),
  }));

  const pieData = rows.map((r) => ({
    name: r.sku,
    value: Number(r.revenue),
  }));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-950">Margin & stock evaluation</h1>
        <p className="text-sm text-neutral-600">Revenue, cost, and margin by product. Confirmed orders only.</p>
      </div>

      {loading && <p className="text-neutral-500">Loading…</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Pieces sold</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">{totalPieces}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Revenue</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Cost</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">{totalCost.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-neutral-950 p-4 text-white shadow">
              <p className="text-xs uppercase tracking-wide text-amber-300">Margin</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">{totalMargin.toLocaleString()}</p>
              <p className="text-xs text-neutral-400">{overallPct}%</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Revenue vs cost</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1a1a1a" name="Revenue" />
                    <Bar dataKey="cost" fill="#d4a017" name="Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow">
              <h2 className="mb-3 text-sm font-semibold text-neutral-800">Revenue share</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="w-full text-sm">
              <thead className="border-b bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-right font-semibold">Pieces</th>
                  <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Margin</th>
                  <th className="px-4 py-3 text-right font-semibold">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No confirmed sales yet</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.sku} className="border-b">
                      <td className="px-4 py-3 font-medium">{row.sku}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3 text-right">{row.pieces}</td>
                      <td className="px-4 py-3 text-right">{Number(row.revenue).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{Number(row.cost).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{Number(row.margin).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{row.margin_pct}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}