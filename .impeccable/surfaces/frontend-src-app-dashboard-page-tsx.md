---
version: 1
slug: "frontend-src-app-dashboard-page-tsx"
primary_target: "frontend/src/app/dashboard/page.tsx"
related_targets: []
---

# Staff dashboard

**Scope:** `/dashboard`, the first screen every staff role lands on after login. **Mode:** Operate. Code-led (no image generation).

**Audience and job:** Warehouse, Sales, Finance, Director and Admin staff, mostly on phones. They need to see in one glance what is waiting for them and open it.

**Content:** Live figures computed from the existing APIs (sales orders, shipments, inventory and products, invoices, margin report). A figure appears only when the role's API call succeeds, and a refused call (403) hides that figure. No placeholder or invented numbers. The Access Notes box is removed (user decision).

**Constraints:** Low-end Android phones on slow data, so blur is an enhancement with a solid fallback. Swahili headroom applies. Quick actions keep the existing routes.

## Direction contract

THESIS: The dashboard is a night-shift work board. The figures are doors into the real records waiting behind them. It refuses the hero-metric template (big number, small label, decorative accent) and the grid of identical link cards.

OWN-WORLD: A Luna Black band with one soft gold radial glow. Glass tiles: white at 7%, a 12px blur, a 1px white/12% border and a 12px radius, with Crescent Gold figures and night-text labels. Gold-outline quick actions sit on the band. Below the band, a Paper list uses existing status badges and right-aligned tabular figures.

STORY: Staff see their role's waiting work as counts (and money due, for money roles). They tap a tile, or a row in Needs attention, and land on that record or list. Money roles also see a quieter health row with honest period labels.

FIRST VIEWPORT: On a 360px phone: the greeting and role line, then a 2×2 grid of work tiles, the quick actions and the top of the Needs attention list. On desktop: four tiles in one row, then the health row, then the list below. The primary action is the first tile.

FORM: Glass band + list. seed: none (pinned): "Glass band + list".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

**Memorable moment:** The gold figures surface through the glass over the glow. Each figure counts up once on load (none under reduced motion).
