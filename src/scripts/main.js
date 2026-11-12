/* Site interactions. Everything here is an enhancement: the page reads fine without it. */
(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ---------- Footer year ---------- */
  for (const el of $$("[data-year]")) el.textContent = new Date().getFullYear();

  /* ---------- Theme: OS preference by default, the visitor's choice once made ---------- */
  const themeToggle = $("#theme-toggle");
  if (themeToggle) {
    const prefersDark = matchMedia("(prefers-color-scheme: dark)");
    const current = () => root.dataset.theme || (prefersDark.matches ? "dark" : "light");
    themeToggle.hidden = false;
    themeToggle.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch { /* private mode: the choice lasts for this page only */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  const nav = $(".nav");
  const navToggle = $(".nav__toggle");
  if (nav && navToggle) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    $(".nav__menu", nav).addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- "Show more" lists ---------- */
  for (const button of $$("[data-expands]")) {
    const list = document.getElementById(button.dataset.expands);
    if (!list || !$(".is-extra", list)) continue;
    button.hidden = false;
    button.addEventListener("click", () => {
      const open = list.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? button.dataset.less : button.dataset.more;
      if (!open) list.scrollIntoView({ block: "nearest" });
    });
  }

  /* ---------- Filter chips ---------- */
  for (const group of $$("[data-filter-for]")) {
    const list = document.getElementById(group.dataset.filterFor);
    if (!list) continue;
    const chips = $$(".chip", group);
    const expander = $(`[data-expands="${list.id}"]`);
    group.addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      const filter = chip.dataset.filter;
      for (const c of chips) c.setAttribute("aria-pressed", String(c === chip));
      for (const item of list.children) item.hidden = filter !== "all" && item.dataset.cat !== filter;
      // A filtered list shows every match, so the "show more" control steps aside.
      list.classList.toggle("is-filtered", filter !== "all");
      if (expander) expander.hidden = filter !== "all";
    });
  }

  /* ---------- Current section in the navigation ---------- */
  const navLinks = new Map($$('.nav__links a[href^="#"]').map((a) => [a.getAttribute("href").slice(1), a]));
  if (navLinks.size && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const [id, link] of navLinks) {
            if (id === entry.target.id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          }
        }
      },
      // A thin band just under the header: whichever section crosses it is "current".
      { rootMargin: "-20% 0px -75% 0px" },
    );
    // Sections without a menu entry are watched too, so they clear the highlight.
    for (const section of $$("main section[id]")) spy.observe(section);
  }

  /* ---------- Reveal sections as they scroll in ---------- */
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of $$(".section > .container")) {
      el.classList.add("reveal");
      reveal.observe(el);
    }
  }

  /* ---------- Photo lightbox ---------- */
  const lightbox = $("#lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const image = $("img", lightbox);
    const caption = $("figcaption", lightbox);
    let items = [];
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + items.length) % items.length;
      const link = items[index];
      // Clear first so the previous photo never lingers under the new caption.
      image.removeAttribute("src");
      image.width = Number(link.dataset.width);
      image.height = Number(link.dataset.height);
      image.alt = $("img", link)?.alt ?? "";
      image.src = link.href;
      caption.textContent = link.dataset.caption;
    };

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-lightbox]");
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      // Step through the photos of the same group that are currently on show.
      items = $$(`a[data-lightbox="${link.dataset.lightbox}"]`).filter((a) => a.offsetParent !== null);
      opener = link;
      const multiple = items.length > 1;
      for (const btn of $$("[data-action=prev], [data-action=next]", lightbox)) btn.hidden = !multiple;
      show(items.indexOf(link));
      lightbox.showModal();
    });

    lightbox.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "prev") show(index - 1);
      else if (action === "next") show(index + 1);
      else if (action === "close" || !event.target.closest("img, figcaption")) lightbox.close();
    });
    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
    lightbox.addEventListener("close", () => {
      image.removeAttribute("src");
      opener?.focus();
    });
  }
})();
