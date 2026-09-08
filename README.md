# EdCloud Venture Partners — Website

Production website for **EdCloud Venture Partners** (edcloud.org), rebuilt from the Wix site as a
fast, modern static site. Plain **HTML / CSS / JS at the repo root — no build step** — hosted on a
**Cloudflare Worker with static assets**, the same model as the EBO and License Ladder sites.

## Pages

| Page | File | Old Wix URL |
|---|---|---|
| Home (Our Promise, Services & Results, Featured Projects, Select Clients, Capabilities, Press, Contact) | `index.html` | `/` |
| About | `about.html` | `/about` |
| Services & Results | `services.html` | `/research-and-technology` (301 → `/services`) |
| Privacy Policy | `privacy-policy.html` | `/privacy-policy` |
| Accessibility Statement | `accessibility-statement.html` | `/accessibility-statement` |
| Not found | `404.html` | — |

Copy is the live edcloud.org copy, verbatim; only the design changed. `/contact` redirects to the
contact section on the home page (`/#contact`), as on the original site.

URLs are extensionless (`/about`, `/services`, …). Cloudflare serves `about.html` for `/about`
(`html_handling: auto-trailing-slash`) and `404.html` for unknown paths.

## Structure

```
index.html …             pages (each carries its own header/footer markup)
assets/tokens.css        every color, font, space, radius, shadow — change once, applies everywhere
assets/site.css          all component styles
assets/site.js           nav toggle, scroll reveal, current-page highlight, contact form submit
assets/media/            drop photos / logos here (see "Media" below)
src/worker.js            Cloudflare Worker: apex→www redirect, POST /api/contact (Resend), else serve assets
wrangler.jsonc           Worker + assets config
.assetsignore            what wrangler must NOT upload as a static asset (.git, src, docs …)
_redirects / _headers    legacy-URL redirects, security + cache headers
sitemap.xml, robots.txt, llms.txt, favicon.svg
```

## Local preview

```sh
npx serve .                 # static preview at http://localhost:3000 (clean URLs work)
npx wrangler dev            # full Worker preview incl. /api/contact and redirects (needs .dev.vars)
```

Copy `.dev.vars.example` → `.dev.vars` and fill `RESEND_API_KEY` to test the form locally.

## Deploy (Cloudflare Workers Builds)

1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** → pick
   `Superyolk/Edcloud-Website`.
2. Settings: production branch `main`, **build command: (none)**, deploy command
   `npx wrangler deploy`, root directory `/`.
3. **Variables and Secrets** → add secret `RESEND_API_KEY` (from resend.com, after verifying the
   `edcloud.org` domain there so mail can be sent from `website@edcloud.org`). Optional:
   `CONTACT_TO`, `CONTACT_FROM`, `CANONICAL_HOST`.
4. Every push to `main` deploys automatically. Pull requests get preview URLs.

Manual deploy from a machine with `wrangler login`: `npx wrangler deploy`.

## Moving the domain off Wix

1. **Before touching DNS**, copy every existing DNS record from Wix (or wherever the zone lives) —
   especially the **MX / SPF / DKIM records for Google Workspace mail** at `aaron@edcloud.org`.
2. Cloudflare → **Add a domain** → `edcloud.org`. Cloudflare imports the records it can find;
   compare against the copy from step 1 and add anything missing.
3. At the registrar (Wix, if the domain was bought there), change the nameservers to the two
   Cloudflare gives you. Propagation takes minutes to a few hours.
4. Worker → **Settings → Domains & Routes → Add → Custom domain** for `www.edcloud.org` **and**
   `edcloud.org`. The Worker 301-redirects the apex to `www` (canonical, matching the old site).
5. Verify: `https://www.edcloud.org/`, `/about`, `/research-and-technology` (should redirect),
   a contact-form send, and that mail still arrives at `aaron@edcloud.org`.
6. Cancel the Wix Premium plan once everything checks out.

## How to edit

- **Copy** — plain HTML in each page.
- **Nav / footer** — identical markup in every page; edit all seven (a project-wide find/replace).
- **Colors / fonts / spacing** — `assets/tokens.css`.
- **Contact details** — the Worker emails form submissions to `info@edcloud.org` (`DEFAULT_TO` in
  `src/worker.js`, or the `CONTACT_TO` variable). Newsletter sign-ups (`/api/subscribe`) go to the
  same inbox. The visible address, phone, and email are in the footer and the home contact section.
- **Client results** — the four case cards live in `index.html` and `services.html` (same content).

## Photography

Photos live in `assets/media/photos/` as `<slot>-1600.jpg` and `<slot>-900.jpg` (the page uses
`srcset`). They are the photographs from the original Wix site (classroom, science lab, stairwell,
robotics lab, students at a laptop) plus the Wayfinder teacher-training photograph by Patrick
Beaudouin on the home page (credited in its caption). Slots: `hero`, `promise`, `projects`, `press`,
`contact`, `about-hero`, `about-mid`, `services-hero`, `services-mid`. Swap any of them by
replacing both files at the same aspect ratio (16:7 wide openers, 3:2 landscape, 4:5 portrait).

## Media

Client and partner logos are in `assets/media/logos/` (50 PNGs, trimmed and sized for a 3:2 box)
and appear in full colour on the home page wall. `assets/og-image.jpg` is a crop of the hero photo.
