# Mobile redesign: Phase 0 baseline

These numbers were measured on the **untouched** build (branch `mobile-redesign` at `95beb8d`, `npm run build`, `out/` served locally by `serve` on :4180) on 2026-09-22 with Windows 11, Playwright 1.63 Chromium (chromium-1243) and system Chrome for Lighthouse 13.

Every later phase is compared against this baseline. Desktop (1024, 1280 and 1440 wide) is frozen pixel for pixel by the goldens in `scripts/qa/golden/`. The 390px "before" screenshots are in `docs/mobile/before/`.

## How to run

Every command builds `out/` if it is missing, serves it on `:4180` (or reuses a server already on that port), and writes its output to `scripts/qa/output/`, which is gitignored. To test a fresh build, set `QA_BUILD=1` or run `npm run build` first.

| Command | What it does | Exit code | Runtime |
|---|---|---|---|
| `npm run qa:all` | Runs every check below in order against one server and writes `output/summary.md`. `QA_SKIP=perf,matrix` skips steps. | 1 if any step fails | ~4m45s |
| `npm run qa:content` | Copy freeze. On every page at 1440 and 390 it compares the multisets of text segments, words, hrefs and image alts, and checks JSON-LD, head metadata, `/llms.txt`, `/sitemap.xml` and `/robots.txt` for exact equality. Snapshot: `scripts/qa/content-snapshot/`. | 1 on any removal or change, or on any addition not listed in `scripts/qa/content-allowlist.json` | ~10s |
| `npm run qa:content -- --update` (or `QA_UPDATE_CONTENT=1`) | Rewrites the content snapshot. | 0 | ~10s |
| `npm run qa:desktop-parity` | Takes full-page screenshots at 1024, 1280 and 1440 and compares them with pixelmatch (threshold 0.1) against `scripts/qa/golden/`. Diffs go to `output/parity/`. | 1 on **any** differing pixel or size change | ~20s |
| `npm run qa:golden` | Recaptures the goldens, but **refuses** if they already exist unless `QA_UPDATE_GOLDEN=1` or `-- --update` is given. | 1 on refusal | ~20s |
| `npm run qa:mobile-lint` | Sweeps 320–430px in 1px steps (height 844), plus 600, 700, 768, 800, 820, 900, 1000 and 1023 (height 1024). Checks overflow, tap size and spacing, text below 13px, body copy below 16px, input fonts below 16px, media missing width/height, and fixed/sticky elements without safe-area handling. Output: `output/mobile-lint.{json,md}`. | 1 on findings unless `QA_REPORT_ONLY=1` | ~25s |
| `npm run qa:a11y` | Runs axe-core (`@axe-core/playwright`) on every page at 390x844 and 1440x900. Output: `output/a11y.json`. | 1 on any violation | ~13s |
| `npm run qa:matrix` | Takes full-page screenshots of 5 pages across 13 viewports (`output/matrix/<page>/<WxH>.png`), writes `heights.json` and `index.json`, and builds contact sheets in `output/contact-sheets/` (`page-<page>.png` and `viewport-<WxH>.png`, each with an `.html` twin). `QA_PAGES` and `QA_VIEWPORTS` narrow a run. | 0 | ~80s |
| `npm run qa:bytes` | Measures first-load transfer per page at 390x844 with a cold cache and motion allowed, so the hero video loads. Output: `output/bytes.json`, with the full request list. | 1 if any third-party request is seen | ~26s |
| `npm run qa:perf` | Runs Lighthouse mobile (default simulated throttling) 3 times per page (`QA_LH_RUNS`) and takes medians. Output: `output/perf.json`. | 1 on a budget miss unless `QA_REPORT_ONLY=1` | ~105s |

For live verification, run `QA_BASE_URL=https://www.edcloud.org npm run qa:all`. Desktop parity and golden capture skip themselves when the target is not localhost. In PowerShell, set the variable first with `$env:QA_BASE_URL='https://www.edcloud.org'; npm run qa:all`.

### Capture conditions (all screenshot-based checks)
- DPR 1. Phones, landscape and tablets use `isMobile`, `hasTouch` and an iPhone Safari user agent. Desktop uses `isMobile: false`.
- `prefers-reduced-motion: reduce`, so `HeroVideo` never mounts and the hero shows `hero-poster.webp`.
- An injected stylesheet sets every animation and transition to 0s, hides the caret and scrollbars, and hides `video`.
- Lazy images are switched to `loading=eager`, the page is scrolled through, and every image is `decode()`d. The capture then waits for `document.fonts.ready` and two animation frames.
- Determinism: after capturing the goldens, `qa:desktop-parity` ran three separate times (including once inside `qa:all`) and found **0 differing pixels** on all 15 page/width pairs each time.

## Gate status on the untouched build

| Check | Result | Notes |
|---|---|---|
| qa:content | PASS | The snapshot was taken from this build. The 1440 and 390 DOMs are currently identical. |
| qa:desktop-parity | PASS (15/15, 0 px) | Goldens are deterministic. |
| qa:mobile-lint | FAIL (baseline findings, see below) | These are expected; the redesign is meant to fix them. |
| qa:a11y | **FAIL (baseline)**: `color-contrast` on every page | This is a genuine failure. See below. |
| qa:perf | **FAIL (baseline)**: LCP > 2.0s on every page, and Home also misses Perf, SEO and A11y | This is a genuine failure. See below. |
| qa:matrix, qa:bytes | PASS | There are no third-party requests. |

## Page heights (px, document scrollHeight, reduced motion)

| Page | 320x568 | 360x780 | 375x667 | 390x844 | 393x852 | 414x896 | 430x932 | 844x390 | 768x1024 | 820x1180 | 1024x900 | 1280x900 | 1440x900 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 13311 | 12446 | 12158 | **12065** | 12051 | 11631 | 11579 | 9977 | 10923 | 10927 | 9842 | 8482 | 8501 |
| about | 10930 | 9878 | 9366 | **9153** | 9106 | 8834 | 8570 | 5215 | 5758 | 5548 | 5053 | 5014 | 5014 |
| services-and-results | 12109 | 10730 | 10134 | **9867** | 9820 | 9478 | 9233 | 6217 | 7059 | 6560 | 5363 | 4948 | 4957 |
| privacy-policy | 4738 | 4195 | 4086 | 3841 | 3841 | 3760 | 3667 | 2629 | 2651 | 2654 | 2624 | 2629 | 2629 |
| accessibility-statement | 2669 | 2479 | 2370 | 2370 | 2370 | 2288 | 2168 | 1566 | 1615 | 1563 | 1533 | 1538 | 1538 |

Length targets at 390: Home ≤ 8500 (now 12065, so it needs −3565 / −30%), Services ≤ 7000 (now 9867, −2867 / −29%), About ≤ 6500 (now 9153, −2653 / −29%).

## Lighthouse mobile (median of 3 runs, local `serve`)

| Page | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | SI ms | Transfer KiB | JS KiB (transfer) | LCP element |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| home | **90** | **96** | 100 | **92** | **3679** | 0.000 | 10 | 1054 | 1054 | 3635.3 | 145.1 | hero `h1` "We Bring Great Education Companies…" |
| about | 98 | **96** | 100 | 100 | **2395** | 0.000 | 8 | 903 | 903 | 718.8 | 152.0 | hero image (alt "Technology Class") |
| services-and-results | 98 | **96** | 100 | 100 | **2397** | 0.000 | 8 | 904 | 904 | 794.3 | 152.0 | hero image (alt "Modern Classroom") |
| privacy-policy | 99 | **96** | 100 | 100 | **2167** | 0.000 | 7 | 903 | 903 | 626.1 | 152.0 | first body paragraph |
| accessibility-statement | 99 | **96** | 100 | 100 | **2168** | 0.000 | 7 | 903 | 903 | 625.3 | 152.0 | first body paragraph |

Budget: Perf ≥ 95, A11y/BP/SEO = 100, LCP ≤ 2000ms, CLS ≤ 0.02, TBT ≤ 100ms. The bold values miss it.
- **A11y 96 everywhere** comes from `color-contrast`, the same issue axe reports below.
- **Home SEO 92** comes from `link-text`: the Promise section's "Read More" link to `/about` is non-descriptive. Copy is frozen, so the likely fix is an `aria-label` or visually hidden text, and that has to be allow-listed in `qa:content`.
- **Home Perf 90 and LCP 3.7s**: the LCP element is the hero `h1` (it has the `rise` reveal animation, and the hero video starts downloading at the same time). Home transfer is about 3.6 MB, most of it `hero.webm` (`total-byte-weight` fails).
- Every page fails `cache-insight`, but that is an artifact of local `serve`, which ignores `public/_headers`. `unused-javascript`, `legacy-javascript-insight`, `render-blocking-insight` and `image-delivery-insight` also appear on every page.
- Local `serve` uses gzip, while Cloudflare serves brotli, so live byte counts will be slightly lower.

## First-load transfer at 390x844 (`qa:bytes`, cold cache, 5s after `load`)

| Page | Requests | Total KiB | Excl. video KiB | HTML | CSS | JS | Font | Images | Video | Other (RSC .txt) | JS gzip from disk KiB (files) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 19 | 3440.6* | **621.0** | 14.5 | 6.1 | 145.1 | 29.5 | 415.1 | 2819.7* | 10.6 | 142.9 (6) |
| about | 21 | 712.6 | 712.6 | 9.7 | 6.1 | 152.0 | 29.5 | 504.6 | 0 | 10.6 | 149.3 (7) |
| services-and-results | 20 | 788.1 | 788.1 | 10.9 | 6.1 | 152.0 | 29.5 | 579.0 | 0 | 10.6 | 149.3 (7) |
| privacy-policy | 19 | 619.9 | 619.9 | 6.5 | 6.1 | 152.0 | 29.5 | 415.1 | 0 | 10.6 | 149.3 (7) |
| accessibility-statement | 19 | 619.1 | 619.1 | 5.8 | 6.1 | 152.0 | 29.5 | 415.1 | 0 | 10.6 | 149.3 (7) |

\* The video streams with range requests (206). Its byte count is whatever arrived in the 5s window, which ranged from 2.8 to 3.4 MB between runs, so compare the "excl. video" figure.

Home first-load requests at 390 (bytes on the wire):

| Path | Kind | Bytes |
|---|---|---:|
| /video/hero.webm | video (206, partial) | ~2,887,350 |
| /images/conference-room.webp | image | 158,161 |
| /images/hero-poster.webp | image | 111,747 |
| /images/stairway.webp | image | 84,625 |
| /_next/static/chunks/1mh6a-0e61pyc.js | js | 71,913 |
| /images/classroom-lecture.webp | image | 59,930 |
| /_next/static/chunks/0s8w3af4l-q85.js | js | 46,872 |
| /fonts/instrument-sans-latin.woff2 | font | 30,197 |
| / | html | 14,839 |
| /_next/static/chunks/0pdptsk3cxlh0.js | js | 13,630 |
| /images/edcloud-mark.png | image | 10,565 |
| /__next.__PAGE__.txt | RSC | 9,938 |
| /_next/static/chunks/1u5zan5bs9a7v.js | js | 7,790 |
| /_next/static/chunks/2xg9eq7bu1vcl.css | css | 4,743 |
| /_next/static/chunks/turbopack-1-a6inufx__04.js | js | 4,281 |
| /_next/static/chunks/3fntmmi971322.js | js | 4,118 |
| /_next/static/chunks/41723krdm25am.css | css | 1,554 |
| /__next._tree.txt | RSC | 950 |

Three below-the-fold photos (conference-room, stairway, classroom-lecture: 302 KB together) load eagerly on first paint at 390, which is an opportunity. The client-logo wall is lazy and does not load.

**JS bundle (gzip level 9, from `out/`):** Home loads 6 chunks, 142.9 KiB gz. Every other page loads 7 chunks, 149.3 KiB gz (the extra one is `1j93jk0038jz_.js`). All 8 chunks in `out/_next/static/chunks` total 602.3 KiB raw and 187.9 KiB gz.

## axe-core (390x844 and 1440x900)

The only rule that fails is `color-contrast`. Each count below is the number of failing nodes.

| Page | 390 | 1440 |
|---|---:|---:|
| home | 41 | 42 |
| about | 3 | 3 |
| services-and-results | 30 | 34 |
| privacy-policy | 1 | 1 |
| accessibility-statement | 1 | 1 |

Causes:
- `--slate` `#7A8494` gives 3.53:1 on `#F2F9F4` and 3.77:1 on white. It is used by the section counters (`SectionShell counter`), the inactive service tabs, press meta, the Services proof client, phase and service indexes, and 14–15px text.
- `#17916B` green on `#F2F9F4` and white fails for capability indexes, press links, phase durations, service results and table outcomes.

Fixing these changes colours on desktop too. That conflicts with the "desktop frozen" rule unless the fix is scoped to mobile or the goldens are deliberately re-baselined, so it needs an explicit decision.

## Mobile lint (untouched build)

Each count is the number of unique (check, selector) findings per page across the whole sweep:

| Page | overflow | tapSize | tapSpacing | textSize | bodyText | inputFont | mediaDims | safeArea |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 0 | 15 | 0 | 2 | 3 | 0 | 0 | 1 |
| about | 0 | 7 | 0 | 2 | 2 | 0 | 0 | 1 |
| services-and-results | 0 | 7 | 0 | 2 | 2 | 0 | 0 | 1 |
| privacy-policy | 0 | 7 | 0 | 2 | 1 | 0 | 0 | 1 |
| accessibility-statement | 0 | 7 | 0 | 2 | 1 | 0 | 0 | 1 |

Element instances flagged at 390px:

| Page | overflow | tapSize | tapSpacing | textSize | bodyText | inputFont | mediaDims | safeArea |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 0 | 25 | 0 | 2 | 10 | 0 | 0 | 1 |
| about | 0 | 9 | 0 | 2 | 4 | 0 | 0 | 1 |
| services-and-results | 0 | 9 | 0 | 2 | 18 | 0 | 0 | 1 |
| privacy-policy | 0 | 9 | 0 | 2 | 0 | 0 | 0 | 1 |
| accessibility-statement | 0 | 9 | 0 | 2 | 0 | 0 | 0 | 1 |

What they are:
- **Tap targets under 44px:**
  - Header brand link (22px tall).
  - Footer links and brand (22.4px), and the LinkedIn icon (24x24).
  - Home: the "Read More" and "Services & Results" link-buttons (22.4px), press "Read the full article" links (24px), contact inputs (40px tall), and the Submit button (40px).
  - Header nav links at 820–1023 (18px tall).
- **Text under 13px:** the header wordmark "EDCLOUD" / "VENTURE PARTNERS" (12px) at phone widths.
- **Body copy under 16px:**
  - Home: case-card and capability `cardBody` (15px).
  - Services: results `dd` (15px, 18 instances at 390).
  - About: numbers `numberBody` (15px).
  - Header nav `li` (14px) at 820–1023.
- **Safe area:** the sticky header sits at the top edge and no `safe-area-inset` rule exists anywhere. The viewport meta also has no `viewport-fit=cover`, so today this is informational.
- No horizontal overflow at any width from 320 to 1023, no input fonts under 16px, and every `img`/`video` has width and height.

## Where things are
- Harness: `scripts/qa/*.mjs` (`lib.mjs` holds the shared page list, viewport matrix, server and settle logic).
- Goldens: `scripts/qa/golden/<page>-<width>.png` (15 files, about 20 MB, committed).
- Content snapshot: `scripts/qa/content-snapshot/` (committed). The allow-list for added UI chrome is `scripts/qa/content-allowlist.json`.
- Before screenshots: `docs/mobile/before/<page>-390.png`.
- Contact sheets (regenerate with `npm run qa:matrix`): `scripts/qa/output/contact-sheets/page-<page>.png` and `viewport-<WxH>.png`.

## After Phase 3 (integrated `mobile-redesign`, 2026-09-23)

This section was measured on the integrated branch (Foundation plus the Home, Pages and Media & Perf merges, plus integration fixes), with the same machine, tools and capture conditions as the baseline above. The build was fresh (`QA_BUILD=1`) and served on :4184. The baseline figures are repeated for comparison.

### Gate status

| Check | Baseline | After Phase 3 |
|---|---|---|
| qa:breakpoints | n/a | **PASS**: 39 files, 52 queries, 0 violations |
| qa:content | PASS | **PASS**: 0 failures. Nothing was removed. The only additions are allow-listed UI chrome (Show all / Show fewer, the counts 9 and 48, the Contact pill href `#contact`, and the hidden "about EdCloud" tail). JSON-LD, meta, `/llms.txt`, `/sitemap.xml` and `/robots.txt` are unchanged. |
| qa:desktop-parity | PASS (15/15, 0 px) | **PASS (15/15, 0 px)** at 1024, 1280 and 1440, against the untouched Phase 0 goldens |
| qa:mobile-lint | FAIL (baseline findings) | **PASS**: 0 findings on every page. The sweep covers 320–430 in 1px steps plus 600–1023, and includes the new `margins` check. |
| qa:a11y | FAIL (`color-contrast`) | **PASS**: 0 violations at 390 and 1440 with `color-contrast` disabled (owner decision, 2026-09-23) |
| qa:bytes | PASS | **PASS**: every Media & Perf assertion passes |
| qa:perf | FAIL | **PASS** after the Phase 3 perf fix (`scripts/defer-hydration.mjs`, see below). At 56c59c5 it failed on LCP only. |

### Page heights at 390×844 (px)

| Page | Baseline | After | Gate |
|---|---:|---:|---:|
| home | 12065 | **7429** | ≤ 8500 |
| about | 9153 | **4194** | ≤ 6500 |
| services-and-results | 9867 | **5338** | ≤ 7000 |
| privacy-policy | 3841 | 3286 | none |
| accessibility-statement | 2370 | 1918 | none |

At the other matrix sizes (px):

| Page | 320×568 | 360×780 | 375×667 | 393×852 | 414×896 | 430×932 | 844×390 | 768×1024 | 820×1180 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| home | 7704 | 7545 | 7397 | 7441 | 7463 | 7273 | 7011 | 7239 | 7306 |
| about | 4662 | 4376 | 4260 | 4199 | 4080 | 4026 | 5589 | 5685 | 5848 |
| services-and-results | 5664 | 5360 | 5328 | 5321 | 5156 | 5063 | 5037 | 5612 | 5341 |

The 1024, 1280 and 1440 heights are unchanged from the baseline. Engineer measurements with everything expanded at 390: Home 9,629 (both Show-all lists open), About 6,932 (all chapters open), Services 6,977 (all six services open).

### First-load transfer at 390×844 (`qa:bytes`, cold cache)

| Page | Requests | Total KiB (baseline) | Total KiB (after) | Images KiB | JS KiB | JS gz growth vs baseline |
|---|---:|---:|---:|---:|---:|---:|
| home | 16 | 3440.6 (621.0 excl. video) | **269.2** (no video on phones) | 53.5 | 147.8 | +2.6 KiB |
| about | 17 | 712.6 | **249.7** | 30.6 | 156.7 | +4.6 KiB |
| services-and-results | 16 | 788.1 | **257.9** | 37.9 | 156.7 | +4.6 KiB |
| privacy-policy | 15 | 619.9 | **224.6** | 10.3 | 155.8 | +3.8 KiB |
| accessibility-statement | 15 | 619.1 | **223.9** | 10.3 | 155.8 | +3.8 KiB |

- **Home share:** 43.3% of the baseline's non-video bytes, against a gate of ≤ 60%.
- **JS growth:** the largest is +4,716 B gz on About and Services, under the 5 KiB budget (5,120 B).
- **Media assertions:**
  - no page requests an image that only Home uses
  - each head carries exactly one image preload (the header mark)
  - no `<picture>` fallback is fetched at 390, and no crop is fetched at 1440
  - `<video>` elements at phone / tablet / reduced motion / Save-Data / desktop: 0 / 1 / 0 / 0 / 1. The tablet video starts after `load`.

### Lighthouse mobile (median of 3, local `serve`)

Measured with a fresh build (`QA_BUILD=1`, served on :4193) after the Phase 3 perf fix. The LCP column shows the value at the baseline, then at 56c59c5, then now.

| Page | Perf | A11y excl. contrast (raw) | BP | SEO | LCP ms: baseline → 56c59c5 → now | CLS | TBT ms | FCP ms | LCP element |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| home | **100** | **100** (96) | 100 | **100** | 3679 → 2629 → **1729** | 0.000 | 6 | 1054 | hero 4:5 crop (828w) |
| about | 100 | **100** (96) | 100 | 100 | 2395 → 2394 → **1429** | 0.000 | 8 | 904 | hero 4:5 crop |
| services-and-results | 100 | **100** (96) | 100 | 100 | 2397 → 2547 → **1654** | 0.000 | 8 | 904 | hero 4:5 crop |
| privacy-policy | 100 | **100** (96) | 100 | 100 | 2167 → 2169 → **1278** | 0.000 | 7 | 903 | first body paragraph |
| accessibility-statement | 100 | **100** (96) | 100 | 100 | 2168 → 2169 → **1279** | 0.000 | 7 | 904 | first body paragraph |

Every run was within 80ms of its median. The widest spread was Services, at 1653–1729ms.

**Why LCP missed at 56c59c5.** Read from the Lighthouse JSON and Lantern's own node timings:

- The LCP resource was never the problem. The hero crop is discoverable in the HTML, has `fetchpriority=high`, is not lazy, and its load delay and duration were 5ms and 10ms.
- The cost was the framework JS. next build puts all six client chunks in the head as `<script async>` (about 150 KiB brotli, of which ~125 KiB is React DOM and the Next runtime). A phone starts fetching them at the same moment as the stylesheets, the font and the hero, on the same connection.
- Lantern treats any script that finished downloading before the observed paint as render-blocking. It lets one off only if it finds an evaluation task of 10ms or more that started after the paint. Short evaluation tasks are pruned from its graph, so their scripts are always charged. Its LCP graph therefore held every chunk. On Home the optimistic estimate ended with `1mh6a…js` (React DOM) at 2405ms and the pessimistic one at 2855ms, while the hero itself finished at 2103ms and 2253ms, slowed by sharing the bandwidth.
- With the chunk tags stripped out, the same page simulated at 1729ms. That was the ceiling for this lever.

**Things that were checked and ruled out:**
- **Compression.** The harness's `serve` already sends brotli (`Content-Encoding: br` on HTML, CSS and JS), as Cloudflare does. It is not a source of distortion.
- **HTTP/2.** The local server is HTTP/1.1, while Cloudflare is h2 or h3. A local h2 + TLS server brought Home to 2144–2338ms. That was better but still over budget, so the harness was not changed.
- **A webpack build** (`next build --webpack`) ships the same ~125 KiB of framework JS as Turbopack. There is no dependency to trim: the site's own client code is ~14 KiB brotli.
- **Fetching the chunks only after `requestAnimationFrame`** made things worse (2.8s). Chrome's first paint landed at ~70ms regardless of when the script ran, so the chunks still finished before it.

**The fix: `scripts/defer-hydration.mjs`**, a post-build step now part of `npm run build`. Below 1024px, the client chunks are fetched and run only after the `first-contentful-paint` entry, the hero image's load and one more frame. At 1024px and wider, a `media`-scoped preload keeps the downloads starting from the head, and the chunks run at the end of parse. Desktop parity stays 15/15 at 0px.
- **Trade-off:** phones hydrate after the first paint instead of racing it. The Menu, the Show-all and disclosure buttons and the contact form wake up a little later. Content, layout and the no-JS fallbacks do not depend on JS (SPEC §5.5, §11). CLS stays 0.000 and TBT is 6–8ms.
- **Fallback:** a `load` + 1.5s timer covers background tabs, which never paint, and browsers without Paint Timing.
- **CSP:** the loader is a small inline script, which `script-src 'self' 'unsafe-inline'` already allows.

**Next step:** production (PSI) numbers still need checking after deploy.

### axe-core

| Page | 390 (`color-contrast` nodes: baseline → after, waived) | 1440 (baseline → after, waived) | Other violations |
|---|---:|---:|---:|
| home | 41 → 23 | 42 → 42 | 0 |
| about | 3 → 3 | 3 → 3 | 0 |
| services-and-results | 30 → 30 | 34 → 34 | 0 |
| privacy-policy | 1 → 1 | 1 → 1 | 0 |
| accessibility-statement | 1 → 1 | 1 → 1 | 0 |

### Mobile lint (unique findings per page across the sweep)

Every check (overflow, tapSize, tapSpacing, textSize, bodyText, inputFont, mediaDims, safeArea, margins and tapSizeInline) is at **0 on every page**. The baseline counts are above.
