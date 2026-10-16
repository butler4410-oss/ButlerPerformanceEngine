# Sager Petroleum Solutions

Ecommerce prototype and build package for Sager Petroleum Solutions, LLC: Primrose Oil Company fuel additives and lubricants supplied from Houma, Louisiana. A Butler Performance client build (Mode B).

Preview: https://claude.ai/artifact/AwkgWwrnJjDzYmJ5evG2oR (private until shared)

| File | What it is |
|---|---|
| `index.html` | Self-contained clickable prototype. Open it in a browser. Hash routes: `#/shop`, `#/product/5007`, `#/ops/marine`, `#/kits`, `#/bulk`, `#/guides`, `#/about`, `#/contact`, `#/checkout`. |
| `data/catalog.json` | 123 Primrose products with numbers, names, types, operations, tags, pack sizes and a null price per product. Seed data for the production build. |
| `sager-petroleum-build-spec.md` | Build spec and copy deck for the production Next.js site (sections A to H). |
| `tools/build.py` | Inlines `data/catalog.json` into `index.html`. Run after editing the catalog: `python3 tools/build.py`. |

Every unknown business fact (phone, email, pickup address, hours, delivery area, response time, founder bio) shows as a visible `[PLACEHOLDER: ...]` and lives in the `CONFIG` block at the top of the prototype script.

Forms run in prototype mode: nothing is sent until `formEndpoint` is set in `CONFIG`. The production build replaces that with the API routes in the spec.

## Hosting on Railway

`server.js` is a zero-dependency Node server. It serves only the storefront (the spec, data and tools in this folder stay private), gzips the page, sends security headers, answers `/healthz` for Railway's health check and redirects clean paths like `/shop` or `/product/5007` to the matching page view. Search engines are blocked until launch.

**One-time setup in the Railway dashboard**
1. New Project, then Deploy from GitHub repo, then pick `butler4410-oss/ButlerPerformanceEngine`. Rename the project `bp-sager-petroleum`.
2. Open the service, then Settings:
   - Source: Root Directory `/sites/sager-petroleum`. Branch: `main` once PR #2 is merged, or `ccr-4b63c276-kn8e8e` to go live now.
   - Config-as-code: Railway Config File `/sites/sager-petroleum/railway.json` (Railway does not look inside the root directory for this file on its own).
   - Networking: Generate Domain. That gives a public `*.up.railway.app` link.
3. Deploys run on every push that touches `sites/sager-petroleum/`.

**Variables (optional)**
| Name | When | Effect |
|---|---|---|
| `ALLOW_INDEXING` | `true` at launch, once placeholders are filled | Removes the noindex tag and header and opens `robots.txt` |
| `FORM_ORIGIN` | When `formEndpoint` is set, for example `https://formspree.io` | Lets the page post forms to that origin |

**Custom domain:** Settings, Networking, Custom Domain, enter `sagerpetroleum.com`, then add the record Railway shows at the domain registrar.

**Run it locally:** `npm start`, then open http://localhost:3000.
