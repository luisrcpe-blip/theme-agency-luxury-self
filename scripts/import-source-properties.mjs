import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";

const root = process.cwd();
const inventory = JSON.parse(
  await readFile(path.join(root, "content", "source-route-inventory.json"), "utf8"),
);
const galleryOverrides = JSON.parse(
  await readFile(path.join(root, "content", "property-gallery-overrides.json"), "utf8"),
);
const sourceUrls = inventory.inventoryBySitemapType.portfolio.filter(
  (url) => new URL(url).pathname !== "/portfolio/",
);
const mediaRoot = path.join(root, "public", "assets", "source", "properties");
const outputPath = path.join(root, "src", "generated", "properties.json");
const cached = new Map();

await mkdir(mediaRoot, { recursive: true });
await mkdir(path.dirname(outputPath), { recursive: true });

function slugFromUrl(url) {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1);
}

function parseAmount(value) {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

function parseMetric(value) {
  const raw = String(value || "").match(/[0-9][0-9.,]*/)?.[0];
  if (!raw) return null;
  if (/,[0-9]{1,2}$/.test(raw)) {
    return Number(raw.replace(/\./g, "").replace(",", "."));
  }
  if (/\.[0-9]{1,2}$/.test(raw)) {
    return Number(raw.replace(/,/g, ""));
  }
  return Number(raw.replace(/[.,]/g, ""));
}

function normalizedKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function downloadImage(sourceUrl, propertySlug, role, index = 0) {
  if (!sourceUrl) return null;
  const absolute = new URL(sourceUrl, "https://agencyluxuryself.com").href;
  const cacheKey = `${absolute}|${role}`;
  if (cached.has(cacheKey)) return cached.get(cacheKey);

  const response = await fetch(absolute, {
    headers: { "user-agent": "AgencyLuxurySelfThemeMigration/1.0" },
  });
  if (!response.ok) throw new Error(`Image ${response.status}: ${absolute}`);
  const sourceBytes = Buffer.from(await response.arrayBuffer());
  const width = role === "hero" ? 2200 : 1600;
  const optimized = await sharp(sourceBytes)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: role === "hero" ? 86 : 82, smartSubsample: true })
    .toBuffer();
  const digest = createHash("sha256").update(optimized).digest("hex").slice(0, 12);
  const directory = path.join(mediaRoot, propertySlug);
  const filename = `${role}-${String(index + 1).padStart(2, "0")}-${digest}.webp`;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), optimized);
  const publicPath = `/assets/source/properties/${propertySlug}/${filename}`;
  cached.set(cacheKey, publicPath);
  return publicPath;
}

function cleanRichText($, node) {
  const content = node.clone();
  content.find("script, style, form, iframe, svg, button, input, select, textarea").remove();
  content.find("h1").each((_, headingNode) => {
    const heading = content.find(headingNode);
    heading.replaceWith(`<h2>${heading.html() || heading.text()}</h2>`);
  });
  content.find("*").each((_, child) => {
    for (const attribute of Object.keys(child.attribs || {})) {
      content.find(child).removeAttr(attribute);
    }
  });
  return content.html()?.trim() || "";
}

async function mapInBatches(values, size, mapper) {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(...(await Promise.all(values.slice(index, index + size).map(mapper))));
  }
  return output;
}

async function importProperty(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "AgencyLuxurySelfThemeMigration/1.0" },
  });
  if (!response.ok) throw new Error(`Property ${response.status}: ${url}`);
  const html = await response.text();
  const $ = load(html);
  const slug = slugFromUrl(url);
  const title = $(".als-hero__title").first().text().replace(/\s+/g, " ").trim();
  const heroSource = $(".als-hero img").first().attr("src");
  const heroImage = await downloadImage(heroSource, slug, "hero");
  const stats = {};
  $(".als-stats__item").each((_, node) => {
    const label = normalizedKey($(node).find(".als-stats__lbl").text());
    const value = $(node).find(".als-stats__val").text().replace(/\s+/g, " ").trim();
    if (label) stats[label] = value;
  });
  const details = {};
  $(".als-detail").each((_, node) => {
    const label = normalizedKey($(node).find(".als-detail__lbl").text());
    const value = $(node).find(".als-detail__val").text().replace(/\s+/g, " ").trim();
    if (label) details[label] = value;
  });
  const gallerySources = $(".als-gallery .als-lb-trigger")
    .toArray()
    .map((node) => $(node).attr("data-full") || $(node).find("img").attr("src"))
    .filter(Boolean);
  const importedGallery = await mapInBatches(gallerySources, 4, (source, index) =>
    downloadImage(source, slug, "gallery", index),
  );
  const gallery = importedGallery.length
    ? importedGallery
    : galleryOverrides[slug]?.gallery || [];
  const contentNode = $(".portfolio-single-item").first();
  const bodyHtml = cleanRichText($, contentNode);
  const description = $("meta[property='og:description']").attr("content")?.trim() ||
    contentNode.find("p").first().text().replace(/\s+/g, " ").trim();
  const location = details.ubicacion || $(".als-hero__loc").first().text().split("·")[0].trim();
  const type = details.tipo || $(".als-hero__loc").first().text().split("·").at(-1)?.trim() || null;
  const status = details.estado || $(".als-badge").first().text().trim() || null;
  const priceLabel = stats.precio || $(".als-cta__price").first().text().trim() || null;

  return {
    id: createHash("sha256").update(new URL(url).pathname).digest("hex").slice(0, 16),
    slug,
    sourcePath: new URL(url).pathname,
    sourceUrl: url,
    title,
    description,
    bodyHtml,
    heroImage,
    gallery,
    location,
    type,
    status,
    currency: "EUR",
    price: parseAmount(priceLabel),
    priceLabel,
    bedrooms: parseMetric(stats.habitaciones || details.habitaciones),
    bathrooms: parseMetric(stats.banos || details.banos),
    areaM2: parseMetric(stats.superficie || details.superficie),
    lotM2: parseMetric(stats.parcela || details.parcela),
  };
}

const properties = [];
for (const url of sourceUrls) {
  process.stdout.write(`Importing ${url}\n`);
  properties.push(await importProperty(url));
}

await writeFile(outputPath, `${JSON.stringify(properties, null, 2)}\n`, "utf8");
process.stdout.write(`Imported ${properties.length} properties to ${outputPath}\n`);
