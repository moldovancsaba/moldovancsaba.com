// Shared helpers for the build, image and check scripts. Node built-ins only.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const at = (...parts) => path.join(ROOT, ...parts);

export const readJson = (rel) => JSON.parse(readFileSync(at(rel), "utf8"));

/** All editable content, keyed by file name. */
export function loadContent() {
  return {
    site: readJson("content/site.json"),
    projects: readJson("content/projects.json"),
    timeline: readJson("content/timeline.json"),
    gallery: readJson("content/gallery.json"),
    reviews: readJson("content/reviews.json"),
  };
}

/** Names (without extension) of every photo the content refers to. */
export function referencedImages(content) {
  const names = new Set([content.site.person.portrait]);
  for (const photo of content.gallery.photos) names.add(photo.image);
  for (const item of content.timeline.items) if (item.photo) names.add(item.photo);
  return [...names].sort();
}
