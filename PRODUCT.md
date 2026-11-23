# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Warehouse staff** use phones on the warehouse floor. They scan package barcodes to receive arrival lots, ship and pick orders, and work through Ready to Pack.
- **Office staff** (Sales / Account Managers, Sales Agents, Finance, Director, Admin) also work mainly on phones, and sometimes on desktops for heavier work. Their jobs are entering sales orders, creating invoices, recording payments, issuing receipts, following shipments, purchase orders and reading the margin report.
- **Trade buyers** (wholesalers and retailers) find the business through the public homepage and place orders with the sales team.
- **Consumers and carers** buy Luna Soft products in shops. They visit the public homepage to learn about the brand and trust it. Nothing is sold to them online.

Phones are the primary device for every staff role. Desktop is a second device for office roles, not the main design target.

## Product Purpose

The Three-Level Distribution System runs stock, warehousing and the sales cycle for Luna Soft Essentials Ltd., a distributor of adult-care, personal-care and hygiene products based in Kikuyu, Kenya. It follows stock from purchase order and goods receipt, through scanned arrival lots and batches (FIFO), to sales orders, reservation, invoice, payment, packing, shipment and delivery. Each role sees only what it is allowed to see.

The public homepage introduces the company (mission, vision, objectives, products) to trade buyers and consumers, and sends trade enquiries to the sales team.

Success means that staff can complete their work from a phone without errors, stock and money figures can be trusted, and trade buyers can reach sales easily.

## Positioning

The system is built for one Kenyan distributor's real operation, not a generic ERP. It works with the units of that operation: packages packed as "8 pcs/bag, 10 bags/hookbox", numeric package barcodes scanned into arrival lots, and FIFO shipping from the oldest batch. Ordering happens through the channels this market already uses, which are WhatsApp, email and phone.

## Operating Context

- Phone-first use on the warehouse floor and in the office. Camera barcode scanning uses the browser's `BarcodeDetector` with manual entry as a fallback, and needs HTTPS or localhost.
- Many users have low-end Android phones on slow or expensive mobile data.
- Orders come in by **WhatsApp (preferred)**, email and social media. Sales staff then enter them as sales orders. Self-serve online ordering does not exist.
- Staff log in at `/login` (Staff Login). Django Admin is a separate route for staff with `is_staff`. There is no public sign-up.
- Hosting: Railway for the backend, Vercel for the frontend.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router, TypeScript, Tailwind v4, Recharts) and Django/DRF with SimpleJWT, PostgreSQL, Redis/Celery, Cloudflare R2 and WeasyPrint.
- Role-based access is enforced by the API. Some fields are hidden per role: Warehouse doesn't see costs or PO totals, and Sales doesn't see product cost. The UI must not suggest access the API denies. The role matrix is in `Implementation-Guide.md`.
- Live screens: Dashboard, Products, Inventory, Scan Stock, Purchase Orders, Sales Orders and their detail pages, Invoices, Ready to Pack, Record Payment, Receipts and their detail pages, Shipments and their detail pages, and the Margin report.
- Known gaps (do not design as if they exist): offline scan queue, pick lists and packing workflow, cycle counts, quotes, commissions, manufacturer portal, full customer-portal ordering.
- **Swahili is required** alongside English. There is no i18n yet. Which screens need it first is still undecided.
- Currency is KES. Units: pcs, pkg, box, pack, carton, kg.

## Brand Commitments

- Name: **Luna Soft Essentials Ltd.** ("LUNA SOFT Essentials" in Django Admin).
- Tagline: "Gentle care. Strong protection." Supporting lines in use: "Confidence you keep.", "Care that shows up."
- The crescent logo (`frontend/public/images/Luna_Soft_Essentials_logo.jpeg`) and the **black / silver / gold** brand colours are fixed.
- Tone: discreet and dignified when talking about incontinence and hygiene. Never clinical, never jokey.
- Social media (Instagram, Facebook, TikTok) and WhatsApp must be easy to reach, and WhatsApp should be the main way to order.

## Evidence on Hand

- Product photos: `frontend/public/images/` (LS-ADP, LS-ADT, LS-PAD-240/290, the product-all group shot and a background-removed version).
- The mission, vision and objectives on the current homepage (`frontend/src/app/page.tsx`).
- Contact details: Kikuyu, Kenya · lunasoftlimited@gmail.com · +254 721 669 664.
- **Missing, still needed:** the WhatsApp ordering number (it may be the phone number above, but this isn't confirmed) and the Instagram, Facebook and TikTok handles. The homepage currently shows the platform names without links.
- There are no testimonials, client logos, certifications, sales figures or pricing for public use. Do not make any up.

## Product Principles

1. **Phone first for everyone.** Every staff task must be fully doable on a low-end phone with a weak connection. Desktop adds room but never adds features that only work there.
2. **Numbers must be trustworthy.** Stock, money and margin figures are real records. Show where they come from and their state clearly, and never use placeholder KPIs.
3. **Meet buyers where they already are.** Make WhatsApp, phone and email ordering easy instead of pushing buyers into a portal that doesn't exist yet.
4. **Dignity first.** People buy these products for themselves or someone they care for. Every word and image should protect that person's dignity.
5. **Each role sees its own work.** Show each role what it can act on, and hide what the API hides.

## Accessibility & Inclusion

- English and Swahili. Copy and layouts must handle longer Swahili text.
- Phone use in bright light, sometimes with gloves: high contrast and large touch targets on warehouse screens.
- Respect data limits: pages and images must be light enough for slow mobile data.
- Target WCAG 2.2 AA (assumed standard; not confirmed as a contractual requirement).
