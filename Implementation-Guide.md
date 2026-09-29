# Distribution System Implementation Guide

Guide for the role-based access work, warehouse scanning, frontend actions, schema changes, and current gaps.
## Database migrations

The feature migrations are:

- `users.0004_seed_distribution_roles`: creates the standard Role records if they do not exist.
- `sales.0002_customer_account_manager`: adds the optional `Customer.account_manager` relationship.
- `inventory.0003_product_barcode`: adds the optional unique `Product.barcode` field.

. `purchasing.0001_initial` is applied. `makemigrations --check` reports a separate pending model change for `GoodsReceiptItem.quantity_received`; investigate separately before generating a purchasing migration.

## Login and role assignment

App users sign in at `/login`; the public homepage labels this **Staff Login**. The separate **Admin** link opens Django Admin. App roles do not grant Django Admin access; that still requires `is_staff` (or superuser status). Users are Django accounts with roles assigned through Django Admin. Use non-superuser test accounts to exercise role permissions because superusers bypass them. Customer scoping requires a linked `Customer.user`; Sales scoping requires account-manager or sales-agent assignments.

## Created role names

Migration `users.0004_seed_distribution_roles` seeds these names:

- `Super Admin`
- `Director`
- `Admin`
- `Warehouse`
- `Sales / Account Managers`
- `Sales Agent`
- `Finance`
- `Customer Portal (Wholesaler / Retailer)`
- `Manufacturer Portal`

The user model also recognizes compatibility role labels including `Sales`, `Account Manager`, `Customer`, `Customer Portal`, `Retailer`, and `Wholesaler`. `Manufacturer Portal` is only a role record; no manufacturer portal screen or API workflow is implemented.

`Super Admin` and Django superusers bypass `RoleAccessPermission`. `Admin` is an application role, not automatically a Django staff/superuser flag.

## Role access enforced by APIs


| Role | Current enforced access |
| --- | --- |
| Super Admin | Full API permission bypass. |
| Django superuser | Full API permission bypass. Django Admin requires `is_staff` as usual. |
| Admin | Broad operational/configuration read/write access, including scan endpoints. Django Admin separately requires `is_staff`. |
| Director | Read-only on explicitly permitted catalog, warehouse/inventory, sales, purchasing, shipment and finance resources. |
| Warehouse | Read catalog, inventory, shipments, purchase orders and goods receipts. Writes batches, locations, inventory, movements, receipts and shipments; can scan. Purchase-order costs/totals/notes and product prices are hidden. Cannot write purchase orders. |
| Sales / Account Managers | Read catalog and sales/customer data; write customers and sales orders. Results are scoped to managed customers, own-created orders or related assigned-agent orders. Product cost is hidden; no stock writes. |
| Sales Agent | Read catalog, assigned orders and related customer/shipment data; create orders assigned to self. Product cost is hidden; no stock writes. |
| Finance | Read sales/customer/shipment and purchasing data; write purchase orders, invoices and receipts. Product cost is visible; no inventory/scan writes. |
| Customer / Customer Portal / Retailer / Wholesaler aliases | Read catalog and linked own records. Can create, not update, own sales orders; server supplies customer/order identity and selling price. No stock writes. |
| Manufacturer Portal | No API role policy or portal workflow is implemented. |

### Access details and caveats

- Permissions are declared separately per API viewset. Some frontend sidebar links may be visible even if a backend endpoint rejects that role; API permissions are authoritative.
- Sales account-manager ownership requires assigning `Customer.account_manager`. Sales agents require `SalesOrder.sales_agent` assignment.
- Customers require a `Customer.user` link for their own-record filters and portal order creation.
- Finance API routes exist at `/api/finance/invoices/` and `/api/finance/receipts/`, but there are no dedicated finance frontend pages yet.
- The role matrix is not a global policy engine. Check the specific view and serializer before relying on an edge-case role/data combination.

## Frontend changes

The homepage distinguishes **Staff Login** (`/login`) and **Admin** (Django Admin); the Sign Up button was removed. The app shell uses Luna Soft branding with black/silver/gold and a crescent mark. Its role-filtered sidebar exposes Dashboard, Products, Inventory, Sales Orders, Purchase Orders, Shipments, and Warehouse/Admin/Super Admin Scan Stock.

### Dashboard

Quick Actions link to existing Products, Inventory, Sales Orders, Purchase Orders, Shipments, Admin user management and Scan Stock screens. Warehouse Receive/Pick shortcuts pass `mode=receive` or `mode=pick`. Unsupported actions and fabricated KPI placeholders were removed. Role descriptions do not implement pick lists, packing, cycle counts, reports, quotes, commissions or a complete customer portal.

Purchase Orders uses `/api/purchasing/purchase-orders/`. Warehouse is read-only and does not receive costs, totals or notes; its UI hides the Total column. Admin and Finance may write purchase orders.

## Warehouse barcode scanning

Implementation is split between `frontend/src/components/ScanBarcode.tsx`, `frontend/src/app/warehouse/scan/page.tsx`, `backend/apps/inventory/scan_serializers.py`, `scan_services.py`, and `StockScanViewSet` in `views.py`. Product barcode is optional and unique; Django Product Admin exposes it for editing/search. SKU is accepted as an alternate code.

UI uses native browser `BarcodeDetector` where available, plus manual entry. Camera access requires permission and HTTPS or localhost. The page initializes receive/pick mode from `?mode=receive|pick`; a superuser without an assigned Warehouse/Admin/Super Admin role can pass API authorization but fail the frontend page role gate. Offline queue/sync is not implemented.

The endpoints use `RoleAccessPermission` and allow Warehouse, Admin, Super Admin and Django superusers:

- `GET /api/warehouse/scan/product/?code=<SKU-or-barcode>` resolves an active Product and returns inventory by warehouse/location/batch.
- `POST /api/warehouse/scan/receive/` adds stock and records inbound movement.
- `POST /api/warehouse/scan/dispense/` removes available stock and records outbound movement.

Example request:

```json
{
  "code": "SKU-001",
  "quantity": 3,
  "warehouse": 1,
  "location": 2,
  "batch": 4,
  "movement_type": "RECEIVE",
  "reference": "GR-100",
  "notes": "Optional note"
}
```

`location` and `batch` are IDs. Batch is required for batch-tracked products and must belong to the product; location must belong to the selected warehouse. Inbound types: `RECEIVE`, `ADJUST_IN`. Outbound types: `PICK`, `SHIP`, `ADJUST_OUT`.

`apply_stock_scan` is atomic. Inbound creates/updates the warehouse/product/batch/location inventory row and an audited movement. Outbound locks rows, enforces `quantity <= quantity_available`, decrements on-hand, and records one movement per affected row. The `reference` is plain text, not a foreign key to a receipt/order/pick list/adjustment. Lookup returns stock grouped by warehouse/location/batch; updated inventory/movement data is returned by both POST endpoints.

## Django Admin branding and PostgreSQL cursor setting

Django Admin branding is set to **LUNA SOFT Essentials**. An admin-only stylesheet applies black, gold and silver colors and gold section headings. PostgreSQL `DISABLE_SERVER_SIDE_CURSORS` is set at Django's database configuration level (not inside psycopg driver's `OPTIONS`) to prevent cursor errors with transaction-pooling connections.

## Known gaps

The following are not complete application features yet:

- Offline barcode queue/synchronization.
- Dedicated pick-list, packing, cycle-count, adjustment-management, reporting, quote and commission workflows.
- Manufacturer portal and dedicated Finance invoice/receipt frontend pages.
- Typed scan references to receipt/order/shipment/pick-list/adjustment records.
- Full customer portal order-building UI; the API create path requires profile and order data to be configured.

Validation performed: Django `check`, frontend TypeScript check, and scoped ESLint checks passed. Inventory service tests were not run because the configured PostgreSQL user could not create a test database.
