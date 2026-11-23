---
name: Luna Soft Essentials
description: Gentle care. Strong protection. A black-and-gold distribution system for stock, sales and money.
colors:
  luna-black: "oklch(14.5% 0 0)"
  gold-bright: "oklch(87.9% 0.169 91.605)"
  gold-solid: "oklch(82.8% 0.189 84.429)"
  gold-ink: "oklch(55.5% 0.163 48.998)"
  gold-wash: "oklch(96.2% 0.059 95.617)"
  canvas: "oklch(97% 0 0)"
  paper: "#ffffff"
  paper-tint: "oklch(98.5% 0 0)"
  hairline: "oklch(92.2% 0 0)"
  field-stroke: "oklch(87% 0 0)"
  ink: "oklch(14.5% 0 0)"
  ink-body: "oklch(26.9% 0 0)"
  ink-muted: "oklch(55.6% 0 0)"
  night-line: "oklch(26.9% 0 0)"
  night-text: "oklch(87% 0 0)"
  page-accent-blue: "oklch(37.9% 0.146 265.522)"
  status-info-bg: "oklch(93.2% 0.032 255.585)"
  status-info-text: "oklch(48.8% 0.243 264.376)"
  status-ok-bg: "oklch(96.2% 0.044 156.743)"
  status-ok-text: "oklch(52.7% 0.154 150.069)"
  status-wait-bg: "oklch(96.2% 0.059 95.617)"
  status-wait-text: "oklch(41.4% 0.112 45.904)"
  status-error-bg: "oklch(97.1% 0.013 17.38)"
  status-error-text: "oklch(50.5% 0.213 27.518)"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  body-field:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.2em"
  wordmark:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.025em"
rounded:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  hero: "1.5rem"
  full: "9999px"
spacing:
  cell-y: "12px"
  cell-x: "16px"
  card: "16px"
  page: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.luna-black}"
    textColor: "{colors.gold-bright}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  button-primary-scan:
    backgroundColor: "{colors.luna-black}"
    textColor: "{colors.gold-bright}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "56px"
  button-gold:
    backgroundColor: "{colors.gold-solid}"
    textColor: "{colors.luna-black}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "48px"
  button-gold-hover:
    backgroundColor: "{colors.gold-bright}"
  button-outline-gold:
    textColor: "{colors.gold-bright}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  card-night:
    backgroundColor: "{colors.luna-black}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  nav-item:
    textColor: "{colors.night-text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.gold-solid}"
    textColor: "{colors.luna-black}"
  status-badge:
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "4px 8px"
  table-head:
    backgroundColor: "{colors.paper-tint}"
    textColor: "{colors.ink}"
    padding: "12px 16px"
---

# Design System: Luna Soft Essentials

## Overview

**Creative North Star: "The Night Shift Ledger"**

This is a quiet, trustworthy instrument for counting stock, packing orders and getting paid. Its world is black and gold. The night side is the near-black sidebar, homepage, scan screen and wordmark. The ledger side is white and light-grey surfaces where the actual records live: tables, forms and receipts. Gold is the brand's light and is used generously as an accent. It marks where you are, what to press and what's live, and it also warms headlines, totals and brand moments.

Density is set for phones first. Fields are 44–56px tall, tables use compact 14px text with 12px/16px cell padding, and every working screen is a stack of white cards on a light-grey canvas. The homepage takes the same palette and turns it toward warmth, with display-size Outfit headlines, a glowing product shot and dark bands alternating with white ones.

The staff dashboards will move to a **glassy** treatment: translucent panels over a dark backdrop with a gold glow, so summary figures float above the night. This is a confirmed direction that hasn't been built yet (see Elevation & Depth). Each staff page will also get its **own accent colour** for identity, while the crescent logo, sidebar and wordmark stay the same everywhere (see Colors).

**Key Characteristics:**
- Near-black night surfaces (sidebar, homepage, scan) frame white working surfaces.
- Gold is the brand accent, used freely on dark backgrounds, with a darker gold for text on white.
- Outfit for brand and display moments, Figtree for everything you read or type.
- Large phone-sized touch targets (44 / 48 / 56px).
- Flat white cards with one soft shadow, gold glow only for light and live feedback.
- Planned: glass panels on staff dashboards and a colour for each page under a fixed logo.

## Colors

A two-sided palette: near-black and gold for brand and navigation, white and neutral greys for records, and a small set of status tints.

### Primary
- **Luna Black** (luna-black): The night side. It's used for the sidebar, homepage background, scan screen, dark summary cards and the fill of primary buttons. It's neutral black with no warm or cool tint.
- **Crescent Gold** (gold-bright): The brand's light on dark backgrounds. Used for button labels on Luna Black, the "Essentials" wordmark line, homepage headline highlights, eyebrow labels and margin totals.
- **Lamp Gold** (gold-solid): Solid gold fills. Used for the active sidebar item, gold primary buttons and the live scan line.
- **Brass Ink** (gold-ink): Gold for text on white. Use this tone whenever gold text sits on Paper or Canvas, where Crescent Gold would fail contrast.
- **Gold Wash** (gold-wash): A pale gold background for highlighted rows, notes and the "waiting" status.

The source also defines `--luna-gold: #f5c518` and `--luna-gold-soft: #e8b923` in `globals.css`, but no markup uses them. The Tailwind amber tones above are the gold actually in use. The margin report's charts use a separate fixed series of #d4a017, #1a1a1a, #8a7340, #4a4a4a and #c9a227. Keep that set for charts and don't use it for UI.

### Neutral
- **Canvas** (canvas): The light-grey app background behind every staff page.
- **Paper** (paper): Cards, tables, forms and the homepage's white bands.
- **Paper Tint** (paper-tint): Table headers, read-only fields and quiet inset panels.
- **Hairline** (hairline): Row dividers and borders on quiet panels.
- **Field Stroke** (field-stroke): Input and select borders, and secondary button outlines.
- **Ink** (ink): Page titles, figures and table text that must be read correctly.
- **Ink Body** (ink-body): Running text on Paper.
- **Ink Muted** (ink-muted): Hints, captions and secondary columns.
- **Night Line / Night Text** (night-line / night-text): Dividers and nav text on Luna Black.

### Status tints
These are paired backgrounds and text colours for order, shipment and payment states, shown as small badges and banner messages: **Info** (blue: confirmed or in progress), **OK** (green: paid, delivered, success), **Wait** (amber: pending or awaiting action) and **Error** (red: cancelled, failed, validation).

### Page accents (confirmed direction, partly built)
Each staff page has its own accent colour, which gives it identity and helps people tell where they are. The accent colours the page title (h1) and may colour one thin rule or icon in the page header. Four pages already share **Page Accent Blue** (page-accent-blue): Inventory, Receipts, Purchase Orders and Record Payment. They should each move to their own colour. The proposed set below uses deep tones so titles meet 4.5:1 contrast on Paper. Adjust it as pages are built.

| Page | Accent (Tailwind) |
|---|---|
| Dashboard | Luna Black + Crescent Gold glass (see Elevation) |
| Products | emerald-800 |
| Inventory | blue-900 (incumbent) |
| Scan Stock | Luna Black night screen (fixed) |
| Purchase Orders | indigo-800 |
| Sales Orders | teal-800 |
| Invoices | violet-800 |
| Ready to Pack | orange-800 |
| Margin | amber-800 |
| Record Payment | green-800 |
| Receipts | sky-800 |
| Shipments | cyan-800 |

### Named Rules
**The Constant Crescent Rule.** The logo, sidebar, wordmark and Luna Black and gold shell are identical on every page. Page accents change only the page's own title area and never the brand frame.

**The Brass-on-Paper Rule.** Gold is used freely, but on white it's always Brass Ink (gold-ink) for text. Crescent Gold and Lamp Gold appear only on Luna Black or as solid fills behind dark text.

**The Status Owns Its Colour Rule.** Status tints mean state and nothing else. A page accent never goes on a badge, and a badge never takes the page accent, even when the hues are similar.

## Typography

**Display Font:** Outfit (with system-ui)
**Body Font:** Figtree (with system-ui)

**Character:** Outfit's round geometry carries the brand: the wordmark, homepage headlines and display moments. Figtree is a calm, open sans that keeps tables, fields and figures readable on small phone screens.

### Hierarchy
- **Display** (Outfit 600, 3rem, 1.25): Homepage hero headline only, with a Crescent Gold second line.
- **Headline** (Figtree 700, 1.5rem, 1.33): The page title (h1) on every staff page, in Ink or the page accent. Dashboard figures also use this size in bold.
- **Title** (Figtree 600, 1.125rem): Card and section headings.
- **Body** (Figtree 400, 0.875rem, 1.43): The app's default size for tables, nav, buttons and help text. Use 500–600 for column headers and emphasis.
- **Body Field** (Figtree 400, 1rem): Text typed into inputs and selects. It never goes below 16px, so iOS doesn't zoom into the field.
- **Label** (Figtree 500, 0.625rem, 0.2em tracking, UPPERCASE): Eyebrows and the "ESSENTIALS" line under the wordmark.

### Named Rules
**The Swahili Headroom Rule.** Labels, buttons and nav items must handle text about 30% longer than the English. Never fix a width to fit an English label.

## Layout

The staff app is a fixed-width sidebar (256px, Luna Black) next to a scrolling main area with 24px padding on Canvas. Content stacks as full-width cards. Tables sit inside a card with horizontal scrolling (`overflow-x-auto`) so wide records stay usable on phones. Rows use 12px/16px cell padding, numbers are right-aligned and headers are left-aligned at weight 600.

The homepage uses a centred container with a maximum width of 72rem and 20px side padding. Bands are 64px tall, and dark and white bands alternate. Grids go from one column to two at `md` (768px) and four at `xl` (1280px). The hero splits 1.2fr / 0.8fr from `md` upwards.

Touch targets follow three tiers: 44px for standard fields and buttons, 48px for important form actions, and 56px for the main scan action.

The shell changes at `lg` (1024px). Below it, phones and tablets get a 56px sticky Luna Black top bar (menu button and wordmark), and the navigation moves into a left drawer, min(18rem, 85vw) wide. Main padding is 16px below `sm` (640px) and 24px above.

## Elevation & Depth

Today the system is mostly flat with one level of lift. Cards use one soft, low shadow on Canvas. There are no layered shadows and nothing stacks deeper than a card. Light provides depth on night surfaces: a warm gold glow behind the homepage product shot and a bright glow on the live scan line.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Every white card and table container. Removed when printing.
- **Lamp glow** (`box-shadow: 0 0 40px rgba(251,191,36,0.28)`): Homepage hero product image.
- **Scan beam** (`box-shadow: 0 0 12px rgba(251,191,36,0.9)`): The live gold line across the camera frame.

### Glass dashboards (confirmed direction, not yet built)
Staff dashboards will use translucent "glass" panels for summary figures and quick actions. Each panel sits on a Luna Black backdrop with a soft gold radial glow. Panels have a white fill at about 6–10% opacity, a background blur of 12px at most, a 1px border of white at about 12% opacity, and white text with Crescent Gold figures.

Low-end phones are a hard constraint, so the blur is an enhancement only. Without `backdrop-filter`, or under `prefers-reduced-transparency`, panels fall back to a solid near-black (night-line), and contrast must pass in that fallback.

### Named Rules
**The Glass Is for Glancing Rule.** Glass goes only on dashboard summaries and quick actions. Tables, forms, receipts and anything printed or edited stay on solid Paper.

**The Gold Light Rule.** Glows are always gold and always mean light or a live state. They're never grey drop shadows used for drama.

## Shapes

Corners are gently rounded, and the radius grows with the size of the surface. Badges use 4px, and buttons and inputs use 6px. Nav items and small buttons use 8px, cards and tables 12px, and quiet inset panels 16px. The homepage hero image uses 24px. Borders are 1px and neutral: Hairline for quiet panels and Field Stroke for anything you type into. The crescent mark is the system's one recurring silhouette. It's always the real artwork (`frontend/public/images/luna-crescent.png`: the crescent, swoosh and four stars cut from the logo on a transparent background), never a ☾ text character or a redrawn icon.

## Components

### Buttons
Large and calm, with gold as the call to action.
- **Shape:** gently rounded (6px).
- **Primary (night):** a Luna Black fill with a Crescent Gold label at weight 600. This is the default action on white pages. It's 44px tall, and 56px with an 18px bold label for the scan screen's main action.
- **Gold:** a Lamp Gold fill with a Luna Black bold label, 48px tall. Used for the strongest action on dark screens. On hover it lightens to Crescent Gold.
- **Outline gold:** a 1px Lamp Gold border with a Crescent Gold label on Luna Black. On hover it gets a gold tint at 10%. Used for secondary actions on night screens.
- **Secondary (paper):** a 1px Field Stroke border with Ink text. On hover the fill becomes Paper Tint.
- **Disabled:** opacity drops to 40% and the cursor changes to not-allowed. The colours stay the same.

### Status badges
- **Style:** 4px radius, 4px/8px padding, 12px text at weight 500, using the paired status tint for background and text.
- **State:** Info (blue), OK (green), Wait (amber), Error (red). Banner messages use the same pairs at 12px padding with an 8px radius.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Paper on Canvas. Night cards are Luna Black with white text for highlighted totals.
- **Shadow Strategy:** Card rest (see Elevation).
- **Border:** none on standard cards. Quiet inset panels use a Hairline border on Paper Tint with 16px corners.
- **Internal Padding:** 16px. Document-style detail pages (receipts, shipments) use 32px.

### Inputs / Fields
- **Style:** a 1px Field Stroke border, a Paper fill, a 6px radius, 12px horizontal padding, a height of 44–48px and Ink text at 16px. The label sits above at 14px weight 500.
- **Read-only:** a Paper Tint fill with a Hairline border and Ink Body text.
- **Focus:** the browser's default focus ring for now. A gold focus ring (Lamp Gold) is the intended treatment.

### Navigation
- **Style:** a Luna Black sidebar with the 40px crescent mark and two-line wordmark at the top ("LUNA SOFT" in Outfit and "ESSENTIALS" as a gold label). Below that is a list of 14px nav items with an 8px radius. The user's name and role list, and a Logout button outlined in Night Line, sit at the bottom.
- **States:** items are 44px tall and Night Text by default. On hover (or press on touch) the fill becomes night-line and the text turns white. The active item is a Lamp Gold fill with a Luna Black label at weight 600. It stays active on that section's detail pages (`/sales-orders/12` lights Sales Orders). Keyboard focus is a 2px Lamp Gold outline.
- **Desktop (1024px and up):** the sidebar is sticky at full viewport height, and its list scrolls on its own if it outgrows the screen.
- **Phone and tablet (below 1024px):** a sticky top bar opens the same sidebar as a drawer that slides in from the left (200ms ease-out, none under reduced motion) over a 60% black scrim. Focus moves into the drawer, Tab wraps within it, and the page behind is inert and held still (including on iOS). Escape, the scrim, the close button or choosing a page closes it, and focus returns to the menu button.
- **Role filtering:** the sidebar shows only the items the user's roles allow.
- **Homepage:** a sticky Luna Black header at 95% opacity with backdrop blur, showing the 44px crescent mark, the wordmark and three bold anchor links. The footer repeats the mark at 40px. The browser tab icon, Android icon and iOS home-screen icon are the crescent on a Luna Black tile (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`).

### Scan Frame (signature)
The warehouse camera view is a 16:9 black frame with an 8px radius and a dark border, and a horizontal Lamp Gold beam with the Scan beam glow. Under it are a 56px night primary button and manual code entry as a fallback. It's the one screen that stays fully night, so it stays readable in a bright warehouse and shows that scanning is live.

## Do's and Don'ts

### Do:
- **Do** keep the crescent logo, sidebar and Luna Black and gold shell identical on every page (The Constant Crescent Rule).
- **Do** use gold freely as the brand accent, but use Brass Ink for gold text on white (The Brass-on-Paper Rule).
- **Do** give each staff page its own accent on the title only, picked from deep tones that pass 4.5:1 on Paper.
- **Do** keep touch targets at 44px or more, 48px for important form actions and 56px for the main scan action.
- **Do** put tables inside a card that scrolls horizontally, with numbers right-aligned.
- **Do** give glass panels a solid near-black fallback and keep their blur at or under 12px.

### Don't:
- **Don't** colour a status badge with a page accent, or a page title with a status colour.
- **Don't** put glass behind tables, forms, receipts or printed documents.
- **Don't** put Crescent Gold (gold-bright) text on white or light grey.
- **Don't** use the unused `--luna-gold` variables as if they were the system gold. The amber tones above are the real ones.
- **Don't** set input text below 16px or fix label widths to English text.
