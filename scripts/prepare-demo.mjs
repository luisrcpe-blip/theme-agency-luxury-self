import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { MANIFEST_FILE, OUT_DIR, PROJECT_ROOT } from "./release-config.mjs";

const DEMO_DIR = resolve(PROJECT_ROOT, "demo-out");
const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".mjs", ".txt", ".xml"]);
const IMPORT_ONLY_FILES = [
  "integrity.json",
  "nuklo.template.json",
  "redirects.json",
  "release-report.json",
];

function assertDemoBase(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.search || url.hash) {
    throw new Error("THEME_DEMO_BASE_URL debe ser una URL HTTPS sin query ni fragmento.");
  }
  return url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
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
  return files;
}

const manifest = JSON.parse(await readFile(resolve(OUT_DIR, MANIFEST_FILE), "utf8"));
const releaseBase = String(manifest.appUrl || "");
if (!releaseBase.startsWith("https://")) {
  throw new Error("El artefacto de release no contiene appUrl HTTPS.");
}
const demoBase = assertDemoBase(
  process.env.THEME_DEMO_BASE_URL || "https://luisrcpe-blip.github.io/theme-agency-luxury-self/",
);

await rm(DEMO_DIR, { recursive: true, force: true });
await mkdir(DEMO_DIR, { recursive: true });
await cp(OUT_DIR, DEMO_DIR, { recursive: true });

let rewrittenFiles = 0;
for (const file of await walkFiles(DEMO_DIR)) {
  if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase())) continue;
  const before = await readFile(file, "utf8");
  const after = before.split(releaseBase).join(demoBase);
  if (after !== before) {
    await writeFile(file, after, "utf8");
    rewrittenFiles += 1;
  }
}

for (const file of IMPORT_ONLY_FILES) {
  await rm(resolve(DEMO_DIR, file), { force: true });
}

// GitHub Pages uses this document for client-only URLs such as product/order routes.
await cp(resolve(DEMO_DIR, "index.html"), resolve(DEMO_DIR, "404.html"));
await writeFile(resolve(DEMO_DIR, ".nojekyll"), "", "utf8");

console.log(`Demo preparado en ${DEMO_DIR} (${rewrittenFiles} archivos reescritos).`);
