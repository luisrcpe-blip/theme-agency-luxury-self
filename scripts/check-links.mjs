import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";

import {
  MANIFEST_FILE,
  OUT_DIR,
  routeMatches,
} from "./release-config.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

function outputPath(path) {
  return relative(OUT_DIR, path).split(sep).join("/");
}

function stripQueryHash(value) {
  return String(value || "").split("#")[0].split("?")[0];
}

function isAssetPath(pathname) {
  const last = pathname.split("/").filter(Boolean).at(-1) || "";
  return /\.[a-z0-9]{2,8}$/i.test(last) && !/\.html?$/i.test(last);
}

function toReleaseRelative(url, appUrl) {
  const base = new URL(appUrl);
  const parsed = new URL(url, appUrl);
  if (parsed.origin !== base.origin || !parsed.pathname.startsWith(base.pathname)) return null;
  return decodeURIComponent(parsed.pathname.slice(base.pathname.length)).replace(/^\//, "");
}

function collectHtmlReferences(html) {
  const refs = [];
  for (const match of html.matchAll(/\b(?:href|src|poster|action)\s*=\s*["']([^"']+)["']/gi)) refs.push(match[1]);
  for (const match of html.matchAll(/\b(?:srcset|imagesrcset)\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const value = candidate.trim().split(/\s+/)[0];
      if (value) refs.push(value);
    }
  }
  return refs;
}

function collectCssReferences(css) {
  return [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1]);
}

function isSkippable(value) {
  return !value || value.startsWith("#") || /^(?:data|blob|mailto|tel):/i.test(value);
}

function matchPublicRoute(routes, pathname) {
  return routes.some((route) => routeMatches(route.path, pathname));
}

async function main() {
  assert(existsSync(OUT_DIR), "out/ no existe; ejecuta npm run prepare:release.");
  const manifest = JSON.parse(await readFile(resolve(OUT_DIR, MANIFEST_FILE), "utf8"));
  const redirects = JSON.parse(await readFile(resolve(OUT_DIR, "redirects.json"), "utf8"));
  const app = new URL(manifest.appUrl);
  const files = await walkFiles(OUT_DIR);
  const fileSet = new Set(files.map(outputPath));
  const referencedAssets = new Set();
  let checkedReferences = 0;

  function validateReference(raw, sourcePath) {
    const value = stripQueryHash(raw.trim());
    if (isSkippable(value)) return;
    assert(!/^javascript:/i.test(value), `Referencia javascript: en ${sourcePath}`);
    if (/^https?:/i.test(value)) {
      const parsed = new URL(value);
      assert(parsed.protocol === "https:", `Referencia HTTP insegura en ${sourcePath}: ${value}`);
      const relativeAsset = toReleaseRelative(value, manifest.appUrl);
      if (relativeAsset !== null && isAssetPath(parsed.pathname)) {
        assert(fileSet.has(relativeAsset), `Asset publicado ausente en ${sourcePath}: ${relativeAsset}`);
        referencedAssets.add(relativeAsset);
      }
      checkedReferences += 1;
      return;
    }
    if (value.startsWith("/")) {
      if (isAssetPath(value)) {
        throw new Error(`Asset raiz sin base inmutable en ${sourcePath}: ${value}`);
      }
      assert(matchPublicRoute(manifest.routes, value), `Ruta interna no declarada en ${sourcePath}: ${value}`);
      checkedReferences += 1;
      return;
    }
    const local = value.replace(/^\.\//, "");
    if (isAssetPath(local)) {
      const sourceDirectory = sourcePath.includes("/") ? sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1) : "";
      const combined = new URL(local, `https://local.invalid/${sourceDirectory}`).pathname.replace(/^\//, "");
      assert(fileSet.has(combined), `Referencia local ausente en ${sourcePath}: ${value}`);
      referencedAssets.add(combined);
      checkedReferences += 1;
    }
  }

  for (const file of files) {
    const path = outputPath(file);
    const extension = extname(file).toLowerCase();
    if (![".html", ".css", ".js", ".mjs"].includes(extension)) continue;
    const text = await readFile(file, "utf8");
    assert(!/(?<![A-Za-z0-9._~:/-])\/assets\//g.test(text), `Referencia /assets/ sin base en ${path}`);
    if (extension === ".html") {
      assert(/<script\b[^>]*type=["']module["']/i.test(text), `HTML sin bundle module: ${path}`);
      assert(/<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(text), `HTML de origen importable sin noindex: ${path}`);
      for (const reference of collectHtmlReferences(text)) validateReference(reference, path);
    } else if (extension === ".css") {
      for (const reference of collectCssReferences(text)) validateReference(reference, path);
    }
  }

  for (const route of manifest.routes) {
    assert(fileSet.has(route.html), `Descriptor apunta a HTML ausente: ${route.path} -> ${route.html}`);
  }
  for (const asset of manifest.mediaAssets || []) validateReference(asset.url, MANIFEST_FILE);

  const redirectSources = new Set();
  for (const entry of redirects.redirects || []) {
    assert(entry.status === 308, `Redirect no permanente: ${entry.from}`);
    assert(!redirectSources.has(entry.from), `Redirect duplicado: ${entry.from}`);
    redirectSources.add(entry.from);
    assert(entry.from !== entry.to, `Bucle de redirect: ${entry.from}`);
    assert(matchPublicRoute(manifest.routes, entry.to), `Destino de redirect no declarado: ${entry.from} -> ${entry.to}`);
  }
  for (const entry of redirects.gone || []) assert(entry.status === 410, `Exclusion sin 410: ${entry.path}`);

  const sitemap = await readFile(resolve(OUT_DIR, "sitemap.xml"), "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert(sitemapUrls.length > 0, "sitemap.xml no contiene URLs.");
  const uniqueSitemap = new Set(sitemapUrls);
  assert(uniqueSitemap.size === sitemapUrls.length, "sitemap.xml contiene URLs duplicadas.");
  for (const value of sitemapUrls) {
    const url = new URL(value);
    assert(url.origin === app.origin && url.pathname.startsWith(app.pathname), `URL de sitemap fuera del release: ${value}`);
    const publicPath = `/${url.pathname.slice(app.pathname.length).replace(/^\//, "")}`;
    assert(matchPublicRoute(manifest.routes, publicPath), `URL de sitemap no resuelta por manifest.routes: ${publicPath}`);
  }

  console.log(`Link check passed for ${manifest.id}@${manifest.templateVersion}`);
  console.log(`  ${checkedReferences} HTML/CSS/manifest references checked`);
  console.log(`  ${referencedAssets.size} published assets resolved`);
  console.log(`  ${sitemapUrls.length} concrete sitemap URLs`);
  console.log(`  ${redirectSources.size} redirect destinations resolve to manifest routes`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
