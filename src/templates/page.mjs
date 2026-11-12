// Document shell (head, header, footer) and the two pages built from it.
import { each, esc } from "./html.mjs";
import * as s from "./sections.mjs";

/** Runs before first paint: marks JS as available and applies a stored theme choice. */
export const THEME_SCRIPT =
  '(function(d){d.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.dataset.theme=t}catch(e){}})(document.documentElement)';

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400..600&display=swap";

function structuredData({ site }) {
  const { person, company, links, url } = site;
  const address = { "@type": "PostalAddress", addressLocality: company.locality, addressCountry: company.country };
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: person.name,
        alternateName: person.alternateName,
        image: `${url}/media/${person.portrait}.jpg`,
        url,
        jobTitle: person.jobTitle,
        worksFor: { "@type": "Organization", name: company.name },
        address,
        alumniOf: person.alumniOf,
        award: person.award,
        sameAs: [links.github, links.linkedin, links.x, links.producthunt, links.wikipedia],
      },
      {
        "@type": "Organization",
        name: company.name,
        alternateName: company.alternateName,
        url,
        logo: `${url}/assets/favicon.svg`,
        slogan: company.slogan,
        address,
        founder: { "@type": "Person", name: person.name },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: company.rating.value,
          reviewCount: String(company.rating.count),
          bestRating: String(company.rating.best),
        },
        sameAs: [company.linkedin],
      },
    ],
  };
  return JSON.stringify(graph, null, 2).replace(/</g, "\\u003c");
}

function documentHead(ctx, { title, description, indexable }) {
  const { site, base, assets } = ctx;
  const { meta, person, company, url } = site;
  const image = `${url}/media/${person.portrait}.jpg`;
  const social = indexable
    ? `<link rel="canonical" href="${url}/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(meta.ogTitle)}" />
  <meta property="og:description" content="${esc(meta.ogDescription)}" />
  <meta property="og:url" content="${url}/" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:alt" content="Portrait of ${esc(person.name)}" />
  <meta property="og:site_name" content="${esc(company.name)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:creator" content="${esc(meta.twitter)}" />
  <script type="application/ld+json">
${structuredData(ctx)}
  </script>`
    : `<meta name="robots" content="noindex" />`;

  return `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="${esc(ctx.csp)}" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="author" content="${esc(person.name)}" />
  <meta name="theme-color" content="#f5f2ea" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#121110" media="(prefers-color-scheme: dark)" />
  <script>${THEME_SCRIPT}</script>
  <link rel="icon" type="image/svg+xml" href="${base}assets/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${esc(FONTS)}" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="${base}${assets.css}" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer></script>
  <script src="${base}${assets.js}" defer></script>
  ${social}
</head>`;
}

function siteHeader({ site }, home) {
  return `<header class="nav" id="top">
    <div class="container nav__inner">
      <a class="brand" href="${home}" aria-label="${esc(site.company.name)} — home">
        <span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.5 4.5L19 7" /></svg></span>
        <span class="brand__text">${esc(site.person.shortName)}</span>
      </a>
      <button type="button" class="nav__toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
        <span></span><span></span>
      </button>
      <nav class="nav__menu" id="site-nav" aria-label="Primary">
        <ul class="nav__links">
          ${each(site.nav, (l) => `<li><a href="${home === "#top" ? "" : home}${l.href}">${esc(l.label)}</a></li>`)}
        </ul>
      </nav>
      <div class="nav__actions">
        <button type="button" class="icon-btn" id="theme-toggle" aria-label="Switch between light and dark theme" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" /><path class="icon-btn__half" d="M12 3.5a8.5 8.5 0 0 1 0 17z" /></svg>
        </button>
        <a class="btn btn--small" href="${site.links.github}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </header>`;
}

function siteFooter({ site }) {
  return `<footer class="footer">
    <div class="container footer__inner">
      <p>© <span data-year></span> ${esc(site.company.name)} · ${esc(site.company.location)}</p>
      <p class="footer__motto">${esc(site.company.slogan)}</p>
    </div>
  </footer>`;
}

const shell = (ctx, head, body) => `<!doctype html>
<!-- Generated by scripts/build.mjs — edit content/ and src/, then rebuild. -->
<html lang="${ctx.site.lang}">
${head}
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${body}
</body>
</html>
`;

export function renderHome(ctx) {
  const { meta } = ctx.site;
  // Numbered sections, in page order.
  const numbered = [s.about, s.method, s.work, s.timeline, s.worldMap, s.galleryGrid, s.reviews, s.studio, s.credentials, s.contact];
  const body = `${siteHeader(ctx, "#top")}

  <main id="main">
    ${s.hero(ctx)}

    ${s.stages(ctx)}

    ${numbered.map((section, i) => section(ctx, i + 1)).join("\n\n    ")}
  </main>

  ${siteFooter(ctx)}

  ${s.lightbox}`;
  return shell(ctx, documentHead(ctx, { title: meta.title, description: meta.description, indexable: true }), body);
}

export function renderNotFound(ctx) {
  const body = `${siteHeader(ctx, "/")}

  <main id="main">
    <section class="notfound">
      <div class="container">
        <p class="eyebrow">Error 404</p>
        <h1 class="hero__title">Not done <span class="nowrap">yet.</span></h1>
        <p class="hero__lead">This page doesn't exist — or it hasn't shipped. Everything that has is on the home page.</p>
        <div class="hero__cta"><a class="btn btn--primary" href="/">Back to the home page</a></div>
      </div>
    </section>
  </main>

  ${siteFooter(ctx)}`;
  return shell(
    ctx,
    documentHead(ctx, { title: `Page not found | ${ctx.site.company.name}`, description: "This page could not be found.", indexable: false }),
    body,
  );
}
