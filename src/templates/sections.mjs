// One function per page section. Each takes the build context
// ({ site, projects, timeline, gallery, reviews, images, base }) and returns HTML.
import { arrow, each, esc, external, inline, lightboxAttrs, picture } from "./html.mjs";

const pad = (n) => String(n).padStart(2, "0");

/** Section opener: numbered kicker, title and optional intro. */
function head({ index, kicker, title, intro, id }) {
  return `<header class="section__head">
        <p class="kicker"><span class="kicker__n">${pad(index)}</span>${esc(kicker)}</p>
        <h2 class="section__title" id="${id}-title">${esc(title)}</h2>
        ${intro ? `<p class="section__intro">${inline(intro)}</p>` : ""}
      </header>`;
}

const tags = (items) => `<ul class="tags">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

function chips({ label, target, filters }) {
  return `<div class="chips" role="group" aria-label="${esc(label)}" data-filter-for="${target}">
          ${each(filters, (f, i) => `<button type="button" class="chip" data-filter="${f.id}" aria-pressed="${i === 0}">${esc(f.label)}</button>`)}
        </div>`;
}

export function hero(ctx) {
  const { hero, person } = ctx.site;
  const ring = `${hero.stamp} · ${hero.stamp} · `.toUpperCase();
  return `<section class="hero" aria-labelledby="hero-title">
      <div class="container hero__grid">
        <div class="hero__text">
          <p class="eyebrow">${esc(hero.eyebrow)}</p>
          <h1 class="hero__title" id="hero-title">Done is better <span class="nowrap">than <span class="strike">perfect<svg class="strike__line" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 14C58 5 118 19 176 10s92-3 121 3" /></svg></span>.</span></h1>
          <p class="hero__lead">${inline(hero.lead)}</p>
          <div class="hero__cta">
            <a class="btn btn--primary" href="${hero.primaryCta.href}">${esc(hero.primaryCta.label)}</a>
            <a class="btn" href="${hero.secondaryCta.href}">${esc(hero.secondaryCta.label)}</a>
          </div>
          <p class="hero__award"><span class="hero__award-mark" aria-hidden="true">★</span>${esc(hero.award)}</p>
        </div>
        <figure class="hero__portrait">
          ${picture(ctx, { name: person.portrait, alt: `Portrait of ${person.name}`, sizes: "(max-width: 860px) 60vw, 380px", eager: true })}
          <svg class="stamp" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <circle class="stamp__disc" cx="60" cy="60" r="58" />
            <path id="stamp-ring" fill="none" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
            <text class="stamp__text"><textPath href="#stamp-ring" textLength="278">${esc(ring)}</textPath></text>
            <path class="stamp__check" d="M43 61l12 12 23-26" />
          </svg>
          <figcaption>${esc(person.name)}</figcaption>
        </figure>
      </div>
      <div class="container">
        <ul class="stats">
          ${each(hero.stats, (s) => `<li><span class="stats__value">${esc(s.value)}</span><span class="stats__label">${esc(s.label)}</span></li>`)}
        </ul>
      </div>
    </section>`;
}

export function stages(ctx) {
  const { stages } = ctx.site;
  return `<section class="stages" aria-label="${esc(stages.label)}">
      <div class="container stages__inner">
        <p class="stages__label">${esc(stages.label)}</p>
        <ul class="stages__list">
          ${each(stages.items, (s) => `<li>${esc(s)}</li>`)}
        </ul>
      </div>
    </section>`;
}

export function about(ctx, index) {
  const { about, person, links } = ctx.site;
  return `<section id="about" class="section" aria-labelledby="about-title">
      <div class="container">
        ${head({ index, id: "about", ...about })}
        <div class="split">
          <div class="prose">
            ${each(about.paragraphs, (p) => `<p>${inline(p)}</p>`)}
            ${tags(about.tags)}
          </div>
          <aside class="card profile" aria-label="Profile">
            <div class="profile__head">
              ${picture(ctx, { name: person.portrait, alt: "", sizes: "64px", className: "profile__avatar" })}
              <div>
                <h3 class="profile__name">${esc(person.name)}</h3>
                <p class="profile__motto">${esc(about.motto)}</p>
              </div>
            </div>
            <dl class="facts">
              ${each(about.facts, (f) => `<div><dt>${esc(f.term)}</dt><dd>${esc(f.value)}</dd></div>`)}
            </dl>
            <p class="profile__links">
              <a href="${links.github}" ${external}>GitHub ${arrow}</a>
              <a href="${links.linkedin}" ${external}>LinkedIn ${arrow}</a>
              <a href="${links.x}" ${external}>X ${arrow}</a>
              <a href="${links.wikipedia}" ${external}>Wikipedia ${arrow}</a>
            </p>
          </aside>
        </div>
      </div>
    </section>`;
}

export function method(ctx, index) {
  const { method } = ctx.site;
  return `<section id="method" class="section section--band" aria-labelledby="method-title">
      <div class="container">
        ${head({ index, id: "method", ...method })}
        <ol class="method">
          ${each(method.steps, (s, i) => `<li><span class="method__n">${pad(i + 1)}</span><h3><span class="method__d">${esc(s.name[0])}</span>${esc(s.name.slice(1))}</h3><p>${esc(s.text)}</p></li>`)}
        </ol>
      </div>
    </section>`;
}

export function work(ctx, index) {
  const { projects, site } = ctx;
  const more = projects.more.names.map((n) => `<strong>${esc(n)}</strong>`);
  const moreList = `${more.slice(0, -1).join(", ")} and ${more.at(-1)}`;
  return `<section id="work" class="section" aria-labelledby="work-title">
      <div class="container">
        ${head({ index, id: "work", ...projects })}
        ${chips({ label: "Filter projects", target: "project-grid", filters: projects.filters })}
        <ul class="projects" id="project-grid">
          ${each(projects.projects, (p) => `<li class="project" data-cat="${p.category}">
            <div class="project__head"><h3>${esc(p.name)}</h3><span class="badge">${esc(p.badge)}</span></div>
            <p class="project__text">${esc(p.text)}</p>
            <p class="project__tech">${p.tech.map(esc).join(" · ")}</p>
            <a class="project__link" href="${p.href}" ${external}>View<span class="sr-only"> ${esc(p.name)}</span> on GitHub ${arrow}</a>
          </li>`)}
        </ul>
        <p class="work__more">Plus ${moreList} and more — <a href="${site.links.repositories}" ${external}>${esc(projects.more.linkLabel)} ${arrow}</a></p>

        <div class="collabs">
          <h3 class="collabs__label">${esc(projects.collaborations.label)}</h3>
          <ul class="collabs__list">
            ${each(projects.collaborations.items, (c) => `<li><strong>${esc(c.name)}</strong><span>${esc(c.text)}</span></li>`)}
          </ul>
        </div>
      </div>
    </section>`;
}

export function timeline(ctx, index) {
  const { timeline, gallery } = ctx;
  const photos = new Map(gallery.photos.map((p) => [p.image, p]));
  const typeLabel = Object.fromEntries(timeline.types.map((t) => [t.id, t.label.replace(/s$/, "")]));

  const item = (it, i) => {
    const photo = it.photo && photos.get(it.photo);
    if (it.photo && !photo) throw new Error(`Timeline photo "${it.photo}" is not in content/gallery.json`);
    return `<li class="tl__item tl__item--${it.type}${i >= timeline.initiallyVisible ? " is-extra" : ""}" data-cat="${it.type}">
            <p class="tl__meta"><span class="tl__date">${esc(it.date)}</span><span class="tl__type">${esc(typeLabel[it.type])}</span></p>
            <div class="tl__body">
              <h3>${esc(it.title)}</h3>
              ${it.org ? `<p class="tl__org">${esc(it.org)}</p>` : ""}
              <p>${esc(it.text)}</p>
            </div>
            ${photo ? `<a class="tl__photo" ${lightboxAttrs(ctx, { name: photo.image, caption: photo.caption, group: "timeline" })}>
              ${picture(ctx, { name: photo.image, alt: photo.alt, sizes: "(max-width: 700px) 92vw, 220px" })}
            </a>` : ""}
          </li>`;
  };

  return `<section id="timeline" class="section section--band" aria-labelledby="timeline-title">
      <div class="container">
        ${head({ index, id: "timeline", ...timeline })}
        ${chips({ label: "Filter timeline", target: "timeline-list", filters: timeline.types })}
        <ol class="tl" id="timeline-list" data-collapsible>
          ${each(timeline.items, item)}
        </ol>
        <p class="more"><button type="button" class="btn" data-expands="timeline-list" data-more="Show full timeline" data-less="Show less" aria-expanded="false" hidden>Show full timeline</button></p>
      </div>
    </section>`;
}

export function worldMap(ctx, index) {
  const { map } = ctx;
  const categories = map.categories;
  const list = categories.map((category) => `<li><span class="map__swatch map__swatch--${category.id}" aria-hidden="true"></span>${esc(category.label)}</li>`).join("");
  const locations = categories.map((category) => `<li><strong>${esc(category.label)}:</strong> ${map.places.filter((place) => place.categories.includes(category.id)).map((place) => esc(place.alsoKnownAs ? `${place.city} (${place.alsoKnownAs})` : place.city)).join(" · ")}</li>`).join("");
  return `<section id="map" class="section section--band" aria-labelledby="map-title">
      <div class="container">
        ${head({ index, id: "map", ...map })}
        <div class="map__toolbar">
          <div class="map__filters" role="group" aria-label="Filter map pins">
            <button type="button" class="chip" data-map-filter="all" aria-pressed="true">All places</button>
            ${each(categories, (category) => `<button type="button" class="chip" data-map-filter="${category.id}" aria-pressed="false">${esc(category.label)}</button>`)}
          </div>
          <button type="button" class="btn map__reset" data-map-reset>Reset map</button>
        </div>
        <div class="map__frame">
          <div id="world-map" class="map__canvas" role="region" aria-label="Map of places where Csaba built television channels and studios, worked with startups, and gave presentations" data-places="${esc(JSON.stringify(map.places))}"></div>
          <p class="map__fallback">The interactive map needs JavaScript. Places are listed below.</p>
        </div>
        <ul class="map__legend" aria-label="Map pin categories">${list}</ul>
        <ul class="map__places" aria-label="Places by category">${locations}</ul>
      </div>
    </section>`;
}

export function galleryGrid(ctx, index) {
  const { gallery } = ctx;
  const total = gallery.photos.length;
  return `<section id="gallery" class="section" aria-labelledby="gallery-title">
      <div class="container">
        ${head({ index, id: "gallery", ...gallery })}
        <ul class="gallery" id="gallery-list" data-collapsible>
          ${each(gallery.photos, (p, i) => `<li class="shot${i >= gallery.initiallyVisible ? " is-extra" : ""}">
            <a class="shot__link" ${lightboxAttrs(ctx, { name: p.image, caption: p.caption, group: "gallery" })}>
              ${picture(ctx, { name: p.image, alt: p.alt, sizes: "(max-width: 600px) 92vw, (max-width: 960px) 46vw, 380px" })}
            </a>
            <p class="shot__caption">${esc(p.caption)}</p>
          </li>`)}
        </ul>
        <p class="more"><button type="button" class="btn" data-expands="gallery-list" data-more="Show all ${total} photos" data-less="Show fewer photos" aria-expanded="false" hidden>Show all ${total} photos</button></p>
      </div>
    </section>`;
}

export function reviews(ctx, index) {
  const { reviews, site } = ctx;
  const { rating } = site.company;
  const mark = { google: "★★★★★", linkedin: "in" };
  return `<section id="reviews" class="section section--band" aria-labelledby="reviews-title">
      <div class="container">
        ${head({ index, id: "reviews", ...reviews })}
        <div class="rating">
          <p class="rating__score">${esc(rating.value)}</p>
          <div class="rating__body">
            <p class="rating__stars" role="img" aria-label="${esc(rating.value)} out of ${rating.best} stars">★★★★★</p>
            <p class="rating__meta">${esc(reviews.ratingMeta)}</p>
          </div>
          <a class="btn rating__cta" href="${site.links.googleReviews}" ${external}>${esc(reviews.ratingCta)} ${arrow}</a>
        </div>
        <ul class="reviews">
          ${each(reviews.reviews, (r) => `<li><figure class="review review--${r.source}">
            <p class="review__mark" ${r.source === "google" ? 'role="img" aria-label="5 out of 5 stars"' : 'aria-hidden="true"'}>${mark[r.source]}</p>
            <blockquote>${esc(r.text)}</blockquote>
            <figcaption><span class="review__who">${esc(r.who)}</span><span class="review__src">${esc(r.label)}</span></figcaption>
          </figure></li>`)}
        </ul>
      </div>
    </section>`;
}

export function studio(ctx, index) {
  const { studio } = ctx.site;
  return `<section id="company" class="section" aria-labelledby="company-title">
      <div class="container">
        ${head({ index, id: "company", kicker: studio.kicker, title: studio.title })}
        <div class="split">
          <div class="prose">
            ${each(studio.paragraphs, (p) => `<p>${inline(p)}</p>`)}
            ${tags(studio.tags)}
          </div>
          <ol class="services">
            ${each(studio.services, (s, i) => `<li><span class="services__n">${pad(i + 1)}</span><div><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></div></li>`)}
          </ol>
        </div>
      </div>
    </section>`;
}

export function credentials(ctx, index) {
  const { award, education, certifications } = ctx.site.credentials;
  const list = (group, id) => `<div>
            <p class="kicker kicker--plain">${esc(group.kicker)}</p>
            <h3 class="creds__title" id="${id}">${esc(group.title)}</h3>
            <ul class="creds" aria-labelledby="${id}">
              ${each(group.items, (c) => `<li><strong>${esc(c.name)}</strong><span>${esc(c.detail)}</span></li>`)}
            </ul>
          </div>`;
  return `<section id="credentials" class="section section--band" aria-labelledby="credentials-title">
      <div class="container">
        <header class="section__head">
          <p class="kicker"><span class="kicker__n">${pad(index)}</span>Credentials</p>
          <div class="award">
            <span class="award__mark" aria-hidden="true">★</span>
            <div>
              <h2 class="award__title" id="credentials-title">${esc(award.title)}</h2>
              <p class="award__text">${esc(award.text)}</p>
            </div>
          </div>
        </header>
        <div class="split split--even">
          ${list(education, "education-title")}
          ${list(certifications, "certifications-title")}
        </div>
      </div>
    </section>`;
}

export function contact(ctx, index) {
  const { contact, links } = ctx.site;
  return `<section id="contact" class="section contact" aria-labelledby="contact-title">
      <div class="container">
        ${head({ index, id: "contact", ...contact })}
        <p class="contact__mail"><a href="mailto:${links.email}">${esc(links.email)}</a></p>
        <div class="contact__actions">
          <a class="btn btn--primary" href="mailto:${links.email}">Start a project</a>
          <a class="btn" href="${links.linkedin}" ${external}>Connect on LinkedIn ${arrow}</a>
        </div>
        <ul class="contact__links">
          ${each(contact.links, (l) => `<li><a href="${l.href}" ${external}>${esc(l.label)}</a></li>`)}
        </ul>
      </div>
    </section>`;
}

export const lightbox = `<dialog class="lightbox" id="lightbox" aria-label="Photo viewer">
    <figure class="lightbox__figure">
      <div class="lightbox__frame"><img alt="" /></div>
      <figcaption></figcaption>
    </figure>
    <button type="button" class="lightbox__btn lightbox__close" data-action="close" aria-label="Close photo viewer">✕</button>
    <button type="button" class="lightbox__btn lightbox__prev" data-action="prev" aria-label="Previous photo">←</button>
    <button type="button" class="lightbox__btn lightbox__next" data-action="next" aria-label="Next photo">→</button>
  </dialog>`;
