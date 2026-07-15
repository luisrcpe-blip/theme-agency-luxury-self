import assert from "node:assert/strict";

import { richHtmlToNukloMarkdown } from "./release-config.mjs";
import {
  CONTACT_DETAILS,
  EDITABLE_PAGE_KEYS,
  buildEditablePageSeed,
} from "../src/page-editorial-content.js";

const headingMarkdown = richHtmlToNukloMarkdown(
  "<h2>Primary</h2><h3>Supported</h3><h4>Legacy detail</h4>",
  "https://templates.nuklo.cloud/agency-luxury-self/",
);

assert.equal(
  headingMarkdown,
  "## Primary\n\n### Supported\n\n### Legacy detail",
  "legacy H4 content is capped at the H3 level supported by Nuklo Core",
);
assert.doesNotMatch(headingMarkdown, /^#{4,}\s+/m, "the converter never emits unsupported H4+ Markdown");

const locales = ["es", "en", "de", "fr"];
for (const page of EDITABLE_PAGE_KEYS) {
  for (const locale of locales) {
    const seed = buildEditablePageSeed(page, locale);
    assert.ok(seed?.title, `${page}:${locale} has an editable title`);
    assert.ok(seed?.excerpt, `${page}:${locale} has an editable lead`);
    assert.ok(seed?.content.length >= 240, `${page}:${locale} exports meaningful visible content`);
    assert.match(seed.content, /^##\s+\S/m, `${page}:${locale} exports its lead structure`);
    assert.ok((seed.content.match(/^###\s+\S/gm) || []).length >= 3, `${page}:${locale} exports its visible content blocks`);
    assert.doesNotMatch(seed.content, /^#{4,}\s+/m, `${page}:${locale} stays within H1-H3`);
  }
}

const englishContact = buildEditablePageSeed("contact", "en");
assert.match(englishContact.content, new RegExp(CONTACT_DETAILS.phone.replace(/[+]/g, "\\+")), "contact seed preserves the published phone number");
assert.match(englishContact.content, new RegExp(CONTACT_DETAILS.email), "contact seed preserves the published email address");

console.log("Release configuration tests passed.");
