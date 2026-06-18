# moldovancsaba.com

The professional website of **Moldován Csaba Zoltán** and **Moldován Csaba Kft** —
entrepreneur, product builder and venture partner based in Budapest.

> Make your product done.

A fast, dependency-free static site built for **GitHub Pages**.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The single-page site (hero, about, method, experience, speaking, work, reviews, company, credentials, contact) |
| `assets/styles.css` | Styling, light/dark theme, responsive layout |
| `assets/script.js` | Theme toggle, project filtering, scroll reveal |
| `assets/portrait.jpg` | Profile headshot |
| `assets/stage-*.jpg` | Speaking / on-stage photos |
| `assets/favicon.svg` | Site icon |
| `CNAME` | Custom domain (`moldovancsaba.com`) |
| `.github/workflows/deploy.yml` | Auto-deploy to GitHub Pages |

## Run locally

It's plain HTML/CSS/JS — open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy (GitHub Pages)

This repo deploys automatically via GitHub Actions. To enable it once:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to the deploy branch — the workflow publishes the site.
4. Keep the `CNAME` file so the `moldovancsaba.com` custom domain stays mapped.

## Sections

- **Hero** — headline, portrait and key stats (incl. 5.0★ Google rating)
- **About** — entrepreneur profile and focus areas
- **Method** — the 8-D framework (Discover → Drive)
- **Experience** — career timeline (CXO/Founder, Seyu, Hiventures, amanoba, …)
- **Speaking** — on-stage gallery (Business Fest, HRFEST)
- **Work** — selected products (amanoba, messmass, hatori, narimato, reply, sso, spot, …) + collaborations
- **Reviews** — Google reviews (5.0★, 22) and LinkedIn recommendations
- **Company** — Moldován Csaba Kft services
- **Credentials** — education and certifications
- **Contact** — email and social links

---

© Moldován Csaba Kft · Budapest, Hungary
