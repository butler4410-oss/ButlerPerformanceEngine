# Sager Petroleum Solutions Ecommerce Site Build Spec
Deployment: bp-sager-petroleum | Mode: B (client website with order and lead endpoints) | Version: 1.0 | Date: 2026-10-16
Prototype: `sites/sager-petroleum/index.html` (preview: https://claude.ai/artifact/AwkgWwrnJjDzYmJ5evG2oR). The prototype is the visual source of truth.

---

## A. Context

- **What exists today:** a TradeWheel supplier listing for Sager Enterprises, LLC (https://www.tradewheel.com/co/sager-enterprises-llc/) that lists Primrose products. No owned website, no cart, no lead capture.
- **What this build delivers:** an owned ecommerce site for Sager Petroleum Solutions, LLC, a Houma, Louisiana supplier of Primrose Oil Company fuel additives and lubricants. Buyers browse the full Primrose line (123 products, 10 product types, 24 pack sizes), filter by operation, build an order by pack size and send it for pricing. Bulk and fleet buyers request volume pricing. Sager gets every order and lead by email and in a simple admin. Phase 2 adds card checkout for SKUs that have a set price.
- **Primary job:** get an order request or bulk pricing request into Sager's inbox with the products, pack sizes and contact details needed to quote it.
- **Users:** fleet managers, workboat and marine operators, farmers, contractors and plant maintenance buyers. Mostly mobile on first visit, desktop for repeat orders. One admin user (Cody Sager).
- **Model:** order-for-pricing at launch. Primrose itself sells on a quote basis with no public prices, and drum, tote and bulk pricing depends on volume and freight. Every product carries a nullable price per pack size so case and pail prices can go live without a rebuild.
- **Out of scope for this version:** online card payment (Phase 2, Section C step 10), carrier shipping and hazmat freight quoting, customer logins and order history, inventory sync with Primrose, a blog CMS (the three guides ship as static pages), bulk fuel delivery (see Open items).
- **Repo:** `[PLACEHOLDER: new repo butler4410-oss/sager-petroleum]`, branch `main`, app at the repo root. Railway deploys from `main`.
- **GitHub references used:**
  - `butler4410-oss/ButlerPerformanceEngine/sites/sager-petroleum/index.html` (prototype, tokens, copy, component markup)
  - `butler4410-oss/ButlerPerformanceEngine/sites/sager-petroleum/data/catalog.json` (product seed)
  - Sandco Performance production site (https://sandco-performance-production.up.railway.app/) for section order, card pattern and stack. It runs Next.js with Tailwind on Railway, so this spec follows that stack instead of the Butler Performance default of Astro on Render.
- **Data source note:** product names, numbers, categories and pack sizes come from primrose.com (pulled 2026-10-16). Product summaries were rewritten for Sager in plain English from Primrose's descriptions. Have Primrose confirm the summaries before launch (Open items).

## B. Strict rules

- Match the prototype's layout, spacing, tokens and copy exactly. Do not restyle.
- Do not add packages beyond Section D.
- Do not invent copy. All copy comes from Section F and `data/catalog.json`. Leave every `[PLACEHOLDER: ...]` visible until Sager supplies the fact.
- Never fill `price_cents` with an estimate. A null price renders "Price on request."
- Do not change the schema beyond Section E.
- The only brands that appear anywhere in code, comments or metadata are Sager Petroleum Solutions, Primrose product names and the Butler Performance credit line. No other company's branding, assets, colors or fonts.
- Do not use Primrose logos or product photos until Primrose grants written permission (Open items). Use the SVG container illustrations from the prototype until then.
- Do not remove or rename routes listed in Section C once live; add 301 redirects if a URL must change.
- Ask nothing. Where the spec says PLACEHOLDER, leave the placeholder in place.

## C. Step-by-step implementation

### 1. Scaffold
```bash
npx create-next-app@16.4.2 sager-petroleum --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --use-npm
cd sager-petroleum
npm install drizzle-orm@0.45.4 postgres@3.4.9 zod@4.6.7 resend@6.33.0
npm install -D drizzle-kit@0.31.11
```
Then pin every version in `package.json` to the exact values in Section D (remove `^` and `~`).

Folder structure:
```
src/
  app/
    layout.tsx                 header, footer, cart drawer, search, toast, fonts, JSON-LD
    page.tsx                   home
    shop/page.tsx              all products with filters (?op= &tag= &q= &sort=)
    shop/[type]/page.tsx       product type pages, same component with type preset
    product/[slug]/page.tsx    product detail
    operations/page.tsx
    operations/[op]/page.tsx
    kits/page.tsx
    bulk/page.tsx
    guides/page.tsx
    guides/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx
    faq/page.tsx
    order/page.tsx             request pricing (checkout)
    order/[ref]/page.tsx       confirmation
    legal/[doc]/page.tsx       terms | privacy | shipping | accessibility
    admin/login/page.tsx
    admin/orders/page.tsx
    admin/orders/[ref]/page.tsx
    admin/prices/page.tsx
    api/orders/route.ts
    api/leads/route.ts
    api/newsletter/route.ts
    api/admin/login/route.ts
    api/admin/prices/route.ts
    api/admin/orders/[ref]/route.ts
    sitemap.ts
    robots.ts
  components/                  ProductCard, ProductVisual, OpCard, KitCard, GuideCard, CartDrawer, SearchPanel, Toast, Field, Stepper
  content/                     types.ts, operations.ts, kits.ts, guides.ts, faq.ts, config.ts (copy from Section F)
  db/schema.ts, db/client.ts, db/seed.ts
  lib/cart.ts, lib/validate.ts, lib/email.ts, lib/auth.ts, lib/analytics.ts
  styles/tokens.css
data/catalog.json              copied from the prototype folder
drizzle.config.ts
railway.json
```

### 2. Tokens and fonts
- Create `src/styles/tokens.css` with every value in Section D. Import it first in `src/app/globals.css`.
- Map tokens into Tailwind v4 with `@theme inline` in `globals.css` (`--color-bg: var(--bg)` and so on) so utilities read the tokens.
- Fonts through `next/font/google`: `Archivo` (axes `wdth`, weights 600 to 900), `IBM_Plex_Sans` (400, 500, 600), `IBM_Plex_Mono` (400, 500, 600). Expose as `--font-display`, `--font-sans`, `--font-mono`. `display: 'swap'`.
- Dark mode: copy the three-block pattern from the prototype (`:root`, `@media (prefers-color-scheme: dark)`, `:root[data-theme="dark"]`). Dark bands (header, hero, story, spotlight, CTA, newsletter, footer) stay dark in both themes using the `--band-*` tokens.

### 3. Content and config
- `src/content/config.ts` holds every business fact as a constant. Values that are unknown stay as the placeholder strings below and render through a `<Placeholder>` component styled like the prototype `.ph` class.
```ts
export const CONFIG = {
  name: 'Sager Petroleum Solutions',
  legalName: 'Sager Petroleum Solutions, LLC',
  domain: 'sagerpetroleum.com',
  owner: 'Cody Sager',
  city: 'Houma', region: 'LA', regionLong: 'Louisiana',
  phone: '[PLACEHOLDER: phone]',          // display format (985) 555-0100
  phoneE164: '',                           // +19855550100; when empty, call links route to /contact
  email: '[PLACEHOLDER: email]',
  street: '[PLACEHOLDER: street address or pickup yard]',
  hours: '[PLACEHOLDER: hours]',
  deliveryArea: '[PLACEHOLDER: delivery area]',
  responseTime: '[PLACEHOLDER: response time]',
} as const;
```
- Copy `TYPES`, `OPS` (with `picks`), `FEATURED`, `KITS`, `GUIDES`, `FAQ` and `TAG_FILTERS` from the prototype script into `src/content/*.ts` unchanged.

### 4. Database
- Write `src/db/schema.ts` exactly as Section E. Generate and run migrations with `drizzle-kit generate` then `drizzle-kit migrate`.
- `src/db/seed.ts` reads `data/catalog.json` and upserts `products` and `product_sizes`. Sort order: catalog order for products, catalog order for sizes. `price_cents` stays null. Run with `npx tsx src/db/seed.ts` (add `tsx@4.20.6` as a dev dependency only for seeding, listed in Section D).

### 5. Pages (build in this order)
1. **Layout:** utility bar, sticky header (`top: env(safe-area-inset-top)`), nav (Shop, Fuel Additives, Operations, Bulk & Fleet, Guides, About), search button, order button with count badge, footer. Mobile menu below 1024px.
2. **Home** (`/`): hero, What are you running (six operation cards with live product counts), Featured products (eight cards, badges from `FEATURED`), Proven chemistry band (four facts, placeholder quote), Kits (three), Power Klenz ID spotlight, How ordering works (three steps), Field guides (three), CTA band, newsletter. Section order and copy exactly as the prototype.
3. **Shop** (`/shop`, `/shop/[type]`): filter sidebar (product type radios with counts, operation radios with counts, feature checkboxes with counts, Clear filters), search box, sort select (product type order, product number, name A to Z), result count, product grid, empty state. Filters update the URL query with `router.replace` and do not scroll. Product type filter matches `types[]`, not only the primary `type`.
4. **Product** (`/product/[slug]`, slug `{id}-{kebab(name)}`, id-only URLs 301 to the full slug): container visual, eyebrow, H1, tag chips, summary, pack size radio group (default: first gallon or pound size), quantity stepper (1 to 999), Add to order, price line, Request TDS and SDS (links to `/contact?about={id}`), Bulk or tote pricing, Used in chips, related products (same primary type, first four).
5. **Operations** (`/operations`, `/operations/[op]`): dark page band with icon, Where to start picks with "+ Add", bulk panel, full product grid for the operation.
6. **Kits** (`/kits`): three kit cards. "Add kit to order" adds each item at the listed size, quantity 1, merging with existing lines.
7. **Bulk** (`/bulk`, optional `?op=` preselects Operation): form (Name, Company, Phone, Email, Delivery ZIP, Operation, Monthly volume, What do you need), side list, first four FAQs.
8. **Order** (`/order`): empty state when the cart is empty; otherwise form (Name, Company, Phone, Email, Pickup or delivery, Delivery ZIP shown only for delivery, Operation, Notes, tax exemption checkbox) plus sticky order summary with Edit order.
9. **Order confirmation** (`/order/[ref]`): reference number, lines, what happens next, links. Reads the order by `ref` from the database; 404 for an unknown ref.
10. **Guides, About, Contact, FAQ, Legal:** copy from Section F. Contact prefills the message from `?about={id}`.
11. **Admin** (Section C step 7).

Cart: client state in `src/lib/cart.ts` (React context plus `localStorage` key `sps-order-v1`, wrapped in try/catch). Line shape `{ id: string; size: string; qty: number }`. Same product and size merge. Changing a line's size merges into an existing line with that size. Drawer, toast and search behave as the prototype, including focus trap, Escape to close and focus return.

### 6. API routes
All routes validate with Zod, reject bodies over 32 KB, and rate limit by IP at 10 requests per minute (in-memory map is fine for one instance).

**POST `/api/orders`**
```ts
// request
{ contact: { name: string(1..120), company?: string(..160), phone: string (10+ digits), email: email },
  fulfillment: 'pickup' | 'delivery', deliveryZip?: /^\d{5}$/ (required when delivery),
  operation?: 'marine'|'oil-gas'|'fleet'|'agriculture'|'construction'|'industrial'|'other',
  notes?: string(..2000), taxExempt: boolean,
  lines: Array<{ id: string; size: string; qty: int 1..999 }> (1..50 items),
  utm?: { source?: string; medium?: string; campaign?: string } }
// response 201
{ ref: 'SPS-261016-482' }
// errors: 400 { error: 'invalid', fields: { [path]: message } }, 422 { error: 'unknown_product', id, size }, 429
```
- Check every `{id, size}` pair against `product_sizes`. Unknown pair returns 422.
- Ref format `SPS-YYMMDD-NNN` (three random digits, retry on unique conflict).
- Snapshot `unit_price_cents` from `product_sizes.price_cents` (null allowed).
- Send two emails through Resend: to `ORDER_NOTIFY_EMAIL` (full order, contact, reply-to customer) and to the customer (reference, lines, what happens next copy from Section F). Email failure logs the error and still returns 201.

**POST `/api/leads`** `{ kind: 'bulk' | 'contact', name, company?, phone, email, zip?, operation?, volume?, message? }` returns `201 { ok: true }` and emails `ORDER_NOTIFY_EMAIL`.

**POST `/api/newsletter`** `{ email }` upserts into `newsletter_signups`, returns `201 { ok: true }`. No email provider sync in this version.

### 7. Admin
- `/admin/login`: one password field compared to `ADMIN_PASSWORD` with a constant-time compare. On success set an httpOnly, secure, SameSite=Lax cookie signed with `SESSION_SECRET` (HMAC SHA-256, 7-day expiry). All `/admin/*` pages and `/api/admin/*` routes return 401 or redirect without it.
- `/admin/orders`: table of order requests, newest first, filter by status. Columns: ref, date, name, company, fulfillment, line count, status.
- `/admin/orders/[ref]`: full detail, status select (`new`, `quoted`, `approved`, `fulfilled`, `cancelled`), internal note.
- `/admin/prices`: table of every product size with an editable price input (dollars, two decimals, blank means null). CSV export and CSV import with columns `sku,price` (row errors listed by row number; nothing imports until every row is valid).

### 8. SEO
- Metadata per route from Section F (titles under 60 characters, descriptions under 155).
- JSON-LD in layout: `WholesaleStore` (name, legalName, url, address locality Houma, region LA, telephone, areaServed). `FAQPage` on `/faq` and `/bulk`. `Product` on product pages with `name`, `sku` (product number), `brand` `{ "@type": "Brand", "name": "Primrose" }`, `description`. Omit `offers` while price is null.
- `sitemap.ts` lists every static route, every product, type, operation and guide URL. `robots.ts` allows all and disallows `/admin` and `/api`.
- One H1 per page. Canonical URLs on every page. Open Graph title, description and a 1200 x 630 share image (`public/og.png`, dark band with the wordmark and "Keep it running.").

### 9. Tracking
GA4 through `@next/third-parties` is not in the package list, so load `gtag.js` with `next/script` using `NEXT_PUBLIC_GA_ID`. Events:
| Event | When | Params |
|---|---|---|
| `add_to_order` | any add to cart | `product_no`, `size`, `qty`, `source` (card, pdp, pick, spotlight) |
| `kit_add` | Add kit to order | `kit_id` |
| `quote_start` | `/order` renders with items | `line_count` |
| `form_submit` | order, bulk, contact, newsletter success | `form_name` |
| `call_click` | any `tel:` link | `location` |
| `search` | search submit or shop query settles | `search_term` |

UTM convention: lowercase with hyphens. Store the first-touch `utm_source`, `utm_medium` and `utm_campaign` in `sessionStorage` and send them with order and lead requests.

### 10. Phase 2: card checkout (behind `ENABLE_CHECKOUT=false`)
- Add `stripe@23.0.0`. When the flag is true and every line has a price and every size is a case, carton, pail or keg, `/order` shows "Pay now" next to "Send order request".
- `POST /api/checkout` creates a Stripe Checkout Session from DB prices (never client prices), pickup only, `automatic_tax` off until the sales tax setup in Open items is done.
- `POST /api/stripe/webhook` marks the order `approved` on `checkout.session.completed`.
- Drums, totes and bulk always stay order-for-pricing because freight changes the price.

### 11. Deploy (Railway)
- Railway project `bp-sager-petroleum` with two services: `web` (this repo) and `Postgres` (Railway template).
- `railway.json`:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "NIXPACKS", "buildCommand": "npm ci && npm run build" },
  "deploy": { "startCommand": "npx drizzle-kit migrate && npm run start", "healthcheckPath": "/", "restartPolicyType": "ON_FAILURE" }
}
```
- Set the environment variables in Section D in Railway. No secrets in the repo.
- Domain: register `sagerpetroleum.com` (Open items), add it as a custom domain on the `web` service, then add the CNAME Railway shows at the registrar. Redirect `www` to the apex.

## D. Exact values

### Tokens (light, from the prototype `:root`)
| Token | Value | Use |
|---|---|---|
| `--ink-950` | `#0B0C0E` | darkest ink, dark bands |
| `--paper` / `--paper-2` | `#F7F6F2` / `#EEECE5` | page and alternate section backgrounds |
| `--white` | `#FFFFFF` | card surface |
| `--amber` | `#E2761C` | primary buttons, accents, logo |
| `--amber-hi` | `#F09A45` | hover, accent text on dark bands |
| `--amber-deep` | `#8A440A` | accent text on light backgrounds |
| `--on-amber` | `#0B0C0E` | text on amber buttons |
| `--text` / `--text-2` / `--text-3` | `#0B0C0E` / `#363B43` / `#4C525B` | text tiers |
| `--rule` / `--rule-strong` | `rgba(11,12,14,.12)` / `rgba(11,12,14,.26)` | borders |
| `--media` | `#ECEAE3` | product image backgrounds |
| `--band` / `--band-2` | `#0B0C0E` / `#14171B` | dark bands, utility bar |
| `--band-text` / `--band-text-2` | `#F2F2F0` / `#A9AEB5` | text on dark bands |
| `--good-text` / `--err-text` | `#1B7A4E` / `#B42318` | success and error |
| `--t-fuel` `--t-engine` `--t-grease` `--t-gear` `--t-hyd` | `#E2761C` `#3E6FA6` `#3F7D4E` `#8C5A2B` `#2C7F86` | label band per product type |
| `--t-trans` `--t-torque` `--t-tractor` `--t-ind` `--t-spec` | `#6A51A0` `#A13D3D` `#647F2E` `#5A6573` `#A86A2A` | label band per product type |

Dark theme values: copy both dark blocks from the prototype exactly (`--bg #0F1114`, `--bg-2 #15181C`, `--surface #1A1D22`, `--text #F2F2F0`, `--accent-text #F09A45`, `--media #20242A` and the rest).

| Type and layout | Value |
|---|---|
| `--font-display` | Archivo, `font-stretch: 85%`, weight 850, uppercase, letter-spacing `-0.01em`, line-height `0.94` |
| `--font-sans` | IBM Plex Sans 400/500/600, body 16px, line-height 1.55 |
| `--font-mono` | IBM Plex Mono 400/500/600, labels 11.5 to 12px, letter-spacing `0.12em` to `0.16em`, uppercase |
| Hero H1 | `clamp(58px, 10vw, 136px)`, line-height `0.86` |
| Page H1 / H2 | `clamp(38px, 5.6vw, 68px)` / `clamp(32px, 4.6vw, 58px)` |
| Buttons | min-height 48px (42px small), padding `0 22px`, radius 2px, Archivo 800, 13.5px, letter-spacing `0.07em`, uppercase |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64px; section padding `clamp(64px, 8vw, 112px)` |
| Radius | 2px everywhere |
| Container | max-width 1280px; side gutter `max(16px, env(safe-area-inset-left))` under 720px, 32px above |
| Breakpoints | 440, 600, 720, 820, 900, 1024, 1100px (as used in the prototype) |
| Product grid | 4 columns, 3 under 1100px, 2 under 820px, 1 under 440px; gap 20px (14px under 820px) |

### Packages (pinned)
| Package | Version | Use |
|---|---|---|
| next | 16.4.2 | framework (App Router) |
| react / react-dom | 19.3.1 | UI |
| typescript | 5.9.3 | types (stay on 5.9 until Next 16 supports TypeScript 7) |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | styles |
| drizzle-orm | 0.45.4 | database access |
| drizzle-kit | 0.31.11 | migrations (dev) |
| postgres | 3.4.9 | Postgres driver |
| zod | 4.6.7 | request validation |
| resend | 6.33.0 | transactional email |
| tsx | 4.20.6 | seed script runner (dev) |
| stripe | 23.0.0 | Phase 2 only |

### Environment variables
| Name | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Railway Postgres reference variable |
| `RESEND_API_KEY` | `re_...` | secret |
| `EMAIL_FROM` | `Sager Petroleum <orders@sagerpetroleum.com>` | domain must be verified in Resend |
| `ORDER_NOTIFY_EMAIL` | `[PLACEHOLDER: Cody's order inbox]` | receives orders and leads |
| `ADMIN_PASSWORD` | long random string | secret |
| `SESSION_SECRET` | 64 random hex characters | secret |
| `NEXT_PUBLIC_SITE_URL` | `https://sagerpetroleum.com` | canonical URLs, sitemap |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXX` | GA4 |
| `ENABLE_CHECKOUT` | `false` | Phase 2 flag |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | `sk_live_...` / `whsec_...` | Phase 2 only |

## E. Data

```ts
// src/db/schema.ts (Drizzle, Postgres)
products            id text PK ('5007', 'fg-80', 'mp8'), no text NOT NULL, name text NOT NULL,
                    type text NOT NULL, types text[] NOT NULL, summary text NOT NULL,
                    tags text[] NOT NULL DEFAULT '{}', ops text[] NOT NULL DEFAULT '{}',
                    primrose_id int, active boolean NOT NULL DEFAULT true, sort int NOT NULL,
                    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
                    INDEX (type), GIN (types), GIN (ops), GIN (tags)
product_sizes       id serial PK, product_id text FK -> products.id ON DELETE CASCADE,
                    label text NOT NULL ('55 gal drum'), sku text UNIQUE NOT NULL ('5007-55-gal-drum'),
                    price_cents int NULL CHECK (price_cents > 0), sort int NOT NULL,
                    UNIQUE (product_id, label)
order_requests      id uuid PK DEFAULT gen_random_uuid(), ref text UNIQUE NOT NULL,
                    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','quoted','approved','fulfilled','cancelled')),
                    name text NOT NULL, company text, phone text NOT NULL, email text NOT NULL,
                    fulfillment text NOT NULL CHECK (fulfillment IN ('pickup','delivery')), delivery_zip text,
                    operation text, notes text, tax_exempt boolean NOT NULL DEFAULT false, internal_note text,
                    utm_source text, utm_medium text, utm_campaign text, created_at timestamptz DEFAULT now()
                    INDEX (status, created_at DESC)
order_request_lines id serial PK, order_id uuid FK -> order_requests.id ON DELETE CASCADE,
                    product_id text FK -> products.id, size_label text NOT NULL,
                    qty int NOT NULL CHECK (qty BETWEEN 1 AND 999), unit_price_cents int NULL
leads               id serial PK, kind text NOT NULL CHECK (kind IN ('bulk','contact')), name text NOT NULL,
                    company text, phone text NOT NULL, email text NOT NULL, zip text, operation text,
                    volume text, message text, created_at timestamptz DEFAULT now()
newsletter_signups  email text PK, source text, created_at timestamptz DEFAULT now()
```

- **Seed:** `data/catalog.json` (123 products). It is real Primrose catalog data, not sample data, but every `price` is null.
- **Import mapping (catalog.json to schema):** `id` to `products.id`, `no` to `no`, `name` to `name`, `type` to `type`, `types` to `types`, `summary` to `summary`, `tags` to `tags`, `ops` to `ops`, `primroseId` to `primrose_id`, array index to `sort`. Each entry in `sizes` becomes a `product_sizes` row with `label` = size, `sku` = `{id}-{kebab(label)}`, `sort` = index.
- **Size order** in the seed: cases and cartons first, then gallon and pound sizes small to large, then Bulk delivery.

## F. Copy deck

All final copy is in the prototype. This section is the reference for anything a developer or Replit agent needs to transcribe. Product summaries live in `data/catalog.json`.

### Business name options (Cody picks one before filing)
| Option | Notes |
|---|---|
| **Sager Petroleum Solutions, LLC** (recommended) | Says fuel and lubricants without limiting to one brand. `sagerpetroleum.com` showed available on 2026-10-16 (first year about $16; renewal priced separately). |
| Sager Fuel & Lube Supply, LLC | Plainest for buyers. Ampersand in a legal name can complicate some filings. |
| Sager Petroleum Supply, LLC | Reads wholesale and distribution first. |
| Sager Lubricant Supply, LLC | Narrower. Undersells the fuel additive line. |
| Sager Fluid Solutions, LLC | Broad, but "fluid" is vague for a first-time buyer. |
| Bayou Fuel & Lube, LLC | Local and memorable, loses the family name. |

Louisiana name availability is not checked. Search it on the Secretary of State geauxBIZ portal before filing.

### Hero options
| # | Headline | Subhead |
|---|---|---|
| 1 (recommended) | **Keep it running.** | Primrose fuel additives, engine oils, greases and hydraulic fluids for fleets, workboats, farms and job sites. Order by the case, drum or tote. Pricing is confirmed before anything ships. |
| 2 | Fuel. Oil. Grease. Uptime. | The full Primrose line from one Houma supplier, priced to your volume. |
| 3 | Built for the hard hours. | Lubricants and fuel treatments for equipment that runs hot, loaded and wet. |
| 4 | One supplier for the whole machine. | Fuel treatment, engine oil, gear lube and grease in one order and one delivery. |
| 5 | Primrose, supplied from Houma. | 123 products, from quart cases to bulk delivery, with a firm price before anything ships. |

### Home page
- **Eyebrow:** Primrose fuel additives + lubricants · Houma, Louisiana
- **Hero:** option 1. Buttons: "Shop products", "Shop by operation". Note: "The full Primrose Oil Company line: 123 products across 10 product types, from quart cases to bulk delivery." Caption: "No. 5007 · Premium diesel additive / Power Klenz ID with Xtreme Torque / View"
- **What are you running?** Aside: "Pick your operation and we narrow 123 products down to the ones that fit it." Cards:
  - Marine & Offshore: Workboats, crew boats, barges and dock equipment.
  - Oil & Gas: Rigs, mud pumps, compressors and gas engines.
  - Fleets & Trucking: Over-the-road, service and delivery trucks.
  - Agriculture: Tractors, combines, cane harvesters and cotton pickers.
  - Construction & Off-Road: Dozers, loaders, excavators and drill rigs.
  - Industrial & Power: Plants, compressors, turbines and standby generators.
- **Featured products.** Button "Shop all 123 products". Badges: 5007 ULSD · Common rail; 234 API CK-4; 327 Moly-D; 442 Stored diesel; B660 Biodegradable; 253 Tractor hydraulic; 3000 Ethanol gas; 711 Full synthetic.
- **Proven chemistry. Local supply.** "Sager Petroleum Solutions supplies the Primrose Oil Company line out of Houma. You get a manufacturer with decades of grease and fuel additive work behind it, and a supplier you can call by name." Quote: `[PLACEHOLDER: one-line quote from Cody Sager on why he started the company]`, Cody Sager, Founder. Button "About Sager". Facts:
  - NLGI / Grease institute member: Primrose has belonged to the National Lubricating Grease Institute for decades and keeps a Certified Lubricating Grease Specialist on staff.
  - 1940s / War Department roots: Protect-O-Lube was developed for the U.S. War Department in the early 1940s and became the base of the Primrose fuel additive line.
  - Moly-D / Dissolved moly: Armor Plate products carry moly as a dissolved compound instead of the black moly disulfide used in most moly greases.
  - 123 / Products in the line: Fuel additives, engine oils, greases, gear lubes, hydraulic fluids and industrial oils from one supplier.
- **Built for the whole machine.** "Each kit pairs the fuel treatment, oil and grease one operation runs through. One order, one delivery."
  - Fleet Diesel Program (Fleets & Trucking): Fuel, engine, axles and grease points for a diesel fleet. One order, one delivery. 5007 55 gal drum, 234 55 gal drum, 745 120 lb keg, 327 120 lb keg.
  - Workboat Package (Marine & Offshore): Stored fuel, engine oil, deck hydraulics and wet grease points on a working boat. 442 55 gal drum, 711 55 gal drum, B660 55 gal drum, 558 35 lb pail.
  - Harvest Season Kit (Agriculture): Farm fuel, tractor hydraulics, grease points and seal care before the season starts. 2001 55 gal drum, 253 55 gal drum, 357 120 lb keg, 532T case of 6 x 1 gal.
  - Price line: "Kit pricing on request". Button: "Add kit to order". Toast: "Added {kit name} (4 products)".
- **Spotlight:** eyebrow "Premium diesel additive · No. 5007", H2 "Power Klenz ID". "Built for high pressure common rail engines running ULSD. It cleans up injector deposits, keeps new ones from forming and adds cetane for power." Rows: Injector deposits / Quick clean and keep clean chemistry for internal diesel injector deposits. Cetane boost / Xtreme Torque cetane improver for power and performance. ULSD upgrade / Adds detergency, stability and lubricity to ultra low sulfur diesel. Pack sizes / (from data). Buttons "Add a 55 gal drum", "View product". Fine print: "Follow the treat rate on the Primrose Technical Data Sheet."
- **How ordering works.** Aside: "No account needed. Nothing ships until you approve the price."
  1. Build your order: Add products and pack sizes, from quart cases to 275 gallon totes.
  2. Get your price: Sager confirms price, freight and timing within `[PLACEHOLDER: response time]`. You approve before anything ships.
  3. Pick up or deliver: Pick up in Houma or get it delivered to your yard, dock or job site in `[PLACEHOLDER: delivery area]`.
- **Field guides.** Three cards (below).
- **CTA band:** "Running a fleet, a boat or a yard?" / "Set up a bulk account for drums, totes and bulk delivery priced to your volume." Buttons "Get bulk pricing", "Shop products".
- **Newsletter:** "Stay stocked." / "Seasonal fuel tips, product news and bulk offers from Sager." Field "Email address", button "Sign up", note "Unsubscribe any time. Sager never sells your details." Success: "You are on the list. Watch for the first email from Sager."
- **Footer:** "Primrose fuel additives and lubricants for fleets, boats, farms, job sites and plants." Contact block from CONFIG. Columns Shop, Operations, Company. Legal row. "© {year} Sager Petroleum Solutions, LLC. All rights reserved." "Digital experience by Butler Performance" linking to https://butler-performance.com. Trademark line: "Primrose, Odyssey, Syn-O-Gen, Armor Plate, Moly-D, Enviro Blend, Klenz ID, Protect-O-Lube and other Primrose product names are trademarks of Primrose Oil Company, Inc. Sager Petroleum Solutions is an independent distributor. Always follow the product label, Technical Data Sheet and Safety Data Sheet."

### Product type blurbs (shop intro line)
- Fuel Additives: Diesel and gasoline treatments for injector deposits, cetane, cold flow, water and stored fuel.
- Engine Oils: Heavy duty diesel, natural gas, passenger car and 2-cycle oils plus oil supplements.
- Greases: Armor Plate Moly-D, synthetic, food grade and specialty greases.
- Gear Lubricants: Moly-D XHP and full synthetic gear oils for axles, gearboxes, open gears and mud pumps.
- Hydraulic Fluids: Industrial, anti-wear, biodegradable and food grade hydraulic oils.
- Transmission Fluids: ATF, Cat TO-4 and synthetic manual transmission lubricants.
- Torque Fluids: Universal torque converter and Twin Disc torque fluids.
- Tractor Fluids: UTTO and tractor hydraulic fluids plus seal conditioner.
- Industrial Oils: Compressor, turbine, way, cutting, heat transfer and rock drill oils.
- Specialty Products: Cleaners, chain and cable lubes, spray adjuvants and leather oil.
- All products: The full Primrose Oil Company line. Filter by product type, operation or feature. Or search by product number.

### Operation pages (intro and Where to start)
- **Marine & Offshore:** Stored diesel on a boat picks up water and microbes. Hydraulics and grease points work next to open water, so what leaks matters. Start with fuel stability and biodegradable fluids. Picks: 442 Keeps stored diesel stable and dry. 3895 Stabilizes or polishes fuel in steel tanks. B660 Biodegradable hydraulic oil for deck gear. 558 Non-toxic grease for valves and bearings in contact with water. 220 2-cycle oil with fuel stabilization built in.
- **Oil & Gas:** Drilling and production equipment runs hot, loaded and nonstop. Mud pumps, plungers, open gears and natural gas engines each need a lubricant built for that job. Picks: 714M Gear oil for high pressure mud pumps. 324 Pass-through grease for plungers. 555 Adhesive grease for open gears and cables. 711G Full synthetic natural gas engine oil. 5007 Injector deposit control for diesel service fleets.
- **Fleets & Trucking:** Common rail diesels on ULSD build injector deposits that cost power and fuel economy. Pair a fuel program with the right engine oil, gear lube and grease. Picks: 5007 Cleans injector deposits and boosts cetane in ULSD. 234 API CK-4 synthetic blend moly engine oil. 745 Full synthetic 75W-90 for rear axles. 327 Multipurpose Moly-D grease for chassis points. 409 Cold flow protection for winter routes.
- **Agriculture:** Farm equipment runs hard through harvest and then sits. Tractor fluids, gearbox grease and a diesel treatment cover most of the yard. Picks: 253 Synthetic blend tractor hydraulic and transmission fluid. 252 UTTO for transmissions, wet brakes and PTO clutches. 358 Semi-fluid grease for corn head gearboxes. 323 Spindle grease for cotton pickers. 2001 Premium diesel additive for farm fuel tanks.
- **Construction & Off-Road:** Heavy iron sees dust, shock loads and heat. Moly-D grease, a Cat TO-4 drive train fluid and a diesel treatment cover the core of most fleets. Picks: 327C Heavy NLGI 3 Moly-D grease for hot, high pressure points. 501 Meets Caterpillar TO-4 for transmissions and drive trains. 213R Rock drill oil in three viscosity grades. 625 Coolant and dust control for concrete cutting. 5007 Injector deposit control for common rail diesels.
- **Industrial & Power:** Plant equipment runs around the clock and standby generators have to start when called. Match compressor, turbine, gear and hydraulic oils to the equipment and keep stored fuel stable. Picks: 236 Compressor oil that keeps carbon in check. 242 Turbine oil for steam, water and gas turbines. 747S Synthetic EP oil for enclosed gear drives. 788 One synthetic fluid for turbines, hydraulics and compressors. 3895 Keeps generator fuel tanks usable.
- Side panel: "Running more than a few units?" / "Sager sets up bulk accounts with drums, totes and scheduled delivery for {operation} customers." / "Get bulk pricing".

### Bulk and fleet page
- Eyebrow "Bulk & fleet accounts", H1 "Priced to your volume." Lede: "Drums, totes and bulk delivery for fleets, boats, farms, contractors and plants. Tell Sager what you run and how much you use, and get a price built for it."
- Form title "Request bulk pricing". Monthly volume options: Under 55 gallons; 55 to 275 gallons; 275 to 1,000 gallons; Over 1,000 gallons; Not sure yet. Textarea placeholder: "Products, tank sizes, number of units, delivery schedule". Button "Send request". Note "Sager replies within `[PLACEHOLDER: response time]`."
- Side list "What a bulk account covers": Pack sizes / 55 gallon drums, 275 gallon totes and bulk delivery, plus cases for the shop shelf. Fuel programs / Treat rates matched to your tanks and the problems you are seeing. Delivery / To your yard, dock or job site in `[PLACEHOLDER: delivery area]`. Terms / `[PLACEHOLDER: confirm whether net terms are offered]`.
- Success: "Request received." / "Sager will reply within {responseTime} with pricing for your volume."

### About page
- H1 "Sager Petroleum Solutions." Lede: "Primrose fuel additives and lubricants for fleets, boats, farms, job sites and plants, supplied out of Houma, Louisiana."
- "Sager Petroleum Solutions is owned and run by Cody Sager. `[PLACEHOLDER: two or three sentences on Cody's background and why he started the company]`"
- Why Primrose: "Primrose Oil Company makes greases, gear lubes, engine oils, hydraulic fluids, industrial oils and fuel additives in Dallas, Texas. The line runs 123 products deep, so one supplier can cover most of what an operation runs through." / "Primrose has belonged to the National Lubricating Grease Institute for decades and keeps a Certified Lubricating Grease Specialist on staff. Its fuel additive line traces back to Protect-O-Lube, developed for the U.S. War Department in the early 1940s."
- How Sager works: "You send an order or a question. Sager confirms price, freight and timing. Nothing ships until you approve it. Pick up in Houma or get delivery to your yard, dock or job site."
- For government and fleet buyers: `[PLACEHOLDER: UEI, CAGE code and any veteran-owned or small business certifications]`

### Contact page
- H1 "Talk to Sager." Lede: "Questions about a product, a data sheet or an order. Call, email or send a note below." Fields Name, Phone, Email, Message. Button "Send message". Prefill from a product: "Please send the Technical Data Sheet and Safety Data Sheet for No. {no} {name}." Success: "Message received." / "Sager will reply within {responseTime}."

### Guides (full text)
**1. Why common rail diesels stick injectors on ULSD** (Diesel · 3 min read; cover "IDID", "No. 5001 · 5002 · 5007"). Excerpt: Internal diesel injector deposits cost power and fuel economy. Here is what causes them and what clears them.

Modern diesel engines run high pressure common rail injectors with very tight clearances. Ultra low sulfur diesel (ULSD) cleaned up emissions, but today's fuel can leave deposits inside the injector itself. The industry calls them internal diesel injector deposits, or IDID.
*What it looks like:* hard starts and rough idle; lost power and a drop in fuel economy; injectors that stick or need replacing early; more frequent DPF regenerations.
*Why ordinary cleaners miss it:* Older additives were built to clean the nozzle tip. IDID forms inside the injector body, where the needle moves. It takes detergent chemistry built for those deposits.
*What to do:* Start with clean, dry fuel. Drain water from tanks and change filters on schedule. Then treat with a premium diesel additive built for IDID. Primrose Klenz ID 5001, Power Klenz ID 5002 and Power Klenz ID 5007 clean up existing deposits and keep new ones from forming. They also add detergency, stability and lubricity to ULSD. The Power Klenz versions add a cetane improver. Ask for the Technical Data Sheet to set the right treat rate for your tank sizes.

**2. Water and microbes in stored diesel** (Storage · 3 min read; cover "H2O", "No. MP8 · 3895 · 442"). Excerpt: Plugged filters and black slime usually start with water in the tank. Fix it in the right order.

Diesel that sits in a tank picks up water from condensation, and water is where microbes grow. Bacteria and fungi live where the water meets the fuel. They form slime, feed on the fuel and leave acids that corrode steel tanks.
*Signs you have a problem:* filters plugging early, often with dark slime; sludge or a hazy layer in tank samples; a rotten egg odor at the tank; engines losing power on fuel from one tank.
*Fix it in order:* (1) Pull a sample from the tank bottom and drain the water. (2) Treat with a microbicide at the dose on its label. Primrose MP8 Microbicide kills bacteria and fungi. (3) Change filters after treatment. Dead growth breaks loose and needs somewhere to go. (4) For fuel that has started to turn, 3895 Concentrated Tank Cleaner has a shock treatment to polish it and a quarterly dose to keep it stable.
*Keep it from coming back:* Drain water on a schedule, keep vents and fill caps tight and treat stored fuel with a stabilizer such as GoMaster Platinum 442.

**3. Ethanol, water and the gas in your boat** (Marine · 3 min read; cover "E10", "No. 3000 · 3030 · 220"). Excerpt: Phase separation can stall an outboard on the water. Stabilizers prevent it. Nothing reverses it.

Most pump gas is blended with ethanol, usually 10% (E10). Ethanol pulls in water. Around a marina or a humid shed, a tank that sits for weeks can take on enough water to separate.
*What phase separation is:* Once the fuel holds more water than it can carry, the water and much of the ethanol drop to the bottom of the tank as a separate layer. What stays on top is gasoline with less octane. If the pickup draws from the bottom layer, the engine can stall or run poorly.
*What a treatment can and can't do:* A stabilizer helps prevent separation. It does not reverse it. Once fuel has separated, the bottom layer has to come out.
*Keep it from happening:* treat fuel when you fill up, not after it sits; use fresh fuel and don't leave a part-full tank sitting for weeks; check water separators and filters often; for 2-cycle outboards, Odyssey 220 has fuel stabilization built in. Primrose Phaser 3000 is a fuel stabilizer built for ethanol blended gasoline. It also cleans carbon, gum and varnish from the fuel system.

Guide side panel: "Not sure what to use?" / "Tell Sager what you are seeing and what you run. You get a product and a treat rate." / "Ask Sager".

### FAQ
1. Why don't you list prices? Pricing depends on volume, pack size and freight. Add what you need to your order and Sager sends back a firm price before anything ships.
2. Can I pick up in Houma? Yes. Choose pickup when you send your order. Pickup location and hours: `[PLACEHOLDER: street address or pickup yard]`, `[PLACEHOLDER: hours]`.
3. Do you deliver? Yes, to `[PLACEHOLDER: delivery area]`. Drums, totes and bulk can go straight to your yard, dock or job site.
4. Do you have Technical Data Sheets and Safety Data Sheets? Yes. Every Primrose product has a Technical Data Sheet and a Safety Data Sheet. Ask on your order or through the contact form and Sager sends them over.
5. Which fuel additive is right for my fuel? Start with the problem you are seeing: injector deposits, gelling, water and microbes or stored fuel going bad. The field guides cover each one, or call and talk it through.
6. Do I need an account to order? No. Send an order request as a guest. Bulk and fleet customers can set up an account for repeat orders. Terms: `[PLACEHOLDER: confirm whether net terms are offered]`.

### Order flow microcopy
| Element | Copy |
|---|---|
| Card button | + Add to order |
| Card price (null) | Price on request |
| Product page price line | **Price on request.** Sager confirms price and freight before anything ships. |
| Product buttons | Add to order / Request TDS and SDS / Bulk or tote pricing |
| Toast | Added No. {no}, {size} (x {qty} when more than 1) / button: View order |
| Drawer title | Your order ({count}) |
| Drawer footer | Sager confirms price, freight and timing before anything ships. No payment now. / Request pricing / Keep shopping |
| Drawer empty | **Your order is empty.** Start with fuel additives or browse all 123 products. / Fuel additives |
| Order page H1 and lede | Request pricing. / Send your order and Sager confirms price, freight and timing within {responseTime}. Nothing ships until you approve it. |
| Fulfillment options | Pickup in Houma / Delivery |
| Notes placeholder | PO number, delivery window, tank sizes or anything Sager should know |
| Tax checkbox | I have a sales tax exemption certificate. Sager will ask for a copy. |
| Submit and note | Send order request / No payment now. Sager sends a firm quote first. |
| Empty order page | Your order is empty. / Add products and pack sizes first, then send the order for pricing. / Shop products / See kits |
| Confirmation | Order request sent / Thanks. Sager has your order. / Reference / What happens next: (1) Sager reviews your order and confirms price, freight and timing within {responseTime}. (2) You approve the quote by phone or email. (3) Pick up in Houma or take delivery at your yard, dock or job site. / Keep shopping / Read the field guides |
| Shop empty | **No products match those filters.** Clear a filter or search by product number, like 5007 or 327. / Clear filters |
| Shop count | Showing {n} of 123 products |
| Search placeholder and hint | Product number or name, like 5007 or grease / Try 5007, Odyssey, grease, winter or biodegradable. |
| Search no results | No products match. Try a product number like 327 or a word like hydraulic. |
| 404 | That page is not here. / Search by product number or head back to the shop. |
| Errors | Enter your name. / Enter a phone number with area code. / Enter an email address like name@company.com. / Enter a 5-digit ZIP code. / Tell Sager what you need. |
| Server error (production) | That did not go through. Check your connection and try again, or call `[PLACEHOLDER: phone]`. |

### Meta titles and descriptions
| Page | Title | Description |
|---|---|---|
| Home | Primrose Lubricants in Houma, LA \| Sager Petroleum | Primrose fuel additives, engine oils, greases and hydraulic fluids from Houma, Louisiana. Order by the case, drum or tote. Bulk pricing on request. |
| Shop | Shop Primrose Fuel Additives & Lubricants \| Sager | Browse 123 Primrose fuel additives, engine oils, greases, gear lubes, hydraulic fluids and industrial oils. Filter by operation or product number. |
| Product type | Primrose {Type} \| Sager Petroleum | Primrose {type, lowercase} in cases, drums, totes and bulk. Order from Sager Petroleum Solutions in Houma, LA, with pricing before anything ships. |
| Product | No. {no} {name, cut to fit} \| Sager (60 max) | No. {no} {name} from Primrose. Pack sizes from {first size} to {last size}. Order from Sager in Houma, LA. (cut to 155) |
| Operation | {Operation} Lubricants \| Sager Petroleum | Write one per operation from its intro line, 155 max. Example (construction): Primrose greases, drive train fluids and diesel additives for dozers, loaders, excavators and drill rigs. Bulk pricing from Sager in Houma, LA. |
| Kits | Lubricant Kits for Fleets, Boats & Farms \| Sager | Fuel treatment, oil and grease kits for diesel fleets, workboats and harvest season. Add a kit, adjust sizes and get one price from Sager. |
| Bulk | Bulk Lubricants & Fleet Accounts in Houma, LA \| Sager | Drums, totes and bulk delivery of Primrose lubricants and fuel additives, priced to your volume. Request bulk pricing from Sager Petroleum Solutions. |
| Guides | Fuel & Lubricant Field Guides \| Sager Petroleum | Short guides to injector deposits, microbes in stored diesel and ethanol phase separation, with the Primrose products built for each problem. |
| Guide 1 | Why Common Rail Diesels Stick Injectors \| Sager | Internal diesel injector deposits cost power and fuel economy on ULSD. What causes them, how to spot them and the Primrose additives that clear them. |
| Guide 2 | Water and Microbes in Stored Diesel \| Sager | Plugged filters and black slime start with water in the tank. Fix microbes in stored diesel in the right order with Primrose MP8, 3895 and 442. |
| Guide 3 | Ethanol, Water and Boat Fuel \| Sager Petroleum | How E10 phase separation stalls outboards, why stabilizers prevent it but cannot reverse it and how to keep boat fuel usable. |
| About | About Sager Petroleum Solutions \| Houma, LA | Sager Petroleum Solutions supplies the Primrose Oil Company line of fuel additives and lubricants from Houma, Louisiana. |
| Contact | Contact Sager Petroleum Solutions \| Houma, LA | Call, email or message Sager Petroleum Solutions for Primrose product questions, data sheets, orders and bulk pricing in Houma, Louisiana. |
| FAQ | FAQ \| Sager Petroleum Solutions | Answers on pricing, pickup in Houma, delivery, data sheets, choosing a fuel additive and ordering without an account. |

### Google Business Profile description (606 of 750 characters)
Sager Petroleum Solutions supplies Primrose Oil Company fuel additives and lubricants from Houma, Louisiana. We carry the full Primrose line: diesel and gasoline fuel additives, heavy duty engine oils, Armor Plate Moly-D greases, gear lubricants, hydraulic fluids, transmission fluids and industrial oils. Order by the case, pail, drum or tote, with bulk delivery for fleets, workboats, farms, contractors and plants. Every order gets a firm price before anything ships. Pick up in Houma or get delivery to your yard, dock or job site. Ask for the Technical Data Sheet and Safety Data Sheet on any product.

### Photo shot list (replaces SVG containers once Primrose approves)
| Shot | Orientation | Count |
|---|---|---|
| Primrose product photos on white, one per product number (request from Primrose marketing first) | square 1:1, 1600px | 123 |
| Drum, pail and tote lineup at the Sager pickup location | landscape 16:9 | 3 |
| Cody with a delivery at a dock, a farm and a job site | landscape 3:2 | 3 |
| Close-ups: grease gun on a fitting, fuel treatment pour, filter change | square | 3 |

## G. Validation checklist
- [ ] Lighthouse mobile scores 90 or higher for performance, accessibility, best practices and SEO on `/`, `/shop` and `/product/5007-power-klenz-id-with-xtreme-torque`.
- [ ] `/shop` shows "Showing 123 of 123 products". Selecting Greases shows 12. Selecting Tractor Fluids shows 4. Searching "winter" shows 18.
- [ ] Every page renders exactly one H1, and every title is 60 characters or fewer and every description 155 or fewer.
- [ ] Adding No. 5007 in a 55 gal drum with quantity 2, then the Workboat Package, shows a badge of 6 and five drawer lines.
- [ ] Changing a drawer line's size to a size already in the order merges the two lines into one with the summed quantity.
- [ ] Submitting `/order` empty shows the name, phone and email errors in text and moves focus to Name. Choosing Delivery reveals Delivery ZIP and a 4-digit ZIP is rejected.
- [ ] A valid order returns 201, writes one `order_requests` row with matching `order_request_lines`, emails `ORDER_NOTIFY_EMAIL` and the customer, clears the cart and lands on `/order/SPS-YYMMDD-NNN`.
- [ ] `POST /api/orders` with `{ id: '5007', size: '1 gal jug' }` returns 422 and writes nothing.
- [ ] Setting a price for `5007-5-gal-pail` in `/admin/prices` shows that price on the product page and card for that size, while other sizes still read "Price on request."
- [ ] An unauthenticated request to `/admin/orders` redirects to `/admin/login` and to `/api/admin/prices` returns 401.
- [ ] No horizontal scroll at 375px on any route, and the primary CTA and the cart button are visible above the fold on the home page at 375 x 812.
- [ ] Keyboard alone can open search, add a product, open the drawer, change quantity, reach Request pricing and submit, with a visible focus ring at each step. Escape closes the drawer and returns focus.
- [ ] `WholesaleStore`, `FAQPage` (on `/faq`) and `Product` JSON-LD pass the Rich Results Test, and `sitemap.xml` lists all 123 product URLs.
- [ ] Light and dark themes both pass WCAG AA contrast on body text, buttons and placeholder chips.
- [ ] The footer credit reads "Digital experience by Butler Performance" and links to `https://butler-performance.com` with the hyphen. A repo search finds no brand names other than Sager Petroleum Solutions, Primrose product names and Butler Performance.

## H. Open items
| Item | Owner | Blocks |
|---|---|---|
| Pick the business name and file it (new LLC or a trade name under Sager Enterprises, LLC). Check Louisiana SOS availability first. Not legal advice; talk to a CPA or attorney about which structure fits. | Cody Sager | Legal name in footer, terms, email domain |
| Register `sagerpetroleum.com` (showed available 2026-10-16; availability is not held) | Cody Sager or Chase | Domain, email, Resend verification |
| Confirm authorized Primrose distributor status, territory and written permission to list product names, numbers, summaries, TDS/SDS and photos online. Ask whether Primrose has minimum advertised pricing. | Cody Sager with Primrose | Launch |
| Have Primrose review the 123 product summaries in `data/catalog.json` | Cody Sager with Primrose | Launch |
| Phone, email, pickup address, hours, delivery area, response time | Cody Sager | Every placeholder in CONFIG |
| Founder bio, pull quote, veteran-owned status (if any), UEI and CAGE codes | Cody Sager | About page, home quote |
| Price list by pack size (cases and pails first) | Cody Sager | Showing prices; Phase 2 checkout |
| MP8 Microbicide is a pesticide product. Confirm EPA and Louisiana registration and label rules for selling it online before it stays in the catalog. | Cody Sager with Primrose | MP8 listing |
| Hazmat: identify which fuel additives ship as DOT hazardous materials. Launch with pickup and local delivery only. | Cody Sager | Any carrier shipping |
| Sales tax: Louisiana state and parish collection and how exemption certificates are stored | Cody Sager with his accountant | Phase 2 checkout |
| Does "fuel" include bulk diesel or gasoline delivery, or only Primrose fuel additives? | Chase to ask Cody | Possible fuel delivery page |
| Legal pages (terms, privacy, shipping and returns, accessibility) | Counsel | Launch |
| Create repo `butler4410-oss/sager-petroleum`, Railway project and plan. Monthly cost: `[PLACEHOLDER: cost]` | Chase | Build start |
| Resend account, verified sending domain, `ORDER_NOTIFY_EMAIL` inbox | Developer with Cody | Order emails |
| GA4 property and Google Business Profile | Cody Sager | Tracking, GBP description |
