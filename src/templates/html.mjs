// Small HTML helpers shared by every template.

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

/** Escape text for use in HTML content or a double-quoted attribute. */
export const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ESCAPES[ch]);

/** Escape, then allow the two inline marks content files may use: **strong** and *emphasis*. */
export const inline = (value) =>
  esc(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

/** Join a list of rendered fragments. */
export const each = (items, render) => items.map(render).join("\n");

/** Attributes for a link that leaves the site. */
export const external = 'target="_blank" rel="noopener"';

export const arrow = '<span class="arrow" aria-hidden="true">↗</span>';

/**
 * Responsive <picture>: AVIF renditions from assets/img with the original JPEG as fallback.
 * `ctx.images` is the manifest written by scripts/images.mjs; `ctx.base` prefixes asset paths.
 */
export function picture(ctx, { name, alt, sizes, eager = false, className = "" }) {
  const meta = ctx.images[name];
  if (!meta) throw new Error(`No renditions for "${name}" — run: node scripts/images.mjs`);
  const srcset = meta.widths.map((w) => `${ctx.base}assets/img/${name}-${w}.avif ${w}w`).join(", ");
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<picture>
  <source type="image/avif" srcset="${srcset}" sizes="${esc(sizes)}" />
  <img${className ? ` class="${className}"` : ""} src="${ctx.base}media/${name}.jpg" alt="${esc(alt)}" width="${meta.width}" height="${meta.height}" ${loading} decoding="async" />
</picture>`;
}

/**
 * Link that opens a photo in the lightbox (and still works as a plain link without JS).
 * The lightbox shows the original JPEG: it is the sharpest copy and only loads on demand.
 */
export function lightboxAttrs(ctx, { name, caption, group }) {
  const meta = ctx.images[name];
  return `href="${ctx.base}media/${name}.jpg" data-lightbox="${group}" data-width="${meta.width}" data-height="${meta.height}" data-caption="${esc(caption)}"`;
}
