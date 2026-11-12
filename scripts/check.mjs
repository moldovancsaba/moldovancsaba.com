#!/usr/bin/env node
// Sanity checks on the built site. Run after `node scripts/build.mjs`; exits non-zero on any problem.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { at, loadContent, referencedImages } from "./lib.mjs";

const ALLOWED_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
const problems = [];
const fail = (page, message) => problems.push(`${page}: ${message}`);

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];

function checkPage(page) {
  const html = readFileSync(at(page), "utf8");

  // Ids are unique, and every in-page link points at one.
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) fail(page, `duplicate id "${id}"`);
  for (const [, target] of html.matchAll(/\shref="#([^"]+)"/g)) {
    if (!ids.includes(target)) fail(page, `link to missing anchor #${target}`);
  }

  // Every local file the page loads or links to exists; nothing loads from an unexpected host.
  const resources = [];
  for (const tag of tags(html, "link")) if (!/rel="canonical"/.test(tag)) resources.push(attr(tag, "href"));
  for (const tag of [...tags(html, "script"), ...tags(html, "img")]) resources.push(attr(tag, "src"));
  for (const tag of tags(html, "source")) {
    for (const candidate of (attr(tag, "srcset") ?? "").split(",")) resources.push(candidate.trim().split(/\s+/)[0]);
  }
  const links = tags(html, "a").map((tag) => attr(tag, "href"));

  const localFile = (url) => url.replace(/^\//, "").replace(/[?#].*$/, "") || "index.html";
  for (const url of resources.filter(Boolean)) {
    if (/^https?:/.test(url)) {
      if (!ALLOWED_HOSTS.has(new URL(url).host)) fail(page, `loads from unexpected host: ${url}`);
    } else if (!existsSync(at(localFile(url)))) fail(page, `missing file ${localFile(url)}`);
  }
  for (const url of links.filter(Boolean)) {
    if (/^(#|mailto:|https?:)/.test(url)) continue;
    if (!existsSync(at(localFile(url)))) fail(page, `link to missing file ${localFile(url)}`);
  }

  // Images carry alt text and intrinsic dimensions (no layout shift).
  for (const tag of tags(html, "img")) {
    if (!attr(tag, "src")) continue; // the lightbox image is filled in at runtime
    for (const name of ["alt", "width", "height"]) {
      if (attr(tag, name) === undefined) fail(page, `<img src="${attr(tag, "src")}"> has no ${name}`);
    }
  }

  // The CSP hash matches the inline script it is meant to allow.
  const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  const hash = createHash("sha256").update(inline ?? "").digest("base64");
  if (!html.includes(`'sha256-${hash}'`)) fail(page, "CSP hash does not match the inline script");

  // Structured data is valid JSON.
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch (error) {
      fail(page, `invalid JSON-LD: ${error.message}`);
    }
  }

  if (/\bundefined\b|\[object Object\]|\bNaN\b/.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) {
    fail(page, "template output contains undefined / [object Object] / NaN");
  }
}

checkPage("index.html");
checkPage("404.html");

// Photos: every referenced source exists, and no rendition is a tiled AVIF (Chromium shows those blank).
for (const name of referencedImages(loadContent())) {
  if (!existsSync(at("media", `${name}.jpg`))) fail("content", `media/${name}.jpg is referenced but missing`);
}
for (const file of readdirSync(at("assets/img")).filter((f) => f.endsWith(".avif"))) {
  if (readFileSync(at("assets/img", file)).includes("grid")) fail("assets/img", `${file} is a tiled AVIF — rerun scripts/images.mjs`);
}

if (problems.length) {
  console.error(`check: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log("check: index.html and 404.html are consistent");
