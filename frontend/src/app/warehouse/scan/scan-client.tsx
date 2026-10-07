"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ScanBarcode from "@/components/ScanBarcode";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Mode = "receive" | "dispense";
interface StockRow {
  warehouse_id: number;
  warehouse: string;
  location_id: number | null;
  location: string | null;
  batch_id: number | null;
  batch: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
}
interface ScannedProduct {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  track_batches: boolean;
}
interface ScanLookup {
  product: ScannedProduct;
  matched_batch?: { id: number; batch_number: string } | null;
  stock: StockRow[];
}
interface WarehouseOption { id: number; name: string; code: string }
interface LocationOption { id: number; warehouse: number; name: string }
interface BatchOption { id: number; product: number; batch_number: string }

export default function WarehouseScanPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const initialMode: Mode = requestedMode === "pick" || requestedMode === "adjust" ? "dispense" : "receive";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [code, setCode] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [reference, setReference] = useState("");
  const [movementType, setMovementType] = useState(requestedMode === "pick" ? "PICK" : requestedMode === "adjust" ? "ADJUST_OUT" : "RECEIVE");
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [lookup, setLookup] = useState<ScanLookup | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  const canUseScanner = user?.roles.some((role) => ["Warehouse", "Admin", "Super Admin"].includes(role.name));

  useEffect(() => {
    if (!isLoading && user && !canUseScanner) router.replace("/dashboard");
  }, [canUseScanner, isLoading, router, user]);

  useEffect(() => {
    if (!user || !canUseScanner) return;
    Promise.all([
      api.get("/inventory/warehouses/"),
      api.get("/inventory/locations/"),
      api.get("/inventory/batches/"),
    ]).then(([warehouseResponse, locationResponse, batchResponse]) => {
      const warehouseData = warehouseResponse.data.results ?? warehouseResponse.data;
      const locationData = locationResponse.data.results ?? locationResponse.data;
      const batchData = batchResponse.data.results ?? batchResponse.data;
      setWarehouses(Array.isArray(warehouseData) ? warehouseData : []);
      setLocations(Array.isArray(locationData) ? locationData : []);
      setBatches(Array.isArray(batchData) ? batchData : []);
      if (warehouseData.length === 1) setWarehouseId(String(warehouseData[0].id));
    }).catch(() => setError("Could not load warehouse options. Check your Warehouse role and connection."));
  }, [canUseScanner, user]);

  const lookupCode = useCallback(async (rawCode: string) => {
    const value = rawCode.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    setMessage("");
    setLookup(null);
    setCode(value);
    setScannedCode(value);
    try {
      const response = await api.get("/warehouse/scan/product/", { params: { code: value } });
      const data = response.data as ScanLookup;
      setLookup(data);
      if (data.matched_batch?.id) setBatchId(String(data.matched_batch.id));
      else setBatchId("");

      const stockRow = data.stock?.find((row) => row.location_id);
      const warehouseForLocation = stockRow ? String(stockRow.warehouse_id) : warehouseId;
      const receiving = locations.find((location) =>
        String(location.warehouse) === warehouseForLocation &&
        location.name.toLowerCase().includes("receiving")
      );
      if (receiving) setLocationId(String(receiving.id));
      else if (stockRow?.location_id) setLocationId(String(stockRow.location_id));
      else setLocationId("");
    } catch (requestError: unknown) {
      const responseMessage = (requestError as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(responseMessage || "Product not found. Check the SKU or barcode and try again.");
    } finally {
      setBusy(false);
    }
  }, [locations, warehouseId]);

  const handleManualLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookupCode(code);
  };

  const submitMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lookup || !warehouseId || !scannedCode) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const endpoint = mode === "receive" ? "receive" : "dispense";
      const response = await api.post(`/warehouse/scan/${endpoint}/`, {
        code: scannedCode,
        quantity,
        warehouse: Number(warehouseId),
        location: locationId ? Number(locationId) : null,
        batch: batchId ? Number(batchId) : null,
        reference,
        movement_type: movementType,
      });
      const counted = response.data.inventory.reduce((total: number, row: { quantity_on_hand: number }) => total + row.quantity_on_hand, 0);
      await lookupCode(scannedCode);
      setMessage(`${mode === "receive" ? "Stock received" : "Stock removed"}: ${quantity} ${lookup.product.name}. Warehouse count is now ${counted}.`);
    } catch (requestError: unknown) {
      const responseData = (requestError as { response?: { data?: { detail?: string; quantity?: string[] } } }).response?.data;
      setError(responseData?.detail || responseData?.quantity?.[0] || "Stock movement failed. Check quantity, batch, and available stock.");
    } finally {
      setBusy(false);
    }
  };

  const activeLocations = locations.filter((location) => String(location.warehouse) === warehouseId);
  const productBatches = lookup ? batches.filter((batch) => batch.product === lookup.product.id) : [];
  const selectedStock = lookup?.stock.filter((row) =>
    String(row.warehouse_id) === warehouseId &&
    (!batchId || String(row.batch_id) === batchId) &&
    (!locationId || String(row.location_id) === locationId)
  ) ?? [];
  const availableAtWarehouse = selectedStock.reduce((total, row) => total + row.quantity_available, 0);

  if (isLoading || !user || !canUseScanner) {
    return <AppShell><p className="text-sm text-neutral-600">Checking warehouse access…</p></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Warehouse operations</p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-950">Scan stock</h1>
          <p className="mt-1 text-sm text-neutral-600">Scan a package barcode. The arrival lot is selected for you.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Stock action">
              <button type="button" onClick={() => { setMode("receive"); setMovementType("RECEIVE"); }} aria-pressed={mode === "receive"} className={`min-h-12 rounded-md font-semibold ${mode === "receive" ? "bg-neutral-950 text-amber-300" : "bg-neutral-100 text-neutral-700"}`}>Receive stock</button>
              <button type="button" onClick={() => { setMode("dispense"); setMovementType("SHIP"); }} aria-pressed={mode === "dispense"} className={`min-h-12 rounded-md font-semibold ${mode === "dispense" ? "bg-neutral-950 text-amber-300" : "bg-neutral-100 text-neutral-700"}`}>Remove / pick</button>
            </div>

            <ScanBarcode onDetected={lookupCode} />

            <form onSubmit={handleManualLookup} className="flex gap-2">
              <label htmlFor="scan-code" className="sr-only">Barcode or SKU</label>
              <input ref={scanInputRef} autoFocus id="scan-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Scan or enter barcode / SKU" autoComplete="off" className="min-h-12 min-w-0 flex-1 rounded-md border border-neutral-300 px-3 text-base text-neutral-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
              <button disabled={busy || !code.trim()} className="min-h-12 rounded-md bg-amber-400 px-5 font-bold text-neutral-950 disabled:opacity-50">Find</button>
            </form>
          </section>

          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-950">Movement details</h2>
            <label className="block text-sm font-medium text-neutral-700">Warehouse
              <select value={warehouseId} onChange={(event) => { setWarehouseId(event.target.value); setLocationId(""); }} className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-base text-neutral-950">
                <option value="">Choose warehouse</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} - {warehouse.name}</option>)}
              </select>
            </label>

            {lookup && <div className="rounded-md border border-amber-300 bg-amber-50 p-3" aria-live="polite">
              <p className="font-bold text-neutral-950">{lookup.product.name}</p>
              <p className="text-sm text-neutral-700">SKU {lookup.product.sku}{lookup.matched_batch ? ` · ${lookup.matched_batch.batch_number}` : ""}</p>
              <p className="text-sm text-neutral-700">Code {scannedCode}</p>
              <p className="mt-2 text-sm text-neutral-700">Available at selected warehouse</p>
              <p className="text-3xl font-bold tabular-nums text-neutral-950">{availableAtWarehouse}</p>
            </div>}

            {lookup && <form onSubmit={submitMovement} className="space-y-3">
              <label className="block text-sm font-medium text-neutral-700">Quantity
                <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 px-3 text-lg text-neutral-950" required />
              </label>
              <label className="block text-sm font-medium text-neutral-700">{mode === "receive" ? "Put-away location" : "Pick from location (optional)"}
                <select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-base text-neutral-950">
                  <option value="">{mode === "receive" ? "Choose location" : "Any location with available stock"}</option>
                  {activeLocations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </label>
              {lookup.product.track_batches && <label className="block text-sm font-medium text-neutral-700">Batch / lot
                <select value={batchId} onChange={(event) => setBatchId(event.target.value)} required className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-base text-neutral-950">
                  <option value="">Choose batch</option>
                  {productBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_number}</option>)}
                </select>
              </label>}
              <label className="block text-sm font-medium text-neutral-700">Movement type
                <select value={movementType} onChange={(event) => setMovementType(event.target.value)} className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-base text-neutral-950">
                  {mode === "receive" ? <><option value="RECEIVE">Receive</option><option value="ADJUST_IN">Adjustment increase</option></> : <><option value="PICK">Pick</option><option value="SHIP">Ship</option><option value="ADJUST_OUT">Adjustment decrease</option></>}
                </select>
              </label>
              <label className="block text-sm font-medium text-neutral-700">Reference (optional)
                <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Receipt, sales order, or adjustment ID" className="mt-1 min-h-12 w-full rounded-md border border-neutral-300 px-3 text-base text-neutral-950" />
              </label>
              <button disabled={busy || !warehouseId || (mode === "receive" && !locationId) || !batchId} className="min-h-14 w-full rounded-md bg-neutral-950 px-5 text-lg font-bold text-amber-300 disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? "Saving movement…" : mode === "receive" ? "Confirm stock received" : "Confirm stock removal"}
              </button>
            </form>}
            {!lookup && <p className="rounded-md bg-neutral-100 p-4 text-sm text-neutral-600">Scan or enter a package barcode to see stock and record a movement.</p>}
          </section>
        </div>

        {message && <p role="status" aria-live="polite" className="rounded-md border border-green-300 bg-green-50 p-3 font-medium text-green-900">{message}</p>}
        {error && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 font-medium text-red-800">{error}</p>}
      </div>
    </AppShell>
  );
}