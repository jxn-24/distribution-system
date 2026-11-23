"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const adminBaseUrl = new URL(
  "/admin/",
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
).toString();

const quickActionRoutes: Record<string, string> = {
  "Manage Users & Roles": `${adminBaseUrl}users/user/`,
  "Inventory Overview": "/inventory",
  "Inventory": "/inventory",
  "Sales Orders": "/sales-orders",
  "View Sales Orders": "/sales-orders",
  "Purchase Orders": "/purchase-orders",
  "Warehouse Tasks": "/warehouse/scan",
  "Receive Goods": "/warehouse/scan?mode=receive",
  "Scan to Pick": "/warehouse/scan?mode=pick",
  "Shipments": "/shipments",
  "View Shipments": "/shipments",
  "Products": "/products",
  "Browse Products": "/products",
  "Order History": "/sales-orders",
  "My Orders": "/sales-orders",
};

/* ---------- Data from the API ---------- */

interface SalesOrder {
  id: number;
  order_number: string;
  customer_name?: string | null;
  order_date: string;
  status: string;
  total_amount: number | string;
}
interface Shipment {
  id: number;
  shipment_number: string;
  order_number?: string | null;
  customer_name?: string | null;
  status: string;
  delivered_at?: string | null;
}
interface InventoryRow {
  product: number;
  quantity_available: number;
}
interface Product {
  id: number;
  sku: string;
  name: string;
  min_stock_level: number;
  is_active: boolean;
}
interface Invoice {
  id: number;
  invoice_number: string;
  customer_name?: string | null;
  status: string;
  due_date?: string | null;
  total_amount: number | string;
  amount_paid: number | string;
}
interface MarginRow {
  revenue: string;
  margin: string;
}

type Source = "orders" | "shipments" | "inventory" | "products" | "invoices" | "margin";

const endpoints: Record<Source, string> = {
  orders: "/sales/sales-orders/",
  shipments: "/warehouse/shipments/",
  inventory: "/inventory/inventory/",
  products: "/inventory/products/",
  invoices: "/finance/invoices/",
  margin: "/sales/margin-report/",
};

interface Data {
  orders?: SalesOrder[];
  shipments?: Shipment[];
  inventory?: InventoryRow[];
  products?: Product[];
  invoices?: Invoice[];
  margin?: MarginRow[];
}

/* ---------- What each role sees ---------- */

type Role = "full" | "director" | "finance" | "warehouse" | "sales" | "customer" | "none";
type TileId = "awaitingPayment" | "readyToPack" | "drafts" | "shipPending" | "inTransit" | "lowStock" | "unpaid" | "overdue" | "myOpen";
type AttentionId = "overdue" | "awaitingPayment" | "readyToPack" | "drafts" | "shipPending" | "lowStock" | "myOpen";

function resolveRole(names: string[]): Role {
  const has = (...n: string[]) => n.some((x) => names.includes(x));
  if (has("Super Admin", "Admin")) return "full";
  if (has("Director")) return "director";
  if (has("Finance")) return "finance";
  if (has("Warehouse")) return "warehouse";
  if (has("Sales", "Sales / Account Managers", "Account Manager", "Sales Agent")) return "sales";
  if (has("Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler")) return "customer";
  return "none";
}

const roleView: Record<Role, { label: string; tiles: TileId[]; attention: AttentionId[]; health: boolean; quickLinks: string[] }> = {
  full: {
    label: "Admin",
    tiles: ["awaitingPayment", "readyToPack", "unpaid", "lowStock"],
    attention: ["overdue", "awaitingPayment", "readyToPack", "lowStock"],
    health: true,
    quickLinks: ["Inventory Overview", "Sales Orders", "Purchase Orders", "Warehouse Tasks"],
  },
  director: {
    label: "Director · read-only",
    tiles: ["awaitingPayment", "readyToPack", "unpaid", "lowStock"],
    attention: ["overdue", "awaitingPayment", "readyToPack", "lowStock"],
    health: true,
    quickLinks: ["Inventory", "Sales Orders", "Purchase Orders"],
  },
  finance: {
    label: "Finance",
    tiles: ["awaitingPayment", "unpaid", "overdue", "inTransit"],
    attention: ["overdue", "awaitingPayment"],
    health: true,
    quickLinks: ["Sales Orders", "Purchase Orders"],
  },
  warehouse: {
    label: "Warehouse",
    tiles: ["readyToPack", "shipPending", "inTransit", "lowStock"],
    attention: ["readyToPack", "shipPending", "lowStock"],
    health: false,
    quickLinks: ["Receive Goods", "Scan to Pick", "View Shipments", "Inventory"],
  },
  sales: {
    label: "Sales",
    tiles: ["drafts", "awaitingPayment", "readyToPack", "inTransit"],
    attention: ["awaitingPayment", "drafts", "readyToPack"],
    health: false,
    quickLinks: ["View Sales Orders", "Products"],
  },
  customer: {
    label: "Customer portal",
    tiles: ["myOpen", "inTransit"],
    attention: ["myOpen"],
    health: false,
    quickLinks: ["My Orders", "Browse Products"],
  },
  none: { label: "", tiles: [], attention: [], health: false, quickLinks: [] },
};

const tileSources: Record<TileId, Source[]> = {
  awaitingPayment: ["orders"],
  readyToPack: ["orders"],
  drafts: ["orders"],
  myOpen: ["orders"],
  shipPending: ["shipments"],
  inTransit: ["shipments"],
  lowStock: ["inventory", "products"],
  unpaid: ["invoices"],
  overdue: ["invoices"],
};
const attentionSources: Record<AttentionId, Source[]> = {
  overdue: ["invoices"],
  awaitingPayment: ["orders"],
  readyToPack: ["orders"],
  drafts: ["orders"],
  myOpen: ["orders"],
  shipPending: ["shipments"],
  lowStock: ["inventory", "products"],
};

function sourcesFor(role: Role): Source[] {
  const view = roleView[role];
  const set = new Set<Source>();
  view.tiles.forEach((t) => tileSources[t].forEach((s) => set.add(s)));
  view.attention.forEach((a) => attentionSources[a].forEach((s) => set.add(s)));
  if (view.health) ["orders", "shipments", "margin"].forEach((s) => set.add(s as Source));
  return [...set];
}

/* ---------- Derived figures ---------- */

const money = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const num = (v: number | string | null | undefined) => Number(v) || 0;
const kes = (v: number) => `KES ${money.format(Math.round(v))}`;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const unpaidStatuses = ["ISSUED", "PARTIALLY_PAID"];
const closedOrder = ["DELIVERED", "CANCELLED"];

function derive(data: Data, today: Date) {
  const orders = data.orders ?? [];
  const byStatus = (s: string) => orders.filter((o) => o.status === s);
  const todayIso = isoDay(today);
  const monthPrefix = todayIso.slice(0, 7);

  const invoices = (data.invoices ?? []).filter((i) => unpaidStatuses.includes(i.status));
  const balance = (i: Invoice) => Math.max(0, num(i.total_amount) - num(i.amount_paid));
  const overdue = invoices
    .filter((i) => i.due_date && i.due_date < todayIso)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1));

  let lowStock: { product: Product; available: number }[] = [];
  if (data.inventory && data.products) {
    const available = new Map<number, number>();
    data.inventory.forEach((row) => available.set(row.product, (available.get(row.product) ?? 0) + num(row.quantity_available)));
    lowStock = data.products
      .filter((p) => p.is_active && p.min_stock_level > 0)
      .map((p) => ({ product: p, available: available.get(p.id) ?? 0 }))
      .filter((x) => x.available < x.product.min_stock_level)
      .sort((a, b) => a.available / a.product.min_stock_level - b.available / b.product.min_stock_level);
  }

  const shipments = data.shipments ?? [];
  const monthOrders = orders.filter((o) => o.order_date?.startsWith(monthPrefix) && !["DRAFT", "CANCELLED"].includes(o.status));
  const marginRows = data.margin ?? [];
  const marginRevenue = marginRows.reduce((s, r) => s + num(r.revenue), 0);
  const marginTotal = marginRows.reduce((s, r) => s + num(r.margin), 0);

  return {
    awaitingPayment: byStatus("CONFIRMED"),
    readyToPack: byStatus("READY_TO_PACK"),
    drafts: byStatus("DRAFT"),
    myOpen: orders.filter((o) => !closedOrder.includes(o.status)),
    shipPending: shipments.filter((s) => s.status === "PENDING"),
    inTransit: shipments.filter((s) => s.status === "IN_TRANSIT"),
    unpaid: invoices,
    unpaidTotal: invoices.reduce((s, i) => s + balance(i), 0),
    overdue,
    overdueTotal: overdue.reduce((s, i) => s + balance(i), 0),
    balance,
    lowStock,
    health: {
      monthTotal: monthOrders.reduce((s, o) => s + num(o.total_amount), 0),
      monthCount: monthOrders.length,
      margin: marginTotal,
      marginPct: marginRevenue ? (marginTotal / marginRevenue) * 100 : 0,
      deliveredMonth: shipments.filter((s) => s.delivered_at?.startsWith(monthPrefix)).length,
    },
  };
}

type Derived = ReturnType<typeof derive>;

/* ---------- Count-up for tile figures ---------- */

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || start === target) {
      from.current = target;
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    const began = performance.now();
    const duration = 650;
    let id = 0;
    const step = (now: number) => {
      const t = Math.min((now - began) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * t); // exponential ease-out
      setValue(start + (target - start) * (t === 1 ? 1 : eased));
      if (t < 1) id = requestAnimationFrame(step);
      else from.current = target;
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return value;
}

/* ---------- Pieces ---------- */

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

interface TileSpec {
  id: TileId;
  label: string;
  value: number;
  detail?: string;
  href: string;
}

function Tile({ tile }: { tile: TileSpec }) {
  const shown = useCountUp(tile.value);
  const idle = tile.value === 0;
  const text = money.format(Math.round(shown));
  const finalText = money.format(tile.value);
  return (
    <Link
      href={tile.href}
      aria-label={`${tile.label}: ${finalText}${tile.detail ? `, ${tile.detail}` : ""}`}
      className={`glass-tile group flex min-h-28 flex-col p-4 transition-colors hover:border-amber-300/50 active:border-amber-300/50 ${focusRing}`}
    >
      <span aria-hidden="true" className="flex items-start justify-between gap-2">
        <span className={`font-display text-[2rem] font-semibold leading-none tabular-nums ${idle ? "text-neutral-400" : "text-amber-300"}`}>
          {text}
        </span>
        <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-colors group-hover:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 5l5 5-5 5" />
        </svg>
      </span>
      <span aria-hidden="true" className="mt-2.5 block">
        <span className="block text-sm font-medium text-neutral-100">{tile.label}</span>
        {tile.detail && <span className="mt-0.5 block text-xs text-neutral-300">{tile.detail}</span>}
      </span>
    </Link>
  );
}

function TileSkeleton() {
  return (
    <div aria-hidden="true" className="glass-tile flex min-h-28 flex-col gap-3 p-4">
      <span className="h-8 w-12 rounded bg-white/10 motion-safe:animate-pulse" />
      <span className="h-3.5 w-24 rounded bg-white/10 motion-safe:animate-pulse" />
    </div>
  );
}

const badgeTone = {
  info: "bg-blue-100 text-blue-700",
  wait: "bg-amber-100 text-amber-900",
  error: "bg-red-100 text-red-700",
} as const;

interface AttentionRow {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: keyof typeof badgeTone;
  amount?: string;
  href: string;
  group: AttentionId;
}

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------- Page ---------- */

function Dashboard() {
  const { user } = useAuth();
  const roleNames = useMemo(() => user?.roles.map((r) => r.name) ?? [], [user]);
  const role = resolveRole(roleNames);
  const view = roleView[role];
  const [now] = useState(() => new Date());
  const [data, setData] = useState<Data>({});
  const [loading, setLoading] = useState(view.tiles.length > 0);
  const [failed, setFailed] = useState(false);

  const fetchAll = useCallback(() => {
    const sources = sourcesFor(role);
    return Promise.allSettled(sources.map((s) => api.get(endpoints[s]))).then((results) => {
      const next: Data = {};
      let networkFailure = false;
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const body = r.value.data?.results ?? r.value.data;
          (next as Record<Source, unknown>)[sources[i]] = Array.isArray(body) ? body : [];
        } else {
          // A refused call (401/403) means this role may not see that figure: hide it quietly.
          const status = isAxiosError(r.reason) ? r.reason.response?.status : undefined;
          if (status !== 401 && status !== 403) networkFailure = true;
        }
      });
      setData(next);
      setFailed(networkFailure);
      setLoading(false);
    });
  }, [role]);

  useEffect(() => {
    if (view.tiles.length) fetchAll();
  }, [fetchAll, view.tiles.length]);

  const retry = () => {
    setLoading(true);
    fetchAll();
  };

  if (!user) return null;
  const d: Derived = derive(data, now);
  const has = (sources: Source[]) => sources.every((s) => data[s] !== undefined);
  const paymentHref = role === "finance" || role === "full" ? "/record-payment" : "/sales-orders";

  const allTiles: Record<TileId, Omit<TileSpec, "id">> = {
    awaitingPayment: {
      label: "Awaiting payment",
      value: d.awaitingPayment.length,
      detail: d.awaitingPayment.length ? kes(d.awaitingPayment.reduce((s, o) => s + num(o.total_amount), 0)) : undefined,
      href: paymentHref,
    },
    readyToPack: { label: "Ready to pack", value: d.readyToPack.length, href: role === "warehouse" || role === "full" ? "/ready-to-pack" : "/sales-orders" },
    drafts: { label: "Draft orders", value: d.drafts.length, href: "/sales-orders" },
    myOpen: { label: "Orders in progress", value: d.myOpen.length, href: "/sales-orders" },
    shipPending: { label: "Shipments to send", value: d.shipPending.length, href: "/shipments" },
    inTransit: { label: "In transit", value: d.inTransit.length, href: "/shipments" },
    lowStock: { label: "Low stock", value: d.lowStock.length, detail: `${d.lowStock.length === 1 ? "product" : "products"} under minimum`, href: "/inventory" },
    unpaid: {
      label: "Unpaid invoices",
      value: d.unpaid.length,
      detail: d.unpaid.length ? `${kes(d.unpaidTotal)} due` : undefined,
      href: "/invoices",
    },
    overdue: {
      label: "Overdue",
      value: d.overdue.length,
      detail: d.overdue.length ? kes(d.overdueTotal) : undefined,
      href: "/invoices",
    },
  };
  const tiles: TileSpec[] = view.tiles.filter((t) => has(tileSources[t])).map((id) => ({ id, ...allTiles[id] }));

  const attention: AttentionRow[] = [];
  view.attention.forEach((kind) => {
    if (!has(attentionSources[kind])) return;
    if (kind === "overdue") {
      d.overdue.forEach((i) => {
        const days = Math.max(1, Math.round((now.getTime() - new Date(`${i.due_date}T00:00:00`).getTime()) / 86_400_000));
        attention.push({ key: `inv-${i.id}`, title: i.invoice_number, subtitle: i.customer_name ?? "Invoice", badge: `${days} ${days === 1 ? "day" : "days"} overdue`, tone: "error", amount: kes(d.balance(i)), href: "/invoices", group: "overdue" });
      });
    }
    if (kind === "awaitingPayment" || kind === "readyToPack" || kind === "drafts" || kind === "myOpen") {
      const list = d[kind];
      const meta = {
        awaitingPayment: { badge: "Awaiting payment", tone: "info" as const },
        readyToPack: { badge: "Ready to pack", tone: "wait" as const },
        drafts: { badge: "Draft", tone: "info" as const },
        myOpen: { badge: "In progress", tone: "info" as const },
      }[kind];
      list.forEach((o) =>
        attention.push({
          key: `so-${kind}-${o.id}`,
          title: o.order_number,
          subtitle: o.customer_name ?? "Sales order",
          badge: kind === "myOpen" ? o.status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : meta.badge,
          tone: meta.tone,
          amount: kes(num(o.total_amount)),
          href: kind === "readyToPack" && (role === "warehouse" || role === "full") ? "/ready-to-pack" : `/sales-orders/${o.id}`,
          group: kind,
        }),
      );
    }
    if (kind === "shipPending") {
      d.shipPending.forEach((s) =>
        attention.push({ key: `sh-${s.id}`, title: s.shipment_number, subtitle: [s.order_number, s.customer_name].filter(Boolean).join(" · ") || "Shipment", badge: "To send", tone: "wait", href: `/shipments/${s.id}`, group: "shipPending" }),
      );
    }
    if (kind === "lowStock") {
      d.lowStock.forEach(({ product, available }) =>
        attention.push({ key: `p-${product.id}`, title: product.sku, subtitle: product.name, badge: "Low stock", tone: "wait", amount: `${money.format(available)} of ${money.format(product.min_stock_level)} min`, href: "/inventory", group: "lowStock" }),
      );
    }
  });
  const attentionShown = attention.slice(0, 8);
  const readyHref = role === "warehouse" || role === "full" ? "/ready-to-pack" : "/sales-orders";
  const groupInfo: Record<AttentionId, { one: string; many: string; href: string }> = {
    overdue: { one: "overdue invoice", many: "overdue invoices", href: "/invoices" },
    awaitingPayment: { one: "order awaiting payment", many: "orders awaiting payment", href: paymentHref },
    readyToPack: { one: "order ready to pack", many: "orders ready to pack", href: readyHref },
    drafts: { one: "draft order", many: "draft orders", href: "/sales-orders" },
    myOpen: { one: "order in progress", many: "orders in progress", href: "/sales-orders" },
    shipPending: { one: "shipment to send", many: "shipments to send", href: "/shipments" },
    lowStock: { one: "low-stock product", many: "low-stock products", href: "/inventory" },
  };
  const hiddenGroups = [...attention.slice(8).reduce((m, r) => m.set(r.group, (m.get(r.group) ?? 0) + 1), new Map<AttentionId, number>())];
  const name = user.first_name?.trim() || user.username;
  const dateLine = new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const showHealth = view.health && !loading && (has(["orders"]) || has(["margin"]) || has(["shipments"]));

  return (
    <div className="-m-4 sm:-m-6">
      {/* Night band: greeting, glass figures, health row, quick actions */}
      <section aria-labelledby="dash-greeting" className="night-band overflow-hidden px-4 pb-6 pt-6 text-neutral-100 sm:px-6 sm:pb-8 sm:pt-8">
        <h1 id="dash-greeting" className="font-display text-2xl font-semibold sm:text-3xl">
          {greeting(now.getHours())}, {name}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {view.label ? `${view.label} · ` : ""}
          {dateLine}
        </p>

        {view.tiles.length > 0 && (
          <div className="glass-stage mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy={loading}>
            {loading
              ? view.tiles.map((t) => <TileSkeleton key={t} />)
              : tiles.map((tile) => <Tile key={tile.id} tile={tile} />)}
          </div>
        )}

        {failed && !loading && (
          <p role="status" className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            Some figures couldn&rsquo;t load. Check your connection.
            <button type="button" onClick={retry} className={`min-h-11 rounded-md border border-amber-400 px-4 font-semibold text-amber-300 hover:bg-amber-400/10 ${focusRing}`}>
              Try again
            </button>
          </p>
        )}

        {showHealth && (
          <dl className="mt-5 grid grid-cols-3 grid-rows-[auto_auto] gap-x-3 gap-y-1 border-t border-white/10 pt-4 sm:gap-x-8">
            {has(["orders"]) && (
              <div className="row-span-2 grid grid-rows-subgrid">
                <dt className="self-end text-xs leading-snug text-neutral-400">Orders this month</dt>
                <dd className="text-sm font-semibold tabular-nums sm:text-base">
                  {kes(d.health.monthTotal)}
                  <span className="block text-xs font-normal text-neutral-400">{d.health.monthCount} {d.health.monthCount === 1 ? "order" : "orders"}</span>
                </dd>
              </div>
            )}
            {has(["margin"]) && (
              <div className="row-span-2 grid grid-rows-subgrid">
                <dt className="self-end text-xs leading-snug text-neutral-400">Margin, all orders to date</dt>
                <dd className="text-sm font-semibold tabular-nums sm:text-base">
                  {kes(d.health.margin)}
                  <span className="block text-xs font-normal text-neutral-400">{d.health.marginPct.toFixed(1)}% of revenue</span>
                </dd>
              </div>
            )}
            {has(["shipments"]) && (
              <div className="row-span-2 grid grid-rows-subgrid">
                <dt className="self-end text-xs leading-snug text-neutral-400">Delivered this month</dt>
                <dd className="text-sm font-semibold tabular-nums sm:text-base">
                  {money.format(d.health.deliveredMonth)}
                  <span className="block text-xs font-normal text-neutral-400">{d.health.deliveredMonth === 1 ? "shipment" : "shipments"}</span>
                </dd>
              </div>
            )}
          </dl>
        )}

        {view.quickLinks.length > 0 && (
          <nav aria-label="Quick actions" className="-mx-4 mt-5 sm:mx-0">
            <ul className="night-scroll flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {view.quickLinks
                .filter((l) => quickActionRoutes[l])
                .map((l) => (
                  <li key={l} className="shrink-0">
                    <Link
                      href={quickActionRoutes[l]}
                      className={`flex min-h-11 items-center whitespace-nowrap rounded-md border border-amber-400/70 px-4 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-400/10 active:bg-amber-400/10 ${focusRing}`}
                    >
                      {l}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
      </section>

      {/* Paper: the records behind the figures */}
      {view.attention.length > 0 && (
        <section aria-labelledby="dash-attention" className="p-4 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="dash-attention" className="text-lg font-semibold text-neutral-950">
              Needs attention
            </h2>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl bg-white shadow">
            {loading ? (
              <ul aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4 last:border-0">
                    <span className="h-4 w-24 rounded bg-neutral-200 motion-safe:animate-pulse" />
                    <span className="h-4 flex-1 rounded bg-neutral-100 motion-safe:animate-pulse" />
                  </li>
                ))}
              </ul>
            ) : attentionShown.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">
                Nothing waiting on you right now.
              </p>
            ) : (
              <ul>
                {attentionShown.map((row) => (
                  <li key={row.key} className="border-b border-neutral-200 last:border-0">
                    <Link
                      href={row.href}
                      className={`flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-neutral-50 active:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-neutral-950">{row.title}</span>
                        <span className="block truncate text-xs text-neutral-500">{row.subtitle}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${badgeTone[row.tone]}`}>{row.badge}</span>
                        {row.amount && <span className="text-xs tabular-nums text-neutral-700">{row.amount}</span>}
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.5 5l5 5-5 5" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {!loading && hiddenGroups.length > 0 && (
              <ul className="border-t border-neutral-200 bg-neutral-50">
                {hiddenGroups.map(([group, n]) => (
                  <li key={group}>
                    <Link
                      href={groupInfo[group].href}
                      className="flex min-h-11 items-center justify-between gap-3 px-4 text-sm font-medium text-amber-800 hover:bg-neutral-100 active:bg-neutral-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-500"
                    >
                      {n} more {n === 1 ? groupInfo[group].one : groupInfo[group].many}
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.5 5l5 5-5 5" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
