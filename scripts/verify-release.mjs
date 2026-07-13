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
  PROJECT_ROOT,
  loadReleaseSource,
} from "./release-config.mjs";

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
  assert(manifest.templateVersion === "1.0.0", "Manifest debe usar templateVersion 1.0.0.");
  assert(manifest.renderer === "remote-static-app", "Manifest renderer debe ser remote-static-app.");
  assert(manifest.entry === "index.html", "Manifest entry debe ser index.html.");
  const appUrl = new URL(manifest.appUrl);
  assert(appUrl.protocol === "https:", "Manifest appUrl debe usar HTTPS.");
  assert(appUrl.pathname.endsWith("/agency-luxury-self/1.0.0/"), "Manifest appUrl no es el release inmutable esperado.");
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

async function validateSeoMigration(manifest) {
  const source = await loadReleaseSource();
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
  const fileCount = await validateIntegrity(manifestRaw, manifest, integrity);
  const migration = await validateSeoMigration(manifest);
  const exactCore = runExactCoreValidation(manifestPath);
  if (manifest.sourceCommit === "local-uncommitted") {
    console.warn("WARN sourceCommit=local-uncommitted; rerun after commit before production registration.");
  }
  console.log(`Verified ${manifest.id}@${manifest.templateVersion}`);
  console.log(`  ${routeResult.routes} unique routes, ${(routeResult.totalHtmlBytes / 1024 / 1024).toFixed(2)} MiB imported HTML`);
  console.log(`  ${routeResult.prerenderedProperties} property pages and ${routeResult.prerenderedArticles} article pages prerendered with JSON-LD`);
  console.log(`  ${fileCount} integrity-tracked files`);
  console.log(`  ${migration.articleRedirects} article redirects, ${migration.propertyRedirects} property redirects, ${migration.gone} gone routes`);
  console.log(`  exact Nuklo Core contract: ${exactCore ? "passed" : "not available"}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
