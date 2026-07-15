import assert from "node:assert/strict";

import {
  mergeRuntimeArticles,
  runtimeArticleForRoute,
  runtimeCustomizedPage,
  specializedPageBodyMode,
} from "../src/editorial-runtime.js";
import { editorialBodyMatchesSeed } from "../src/editorial-seed-renderer.js";

const staticArticles = [
  {
    id: "static-en",
    locale: "en",
    translationKey: "article-one",
    slug: "article-one",
    title: "Static article",
    publishedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "static-es",
    locale: "es",
    translationKey: "article-one",
    slug: "articulo-uno",
    title: "Articulo estatico",
    publishedAt: "2025-01-01T00:00:00.000Z",
  },
];

const context = {
  data: {
    editorial: {
      schemaVersion: 1,
      managedBlogPostTranslationKeys: ["article-one"],
      current: {
        kind: "blogPost",
        id: "core-en",
        locale: "en",
        translationKey: "article-one",
        routePath: "/en/blog/article-one/",
        slug: "en-blog-edited-article",
        title: "Edited in Nuklo",
        bodyHtml: "<p>Edited body</p>",
      },
      blogPosts: [
        {
          kind: "blogPost",
          id: "core-en",
          locale: "en",
          translationKey: "article-one",
          routePath: "/en/blog/article-one/",
          slug: "en-blog-edited-article",
          title: "Edited in Nuklo",
          bodyHtml: "<p>Edited body</p>",
          publishedAt: "2026-02-01T00:00:00.000Z",
        },
        {
          kind: "blogPost",
          id: "new-en",
          locale: "en",
          translationKey: "core.new-post",
          routePath: "/en/blog/new-post/",
          slug: "en-blog-new-post",
          title: "New post",
          bodyHtml: "<p>New body</p>",
          publishedAt: "2026-03-01T00:00:00.000Z",
        },
        {
          kind: "blogPost",
          id: "wrong-locale",
          locale: "fr",
          slug: "ignore-me",
          title: "Ignore me",
        },
      ],
    },
  },
};

assert.deepEqual(
  mergeRuntimeArticles(staticArticles, null, "en").map((article) => article.title),
  ["Static article"],
  "without Core context the static article remains the fallback",
);

assert.deepEqual(
  mergeRuntimeArticles(
    staticArticles,
    {
      data: {
        editorial: {
          schemaVersion: 1,
          current: null,
          managedBlogPostTranslationKeys: ["article-one"],
          blogPosts: [],
        },
      },
    },
    "en",
  ),
  [],
  "a deleted Core-managed post does not reappear from the static fallback",
);

const merged = mergeRuntimeArticles(staticArticles, context, "en");
assert.deepEqual(
  merged.map((article) => article.title),
  ["New post", "Edited in Nuklo"],
  "Core replaces the seeded translation and adds a new post without leaking another locale",
);
assert.deepEqual(
  merged.map((article) => article.slug),
  ["new-post", "article-one"],
  "public article links use routePath slugs rather than globally unique CMS slugs",
);

assert.equal(
  runtimeArticleForRoute(
    staticArticles,
    context,
    "en",
    "article-one",
    "/en/blog/article-one/",
  )?.title,
  "Edited in Nuklo",
  "the active route keeps rendering an edited post even after its slug changes",
);

const customizedPageContext = {
  data: {
    editorial: {
      schemaVersion: 1,
      current: {
        kind: "page",
        id: "about-en",
        locale: "en",
        routePath: "/en/about-us/",
        slug: "about-us",
        title: "Our edited story",
        bodyHtml: "<p>Tenant-owned copy</p>",
        customized: true,
      },
      blogPosts: [],
    },
  },
};

assert.equal(
  runtimeCustomizedPage(customizedPageContext, "en", "/en/about-us/")?.title,
  "Our edited story",
  "a customized Page is exposed on its indexed localized route",
);
assert.equal(
  runtimeCustomizedPage(customizedPageContext, "en", "/en/contact/"),
  null,
  "a Page is never injected into a different route",
);
customizedPageContext.data.editorial.current.customized = false;
assert.equal(
  runtimeCustomizedPage(customizedPageContext, "en", "/en/about-us/"),
  null,
  "an unchanged imported Page preserves the exact static template composition",
);

const servicesSeedBody = [
  "## Property & lifestyle management",
  "Complete management through one point of contact.",
  "### Complete operational care",
  "We coordinate maintenance and suppliers.",
  "### Clear follow-up",
  "We keep the owner informed.",
].join("\n\n");
const servicesSeedBodyHtml = [
  '<div class="blog-section"><h2>Property &amp; lifestyle management</h2></div>',
  '<div class="blog-section"><p>Complete management through one point of contact.</p></div>',
  '<div class="blog-section"><h3>Complete operational care</h3></div>',
  '<div class="blog-section"><p>We coordinate maintenance and suppliers.</p></div>',
  '<div class="blog-section"><h3>Clear follow-up</h3></div>',
  '<div class="blog-section"><p>We keep the owner informed.</p></div>',
].join("\n");
const coverOnlyContext = {
  data: {
    editorial: {
      schemaVersion: 1,
      current: {
        kind: "page",
        id: "services-en",
        locale: "en",
        routePath: "/en/services/",
        slug: "services",
        title: "Property care with a new cover",
        coverImage: "/media/tenant/services-cover.webp",
        bodyHtml: servicesSeedBodyHtml,
        customized: true,
      },
      blogPosts: [],
    },
  },
};
const coverOnlyPage = runtimeCustomizedPage(
  coverOnlyContext,
  "en",
  "/en/services/",
  { seedBody: servicesSeedBody },
);
assert.equal(
  coverOnlyPage?.bodyCustomized,
  false,
  "editing a cover or another Page field does not turn the unchanged seed body into custom copy",
);
assert.equal(
  specializedPageBodyMode(coverOnlyPage),
  "static",
  "Services keeps its specialized principles layout when only Page metadata changed",
);

const sameTextStructuralEdits = [
  {
    label: "heading structure",
    bodyHtml: servicesSeedBodyHtml.replace(
      "<h3>Complete operational care</h3>",
      "<h2>Complete operational care</h2>",
    ),
  },
  {
    label: "inline formatting",
    bodyHtml: servicesSeedBodyHtml.replace(
      "Complete management through one point of contact.",
      "<strong>Complete management through one point of contact.</strong>",
    ),
  },
  {
    label: "link destination",
    bodyHtml: servicesSeedBodyHtml.replace(
      "Complete management through one point of contact.",
      '<a href="/en/contact/">Complete management through one point of contact.</a>',
    ),
  },
  {
    label: "image media",
    bodyHtml: `${servicesSeedBodyHtml}\n<div class="blog-section"><figure class="editorial-media editorial-media--image"><img src="/media/tenant/service-detail.webp" alt="" loading="lazy"></figure></div>`,
  },
  {
    label: "audio media",
    bodyHtml: `${servicesSeedBodyHtml}\n<div class="blog-section"><figure class="editorial-media editorial-media--audio"><audio src="/media/tenant/service-brief.mp3" controls></audio></figure></div>`,
  },
];

for (const edit of sameTextStructuralEdits) {
  coverOnlyContext.data.editorial.current.bodyHtml = edit.bodyHtml;
  const editedPage = runtimeCustomizedPage(
    coverOnlyContext,
    "en",
    "/en/services/",
    { seedBody: servicesSeedBody },
  );
  assert.equal(
    editedPage?.bodyCustomized,
    true,
    `${edit.label} must be preserved even when plain text is unchanged`,
  );
  assert.equal(
    specializedPageBodyMode(editedPage),
    "editorial",
    `${edit.label} replaces the specialized static body rather than being discarded`,
  );
}

const richSeedBody = [
  "## Service detail",
  "Read **our [private brief](/en/contact/)**.",
  "![](/media/tenant/service-detail.webp)",
  "::audio[](/media/tenant/service-brief.mp3)",
].join("\n\n");
const richSeedBodyHtml = [
  '<div class="blog-section"><h2>Service detail</h2></div>',
  '<div class="blog-section"><p>Read <strong>our <a href="/en/contact/">private brief</a></strong>.</p></div>',
  '<div class="blog-section"><figure class="editorial-media editorial-media--image"><img src="/media/tenant/service-detail.webp" alt="" loading="lazy"></figure></div>',
  '<div class="blog-section"><figure class="editorial-media editorial-media--audio"><audio src="/media/tenant/service-brief.mp3" controls></audio></figure></div>',
].join("\n");
assert.equal(
  editorialBodyMatchesSeed(richSeedBodyHtml, richSeedBody),
  true,
  "an unchanged structured seed with formatting, links, images and audio stays static",
);
for (const changedHtml of [
  richSeedBodyHtml.replace('href="/en/contact/"', 'href="/en/about-us/"'),
  richSeedBodyHtml.replace("service-detail.webp", "different-detail.webp"),
  richSeedBodyHtml.replace("service-brief.mp3", "different-brief.mp3"),
]) {
  assert.equal(
    editorialBodyMatchesSeed(changedHtml, richSeedBody),
    false,
    "link and media identity are part of the canonical body",
  );
}

coverOnlyContext.data.editorial.current.bodyHtml =
  `${servicesSeedBodyHtml}\n<div class="blog-section"><p>A tenant-authored service promise.</p></div>`;
const bodyEditedPage = runtimeCustomizedPage(
  coverOnlyContext,
  "en",
  "/en/services/",
  { seedBody: servicesSeedBody },
);
assert.equal(bodyEditedPage?.bodyCustomized, true);
assert.equal(
  specializedPageBodyMode(bodyEditedPage),
  "editorial",
  "an actual body edit replaces the static principles instead of rendering both copies",
);

console.log("Editorial runtime bridge tests passed.");
