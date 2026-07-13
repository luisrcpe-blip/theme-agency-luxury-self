import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

import {
  INTEGRITY_FILE,
  LOCALES,
  MANIFEST_FILE,
  OUT_DIR,
  PAGE_COVER_PATHS,
  PROJECT_ROOT,
  SOURCE_MEDIA_ASSETS,
  loadReleaseSource,
} from "./release-config.mjs";
import {
  PROPERTY_LOCALES,
  localizePropertyFacts,
  propertyMatchesType,
} from "../src/property-localization.js";

const MAX_MANIFEST_BYTES = 256 * 1024;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_ROUTE_HTML_BYTES = 16 * 1024 * 1024;
const REQUIRED_SURFACES = ["SHOP_HOME", "SHOP_COLLECTION", "SHOP_PRODUCT", "CONTENT_PAGE"];
const REQUIRED_CAPABILITIES = [
  "tenant",
  "branding",
  "media",
  "tracking",
  "catalog",
  "product",
  "collection",
  "cart",
  "checkout",
  "orders",
  "contactInquiry",
  "contentPage",
];
const PRIVATE_KINDS = new Set(["cart", "checkout", "order"]);
const EXPECTED_PROPERTY_TYPES = {
  Villa: {
    typeKey: "villa",
    labels: { es: "Villa", en: "Villa", de: "Villa", fr: "Villa" },
  },
  Apartamento: {
    typeKey: "apartment",
    labels: { es: "Apartamento", en: "Apartment", de: "Wohnung", fr: "Appartement" },
  },
  Penthouse: {
    typeKey: "apartment",
    labels: { es: "Ático", en: "Penthouse", de: "Penthouse", fr: "Penthouse" },
  },
};
const EXPECTED_PROPERTY_STATUS = {
  statusKey: "for-sale",
  labels: { es: "En venta", en: "For sale", de: "Zum Verkauf", fr: "À vendre" },
};
const EXPECTED_OG_BY_TRANSLATION_KEY = Object.freeze({
  "shop.home": PAGE_COVER_PATHS.home,
  "content.properties": PAGE_COVER_PATHS.properties,
  "content.interiors": PAGE_COVER_PATHS.interiors,
  "shop.collection": PAGE_COVER_PATHS.atelier,
  "content.services": PAGE_COVER_PATHS.services,
  "content.about": PAGE_COVER_PATHS.about,
  "content.blog": PAGE_COVER_PATHS.blog,
  "content.contact": PAGE_COVER_PATHS.contact,
  "content.privacy": PAGE_COVER_PATHS.home,
  "content.cookies": PAGE_COVER_PATHS.home,
  "content.legal": PAGE_COVER_PATHS.home,
  "commerce.cart": PAGE_COVER_PATHS.home,
  "commerce.checkout": PAGE_COVER_PATHS.home,
  "shop.product": PAGE_COVER_PATHS.atelier,
  "commerce.order": PAGE_COVER_PATHS.home,
});
const EXPECTED_SOURCE_HASHES = Object.freeze({
  "assets/source/pages/home-cover.webp": "421693da60c067ae9914d5407a2483fa8d0074d170316b97fb26d9ee5ad45b04",
  "assets/source/pages/about-cover.jpg": "6e1b000a9ffb91c4743f885d78ba35ed1dd80a59a2bf51502739ec15793e453c",
  "assets/source/pages/properties-cover.webp": "5c0233b9f5e3c8bcae771fd34ff91da582957265ecf13dd92cd1eac7388f4466",
  "assets/source/pages/management-cover.jpg": "d1dd970b929c710611c1d4d78f2afdc0608a2d5f2308d890af1bd517c8d171b3",
  "assets/source/pages/interiors-cover.webp": "fca89f14d4d098cdf2f81c588fb1318b984506b22693d786cbb7fc1dc76ae627",
  "assets/source/pages/atelier-cover.webp": "29b6af6a25f410222fb82a2791ae1440446d8ceb517d6a5e30e1f99d73123e38",
  "assets/source/pages/blog-cover.jpg": "37d303930afa71aca8aa9bd6938082404dfae96016d4395019636e9e53652cbd",
  "assets/source/pages/contact-cover.jpg": "e848be371169caa1fbd28dba1fb606b8e7c9459c9d2090394b4300ac02f9284d",
  "assets/source/pages/contact-form-keys.webp": "7816f5c953389d966f868109d115e8a7a9aeb8e9c7f04d6ea3b1f188d2c0342d",
  "assets/source/blog/sidebar-contact-bg.webp": "86c109c851a0390bfca57d213c838b760921e97dcd4e525bd31a9c4d5e559139",
  "assets/source/brand/als-logo-dark.webp": "634881232b0bc1c01c17ba34aab5dbc1762c4b7305b82f2d484225bc3677f416",
  "assets/source/brand/als-logo-light.webp": "73727a9f210a1773a9ef72aa419fd34c25ef7fc415400c521290074fdb4d0a0e",
  "assets/source/brand/flags/de.svg": "8fcaa96d8835e39fa6a74ff4dc781d908112d46ceb8fb81ff37c433f390a4c8b",
  "assets/source/brand/flags/en.svg": "4c5edc0c143fffe3bfed4126d2b3527e6e21c57499af43f9577b45c6eb93e598",
  "assets/source/brand/flags/es.svg": "8fc508fdb3ef11a4e38f9123f1ae903962ca14841cefd7b98ed5550d50d2f1bb",
  "assets/source/brand/flags/fr.svg": "a7d195ab974d9555702eede5af18287b5767efcea5fc6dadf529e114dc6fb568",
});

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function normalizePath(value) {
  const path = String(value || "").trim();
  if (path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function isSafeRoutePath(value) {
  const path = String(value || "").trim();
  if (!path.startsWith("/") || path.includes("//") || /[?#\\%\u0000-\u001f]/u.test(path)) return false;
  if (path === "/") return true;
  const params = new Set();
  return normalizePath(path).slice(1).split("/").every((segment) => {
    if (segment === ":slug" || segment === ":token") {
      if (params.has(segment)) return false;
      params.add(segment);
      return true;
    }
    return /^[\p{L}\p{N}](?:[\p{L}\p{N}._~-]*[\p{L}\p{N}_~-])?$/u.test(segment);
  });
}

function isSafeHtmlPath(value) {
  const path = String(value || "").trim();
  if (!path || path.startsWith("/") || path.includes("//") || /[?#\\:%\u0000-\u001f]/u.test(path)) return false;
  const parts = path.split("/");
  return parts.every((part) => /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9_-])?$/.test(part)) && path.toLowerCase().endsWith(".html");
}

async function walkFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function relativePath(path) {
  return relative(OUT_DIR, path).split(sep).join("/");
}

function validateManifestShape(manifest) {
  assert(manifest.id === "agency-luxury-self", "Manifest theme id invalido.");
  assert(manifest.mode === "sales", "Manifest mode debe ser sales.");
  assert(manifest.contractVersion === "sales@1.1.0", "Manifest debe usar sales@1.1.0.");
  assert(manifest.templateVersion === "1.0.5", "Manifest debe usar templateVersion 1.0.5.");
  assert(manifest.renderer === "remote-static-app", "Manifest renderer debe ser remote-static-app.");
  assert(manifest.entry === "index.html", "Manifest entry debe ser index.html.");
  const appUrl = new URL(manifest.appUrl);
  assert(appUrl.protocol === "https:", "Manifest appUrl debe usar HTTPS.");
  assert(appUrl.pathname.endsWith("/agency-luxury-self/1.0.5/"), "Manifest appUrl no es el release inmutable esperado.");
  assert(
    manifest.previewUrl === new URL("es/index.html", manifest.appUrl).toString(),
    "Manifest previewUrl debe apuntar al HTML humano espanol.",
  );
  assert(Array.isArray(manifest.surfaces), "Manifest surfaces debe ser un array.");
  assert(Array.isArray(manifest.capabilities), "Manifest capabilities debe ser un array.");
  for (const surface of REQUIRED_SURFACES) assert(manifest.surfaces.includes(surface), `Falta surface ${surface}.`);
  for (const capability of REQUIRED_CAPABILITIES) assert(manifest.capabilities.includes(capability), `Falta capability ${capability}.`);
  for (const forbidden of ["leadLanding", "leadForm", "singleLanding"]) {
    assert(!manifest.capabilities.includes(forbidden), `SALES no puede declarar ${forbidden}.`);
  }
  assert(manifest.i18n?.defaultLocale === "es", "i18n.defaultLocale debe ser es.");
  assert(manifest.i18n?.prefixDefault === true, "i18n.prefixDefault debe ser true.");
  assert(JSON.stringify(manifest.i18n?.locales?.map((entry) => entry.code)) === JSON.stringify(LOCALES), "Locales deben ser es/en/de/fr en orden estable.");
}

async function validateRoutes(manifest) {
  const routes = manifest.routes || [];
  assert(routes.length > 0, "Manifest routes esta vacio.");
  const paths = new Set();
  const structural = new Set();
  const html = new Set();
  const groups = new Map();
  let totalHtmlBytes = 0;
  let prerenderedProperties = 0;
  let prerenderedArticles = 0;
  for (const [index, route] of routes.entries()) {
    assert(isSafeRoutePath(route.path), `Ruta insegura en routes[${index}]: ${route.path}`);
    const normalized = normalizePath(route.path);
    assert(!paths.has(normalized), `Ruta duplicada: ${normalized}`);
    paths.add(normalized);
    const pattern = normalized.replace(/:(?:slug|token)(?=\/|$)/g, ":param");
    assert(!structural.has(pattern), `Patron estructural duplicado: ${normalized}`);
    structural.add(pattern);
    assert(isSafeHtmlPath(route.html), `HTML inseguro en ${route.path}: ${route.html}`);
    assert(!html.has(route.html.toLowerCase()), `HTML duplicado: ${route.html}`);
    html.add(route.html.toLowerCase());
    assert(REQUIRED_SURFACES.includes(route.surface), `Surface no permitida en ${route.path}.`);
    assert(["surface", "cart", "checkout", "order"].includes(route.runtimeKind), `runtimeKind invalido en ${route.path}.`);
    assert(LOCALES.includes(route.locale), `Locale invalido en ${route.path}.`);
    assert(route.path === `/${route.locale}/` || route.path.startsWith(`/${route.locale}/`), `Prefijo de locale invalido en ${route.path}.`);
    if (route.runtimeKind !== "surface") assert(route.surface === "SHOP_HOME", `${route.runtimeKind} debe usar SHOP_HOME.`);
    if (route.runtimeKind === "order") assert(route.path.split("/").includes(":token"), `Order sin :token: ${route.path}`);
    if (route.runtimeKind !== "order") assert(!route.path.split("/").includes(":token"), `:token fuera de order: ${route.path}`);
    if (route.runtimeKind !== "surface") assert(!route.path.split("/").includes(":slug"), `:slug fuera de surface: ${route.path}`);
    const file = resolve(OUT_DIR, ...route.html.split("/"));
    assert(existsSync(file), `HTML de ruta ausente: ${route.html}`);
    const size = (await stat(file)).size;
    assert(size <= MAX_HTML_BYTES, `HTML excede 2 MiB: ${route.html}`);
    totalHtmlBytes += size;
    if (route.translationKey.startsWith("property.") || route.translationKey.startsWith("article.")) {
      const routeHtml = await readFile(file, "utf8");
      assert(/data-nuklo-prerender=(?:"|')(?:property|article)(?:"|')/i.test(routeHtml), `Falta contenido prerenderizado en ${route.path}.`);
      assert(/<script\s+type=(?:"|')application\/ld\+json(?:"|')>/i.test(routeHtml), `Falta JSON-LD en ${route.path}.`);
      assert(/<h1\b[^>]*>[^<]+<\/h1>/i.test(routeHtml), `Falta H1 prerenderizado en ${route.path}.`);
      if (route.translationKey.startsWith("property.")) prerenderedProperties += 1;
      else prerenderedArticles += 1;
    }
    const group = groups.get(route.translationKey) || [];
    group.push(route);
    groups.set(route.translationKey, group);
  }
  assert(totalHtmlBytes <= MAX_ROUTE_HTML_BYTES, `HTML total importable excede 16 MiB (${totalHtmlBytes} bytes).`);
  for (const [translationKey, entries] of groups) {
    for (const locale of LOCALES) {
      assert(entries.filter((entry) => entry.locale === locale).length === 1, `Grupo ${translationKey} incompleto para ${locale}.`);
    }
    assert(new Set(entries.map((entry) => `${entry.surface}:${entry.runtimeKind}`)).size === 1, `Grupo ${translationKey} mezcla surface/runtimeKind.`);
  }
  for (const surface of REQUIRED_SURFACES) {
    assert(routes.some((route) => route.surface === surface && route.runtimeKind === "surface"), `No existe ruta surface para ${surface}.`);
  }
  for (const kind of ["surface", "cart", "checkout", "order"]) {
    assert(routes.some((route) => route.runtimeKind === kind), `No existe runtimeKind=${kind}.`);
  }
  assert(Array.isArray(manifest.routeSeo) && manifest.routeSeo.length === routes.length, "routeSeo debe cubrir cada descriptor exactamente una vez.");
  const seoPaths = new Set(manifest.routeSeo.map((entry) => normalizePath(entry.path)));
  assert(seoPaths.size === routes.length && [...paths].every((path) => seoPaths.has(path)), "routeSeo no coincide con routes.");
  assert(prerenderedProperties === 44, `Se esperaban 44 propiedades prerenderizadas; hay ${prerenderedProperties}.`);
  assert(prerenderedArticles === 32, `Se esperaban 32 articulos prerenderizados; hay ${prerenderedArticles}.`);
  return { routes: routes.length, totalHtmlBytes, prerenderedProperties, prerenderedArticles };
}

async function validateSourceAssets(manifest) {
  const appUrl = new URL(manifest.appUrl);
  const mediaAssets = manifest.mediaAssets || [];
  assert(mediaAssets.length === SOURCE_MEDIA_ASSETS.length, `Se esperaban ${SOURCE_MEDIA_ASSETS.length} mediaAssets fuente; hay ${mediaAssets.length}.`);
  assert(new Set(mediaAssets.map((asset) => asset.key)).size === mediaAssets.length, "mediaAssets contiene keys duplicadas.");
  const mediaByKey = new Map(mediaAssets.map((asset) => [asset.key, asset]));
  for (const expected of SOURCE_MEDIA_ASSETS) {
    const asset = mediaByKey.get(expected.key);
    assert(asset, `Falta mediaAsset fuente: ${expected.key}`);
    assert(asset.kind === expected.kind, `Kind incorrecto para ${expected.key}: ${asset.kind}`);
    const expectedUrl = new URL(expected.path.replace(/^\//, ""), manifest.appUrl).toString();
    assert(asset.url === expectedUrl, `URL incorrecta para ${expected.key}: ${asset.url}`);
  }

  for (const [relativeAsset, expectedHash] of Object.entries(EXPECTED_SOURCE_HASHES)) {
    const file = resolve(OUT_DIR, ...relativeAsset.split("/"));
    assert(existsSync(file), `Asset fuente ausente: ${relativeAsset}`);
    const bytes = await readFile(file);
    assert(sha256(bytes) === expectedHash, `Asset fuente sustituido o alterado: ${relativeAsset}`);
  }

  const routesByPath = new Map((manifest.routes || []).map((route) => [route.path, route]));
  for (const seo of manifest.routeSeo || []) {
    assert(seo.ogImage, `Falta ogImage en ${seo.path}.`);
    const url = new URL(seo.ogImage);
    assert(url.origin === appUrl.origin, `ogImage fuera del origen en ${seo.path}: ${seo.ogImage}`);
    assert(url.pathname.startsWith(appUrl.pathname), `ogImage fuera del release inmutable en ${seo.path}: ${seo.ogImage}`);
    const relativeAsset = url.pathname.slice(appUrl.pathname.length).replace(/^\//, "");
    assert(relativeAsset && existsSync(resolve(OUT_DIR, ...relativeAsset.split("/"))), `ogImage ausente en ${seo.path}: ${relativeAsset}`);
    const route = routesByPath.get(seo.path);
    assert(route, `routeSeo sin descriptor: ${seo.path}`);
    const expectedPath = EXPECTED_OG_BY_TRANSLATION_KEY[route.translationKey];
    if (expectedPath) {
      const expectedUrl = new URL(expectedPath.replace(/^\//, ""), manifest.appUrl).toString();
      assert(seo.ogImage === expectedUrl, `Cover OG incorrecto para ${route.translationKey}:${route.locale}.`);
    }
  }

  return { mediaAssets: mediaAssets.length, sourceHashes: Object.keys(EXPECTED_SOURCE_HASHES).length };
}

async function validateIntegrity(manifestRaw, manifest, integrity) {
  assert(integrity.schemaVersion === 1, "integrity.schemaVersion invalido.");
  assert(integrity.themeId === manifest.id, "integrity.themeId no coincide.");
  assert(integrity.templateVersion === manifest.templateVersion, "integrity.templateVersion no coincide.");
  assert(integrity.commit === manifest.sourceCommit, "integrity.commit no coincide.");
  assert(integrity.baseUrl === manifest.appUrl, "integrity.baseUrl no coincide.");
  assert(integrity.manifest === MANIFEST_FILE, "integrity.manifest invalido.");
  assert(integrity.manifestSha256 === sha256(manifestRaw), "manifestSha256 invalido.");
  const actualFiles = (await walkFiles(OUT_DIR)).filter((path) => relativePath(path) !== INTEGRITY_FILE);
  const actualPaths = actualFiles.map(relativePath).sort();
  const declaredPaths = integrity.files.map((entry) => entry.path).sort();
  assert(JSON.stringify(actualPaths) === JSON.stringify(declaredPaths), "Lista de archivos de integrity.json no coincide con out/.");
  const byPath = new Map(integrity.files.map((entry) => [entry.path, entry]));
  for (const file of actualFiles) {
    const path = relativePath(file);
    const bytes = await readFile(file);
    const entry = byPath.get(path);
    assert(entry.bytes === bytes.byteLength, `Tamano invalido en integrity: ${path}`);
    assert(entry.sha256 === sha256(bytes), `SHA-256 invalido en integrity: ${path}`);
  }
  return actualFiles.length + 1;
}

function validatePropertyLocalization(source) {
  assert(source.properties.length === 11, `Se esperaban 11 propiedades fuente; hay ${source.properties.length}.`);
  let localizedFacts = 0;
  for (const property of source.properties) {
    const expectedType = EXPECTED_PROPERTY_TYPES[property.type];
    assert(expectedType, `Tipo de propiedad sin expectativa estable: ${property.type}`);
    assert(property.status === "En Venta", `Estado fuente inesperado en ${property.slug}: ${property.status}`);
    for (const locale of PROPERTY_LOCALES) {
      const facts = localizePropertyFacts(property, locale);
      assert(facts.typeKey === expectedType.typeKey, `typeKey invalido para ${property.slug}:${locale}.`);
      assert(facts.type === expectedType.labels[locale], `Tipo no localizado para ${property.slug}:${locale}.`);
      assert(facts.statusKey === EXPECTED_PROPERTY_STATUS.statusKey, `statusKey invalido para ${property.slug}:${locale}.`);
      assert(facts.status === EXPECTED_PROPERTY_STATUS.labels[locale], `Estado no localizado para ${property.slug}:${locale}.`);
      assert(propertyMatchesType(facts, "all"), `Filtro all excluye ${property.slug}:${locale}.`);
      assert(propertyMatchesType(facts, expectedType.typeKey), `Filtro ${expectedType.typeKey} excluye ${property.slug}:${locale}.`);
      const oppositeType = expectedType.typeKey === "villa" ? "apartment" : "villa";
      assert(!propertyMatchesType(facts, oppositeType), `Filtro ${oppositeType} incluye ${property.slug}:${locale}.`);
      localizedFacts += 1;
    }
  }
  return localizedFacts;
}

async function validateSeoMigration(manifest) {
  const source = await loadReleaseSource();
  const localizedPropertyFacts = validatePropertyLocalization(source);
  const redirects = JSON.parse(await readFile(resolve(OUT_DIR, "redirects.json"), "utf8"));
  const redirectFrom = new Set(redirects.redirects.map((entry) => normalizePath(entry.from)));
  const gonePaths = new Set(redirects.gone.map((entry) => normalizePath(entry.path)));
  assert(manifest.legacySeo?.schemaVersion === 1, "Falta legacySeo v1 en el manifest.");
  assert(JSON.stringify(manifest.legacySeo.redirects) === JSON.stringify(redirects.redirects), "legacySeo.redirects no coincide con redirects.json.");
  assert(JSON.stringify(manifest.legacySeo.gone) === JSON.stringify(redirects.gone), "legacySeo.gone no coincide con redirects.json.");
  assert(redirects.redirects.every((entry) => entry.status === 308), "Toda redireccion de migracion debe usar 308.");
  assert(redirects.gone.every((entry) => entry.status === 410), "Toda baja de migracion debe usar 410.");
  for (const article of source.sourceArticles) assert(redirectFrom.has(normalizePath(article.sourcePath)), `Falta redirect de articulo: ${article.sourcePath}`);
  for (const property of source.properties) assert(redirectFrom.has(normalizePath(property.sourcePath)), `Falta redirect de propiedad: ${property.sourcePath}`);
  const demoProducts = (source.inventory?.inventoryBySitemapType?.product || [])
    .map((url) => new URL(url).pathname)
    .filter((path) => path !== "/shop/");
  assert(demoProducts.length === 22, `Se esperaban 22 productos demo; hay ${demoProducts.length}.`);
  for (const path of demoProducts) assert(gonePaths.has(normalizePath(path)), `Falta 410 para producto demo: ${path}`);
  assert(gonePaths.has(normalizePath("/elementor-222585/")), "Falta 410 para pagina de Elementor.");
  const robots = await readFile(resolve(OUT_DIR, "robots.txt"), "utf8");
  assert(/User-agent:\s*\*/i.test(robots) && /Disallow:\s*\//i.test(robots), "El origen de release debe quedar bloqueado en robots.txt.");
  const sitemap = await readFile(resolve(OUT_DIR, "sitemap.xml"), "utf8");
  assert(!/[/:](?:carrito|cart|warenkorb|panier|checkout|kasse|paiement|pedido|order|bestellung|commande)(?:[/<])/i.test(sitemap), "Sitemap contiene rutas privadas de comercio.");
  assert(!sitemap.includes(":" + "slug") && !sitemap.includes(":" + "token"), "Sitemap contiene plantillas dinamicas.");
  for (const article of source.articles) {
    const expected = `/${article.locale}/${article.locale === "es" ? "blog" : "blog"}/${article.slug}/`;
    assert(sitemap.includes(expected), `Sitemap no conserva articulo: ${expected}`);
  }
  for (const asset of manifest.mediaAssets || []) {
    const url = new URL(asset.url);
    assert(url.origin === new URL(manifest.appUrl).origin, `Media asset fuera del origen: ${asset.url}`);
    const relativeAsset = url.pathname.slice(new URL(manifest.appUrl).pathname.length).replace(/^\//, "");
    assert(existsSync(resolve(OUT_DIR, ...relativeAsset.split("/"))), `Media asset ausente: ${relativeAsset}`);
  }
  return {
    articleRedirects: source.sourceArticles.length,
    propertyRedirects: source.properties.length,
    gone: redirects.gone.length,
    localizedPropertyFacts,
  };
}

function runExactCoreValidation(manifestPath) {
  const configured = String(process.env.NUKLO_CORE_DIR || "").trim();
  const candidates = [configured, resolve(PROJECT_ROOT, "..", "nuklo.cloud")].filter(Boolean);
  const core = candidates.find((candidate) => existsSync(resolve(candidate, "scripts/check-template-manifest.ts")));
  if (!core) {
    console.warn("WARN exact Core validation skipped: set NUKLO_CORE_DIR to a Nuklo Core checkout.");
    return false;
  }
  const tsxCli = resolve(core, "node_modules/tsx/dist/cli.mjs");
  assert(existsSync(tsxCli), `Nuklo Core no tiene tsx instalado: ${tsxCli}`);
  const result = spawnSync(process.execPath, [tsxCli, resolve(core, "scripts/check-template-manifest.ts"), manifestPath], {
    cwd: core,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert(result.status === 0, `La validacion exacta de Nuklo Core fallo con codigo ${result.status ?? "desconocido"}.`);
  return true;
}

async function main() {
  assert(existsSync(OUT_DIR), "out/ no existe; ejecuta npm run prepare:release.");
  const manifestPath = resolve(OUT_DIR, MANIFEST_FILE);
  const manifestRaw = await readFile(manifestPath);
  assert(manifestRaw.byteLength <= MAX_MANIFEST_BYTES, "El manifest excede 256 KiB.");
  const manifest = JSON.parse(manifestRaw.toString("utf8"));
  const integrity = JSON.parse(await readFile(resolve(OUT_DIR, INTEGRITY_FILE), "utf8"));
  validateManifestShape(manifest);
  const routeResult = await validateRoutes(manifest);
  const sourceAssets = await validateSourceAssets(manifest);
  const fileCount = await validateIntegrity(manifestRaw, manifest, integrity);
  const migration = await validateSeoMigration(manifest);
  const exactCore = runExactCoreValidation(manifestPath);
  if (manifest.sourceCommit === "local-uncommitted") {
    console.warn("WARN sourceCommit=local-uncommitted; rerun after commit before production registration.");
  }
  console.log(`Verified ${manifest.id}@${manifest.templateVersion}`);
  console.log(`  ${routeResult.routes} unique routes, ${(routeResult.totalHtmlBytes / 1024 / 1024).toFixed(2)} MiB imported HTML`);
  console.log(`  ${routeResult.prerenderedProperties} property pages and ${routeResult.prerenderedArticles} article pages prerendered with JSON-LD`);
  console.log(`  ${sourceAssets.mediaAssets} original cover/brand assets with ${sourceAssets.sourceHashes} locked source hashes`);
  console.log(`  ${fileCount} integrity-tracked files`);
  console.log(`  ${migration.articleRedirects} article redirects, ${migration.propertyRedirects} property redirects, ${migration.gone} gone routes`);
  console.log(`  ${migration.localizedPropertyFacts} localized property fact sets with stable filter keys`);
  console.log(`  exact Nuklo Core contract: ${exactCore ? "passed" : "not available"}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
