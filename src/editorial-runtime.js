import { editorialBodyMatchesSeed } from "./editorial-seed-renderer.js";

function cleanText(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function normalizePath(value) {
  const raw = cleanText(value).split("?")[0].split("#")[0];
  if (!raw) return "/";
  const path = `/${raw.replace(/^\/+|\/+$/g, "")}/`.replace(/\/{2,}/g, "/");
  return path === "//" ? "/" : path;
}

function readEditorial(context) {
  const data = asRecord(context)?.data;
  const editorial = asRecord(asRecord(data)?.editorial);
  return editorial?.schemaVersion === 1 ? editorial : null;
}

function publicSlugForPost(post) {
  const explicit = cleanText(post.publicSlug);
  if (explicit) return explicit;
  const routeSegments = normalizePath(post.routePath).split("/").filter(Boolean);
  const routeSlug = routeSegments.at(-1);
  return cleanText(routeSlug, cleanText(post.slug));
}

function normalizeBlogPost(value, locale) {
  const post = asRecord(value);
  if (!post || cleanText(post.kind) !== "blogPost") return null;
  const postLocale = cleanText(post.locale).toLowerCase();
  const cmsSlug = cleanText(post.slug);
  const slug = publicSlugForPost(post);
  const title = cleanText(post.title);
  if (!cmsSlug || !slug || !title || (postLocale && postLocale !== locale)) return null;

  return {
    id: cleanText(post.id, `core-blog-${locale}-${slug}`),
    locale,
    translationKey: cleanText(post.translationKey, `core.${slug}`),
    routePath: normalizePath(post.routePath),
    slug,
    cmsSlug,
    title,
    description: cleanText(post.excerpt, cleanText(post.seoDescription)),
    bodyHtml: cleanText(post.bodyHtml),
    heroImage: cleanText(post.coverImage, "/assets/source/pages/blog-cover.jpg"),
    heroAlt: cleanText(post.coverAlt, title),
    category: cleanText(post.category),
    publishedAt: cleanText(post.publishedAt),
    author: cleanText(post.author, "Agency Luxury Self"),
    publisher: cleanText(post.publisher, "Agency Luxury Self"),
    source: "nuklo-core",
  };
}

function articleIdentity(article) {
  const translationKey = cleanText(article?.translationKey);
  return translationKey ? `translation:${translationKey}` : `slug:${cleanText(article?.slug)}`;
}

export function mergeRuntimeArticles(staticArticles, context, locale) {
  const normalizedLocale = cleanText(locale, "es").toLowerCase();
  const editorial = readEditorial(context);
  const managedTranslationKeys = new Set(
    Array.isArray(editorial?.managedBlogPostTranslationKeys)
      ? editorial.managedBlogPostTranslationKeys.map((value) => cleanText(value)).filter(Boolean)
      : [],
  );
  const fallback = [...(Array.isArray(staticArticles) ? staticArticles : [])]
    .filter((article) => cleanText(article?.locale).toLowerCase() === normalizedLocale);
  if (!editorial || !Array.isArray(editorial.blogPosts)) {
    return fallback.sort(sortArticlesNewestFirst);
  }

  const merged = new Map(
    fallback
      .filter((article) => !managedTranslationKeys.has(cleanText(article?.translationKey)))
      .map((article) => [articleIdentity(article), article]),
  );
  for (const candidate of editorial.blogPosts) {
    const article = normalizeBlogPost(candidate, normalizedLocale);
    if (!article) continue;
    merged.set(articleIdentity(article), article);
  }

  return [...merged.values()].sort(sortArticlesNewestFirst);
}

export function runtimeArticleForRoute(staticArticles, context, locale, slug, pathname = "") {
  const normalizedLocale = cleanText(locale, "es").toLowerCase();
  const normalizedSlug = cleanText(slug);
  const editorial = readEditorial(context);
  const current = normalizeBlogPost(editorial?.current, normalizedLocale);
  if (
    current &&
    (current.slug === normalizedSlug ||
      (pathname && normalizePath(current.routePath) === normalizePath(pathname)))
  ) {
    return current;
  }

  return (
    mergeRuntimeArticles(staticArticles, context, normalizedLocale)
      .find((article) => cleanText(article.slug) === normalizedSlug) || null
  );
}

export function runtimeCustomizedPage(context, locale, pathname = "", options = {}) {
  const editorial = readEditorial(context);
  const page = asRecord(editorial?.current);
  const normalizedLocale = cleanText(locale, "es").toLowerCase();
  if (
    !page ||
    cleanText(page.kind) !== "page" ||
    page.customized !== true ||
    (cleanText(page.locale) && cleanText(page.locale).toLowerCase() !== normalizedLocale) ||
    (pathname && normalizePath(page.routePath) !== normalizePath(pathname))
  ) {
    return null;
  }

  const title = cleanText(page.title);
  const bodyHtml = cleanText(page.bodyHtml);
  if (!title || !bodyHtml) return null;
  const seedBody = cleanText(asRecord(options)?.seedBody);
  const bodyCustomized =
    !seedBody || !editorialBodyMatchesSeed(bodyHtml, seedBody);

  return {
    id: cleanText(page.id),
    locale: normalizedLocale,
    routePath: normalizePath(page.routePath),
    translationKey: cleanText(page.translationKey),
    slug: cleanText(page.slug),
    title,
    excerpt: cleanText(page.excerpt),
    bodyHtml,
    bodyCustomized,
    coverImage: cleanText(page.coverImage),
    coverAlt: cleanText(page.coverAlt, title),
    seoTitle: cleanText(page.seoTitle),
    seoDescription: cleanText(page.seoDescription),
  };
}

export function specializedPageBodyMode(page) {
  return asRecord(page)?.bodyCustomized === true ? "editorial" : "static";
}

function sortArticlesNewestFirst(left, right) {
  const leftTime = Date.parse(cleanText(left?.publishedAt)) || 0;
  const rightTime = Date.parse(cleanText(right?.publishedAt)) || 0;
  return rightTime - leftTime || cleanText(left?.title).localeCompare(cleanText(right?.title));
}
