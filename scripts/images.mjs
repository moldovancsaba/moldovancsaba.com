#!/usr/bin/env node
// Generates responsive AVIF renditions for every photo the content references:
//   media/<name>.jpg  ->  assets/img/<name>-<width>.avif
// The original JPEG in media/ doubles as the fallback for browsers without AVIF.
//
// Uses `sips`, which ships with macOS, so there is nothing to install. The output
// is committed; run this only after adding or replacing a file in media/.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { at, loadContent, referencedImages } from "./lib.mjs";

const WIDTHS = [480, 800, 1000];
// sips switches to tiled ("grid") AVIF once either side reaches 1024px, and Chromium
// renders those as a blank box. Every rendition therefore fits inside 1000 x 1000.
const MAX_SIDE = 1000;
const AVIF_QUALITY = 50;
const OUT = "assets/img";

if (process.platform !== "darwin") {
  console.error("scripts/images.mjs needs macOS (it uses the built-in `sips` tool).");
  process.exit(1);
}

const sips = (...args) => execFileSync("sips", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function dimensions(file) {
  const out = sips("-g", "pixelWidth", "-g", "pixelHeight", file);
  return {
    width: Number(out.match(/pixelWidth: (\d+)/)[1]),
    height: Number(out.match(/pixelHeight: (\d+)/)[1]),
  };
}

const force = process.argv.includes("--force");
const names = referencedImages(loadContent());
mkdirSync(at(OUT), { recursive: true });

const manifest = {};
const expected = new Set(["manifest.json"]);
let written = 0;

for (const name of names) {
  const source = at("media", `${name}.jpg`);
  if (!existsSync(source)) {
    console.error(`Missing source photo: media/${name}.jpg`);
    process.exit(1);
  }
  const { width, height } = dimensions(source);
  // Never upscale, and keep the height within MAX_SIDE too (matters for portrait photos).
  const widest = Math.min(width, Math.floor((MAX_SIDE * width) / height));
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, widest)))];

  for (const w of widths) {
    const file = `${name}-${w}.avif`;
    expected.add(file);
    const target = at(OUT, file);
    if (!force && existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) continue;
    sips("--resampleWidth", String(w), "-s", "format", "avif", "-s", "formatOptions", String(AVIF_QUALITY), source, "--out", target);
    if (readFileSync(target).includes("grid")) {
      console.error(`${file} came out as a tiled AVIF, which browsers cannot be trusted to render.`);
      process.exit(1);
    }
    written++;
  }

  manifest[name] = { width, height, widths };
}

// Drop renditions of photos the content no longer uses.
for (const file of readdirSync(at(OUT))) {
  if (!expected.has(file)) rmSync(at(OUT, file));
}

writeFileSync(at(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`images: ${names.length} photos, ${written} renditions written to ${OUT}/`);
