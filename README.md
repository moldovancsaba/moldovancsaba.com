# moldovancsaba.com

The professional website of **Moldován Csaba Zoltán** and **Moldován Csaba Kft** —
entrepreneur, product builder and venture partner based in Budapest.

> Make your product done.

A fast static site with **no dependencies**: content lives in JSON, a small Node script
turns it into HTML, and GitHub Pages serves the result straight from this branch.

## How it fits together

| Path | What it is | Edit by hand? |
|------|------------|---------------|
| `content/*.json` | All text: bio, method, projects, timeline, gallery captions, reviews, credentials, links | **Yes** — this is where content changes go |
| `src/templates/` | HTML templates (one function per page section) | Yes |
| `src/styles/` | CSS: `tokens` (colours, type, spacing) → `base` → `components` → `sections` | Yes |
| `src/scripts/main.js` | Theme toggle, mobile menu, filters, "show more", photo lightbox | Yes |
| `media/` | Original photos (JPEG) — also the fallback for browsers without AVIF | Add photos here |
| `scripts/` | `build`, `dev`, `check` and `images` tools (Node built-ins only) | Rarely |
| `index.html`, `404.html`, `sitemap.xml`, `assets/site.css`, `assets/site.js` | **Generated** by `scripts/build.mjs` | No — rebuild instead |
| `assets/img/` | **Generated** responsive AVIF renditions + `manifest.json` | No — run `scripts/images.mjs` |
| `CNAME`, `.nojekyll`, `robots.txt` | GitHub Pages / crawler configuration | Rarely |

## Working on the site

Requires Node 20 or newer. There is nothing to install.

```bash
node scripts/dev.mjs      # preview at http://localhost:8100, rebuilds on every change
node scripts/build.mjs    # one-off build
node scripts/check.mjs    # verify links, anchors, images, metadata and the CSP hash
```

### Common changes

- **Change any text** — edit the matching file in `content/`. Inside prose, `**bold**` and
  `*emphasis*` are supported.
- **Add a project, review or timeline entry** — add an object to the list in
  `content/projects.json`, `content/reviews.json` or `content/timeline.json`.
  Timeline entries can show a photo: set `"photo"` to the `image` name of a gallery photo.
- **Add a photo** — put `name.jpg` in `media/`, add it to `content/gallery.json`
  (`image`, `alt`, `caption`), then run `node scripts/images.mjs` (macOS only — it uses the
  built-in `sips` tool) and rebuild.
- **Change colours or fonts** — `src/styles/tokens.css`. Each colour is a
  `light-dark(light, dark)` pair, so both themes stay in one place.

## Deploying

GitHub Pages publishes the `main` branch root on the `moldovancsaba.com` custom domain
(`CNAME`). Because Pages serves the files as committed, **commit the generated files too**:

```bash
node scripts/build.mjs && node scripts/check.mjs
git add -A && git commit
```

The `Check site` workflow rebuilds on every push and pull request and fails if the committed
output is stale or a check does not pass.

## Design notes

- Light and dark themes follow the visitor's system setting; the toggle stores an explicit choice.
- The page works without JavaScript: all content is visible, the menu stays reachable and
  photos open as plain links.
- Photos are served as AVIF at three sizes (`srcset`), lazy-loaded, with intrinsic dimensions
  so nothing shifts while loading.
- A Content-Security-Policy restricts the page to its own files plus Google Fonts.
- Motion (headline strike-through, rotating stamp, scroll reveal) is disabled for visitors who
  prefer reduced motion.

---

© Moldován Csaba Kft · Budapest, Hungary

## License

MIT. See [LICENSE](LICENSE).
