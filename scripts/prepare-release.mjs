import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

import {
  DIST_DIR,
  INTEGRITY_FILE,
  LOCALES,
  MANIFEST_FILE,
  OUT_DIR,
  PROJECT_ROOT,
  buildReleaseModel,
  escapeXml,
} from "./release-config.mjs";

const textEncoder = new TextEncoder();

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function gitValue(args, fallback) {
  const result = spawnSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : fallback;
}

function gitIsDirty() {
  const result = spawnSync("git", ["status", "--porcelain"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status !== 0 || Boolean(result.stdout.trim());
}

async function walkFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(root);
  return files;
}

function relativePath(root, path) {
  return relative(root, path).split(sep).join("/");
}

function assertReleaseBase(baseUrl, themeId, version) {
  const url = new URL(baseUrl);
  if (url.protocol !== "https:" || url.search || url.hash) {
    throw new Error("THEME_RELEASE_BASE_URL debe ser una URL HTTPS sin query ni fragmento.");
  }
  const normalized = url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
  if (!normalized.endsWith(`/${themeId}/${version}/`)) {
    throw new Error(`La base del release debe terminar en /${themeId}/${version}/.`);
  }
  return normalized;
}

function runViteBuild(releaseBase) {
  const viteCli = resolve(PROJECT_ROOT, "node_modules/vite/bin/vite.js");
  const result = spawnSync(process.execPath, [viteCli, "build", "--outDir", DIST_DIR, "--emptyOutDir"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      THEME_RELEASE_BASE_URL: releaseBase.replace(/\/$/, ""),
    },
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`Vite termino con codigo ${result.status ?? "desconocido"}.`);
  }
}

async function rewriteReleaseAssetReferences(root, releaseBase) {
  const assetBase = `${releaseBase}assets/`;
  const files = await walkFiles(root);
  let rewrites = 0;
  for (const file of files) {
    if (![".css", ".html", ".js", ".mjs"].includes(extname(file).toLowerCase())) continue;
    const before = await readFile(file, "utf8");
    const after = before.replace(/(?<![A-Za-z0-9._~:/-])\/assets\//g, assetBase);
    if (after !== before) {
      await writeFile(file, after, "utf8");
      rewrites += 1;
    }
  }
  return rewrites;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function buildStructuredData(route) {
  const content = route.prerender;
  if (!content) return null;
  if (content.kind === "article") {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: content.title,
      description: content.description,
      image: content.image,
      mainEntityOfPage: { "@type": "WebPage", "@id": route.path },
      ...(content.publishedAt ? { datePublished: content.publishedAt } : {}),
      author: {
        "@type": content.authorType === "Organization" ? "Organization" : "Person",
        name: content.author || "Agency Luxury Self",
      },
      publisher: { "@type": "Organization", name: content.publisher || "Agency Luxury Self" },
    };
  }
  const residenceType = /apart|appar|penthouse|wohnung/i.test(`${content.title} ${content.description}`)
    ? "Apartment"
    : "SingleFamilyResidence";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: content.title,
    description: content.description,
    url: route.path,
    primaryImageOfPage: content.image,
    contentLocation: { "@type": "Place", name: content.location },
    about: {
      "@type": residenceType,
      name: content.title,
      image: content.image,
      ...(content.location ? { address: content.location } : {}),
    },
    ...(Number.isFinite(Number(content.price))
      ? {
          offers: {
            "@type": "Offer",
            price: Number(content.price),
            priceCurrency: content.currency || "EUR",
            url: route.path,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

function renderPrerenderContent(route) {
  const content = route.prerender;
  if (!content) return "";
  const propertyLabels = {
    es: { bedrooms: "dormitorios", bathrooms: "baños", plot: "de parcela" },
    en: { bedrooms: "bedrooms", bathrooms: "bathrooms", plot: "plot" },
    de: { bedrooms: "Schlafzimmer", bathrooms: "Bäder", plot: "Grundstück" },
    fr: { bedrooms: "chambres", bathrooms: "salles de bain", plot: "de terrain" },
  }[route.locale] || { bedrooms: "bedrooms", bathrooms: "bathrooms", plot: "plot" };
  const details = content.kind === "property"
    ? [
        content.location,
        content.bedrooms ? `${content.bedrooms} ${propertyLabels.bedrooms}` : "",
        content.bathrooms ? `${content.bathrooms} ${propertyLabels.bathrooms}` : "",
        content.areaM2 ? `${content.areaM2} m²` : "",
        content.lotM2 ? `${content.lotM2} m² ${propertyLabels.plot}` : "",
      ].filter(Boolean).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "";
  return [
    `<main data-nuklo-prerender="${content.kind}">`,
    "<article>",
    `<h1>${escapeHtml(content.title)}</h1>`,
    content.description ? `<p>${escapeHtml(content.description)}</p>` : "",
    details ? `<ul>${details}</ul>` : "",
    `<div class="rich-content">${content.bodyHtml || ""}</div>`,
    "</article>",
    "</main>",
  ].join("");
}

function replaceOrInject(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function renderRouteHtml(baseHtml, route, alternates) {
  const canonical = route.seo.canonical;
  let html = baseHtml;
  html = /<html\b[^>]*\blang\s*=\s*["'][^"']*["']/i.test(html)
    ? html.replace(/(<html\b[^>]*\blang\s*=\s*)["'][^"']*["']/i, `$1"${route.locale}"`)
    : html.replace(/<html\b/i, `<html lang="${route.locale}"`);
  html = replaceOrInject(html, /<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.seo.title)}</title>`);
  html = replaceOrInject(
    html,
    /<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>/i,
    `<meta name="description" content="${escapeHtml(route.seo.description)}">`,
  );
  html = replaceOrInject(
    html,
    /<meta\b(?=[^>]*\bname\s*=\s*["']robots["'])[^>]*>/i,
    '<meta name="robots" content="noindex,nofollow">',
  );
  html = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*(?:canonical|alternate)[^"']*["'])[^>]*>\s*/gi, "");
  html = html.replace(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:(?:title|description|url|image|locale(?::alternate)?)["'])[^>]*>\s*/gi, "");

  const head = [];
  if (canonical) head.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);
  for (const alternate of alternates) {
    head.push(`<link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeHtml(alternate.href)}">`);
  }
  const defaultAlternate = alternates.find((entry) => entry.locale === "es");
  if (defaultAlternate) {
    head.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(defaultAlternate.href)}">`);
  }
  head.push(`<meta property="og:title" content="${escapeHtml(route.seo.title)}">`);
  head.push(`<meta property="og:description" content="${escapeHtml(route.seo.description)}">`);
  if (canonical) head.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`);
  if (route.seo.ogImage) head.push(`<meta property="og:image" content="${escapeHtml(route.seo.ogImage)}">`);
  head.push(`<meta property="og:locale" content="${route.locale}">`);
  const structuredData = buildStructuredData(route);
  if (structuredData) {
    head.push(`<script type="application/ld+json">${safeJsonForScript(structuredData)}</script>`);
  }
  html = html.replace(/<\/head>/i, `${head.join("\n")}\n</head>`);
  const prerenderedContent = renderPrerenderContent(route);
  if (prerenderedContent) {
    html = html.replace(/<div\s+id=["']root["']\s*><\/div>/i, `<div id="root">${prerenderedContent}</div>`);
  }
  return html;
}

function buildAlternateMap(routes, releaseBase) {
  const groups = new Map();
  for (const route of routes) {
    if (route.path.includes(":") || route.seo.private) continue;
    const entries = groups.get(route.translationKey) || [];
    entries.push(route);
    groups.set(route.translationKey, entries);
  }
  const map = new Map();
  for (const entries of groups.values()) {
    if (entries.length < 2) continue;
    const alternates = entries.map((entry) => ({
      locale: entry.locale,
      hreflang: entry.locale,
      href: new URL(entry.path.replace(/^\//, ""), releaseBase).toString(),
    }));
    for (const entry of entries) map.set(entry.path, alternates);
  }
  return map;
}

async function writeRouteHtml(model, baseHtml) {
  const alternates = buildAlternateMap(model.publicRoutes, model.releaseBase);
  const allPhysicalRoutes = new Map();
  for (const route of [...model.internalRoutes, ...model.publicRoutes]) {
    allPhysicalRoutes.set(route.html, route);
  }
  for (const [htmlPath, route] of allPhysicalRoutes) {
    const target = resolve(OUT_DIR, ...htmlPath.split("/"));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, renderRouteHtml(baseHtml, route, alternates.get(route.path) || []), "utf8");
  }
  const home = model.internalRoutes.find((route) => route.translationKey === "shop.home" && route.locale === "es");
  await writeFile(resolve(OUT_DIR, "index.html"), renderRouteHtml(baseHtml, home, alternates.get(home.path) || []), "utf8");
}

function renderSitemap(model) {
  const groups = new Map();
  for (const route of model.publicRoutes) {
    const entries = groups.get(route.translationKey) || [];
    entries.push(route);
    groups.set(route.translationKey, entries);
  }
  const urls = model.publicRoutes.map((route) => {
    const loc = new URL(route.path.replace(/^\//, ""), model.releaseBase).toString();
    const alternates = (groups.get(route.translationKey) || [])
      .filter((entry) => entry.path !== route.path || entry.locale === route.locale)
      .map((entry) => {
        const href = new URL(entry.path.replace(/^\//, ""), model.releaseBase).toString();
        return `<xhtml:link rel="alternate" hreflang="${escapeXml(entry.locale)}" href="${escapeXml(href)}"/>`;
      });
    const defaultEntry = (groups.get(route.translationKey) || []).find((entry) => entry.locale === "es");
    if (defaultEntry && (groups.get(route.translationKey) || []).length > 1) {
      alternates.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(new URL(defaultEntry.path.replace(/^\//, ""), model.releaseBase).toString())}"/>`);
    }
    return `  <url><loc>${escapeXml(loc)}</loc>${alternates.join("")}<changefreq>weekly</changefreq></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

function renderLlms(model) {
  const lines = [
    "# Agency Luxury Self",
    "",
    "Importable Nuklo SALES remote-static theme for exceptional real estate, property management, interiors and Atelier commerce.",
    "",
    `- Theme: ${model.manifest.id}@${model.manifest.templateVersion}`,
    `- Contract: ${model.manifest.contractVersion}`,
    `- Locales: ${LOCALES.join(", ")}`,
    `- Properties: ${model.counts.properties}`,
    `- Migrated articles: ${model.counts.articles}`,
    "- Commerce: Nuklo catalog, cart, checkout and public orders",
    "- Commercial enquiries: Nuklo contactInquiry bridge (not CAPTURE leads)",
    "",
    "The immutable themes.nuklo.cloud origin is an import and asset source. Canonical public pages, hreflang, robots and sitemap are served from the assigned Nuklo tenant domain.",
    "",
  ];
  return lines.join("\n");
}

async function writeIntegrity(model) {
  const files = (await walkFiles(OUT_DIR))
    .filter((path) => relativePath(OUT_DIR, path) !== INTEGRITY_FILE)
    .sort((a, b) => relativePath(OUT_DIR, a).localeCompare(relativePath(OUT_DIR, b)));
  const entries = [];
  for (const file of files) {
    const bytes = await readFile(file);
    entries.push({
      path: relativePath(OUT_DIR, file),
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
    });
  }
  const manifestRaw = await readFile(resolve(OUT_DIR, MANIFEST_FILE));
  const integrity = {
    schemaVersion: 1,
    themeId: model.manifest.id,
    version: model.manifest.templateVersion,
    templateVersion: model.manifest.templateVersion,
    commit: model.manifest.sourceCommit,
    baseUrl: model.releaseBase,
    manifest: MANIFEST_FILE,
    manifestSha256: sha256(manifestRaw),
    files: entries,
  };
  await writeFile(resolve(OUT_DIR, INTEGRITY_FILE), json(integrity), "utf8");
  return integrity;
}

async function main() {
  const releaseSource = JSON.parse(await readFile(resolve(PROJECT_ROOT, "theme.release.json"), "utf8"));
  const configuredBase = process.env.THEME_RELEASE_BASE_URL || releaseSource.publicBaseUrl;
  const releaseBase = assertReleaseBase(configuredBase, releaseSource.themeId, releaseSource.version);
  const explicitSourceCommit = process.env.THEME_SOURCE_COMMIT || process.env.GITHUB_SHA;
  const sourceCommit = String(
    explicitSourceCommit || (gitIsDirty() ? "local-uncommitted" : gitValue(["rev-parse", "HEAD"], "local-uncommitted")),
  ).trim();
  const sourceBranch = String(
    process.env.THEME_SOURCE_BRANCH || process.env.GITHUB_REF_NAME || gitValue(["branch", "--show-current"], "main"),
  ).trim();
  const model = await buildReleaseModel({ baseUrl: releaseBase, sourceCommit, sourceBranch });

  await rm(DIST_DIR, { recursive: true, force: true });
  await rm(OUT_DIR, { recursive: true, force: true });
  runViteBuild(releaseBase);
  const rewrittenFiles = await rewriteReleaseAssetReferences(DIST_DIR, releaseBase);
  await cp(DIST_DIR, OUT_DIR, { recursive: true });

  const baseHtml = await readFile(resolve(DIST_DIR, "index.html"), "utf8");
  await writeRouteHtml(model, baseHtml);
  await writeFile(resolve(OUT_DIR, MANIFEST_FILE), json(model.manifest), "utf8");
  await writeFile(resolve(OUT_DIR, "redirects.json"), json(model.redirects), "utf8");
  await writeFile(resolve(OUT_DIR, "sitemap.xml"), renderSitemap(model), "utf8");
  await writeFile(resolve(OUT_DIR, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");
  await writeFile(resolve(OUT_DIR, "llms.txt"), renderLlms(model), "utf8");
  await writeFile(
    resolve(OUT_DIR, "release-report.json"),
    json({
      schemaVersion: 1,
      themeId: model.manifest.id,
      version: model.manifest.templateVersion,
      sourceCommit,
      sourceBranch,
      counts: model.counts,
      rootAssetFilesRewritten: rewrittenFiles,
      seoMigration: {
        redirects: model.redirects.redirects.length,
        gone: model.redirects.gone.length,
        contractGap: null,
        manifestApplied: true,
        incompleteArticleTranslationGroups: model.counts.localizedArticleRoutes - model.counts.completeArticleGroups * LOCALES.length,
      },
    }),
    "utf8",
  );
  const integrity = await writeIntegrity(model);
  const size = (await Promise.all((await walkFiles(OUT_DIR)).map((path) => stat(path)))).reduce((sum, item) => sum + item.size, 0);
  console.log(`Prepared ${model.manifest.id}@${model.manifest.templateVersion}`);
  console.log(`  ${OUT_DIR}`);
  console.log(`  ${integrity.files.length + 1} files, ${(size / 1024 / 1024).toFixed(2)} MiB`);
  console.log(`  ${model.internalRoutes.length} route descriptors, ${model.publicRoutes.length} public sitemap routes`);
  console.log(`  source ${sourceCommit} (${sourceBranch})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
