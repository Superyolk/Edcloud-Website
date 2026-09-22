# Phase 1 audit, B-pages: About, Services & Results, and the legal pages

**Auditor:** B-pages · **Build:** `mobile-redesign` at `af30ca2`. Page source is unchanged from `95beb8d`, and `out/` was served locally on :4187 · **Date:** 2026-09-22

**Scope:** `/about`, `/services-and-results`, `/privacy-policy`, `/accessibility-statement`, `components/LegalPage.tsx`, `app/about/about.module.css`, `app/services-and-results/services.module.css`. The shell (header, footer, menu, safe-area) belongs to another auditor. It is cross-referenced below only where it changes the numbers for these pages.

**Method:**
- I looked at every matrix screenshot for the four pages (`scripts/qa/output/matrix/<page>/<WxH>.png`, sliced to full resolution for 320, 390, 768, 820 and 844, plus the per-page contact sheets).
- I re-measured every page at all 13 matrix viewports with Playwright Chromium. The capture settings match `scripts/qa/lib.mjs` (reduced motion, frozen CSS, DPR 1, isMobile, touch and iPhone UA). I recorded DOM geometry, line counts from `Range.getClientRects()`, and characters per line (cpl) = characters ÷ rendered lines.
- I read `mobile-lint.json`, `a11y.json`, `perf.json` and `bytes.json`.
- Hero-text contrast: I hid the text, screenshotted the backdrop under its box, and computed the WCAG ratio of `#FFF` against every backdrop pixel.
- All crops are in `docs/mobile/audit/crops/B-pages-NN.png`. A composite crop has grey gutters between panels.

**Counts:** P0 = 3 · P1 = 11 · P2 = 8 (22 findings)

---

## P0: broken, or blocks a Phase gate

### B-pages-01: Services "For / How / When" rows crush the answer column to 102–212px
- **Pages / viewports:** `/services-and-results` at 320x568 and 360x780 (unreadable), 375x667 (P0 edge), and 390–430 (P1: the same defect, milder).
- **Crop:** `crops/B-pages-01.png` shows service 02 at 320 (left) and 390 (right).
- **Evidence:** 18 `<dd>`s. The `<dt>` column is a fixed 110px plus a 16px gap, and it starts after the 44px counter indent, so the `<dd>` starts at x=194 on every phone.

  | vw | dd width | avg cpl | total dd lines | longest dd | "What we do" section height | share of page |
  |---|---:|---:|---:|---:|---:|---:|
  | 320 | 102px | **11.3** | 115 | **13 lines** ("GTM engineering plan, CRM architecture…") | 5883px | 49% |
  | 360 | 142px | 15.2 | 85 | 10 | 4917px | 46% |
  | 375 | 157px | 17.5 | 74 | 7 | 4557px | 45% |
  | 390 | 172px | 19.6 | 66 | 7 | 4316px | 44% |
  | 430 | 212px | 24.0 | 54 | 6 | 3928px | 43% |
  | 768 | 506px | 43.1 | 30 | 2 | 2778px | 39% |

  At 320 the tallest single `<dl>` is 590px, and each service `<li>` is 830–1044px tall. The labels ("For:", "How:", "When:") are 3–5 characters wide but get 110px each, so 60% of the row width (110 of 228px at 320) holds a 4-character label.
- **Root cause:** `app/services-and-results/services.module.css:263-265` (`.dlRow { grid-template-columns: 110px minmax(0, 1fr) }`), which has no phone override. The indent comes from `services.module.css:199-201` (`.service` grid `var(--counter-col) minmax(0,1fr)`).
- **Fix direction:** below about 600px, stop giving the label its own 110px column. For example, stack the label above the value or use an inline run-in label, so the value gets the full 298–342px content width.

### B-pages-02: About and Services miss the 390px page-length gate by 41% and 41%
- **Pages / viewports:** `/about` and `/services-and-results` at 390x844 (gate), and every phone width.
- **Crop:** `crops/B-pages-02.png` shows both full pages at 390, scaled to 1800px tall.
- **Evidence:** section heights (px) at 390x844:

  | Page | Total | Target | Over | Breakdown |
  |---|---:|---:|---:|---|
  | About | **9153** | 6500 | +2653 (+41%) | hero 537 · 01 Mission & History **6011 (66%)** · 02 Managing Partner 1003 · 03 By The Numbers 1067 · footer ≈535 |
  | Services | **9867** | 7000 | +2867 (+41%) | hero 672 · proof strip 527 · 01 Engagement 1264 · 02 What we do **4316 (44%)** · 03 Results 1457 · 04 Fit 1097 · footer ≈534 |

  At 320: About is 10930 and Services is 12109. The two largest contributors are B-pages-04 (Mission prose, 6011px) and B-pages-01 (the service `<dl>`s, 4316px). Content is frozen, so the height must come from layout (measure, indent, stacking, padding), or from disclosure that keeps content in the DOM.
- **Root cause:** there is no single line to point to; it is the sum of B-pages-01, 04, 05, 12 and 13. The largest levers are `about.module.css:48-55` (`.mission`, full prose in one column), `services.module.css:263-265` and `tokens.css:59-62` / `SectionShell.module.css:36-39` (the 44px indent).
- **Fix direction:** budget each section at 390 (for example, About Mission ≤ 3800px and Services What-we-do ≤ 2600px), then fix B-pages-01, 04, 05 and 13 first. Together they account for most of the excess.

### B-pages-03: color contrast. axe reports 35 failing nodes across the four pages at 390 and 39 at 1440 (gate: axe zero)
- **Pages / viewports:** all four pages at 390x844 and 1440x900. The same tokens apply at every width.
- **Crop:** `crops/B-pages-03.png` shows a phase card (index `01` and duration `2 to 3 weeks`), a proof item (client `Handshake`) and a service result line, at 390.
- **Evidence (from `a11y.json`, 390 / 1440):**
  - About 3/3: section counters, `#7A8494` on `#F2F9F4` at **3.53:1** and on `#FFF` at **3.77:1**, 15px.
  - Services 30/34:
    - proofClient: 4 nodes, 14px, 3.77:1.
    - counters: 4.
    - phaseIndex: 3, 3.77:1.
    - **phaseDuration**: 3 nodes, `#17916B` on white, **3.96:1**, 14px/600.
    - serviceIndex: 6, 3.77:1.
    - **serviceResult**: 6 nodes, `#17916B`, 3.96:1, 17px/600. axe treats 600 as normal weight, so the large-text exemption does not apply.
    - **tdOutcome**: 4 nodes, 3.96:1, 16px/600.
    - At 1440, 4 more `th` nodes at 3.77:1.
  - Privacy 1/1 and Accessibility 1/1: the lone `01` counter at 3.53:1.
  - Lighthouse A11y is 96 on all four pages, from `color-contrast` alone.
- **Root cause:** `app/tokens.css:6` (`--slate #7A8494`) and `app/tokens.css:10` (`--growth #17916B`). They are used at `SectionShell.module.css:23`, `services.module.css:99, 153, 159, 209, 250, 302, 327`.
- **Fix direction:** darken slate and the green used for text, scoped below 1024px (or accept a golden re-baseline; see BASELINE quirk 5). Slate needs ≥ 4.5:1 on both `#F2F9F4` and `#FFF`, and green text ≥ 4.5:1 on white. The desktop decision is out of scope for this audit. Also see B-pages-11, which axe cannot see.

---

## P1: looks amateur, or fails a quality-bar line item

### B-pages-04: About "Mission & History" is a 6011px single-column wall of prose
- **Pages / viewports:** `/about`, every phone width. It is still 3218–3430px on tablets and 844 landscape.
- **Crop:** `crops/B-pages-04.png` shows the whole section at 390, scaled from 6011px to 1800px.
- **Evidence:** 19 text blocks (paragraphs and list items) under 8 headings, 6118 characters in total.

  | vw | text column | lines | avg cpl | section height | screens to scroll (at vh) |
  |---|---:|---:|---:|---:|---:|
  | 320 | 228px | 242 | **25.3** | 7694px | 13.5 |
  | 360 | 268px | 206 | 29.7 | 6691px | 8.6 |
  | 390 | 298px | 181 | **33.8** | 6011px | 7.1 |
  | 430 | 338px | 162 | 37.8 | 5494px | 5.9 |

  The comfortable measure is 45–75 cpl. At 320 it is 25 cpl. The section has no in-page navigation or disclosure, and nothing to break the text up visually between "About EdCloud" and "Why now". The eight h3 subheads (20px/600) are the only rhythm.
- **Root cause:** `app/about/about.module.css:48-55` (`.mission`: `max-width 68ch`, one grid column, `gap 20px`) and `about.module.css:66` (`.h3` `margin-top 24px`). The text is narrowed further by the 44px indent (B-pages-05).
- **Fix direction:** designers should pick a mobile structure for the 8 subsections that keeps every word in the DOM (for example, disclosure per subsection, or a jump list plus a tighter rhythm), and reclaim the indent.

### B-pages-05: the 44px counter-column indent narrows every section's text on phones
- **Pages / viewports:** all four pages, 320–430. At 600–1023 the indent is 88px.
- **Crop:** `crops/B-pages-05.png` shows About (left) and Privacy (right) at 320, with `01` alone in a 28px column.
- **Evidence:**
  - Content starts at x=68 on a 320–430 viewport: 24px gutter + 28px counter column + 16px gap. The 28px column holds nothing but the two-digit counter, one line tall.
  - Text width at 320 is 228px against a possible 272px (−16%). At 390 it is 298px against 342px (−13%).
  - At the About measure, reclaiming the indent at 390 would take the Mission copy from 181 to about 162 lines (the count measured at the 338px column of the 430 viewport), about **−517px**. Services leads (20px) drop to 19.2–22.6 cpl at 320. Legal body text is at **22.3 cpl** at 320.
  - At 768–1023 the column is 72px + 16px, so text starts at x=112.
- **Root cause:** `app/tokens.css:59-62` (`--counter-col: 28px` below 600px), `components/SectionShell.module.css:14-16` (`.head`) and `SectionShell.module.css:36-39` (`.body` with the empty `aria-hidden` spacer, `SectionShell.tsx:45`).
- **Fix direction:** on phones, let section content run the full gutter-to-gutter width (the counter can sit inline with or above the title). Keep desktop unchanged.

### B-pages-06: Services items numbered 01–06 share the column and style of section numbers 01–04
- **Pages / viewports:** `/services-and-results`, 320–820. Above 820 the list is indented and the collision goes away.
- **Crop:** `crops/B-pages-06.png` shows, at 390, "02 What we do" followed directly by "01 GTM Strategy & Positioning" in the same column.
- **Evidence:**
  - The section counter is at x=24, w=28, 15px, `rgb(122,132,148)`. The service index is also at x=24, w=28, 15px, `rgb(122,132,148)`. The two are identical.
  - Reading down the left column at 390 gives: 01, 02, **01, 02, 03, 04, 05, 06**, 03, 04. The phase cards add a third 01–03 sequence (in slate, inside cards).
- **Root cause:** `services.module.css:193-197` (`@media (max-width: 820px) { .serviceList { margin-left: 0 } }`) combined with `.serviceIndex` (`services.module.css:207-212`), which uses the same token and size as `SectionShell.module.css:21-25`.
- **Fix direction:** give the service numbers a visibly subordinate treatment, or position, on phones, so that they can't be mistaken for section numbers.

### B-pages-07: every subpage downloads 413,326 bytes of Home-only photos on first load
- **Pages / viewports:** `/about`, `/services-and-results`, `/privacy-policy`, `/accessibility-statement`, at every width (measured at 390).
- **Crop:** `crops/B-pages-07.png` is a network table rendered from the measured requests. Home images are the red rows.
- **Evidence:**
  - Within about 5–10ms of `/__next._tree.txt` (the Home route's prefetch tree) arriving, each subpage fetches `hero-poster.webp` 111,464 + `conference-room.webp` 157,874 + `stairway.webp` 84,346 + `classroom-lecture.webp` 59,642 = **413,326 B**. None of these images is used on the page.
  - `out/__next._tree.txt` contains `:HL["/images/hero-poster.webp","image",{"fetchPriority":"high"}]` and `:HL[...]` for the other three.
  - Blocking `__next.__PAGE__.txt` does not stop the downloads, so `_tree.txt` is what carries them.
  - As a share of first-load bytes (`bytes.json`): Privacy **65%** of 619.9 KiB, Accessibility **65%**, About **57%** of 712.6 KiB, Services **51%** of 788.1 KiB.
  - A `hero-poster` preload at `fetchPriority: high` competes with each page's own LCP. About and Services LCP is 2395/2397ms, and the legal pages' text LCP is 2167/2168ms. All exceed the 2000ms budget.
  - Also: `aaron-sokol.webp` (12,752 B) loads eagerly at t=18ms although it sits at y=6658 at 390.
- **Root cause:**
  - The Home `<img>`s at `app/page.tsx:130`, `:148` and `:192` have no `loading="lazy"`, and the poster has `fetchPriority="high"` at `app/page.tsx:67`. React emits preload hints for all of them into the Home RSC tree.
  - That tree is prefetched by the brand `<Link href="/">` in `components/SiteHeader.tsx:40`, which renders through `components/RouteLink.tsx:41` (next/link, default prefetch). The footer brand link at `SiteFooter.tsx:48` does the same.
  - The headshot: `app/about/page.tsx:78` has no `loading="lazy"`.
- **Fix direction:** stop Home's below-the-fold image hints from reaching other routes, via lazy loading on Home or prefetch policy on the brand links. Lazy-load the About headshot. Re-measure with `qa:bytes`.

### B-pages-08: About and Services hero images are 1920x1080 on phones and not prioritised, and they are the LCP (2395 / 2397ms)
- **Pages / viewports:** `/about` and `/services-and-results`, all phone and tablet widths.
- **Crop:** `crops/B-pages-08.png` shows the first viewport of About and of Services at 390.
- **Evidence:**
  - `hero-about.webp` is 1920x1080, 78,344 B. `hero-services.webp` is 1920x1080, 167,540 B.
  - They render in a 390x537 box (About) and a 390x672 box (Services). With `object-fit: cover`, that is about 954x1080 source pixels; even at DPR 3 the boxes need at most 1170x1611.
  - The LCP element in Lighthouse (`perf.json`) is the hero `<img>` on both pages. LCP medians are 2395ms and 2397ms, against a 2000ms budget. FCP is 903ms.
  - Failing audits are `lcp-discovery-insight`, `image-delivery-insight` and `network-dependency-tree-insight`.
  - Neither `<img>` has `fetchpriority` or `srcset`/`sizes`.
- **Root cause:** `app/about/page.tsx:27` and `app/services-and-results/page.tsx:30` (plain `<img>` with a single 1920px source, no priority), plus B-pages-07's competing preloads.
- **Fix direction:** serve width-appropriate variants to phones and mark the hero as high priority. This must stay self-hosted and CSP `'self'`.

### B-pages-09: tablet grids strand one item on its own row (3+1 and 2+1)
- **Pages / viewports:** 768x1024, 820x1180 and 844x390.
- **Crop:** `crops/B-pages-09.png` shows About numbers at 768, the Services proof strip at 820 and Services phases at 844.
- **Evidence (items per row, measured):**
  - About "By The Numbers": `[3,1]` at 768, 820 and 844. Cards are 224–249px wide, and the orphan leaves 504–540px of empty row. At 1024 the layout is `[4]`.
  - Services proof strip: `[3,1]` at 768, 820 and 844. 500K / "teachers served" sits alone under three stats.
  - Services phases: `[2,1]` at 768, 820 and 844. "Run and hand off" sits alone, and its 304–342px column is empty beside it.
- **Root cause:** `repeat(auto-fit, minmax(min(100%, N), 1fr))` with N = 220px at `about.module.css:127`, 200px at `services.module.css:70` and 260px at `services.module.css:130`. At 632–796px content widths these resolve to 3, 3 and 2 tracks for 4, 4 and 3 items.
- **Fix direction:** choose explicit tablet column counts that divide the item count (2x2 for the 4-item grids; 3-up or 1-up for phases).

### B-pages-10: legal pages set the H1 at the same size and weight as their H2s
- **Pages / viewports:** `/privacy-policy` and `/accessibility-statement`, every width (the style is the same on desktop).
- **Crop:** `crops/B-pages-10.png` shows the first viewport of both pages at 390.
- **Evidence:**
  - H1 "Privacy Policy" is **20px / 600**. H2 "Information we collect" is **20px / 600**. The same holds for the Accessibility Statement.
  - The page title is smaller than the About page's in-content h2 (28px, `--t-h2-footer`), and 55% smaller than the About/Services H1s (44px at phones).
  - At 390 the H1 sits at y=113 and is visually indistinguishable from the 10 (Privacy) and 5 (Accessibility) section heads below it.
- **Root cause:** `components/LegalPage.tsx:15` renders the title through `SectionShell` `as="h1"`, which inherits `.title` at `--t-section` 1.25rem (`SectionShell.module.css:27-34`). `LegalPage.tsx:20` renders h2s with `about.module.css .h3` (`--t-h3` 1.25rem).
- **Fix direction:** give the legal page title a real title scale on mobile (scoped if desktop stays frozen), and keep the h2s visibly subordinate.

### B-pages-11: Results column labels on phones are 14px `#7A8494` on white (3.77:1), and axe cannot see them
- **Pages / viewports:** `/services-and-results`, 320–799 (stacked-card mode).
- **Crop:** `crops/B-pages-11.png` shows the Handshake card at 390 ("Where we started / What we built / Outcome").
- **Evidence:**
  - 12 labels (4 rows × 3) are generated as `::before { content: attr(data-label) }`. They are 14px/500 slate on `#FFF`, at **3.77:1**, below the 4.5:1 needed.
  - axe skips pseudo-element text, so `a11y.json` at 390 reports only the 4 `tdOutcome` nodes, and the gate would pass even with these still failing.
  - The labels carry the column meaning, because `thead` is `display:none` at this width.
- **Root cause:** `services.module.css:367-373` (`.td[data-label]::before { color: var(--slate); font-size: var(--t-small) }`) and `services.module.css:339-341` (thead hidden).
- **Fix direction:** fix these together with B-pages-03's slate token, and add a manual contrast check for pseudo-content, since axe will not catch a regression here.

### B-pages-12: heroes fill the first screen; Services at 320x568 and 844x390 shows nothing but the hero
- **Pages / viewports:** `/services-and-results` at 320x568 (hero 566 of 568px, 99.6%) and 844x390 (hero 407 of 390px, **104%**); 390x844 (672 of 844, 80%). `/about` at 390x844: 537px (64%) of hero whose only content is the two-word H1 "About Us".
- **Crop:** `crops/B-pages-12.png` shows the first viewport of Services at 320x568, of Services at 844x390 and of About at 390x844.
- **Evidence:**
  - Services at 320: no proof-strip stat is visible above the fold. The first stat is at y=578.
  - At 844x390 the proof strip starts at y=407. The 64px sticky header (another auditor's scope) also covers 16% of the 390px-tall viewport over the hero.
  - About at 320: hero 382px, H1 44px.
  - The hero `min-height` is `min(72vh,640px)+64px` (Services) and `min(56vh,480px)+64px` (About). Its top padding is `112px + 64px` (Services) and `96px + 64px` (About), which sets the height at short viewports, not the `vh` term.
- **Root cause:** `services.module.css:7` and `:27-33` (`.heroInner` padding `calc(112px + var(--nav-h)) … 64px`); `about.module.css:8` and `:28-35`.
- **Fix direction:** cap the hero on short and landscape viewports so that at least the first proof stat (Services) or the section head (About) shows above the fold.

### B-pages-13: body copy at 15px on phones (lint `bodyText`: Services 18 instances, About 4)
- **Pages / viewports:** `/services-and-results` `<dd>` ×18 and `/about` `.numberBody` ×4, at every width 320–1023 (`mobile-lint.json`).
- **Crop:** `crops/B-pages-13.png` shows an About number card and a Services `<dl>` at 390.
- **Evidence:**
  - `dd` computes to 15px (`--t-body-sm`) at line-height 1.55. The quality bar is body ≥ 16px. These are full sentences ("Teams whose pitch changes every meeting, or who sell well to one persona…"), not labels.
  - `.numberBody` is 15px at line-height 1.5.
  - `.proofLabel` is also 15px. It is not flagged, but it is on the same token.
- **Root cause:** `services.module.css:259` (`.dl { font-size: var(--t-body-sm) }`), `about.module.css:178` (`.numberBody`) and `services.module.css:91` (`.proofLabel`), all set from `tokens.css:32` (`--t-body-sm: 15px`).
- **Fix direction:** at phone and tablet widths, set sentence-length copy to at least 16px. Budget the height impact together with B-pages-01.

### B-pages-14: About "By The Numbers" cards break the page's left edge by 44px on phones
- **Pages / viewports:** `/about`, 320–430.
- **Crop:** `crops/B-pages-14.png` (390) shows partner text at x=68 and the card at x=24.
- **Evidence:**
  - Every other content block on the page starts at x=68 (title word). The four cards start at x=24, under the `03` counter, and are 272–382px wide.
  - Each card has 32px padding all round, so the stat sits at x=56 and does not line up with the title (x=68) or with the counter (x=24).
  - The four cards stack to 221+198+221+198 + 3×24 = **910px** at 390 for four numbers.
- **Root cause:** `app/about/page.tsx:91` (`offset={false}`, which the desktop reference requires) together with `about.module.css:125-139` (`.numbers`, and `.numberCard` `padding: 32px`).
- **Fix direction:** on phones, align the cards to one edge with the rest of the page, and use a denser arrangement (for example 2x2) for four short stats.

---

## P2: polish

### B-pages-15: at 768–1023, the partner headshot leaves an empty column beside the long bio
- **Pages / viewports:** `/about` at 768x1024 and 820x1180. At 844x390 the gap is similar.
- **Crop:** `crops/B-pages-15.png` shows the partner block at 768 and at 820.
- **Evidence:**
  - At 768 the headshot is 296x274 and the text column is 296x556, leaving **282px** of blank space under the photo. At 820 the photo is 322x298 against 502px of text, a 204px gap.
  - The bio column is 296px wide at 768, about 36 cpl, which is narrower than the phone layout at 430 (338px).
- **Root cause:** `about.module.css:94-99` (`.partner` auto-fit `minmax(min(100%,280px),1fr)` gives two equal columns as soon as there are 600px or more) and `about.module.css:101-108` (`.headshot` `max-width: 420px`).
- **Fix direction:** on tablets, either stack, or size the photo column narrower than the text column.

### B-pages-16: proof-strip labels sit 7px lower in one column at 768
- **Pages / viewports:** `/services-and-results`, 768x1024.
- **Crop:** `crops/B-pages-16.png`.
- **Evidence:**
  - Label tops are at y=789, 782 and 782. The "30 → 550" item is stretched to 108px high because its neighbours' labels wrap to 2 lines ("US market share in two / years").
  - Grid `align-content: normal` distributes the extra height into its auto rows, which pushes "universities in two years" down 7px and "Handshake" down 14px.
- **Root cause:** `services.module.css:74-79` (`.proofItem { display: grid; gap: 6px }`, with no `align-content: start`).
- **Fix direction:** top-align the stat, label and client rows inside each proof item.

### B-pages-17: at 800–1023, the Results table squeezes "What we built" to 185–194px, giving four-line cells
- **Pages / viewports:** `/services-and-results` at 820x1180 and 844x390. The table switches back on at 800px.
- **Crop:** `crops/B-pages-17.png` shows the table at 820 and at 844.
- **Evidence:**
  - At 820 the column widths are 132 / 161 / 185 / 206px. "What we built" wraps to **4 lines at 13.8 cpl**, the Outcome column to 3 lines, and "Where we started" breaks in the header.
  - Row height is 137px.
  - The same table at 768, in stacked-card mode, reads at 43–55 cpl.
- **Root cause:** `services.module.css:333` (the `max-width: 799px` breakpoint) and `:292-298` (`.table` `min-width: 640px` in a 684–708px wrapper with 24px cell padding).
- **Fix direction:** move the card/table switch point up (so tablets up to 1023 use the stacked cards, which keeps desktop frozen), or rebalance the column widths.

### B-pages-18: legal pages print the contact emails as plain text, with no tap target
- **Pages / viewports:** `/privacy-policy` (2 × `privacy@edcloud.org`) and `/accessibility-statement` (1 × `accessibility@edcloud.org`), every width.
- **Crop:** `crops/B-pages-18.png` (390).
- **Evidence:** `hasLink: false` for all 3 occurrences. On a phone, the Accessibility Statement's own "Feedback" instructions ("please contact us: accessibility@edcloud.org") cannot be acted on with a tap; the user has to select and copy the address.
- **Root cause:** `components/LegalPage.tsx:19-22` renders blocks as plain text (`content/legal.ts` has no link data).
- **Fix direction:** this needs a copy/link decision, because adding a `mailto:` adds hrefs (it would have to go in `content-allowlist.json`). Designers or the owner should decide.

### B-pages-19: the legal pages import the About page's CSS module
- **Pages / viewports:** `/privacy-policy` and `/accessibility-statement`, all widths.
- **Crop:** `crops/B-pages-19.png` shows About Mission (left) and Privacy (right) at 390, rendered by the same rules.
- **Evidence:**
  - `LegalPage` uses `.mission`, `.h3`, `.list` and `.p` from `about.module.css`.
  - Any phone change made for B-pages-04 (for example disclosure, a different rhythm or a different measure) would silently change both legal pages. The desktop goldens for the legal pages would also shift if an About rule is not width-scoped.
- **Root cause:** `components/LegalPage.tsx:5` (`import styles from '@/app/about/about.module.css'`).
- **Fix direction:** give the legal pages their own text styles, or a shared prose module, before redesigning the About prose.

### B-pages-20: prose exceeds 75 cpl on tablets and in landscape
- **Pages / viewports:** `/about` at 844x390 (**77.4 cpl**, 708px column) and 820x1180 (**75.5**). 768 is at 70.3. The legal pages are at 64.6–66.6.
- **Crop:** `crops/B-pages-20.png` shows the first Mission paragraph at 844 and at 820.
- **Evidence:** `.mission { max-width: 68ch }`. In Instrument Sans, `1ch` (the "0" glyph) is wider than the average character, so "68ch" renders at about 77 characters per line. The first line at 844 is "EdCloud exists for a simple reason: too many promising education products stall out" (84 characters).
- **Root cause:** `about.module.css:49`.
- **Fix direction:** cap the measure in px or rem at tablet widths, targeting 60–72 cpl. Desktop is frozen, so scope the change to 600–1023px.

### B-pages-21: white hero text over the photos drops to 2.73–3.35:1 in places
- **Pages / viewports:** the Services hero lead (20px/400) at every phone and tablet width. The About H1 (44–49px) at 375–820.
- **Crop:** `crops/B-pages-21.png` shows the Services hero at 390 and the About hero at 768.
- **Evidence:** backdrop sampled with the text hidden:
  - Services `.heroLead`: worst **3.20:1** (390). **41–56% of backdrop pixels are below 4.5:1** at every width, for example the white laptop behind "measured the way your board".
  - Services H1: worst 3.24:1. This is large text, so it passes 3:1.
  - About H1: worst **2.73:1** at 768/820 and 2.81–2.99:1 at 375–430. It fails even the 3:1 large-text threshold, where the bright robot arm and white shirts sit behind "About Us".
  - axe does not test text over images, so this does not show up in `a11y.json`.
- **Root cause:** `app/tokens.css:16-17` (`--hero-overlay-subpage` rgba(27,36,49,0.42), `--hero-overlay-services` 0.5), applied at `about.module.css:22-26` and `services.module.css:21-25`, with no gradient behind the text.
- **Fix direction:** on phones and tablets, strengthen the overlay locally behind the text block (for example a bottom scrim), or reposition the crop. Verify by sampling the backdrop as above.

### B-pages-22: the "Is this a fit" list spends 1097px at 390 on 7 short sentences
- **Pages / viewports:** `/services-and-results`, 320–430 (1278px at 320).
- **Crop:** `crops/B-pages-22.png` (390).
- **Evidence:**
  - 7 items, each 116–142px tall at 390 (18px top and bottom padding + a hairline + 2–4 lines at 17px/1.55), for items of 57–103 characters.
  - The two columns stack at every width below 768+ (`minmax(320px)` resolves to 1 column up to 820px wide), so the section is 807px at 768 and 783px at 820.
  - The 20px check or dash marks are slate for the "not" list. They are decorative (`aria-hidden`), so there is no contrast gate.
- **Root cause:** `services.module.css:378-382` (`.fit` `minmax(min(100%, 320px), 1fr)` plus `gap: 40px 64px`) and `:407-414` (`.fitItem` `padding: 18px 0`).
- **Fix direction:** tighten the item rhythm on phones, and let the two lists sit side by side from about 700px.

---

## Notes and non-findings
- **Overflow:** 0 at every width 320–1023 on all four pages (`mobile-lint`). The Results table no longer scrolls horizontally below 800px.
- **Media:** every `<img>` in scope has width and height attributes, so `mediaDims` is 0, and CLS is 0 on every page.
- **Tap targets:** the four page bodies contain no interactive elements. The only `tapSize` findings on these pages are header and footer (shell auditor), and the brand link and footer links appear identically on every page.
- **Text below 13px:** only the header wordmark (shell).
- **Safe area:** only the sticky header (shell).
- **Services has no booking or CTA section, as intended.** It ends on "Is this a fit" and then the footer. Nothing flagged.
- **Desktop (1024 / 1280 / 1440):** measured for reference only (heights match BASELINE). No desktop findings are raised, because desktop is frozen. The contrast items (03, 21) and legal heading item (10) also apply to desktop and need an explicit re-baseline decision if they are fixed globally.

## Coverage

✔ means screenshot reviewed and DOM measured. (m) means DOM measured and reviewed through the contact sheet, not at full resolution.

| Page | 320x568 | 360x780 | 375x667 | 390x844 | 393x852 | 414x896 | 430x932 | 844x390 | 768x1024 | 820x1180 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| /about | ✔ | (m) | (m) | ✔ | (m) | (m) | (m) | ✔ | ✔ | ✔ | (m) | (m) | (m) |
| /services-and-results | ✔ | (m) | (m) | ✔ | (m) | (m) | (m) | ✔ | ✔ | ✔ | (m) | (m) | (m) |
| /privacy-policy | ✔ | (m) | (m) | ✔ | (m) | (m) | (m) | ✔ | ✔ | ✔ | (m) | (m) | (m) |
| /accessibility-statement | ✔ | (m) | (m) | ✔ | (m) | (m) | (m) | (m) | (m) | (m) | (m) | (m) | (m) |

Additional sources: `mobile-lint.json` (the 320–430 1px sweep and 600–1023), `a11y.json` (390 and 1440), `perf.json` (Lighthouse mobile, 3 runs), `bytes.json`, plus a fresh request capture at 390 for B-pages-07 and a backdrop contrast sample at all 10 phone, landscape and tablet viewports for B-pages-21.

## Findings index

| ID | Sev | Page(s) | Viewports | Root cause |
|---|---|---|---|---|
| 01 | P0 | Services | 320–430 | services.module.css:263-265 |
| 02 | P0 | About, Services | 390 (all phones) | aggregate; about.module.css:48, services.module.css:263, tokens.css:59 |
| 03 | P0 | all 4 | all | tokens.css:6,10 |
| 04 | P1 | About | phones | about.module.css:48-55 |
| 05 | P1 | all 4 | 320–1023 | tokens.css:59-62, SectionShell.module.css:14-16,36-39 |
| 06 | P1 | Services | 320–820 | services.module.css:193-197,207-212 |
| 07 | P1 | all 4 | all | app/page.tsx:67,130,148,192; RouteLink.tsx:41; SiteHeader.tsx:40; about/page.tsx:78 |
| 08 | P1 | About, Services | phones, tablets | about/page.tsx:27; services-and-results/page.tsx:30 |
| 09 | P1 | About, Services | 768, 820, 844 | about.module.css:127; services.module.css:70,130 |
| 10 | P1 | Legal | all | LegalPage.tsx:15,20; SectionShell.module.css:27-34 |
| 11 | P1 | Services | 320–799 | services.module.css:367-373 |
| 12 | P1 | Services, About | 320x568, 844x390, 390 | services.module.css:7,27-33; about.module.css:8,28-35 |
| 13 | P1 | Services, About | 320–1023 | services.module.css:259,91; about.module.css:178; tokens.css:32 |
| 14 | P1 | About | 320–430 | about/page.tsx:91; about.module.css:125-139 |
| 15 | P2 | About | 768, 820, 844 | about.module.css:94-108 |
| 16 | P2 | Services | 768 | services.module.css:74-79 |
| 17 | P2 | Services | 800–1023 | services.module.css:292-298,333 |
| 18 | P2 | Legal | all | LegalPage.tsx:19-22 |
| 19 | P2 | Legal | all | LegalPage.tsx:5 |
| 20 | P2 | About (Legal) | 820, 844 | about.module.css:49 |
| 21 | P2 | Services, About | all phones and tablets | tokens.css:16-17 |
| 22 | P2 | Services | 320–820 | services.module.css:378-382,407-414 |
