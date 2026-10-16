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
