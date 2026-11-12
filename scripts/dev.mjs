#!/usr/bin/env node
// Local preview: builds, serves the repository root the way GitHub Pages does,
// and rebuilds whenever something in content/ or src/ changes.
//   node scripts/dev.mjs            (PORT=8100 by default)
import { execFile } from "node:child_process";
import { createReadStream, existsSync, statSync, watch } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { ROOT, at } from "./lib.mjs";

const PORT = Number(process.env.PORT) || 8100;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
};

// Each build runs in a fresh process so edited templates are never served from the module cache.
const rebuild = () =>
  new Promise((resolve) => {
    execFile(process.execPath, [at("scripts/build.mjs")], (error, stdout, stderr) => {
      process.stdout.write(stdout);
      if (error) process.stderr.write(stderr || String(error));
      resolve();
    });
  });

let timer;
for (const dir of ["content", "src"]) {
  watch(at(dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 80);
  });
}

await rebuild();

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = path.join(ROOT, path.normalize(pathname));
  if (!file.startsWith(ROOT)) file = at("404.html");
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  const found = existsSync(file);
  if (!found) file = at("404.html");
  response.writeHead(found ? 200 : 404, {
    "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`dev: http://localhost:${PORT}`));
