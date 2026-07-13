import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const root = process.cwd();
const inventory = JSON.parse(
  await readFile(path.join(root, "content", "source-route-inventory.json"), "utf8"),
);

const mediaRoot = path.join(root, "public", "assets", "source", "blog");
const outputPath = path.join(root, "src", "generated", "articles.json");
const articleUrls = inventory.inventoryBySitemapType.post.filter(
  (url) => !/\/(?:en|fr|de)?\/?blog\/?$/.test(new URL(url).pathname),
);

await mkdir(mediaRoot, { recursive: true });
await mkdir(path.dirname(outputPath), { recursive: true });

const downloadedMedia = new Map();

function slugFromUrl(url) {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1) || "article";
}

function localeFromUrl(url) {
  const first = new URL(url).pathname.split("/").filter(Boolean)[0];
  return ["en", "fr", "de"].includes(first) ? first : "es";
}

function translationKeyFor(url) {
  const pathname = new URL(url).pathname;
  return (
    inventory.completeWpmlGroups.find((group) =>
      [group.es, group.en, group.fr, group.de].includes(pathname),
    )?.key || `article-${slugFromUrl(url)}`
  );
}

function extensionFor(url, contentType) {
  const pathname = new URL(url).pathname;
  const extension = path.extname(pathname).toLowerCase();
  if (/^\.(?:avif|gif|jpe?g|mp3|mp4|ogg|png|webm|webp)$/.test(extension)) {
    return extension === ".jpeg" ? ".jpg" : extension;
  }
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("mpeg")) return ".mp3";
  if (contentType?.includes("mp4")) return ".mp4";
  return ".jpg";
}

async function downloadMedia(sourceUrl, articleSlug) {
  if (!sourceUrl) return null;
  const absoluteUrl = new URL(sourceUrl, "https://agencyluxuryself.com").href;
  if (downloadedMedia.has(absoluteUrl)) return downloadedMedia.get(absoluteUrl);

  const response = await fetch(absoluteUrl, {
    headers: { "user-agent": "AgencyLuxurySelfThemeMigration/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Media ${response.status}: ${absoluteUrl}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const extension = extensionFor(absoluteUrl, response.headers.get("content-type"));
  const directory = path.join(mediaRoot, articleSlug);
  const filename = `${hash}${extension}`;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);

  const publicPath = `/assets/source/blog/${articleSlug}/${filename}`;
  downloadedMedia.set(absoluteUrl, publicPath);
  return publicPath;
}

function descriptionFrom(rootNode, fallbackTitle) {
  const paragraph = rootNode
    .find("p")
    .toArray()
    .map((node) => rootNode.find(node).text().replace(/\s+/g, " ").trim())
    .find((text) => text.length >= 80);
  const source = paragraph || fallbackTitle;
  return source.length > 158 ? `${source.slice(0, 155).trim()}…` : source;
}

function cleanAttributes(rootNode) {
  const allowedByTag = {
    a: new Set(["href", "rel", "target"]),
    audio: new Set(["controls", "preload", "src"]),
    img: new Set(["alt", "decoding", "height", "loading", "src", "width"]),
    source: new Set(["src", "type"]),
  };

  rootNode.find("*").each((_, element) => {
    const tag = element.tagName?.toLowerCase();
    const allowed = allowedByTag[tag] || new Set();
    for (const attribute of Object.keys(element.attribs || {})) {
      if (!allowed.has(attribute)) rootNode.find(element).removeAttr(attribute);
    }
    if (tag === "a") {
      const href = rootNode.find(element).attr("href")?.trim() || "";
      let safeHref = false;
      try {
        safeHref = ["http:", "https:", "mailto:", "tel:"].includes(new URL(href, "https://agencyluxuryself.com/").protocol);
      } catch {
        safeHref = false;
      }
      if (!safeHref) {
        rootNode.find(element).removeAttr("href").removeAttr("target");
      }
      const target = rootNode.find(element).attr("target");
      if (target && !["_blank", "_self"].includes(target)) rootNode.find(element).removeAttr("target");
      rootNode.find(element).attr("rel", "noopener noreferrer");
    }
  });
}

async function importArticle(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "AgencyLuxurySelfThemeMigration/1.0" },
  });
  if (!response.ok) throw new Error(`Article ${response.status}: ${url}`);
  const html = await response.text();
  const $ = load(html);
  const article = $("article").first();
  const content = article.find(".entry-content.single-entry-content").first().clone();
  const title = article.find("h1.entry-title").first().text().replace(/\s+/g, " ").trim();
  const slug = slugFromUrl(url);
  const locale = localeFromUrl(url);

  content
    .find(
      ".als-blog-outer, form, script, style, iframe, input, select, textarea, button, noscript",
    )
    .remove();

  content.find("h1").each((_, node) => {
    const heading = content.find(node);
    heading.replaceWith(`<h2>${heading.html() || heading.text()}</h2>`);
  });
  content.find("h2, h3").each((_, node) => {
    const heading = content.find(node);
    if (/solicita\s+cotizaci[oó]n|request\s+(?:a\s+)?quote|demander\s+un\s+devis|angebot\s+anfordern/i.test(heading.text())) {
      heading.parent().remove();
    }
  });
  content.find("h2, h3, h4, p, sup").each((_, node) => {
    const element = content.find(node);
    if (!element.text().replace(/\s+/g, " ").trim() && !element.find("img, audio").length) {
      element.remove();
    }
  });
  content.find("h4").each((_, node) => {
    const heading = content.find(node);
    heading.text(heading.text().replace(/^🎧\s*/, ""));
  });

  const mediaNodes = content.find("img, audio").toArray();
  for (const node of mediaNodes) {
    const element = content.find(node);
    const original = element.attr("src");
    if (!original) continue;
    const localPath = await downloadMedia(original, slug);
    element.attr("src", localPath);
    if (node.tagName === "img") {
      element.attr("loading", "lazy");
      element.attr("decoding", "async");
      element.removeAttr("srcset");
      element.removeAttr("sizes");
      if (!element.attr("alt")?.trim()) {
        element.attr("alt", `${title} — Agency Luxury Self`);
      }
    } else {
      element.attr("preload", "none");
    }
  }

  cleanAttributes(content);

  const sourceHero = article.find(".entry-image img").first().attr("src");
  const heroImage = sourceHero
    ? await downloadMedia(sourceHero, slug)
    : content.find("img").first().attr("src") || null;
  const publishedAt =
    article.find("time.entry-date").first().attr("datetime") ||
    $("meta[property='article:published_time']").attr("content") ||
    null;
  const sourceAuthor = article.find("[rel='author']").first().text().trim() || null;
  const sourceCategory = article.find(".nasa-meta-categories").first().text().trim() || null;
  const category = /sin categorizar|uncategorized/i.test(sourceCategory || "")
    ? null
    : sourceCategory;
  const sourcePath = new URL(url).pathname;

  return {
    id: createHash("sha256").update(sourcePath).digest("hex").slice(0, 16),
    translationKey: translationKeyFor(url),
    locale,
    slug,
    sourcePath,
    sourceUrl: url,
    title,
    description: descriptionFrom(content, title),
    author: sourceAuthor || "Agency Luxury Self",
    authorType: sourceAuthor ? "Person" : "Organization",
    publisher: "Agency Luxury Self",
    category,
    publishedAt,
    heroImage,
    bodyHtml: content.html()?.trim() || "",
  };
}

const articles = [];
for (const url of articleUrls) {
  process.stdout.write(`Importing ${url}\n`);
  articles.push(await importArticle(url));
}

articles.sort((left, right) =>
  String(right.publishedAt || "").localeCompare(String(left.publishedAt || "")),
);

await writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
process.stdout.write(`Imported ${articles.length} articles to ${outputPath}\n`);
