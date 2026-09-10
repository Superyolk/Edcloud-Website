# EdCloud Venture Partners — Website

Two implementations live in this repository:

1. **`app/` — the Next.js site built from the design handoff** (Home, About, Services & Results),
   verified pixel-for-pixel against the reference prototypes. This is the current work; see
   [Next.js site](#nextjs-site-design-handoff-implementation) below.
2. The earlier plain **HTML / CSS / JS static site at the repo root** (`index.html`, `about.html`, …)
   that the Cloudflare Worker (`wrangler.jsonc`, `src/worker.js`) currently serves. It is untouched;
   its original notes follow under [Static site (previous)](#static-site-previous).

## Next.js site (design handoff implementation)

Built from `EdCloud Website/design_handoff_edcloud_site/` (README, `tokens.css`, `content.js` and the
`reference/*.dc.html` prototypes). Next.js 16 App Router, TypeScript, CSS Modules, no component or icon
library; Instrument Sans (400/500/600) via `next/font/google`; `output: 'export'` so `next build` writes
a static site to `out/`.

```
app/
  layout.tsx, tokens.css, globals.css     font, design tokens (verbatim from the handoff), base styles
  page.tsx + home.module.css              Home: hero, 01–07
  about/page.tsx + about.module.css       About
  services-and-results/page.tsx + .css    Services & Results
components/
  SectionShell.tsx                        container + "72px | content" header grid + offset content row
  SiteHeader.tsx                          sticky nav; transparent over the Home hero; Menu/Close < 820px
  SiteFooter.tsx, NewsletterForm.tsx      black footer + newsletter block
  LinkButton.tsx, ui.module.css           the two design-system Button variants used by the reference
  home/HeroVideo.tsx, ServicesTabs.tsx, ContactForm.tsx
content/
  content.js                              the handoff's content.js (duplicate blocks removed, see header)
  copy.ts                                 GENERATED from the reference DOM by scripts/extract-copy.mjs
  site.ts                                 reference file links → routes
scripts/
  visual-diff.spec.ts                     pixel + layout-fingerprint parity against the reference
  interactions.spec.ts                    behaviour checks + Lighthouse accessibility
  extract-copy.mjs                        regenerates content/copy.ts
public/images/                            the two user-supplied images from the handoff
```

### Run

```sh
npm install
npx playwright install chromium
npm run dev              # http://localhost:3000  (/, /about, /services-and-results)
npm run build            # static export to ./out
npm run serve:reference  # the design reference on http://localhost:4174 (used by the tests)
npm run test:visual      # pixel + layout parity (starts both servers itself)
npm run test:interactions
python3 scripts/single-file-preview.py   # after `npm run build`: one self-contained HTML file to open from disk
```

### Verification results

`scripts/visual-diff.spec.ts` loads app and reference under `prefers-reduced-motion: reduce`, waits
for fonts, network and lazy images, pauses any video, then compares full-page screenshots with
pixelmatch (threshold 0.1) and diffs a layout fingerprint (`x, y, w, h, font-size, font-weight,
line-height, color, background-color` of every `h1, h2, h3, p, li, button, input, img, video, section`,
±1px). Acceptance: ≤ 0.5 % mismatch and an empty fingerprint diff. Final run:

| Page | Viewport | Pixel mismatch | Diff pixels | App size | Reference size | Fingerprint defects |
|---|---|---|---|---|---|---|
| home | 375×812 | 0.000% | 3 | 834×14344 | 834×14344 | 0 |
| home | 820×1180 | 0.000% | 3 | 834×10685 | 834×10685 | 0 |
| home | 1024×768 | 0.000% | 3 | 1024×9570 | 1024×9570 | 0 |
| home | 1440×900 | 0.000% | 3 | 1440×8460 | 1440×8460 | 0 |
| about | 375×812 | 0.001% | 26 | 399×11236 | 399×11236 | 0 |
| about | 820×1180 | 0.001% | 43 | 820×5918 | 820×5918 | 0 |
| about | 1024×768 | 0.001% | 42 | 1024×5420 | 1024×5420 | 0 |
| about | 1440×900 | 0.001% | 42 | 1440×5412 | 1440×5412 | 0 |
| services | 375×812 | 0.000% | 0 | 399×11842 | 399×11842 | 0 |
| services | 820×1180 | 0.000% | 3 | 820×6926 | 820×6926 | 0 |
| services | 1024×768 | 0.000% | 3 | 1024×5658 | 1024×5658 | 0 |
| services | 1440×900 | 0.000% | 3 | 1440×5517 | 1440×5517 | 0 |

The remaining 3–43 pixels per page are sub-pixel text anti-aliasing (footer address line, About body
copy). `scripts/interactions.spec.ts`: 10/10 pass — transparent→solid nav at `scrollY` 40, hover/click
service tabs, 375px Menu/Close with a 5-link list, native `required` validation, a 2px green focus ring
on all 35 tab stops, hero `<video>` playing at 0.85× (absent under reduced motion), and Lighthouse
accessibility **96 / 96 / 97** for `/`, `/about`, `/services-and-results`.

### Things reproduced from the reference on purpose (and other notes)

The brief makes the reference markup the source of truth, so these were matched, not fixed:

- **Home hero paragraph has a fixed `width: 810px; height: 92px`** (inline in the prototype). It is what
  makes the paragraph three lines at 1440, but at 375/820 it makes the page 834px wide (horizontal
  scroll). One rule to change: `.heroLead` in `app/home.module.css`.
- **The nav overflows a 375px viewport by 24px** on every page: the `white-space: nowrap` wordmark plus
  the Menu button are wider than 327px. See `.brand` in `components/SiteHeader.module.css`.
- **Newsletter SUBMIT** is the design-system Button (letter-spacing `.02em`, `14px 26px`, 1.5px border),
  not the `.08em` contact SUBMIT — that is what the reference renders.
- **Lighthouse colour contrast** is the only failing audit: the design's slate `#7A8494` (counters, press
  dates, table header, proof-strip client names) and green `#17916B` at regular size (capability
  numbers, "Read The Full Article", phase durations, result lines, outcome cells) sit at 3.5–4.0 : 1,
  below the 4.5 : 1 the handoff README claims. Changing them means changing tokens, so it is left as is.
- **Hover colours** for buttons/links follow the handoff README (green), not the design-system bundle's
  generic blue; the reference's `a:hover` never fired on links that carried an inline colour, and that is
  mirrored (nav, footer and newsletter links keep their colour on hover, underline only).
- **`content.js` as shipped does not parse** (it redeclares `const press/services/results` and pushes the
  last two logos twice, giving 50 logos instead of 48). `content/content.js` is the same file with those
  duplicate blocks deleted and the UC San Diego logo path pointed at `public/images/`; no string was
  retyped. Copy that only exists in the prototypes' markup is pulled out by `scripts/extract-copy.mjs`
  into `content/copy.ts` for the same reason.
- The prototype runtime drops `required=""` (React treats the empty string as false), so the live
  reference has no required fields; the app keeps First name, Last name and Email required as the source
  markup and the brief intend.
- **Not wired:** the contact and newsletter forms `preventDefault` (the Worker's `POST /api/contact`
  expects `name/email/subject/message`, the new form sends first/last/email/phone/message); Privacy
  Policy and Accessibility Statement link to `www.edcloud.org` as in the reference; Wix-hosted images and
  video are hot-linked (self-host before launch, keeping the crop parameters); Cloudflare deployment
  still points at the old static site (set wrangler `assets.directory` to `out/` and exclude the old
  pages in `.assetsignore` to switch).

## Static site (previous)

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
