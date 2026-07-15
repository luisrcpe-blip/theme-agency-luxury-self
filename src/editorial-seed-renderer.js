// Mirrors Nuklo Core's public Markdown renderer so Page seed identity includes
// structure and safe attributes, not only the text a visitor can see.
const INLINE_PATTERN_SOURCE = String.raw`(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))`;
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function normalizeSpaces(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(value) {
  const href = String(value ?? "").trim();
  if (!href) return "";
  if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#")) {
    return href;
  }
  try {
    const parsed = new URL(href);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function parseInline(text) {
  const tokens = [];
  const pattern = new RegExp(INLINE_PATTERN_SOURCE, "g");
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    if (match[2]) {
      tokens.push({ type: "strong", children: parseInline(match[2]) });
    } else if (match[3]) {
      tokens.push({ type: "em", children: parseInline(match[3]) });
    } else if (match[4]) {
      const href = sanitizeHref(match[5]);
      tokens.push(
        href
          ? { type: "link", href, children: parseInline(match[4]) }
          : { type: "text", text: match[4] },
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", text: text.slice(lastIndex) });
  }
  return tokens;
}

function renderInline(tokens) {
  return tokens.map((token) => {
    if (token.type === "text") return escapeHtml(token.text);
    if (token.type === "strong") return `<strong>${renderInline(token.children)}</strong>`;
    if (token.type === "em") return `<em>${renderInline(token.children)}</em>`;
    const href = sanitizeHref(token.href);
    return href
      ? `<a href="${escapeHtml(href)}">${renderInline(token.children)}</a>`
      : renderInline(token.children);
  }).join("");
}

function renderTextBlock(tag, text) {
  return `<${tag}>${renderInline(parseInline(text))}</${tag}>`;
}

function parseTableRow(value) {
  return value
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => normalizeSpaces(cell.replace(/\\\|/g, "|")));
}

function isTableLine(value) {
  return /^\|.+\|$/.test(value.trim());
}

function isTableSeparator(value) {
  if (!isTableLine(value)) return false;
  const cells = parseTableRow(value);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseCaption(value) {
  const match = value.trim().match(/^[_*]([^_*].*?)[_*]$/);
  return match?.[1] ? normalizeSpaces(match[1]) : "";
}

export function renderEditorialSeedMarkdownHtml(body) {
  const lines = String(body ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const text = normalizeSpaces(paragraphLines.join(" "));
    if (text) blocks.push(renderTextBlock("p", text));
    paragraphLines = [];
  };
  const flushList = () => {
    if (!list?.items.length) {
      list = null;
      return;
    }
    const tag = list.type === "ordered" ? "ol" : "ul";
    blocks.push(
      `<${tag}>${list.items.map((item) => `<li>${renderInline(parseInline(item))}</li>`).join("")}</${tag}>`,
    );
    list = null;
  };
  const flushOpen = () => {
    flushParagraph();
    flushList();
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = (lines[lineIndex] ?? "").trim();
    if (!line) {
      flushOpen();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading?.[1] && heading[2]) {
      flushOpen();
      const level = heading[1].length;
      blocks.push(renderTextBlock(`h${level}`, normalizeSpaces(heading[2])));
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushOpen();
      blocks.push("<hr>");
      continue;
    }

    const spacer = line.match(/^::spacer\[(\d{1,4})\]$/);
    if (spacer?.[1]) {
      flushOpen();
      const height = Math.min(240, Math.max(8, Number(spacer[1])));
      blocks.push(`<div class="editorial-spacer" style="height:${height}px"></div>`);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image?.[2]) {
      const src = sanitizeHref(image[2]);
      if (src) {
        let caption = "";
        let nextIndex = lineIndex + 1;
        while (nextIndex < lines.length && !(lines[nextIndex] ?? "").trim()) nextIndex += 1;
        const possibleCaption = parseCaption(lines[nextIndex] ?? "");
        if (possibleCaption) {
          caption = possibleCaption;
          lineIndex = nextIndex;
        }
        flushOpen();
        blocks.push(
          `<figure class="editorial-media editorial-media--image"><img src="${escapeHtml(src)}" alt="${escapeHtml(normalizeSpaces(image[1] ?? ""))}" loading="lazy">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`,
        );
        continue;
      }
    }

    const audio = line.match(/^::audio\[([^\]]*)\]\(([^)]+)\)$/);
    if (audio?.[2]) {
      const src = sanitizeHref(audio[2]);
      if (src) {
        flushOpen();
        const title = normalizeSpaces(audio[1] ?? "Audio");
        blocks.push(
          `<figure class="editorial-media editorial-media--audio"><audio src="${escapeHtml(src)}" controls></audio>${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ""}</figure>`,
        );
        continue;
      }
    }

    const nextLine = (lines[lineIndex + 1] ?? "").trim();
    if (isTableLine(line) && isTableSeparator(nextLine)) {
      flushOpen();
      const headers = parseTableRow(line);
      const rows = [];
      lineIndex += 2;
      while (lineIndex < lines.length && isTableLine((lines[lineIndex] ?? "").trim())) {
        rows.push(parseTableRow(lines[lineIndex] ?? ""));
        lineIndex += 1;
      }
      lineIndex -= 1;
      blocks.push(
        `<div class="editorial-table-wrap"><table><thead><tr>${headers.map((header) => `<th>${renderInline(parseInline(header))}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(parseInline(cell))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote?.[1]) {
      flushOpen();
      blocks.push(renderTextBlock("blockquote", normalizeSpaces(quote[1])));
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered?.[1]) {
      flushParagraph();
      if (list?.type !== "unordered") {
        flushList();
        list = { type: "unordered", items: [] };
      }
      list.items.push(normalizeSpaces(unordered[1]));
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered?.[1]) {
      flushParagraph();
      if (list?.type !== "ordered") {
        flushList();
        list = { type: "ordered", items: [] };
      }
      list.items.push(normalizeSpaces(ordered[1]));
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushOpen();
  return blocks.map((block) => `<div class="blog-section">${block}</div>`).join("\n");
}

function canonicalizeRenderedHtml(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .replace(/>\s+</g, "><");
}

export function editorialBodyMatchesSeed(bodyHtml, seedMarkdown) {
  return (
    canonicalizeRenderedHtml(bodyHtml) ===
    canonicalizeRenderedHtml(renderEditorialSeedMarkdownHtml(seedMarkdown))
  );
}
