# Agency Luxury Self for Nuklo

Multilingual `sales@1.1.0` remote-static theme for Agency Luxury Self. It includes the migrated real-estate portfolio and journal, four localized route trees (`es`, `en`, `de`, `fr`), Atelier commerce surfaces, cart, checkout, private order confirmation, enquiries, SEO metadata, structured data, and legacy redirects/410 responses.

## Local development

Requires Node `20.19+` (Node 22 or 24 is also supported).

```bash
npm ci
npm run dev
```

The local preview uses editorial sample data. Real products, variants, prices, stock, cart, orders, tenant currency, and enquiries are supplied by the Nuklo SALES runtime after import.

## Release

```bash
npm run release
```

The command builds and validates the immutable artifact in `out/`, including `nuklo.template.json`, per-route HTML, `integrity.json`, `redirects.json`, sitemap, localized SEO, prerendered property/article content, and JSON-LD. Production releases must set `THEME_SOURCE_COMMIT` to the exact source commit and use the versioned base declared in `theme.release.json`.

See [RELEASE.md](RELEASE.md) for the import URL and release guarantees.
