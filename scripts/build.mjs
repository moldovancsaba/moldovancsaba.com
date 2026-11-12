#!/usr/bin/env node
// Builds the site into the repository root, which is what GitHub Pages serves:
//   content/*.json + src/templates  ->  index.html, 404.html, sitemap.xml
//   src/styles/*.css                ->  assets/site.css
//   src/scripts/main.js             ->  assets/site.js
// Node built-ins only — there is nothing to install.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { THEME_SCRIPT, renderHome, renderNotFound } from "../src/templates/page.mjs";
import { at, loadContent, readJson } from "./lib.mjs";

// Order matters: later files may override earlier ones.
const STYLES = ["tokens", "base", "components", "sections"];

const sha = (text, encoding) => createHash("sha256").update(text).digest(encoding);
const version = (text) => sha(text, "hex").slice(0, 10);

// Comments and indentation are dropped; anything smarter is not worth a dependency.
const css = STYLES.map((name) => readFileSync(at(`src/styles/${name}.css`), "utf8"))
  .join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s+/gm, "")
  .replace(/\n{2,}/g, "\n");
const js = readFileSync(at("src/scripts/main.js"), "utf8");

const content = loadContent();

// Everything is self-hosted except the web fonts; the one inline script is allowed by hash.
const csp = [
  "default-src 'self'",
  `script-src 'self' https://unpkg.com 'sha256-${sha(THEME_SCRIPT, "base64")}'`,
  "style-src 'self' https://fonts.googleapis.com https://unpkg.com",
  "style-src-attr 'unsafe-inline'",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: https://*.tile.openstreetmap.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

/** Template context. `base` prefixes asset URLs: "" for relative, "/" for root-relative. */
const context = (base) => ({
  ...content,
  images: readJson("assets/img/manifest.json"),
  base,
  csp,
  // The content hash in the query string busts caches whenever a file changes.
  assets: { css: `assets/site.css?v=${version(css)}`, js: `assets/site.js?v=${version(js)}` },
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${content.site.url}/</loc></url>
</urlset>
`;

const outputs = {
  "assets/site.css": css,
  "assets/site.js": js,
  "index.html": renderHome(context("")),
  // The 404 page is served for any missing path, so its assets are root-relative.
  "404.html": renderNotFound(context("/")),
  "sitemap.xml": sitemap,
};
for (const [file, text] of Object.entries(outputs)) writeFileSync(at(file), text);

const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} kB`;
console.log(`build: index.html ${kb(outputs["index.html"])}, site.css ${kb(css)}, site.js ${kb(js)}`);
