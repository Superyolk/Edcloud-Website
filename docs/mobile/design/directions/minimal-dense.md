# Direction C: "The Ledger" (minimal-dense)

> The phone site reads like a well-set annual report. Hairline rules, tabular numerals and run-in labels fit more real content on each screen than a stacked, card-based layout would. There is no decoration, the content stays in the DOM, and every row is a thumb-sized target.

Owner decisions applied: colour contrast is out of scope (palette untouched, and A-home-01, B-pages-03, the contrast part of B-pages-11, and C-cross-09 are waived). The hero pause control is out of scope (C-cross-16 is waived). Everything else in the brief is treated as binding.

Mockups (real copy from `content/*`, real images, self-hosted Instrument Sans, rendered with the repo's Playwright Chromium):

| File | What | Measured doc height |
|---|---|---|
| `dense-home.png` | Home, 390 wide, DPR 2, full page | **6,961px** (target ≤ 8,500; baseline 12,065) |
| `dense-home-320.png` | Home, 320 wide | 7,204px, **scrollWidth 320 (no overflow)** |
| `dense-services.png` | Services & Results, 390, DPR 2 | **6,874px** (target ≤ 7,000; baseline 9,867) |
| `dense-services-320.png` | Services at 320 | 7,585px, no overflow |
| `dense-about.png` | About, 390 (bonus, built to prove the About number) | **3,970px** (target ≤ 6,500; baseline 9,153) |
| `dense-home-768.png` | Tablet 768 | 6,595px, no overflow |
| `dense-home-landscape.png` | 844×390 first screen | 6,264px total |
| `dense-menu.png` | Menu sheet open, 390×844 viewport | — |
| `dense-home-scrolled.png` | Mid-scroll state: solid 56px header plus the home-only Contact pill | — |

Sources: `dense.css` (all tokens and rules), `gen.mjs` (builds the HTML from `content/content.js` and `content/copy.ts`, so no string was retyped), `shoot.cjs` / `about.cjs` (render and measure, including an overflow scan of every element), and `img/` (the art-directed crops made for the mockup).

---

## 1. The idea in one screen

Three signature moves, used on every page:

1. **The rule header.** Each section opens with a 1px `--ink` rule across the full content width. Under it, on one baseline, sit the counter (`01`, 13px 600 `--slate`, tabular) and the title (20px 600). The 28–72px counter column is gone, so content runs the full width minus a 20px gutter on both sides and the margins are symmetric (fixes A-home-13, B-pages-05, C-cross-15).
2. **Ledger rows.** Lists (capabilities, cases, press, phases, services, results, fit items, menu) are rows separated by 1px `--line` hairlines. A strong ink rule marks a section and a soft green hairline marks a row. That two-weight hierarchy does the work that cards and shadows do on desktop, so the phone site uses **no card shadows and no card padding**. Those two things are where the baseline lost 30–40% of its width.
3. **Run-in labels and inline indices.** Labels begin the line and the value wraps to the full measure under them (`For: Teams whose pitch…`). The number on an item sits inline before its title (`01 Rapid Testing…`) and never forms a column. That is how Services' For/How/When goes from 102–212px wide to 318px wide without adding height.

The density comes from typography, not from shrinking things. Body copy stays at 16px/1.5. The saving comes from removing gutters, cards, duplicate whitespace and photo/list/photo stacks, plus four well-chosen disclosures.

---

## 2. Tokens

All new tokens are prefixed `--m-` or `--s-` and are **declared only inside `@media (width < 1024px)`** in `app/tokens.css` (see §9). Brand colours, Instrument Sans (400/600) and `--ease` are reused as they are. No new colours or fonts are added.

### 2.1 Type: fluid 320→1023 with `clamp()`

| Token | Value | @320 | @390 | @768 | Use |
|---|---|---:|---:|---:|---|
| `--m-t-display` | `clamp(2rem, 1.35rem + 3.2vw, 3.25rem)` | 32 | 34.1 | 46.2 | Hero and page H1, lh 1.06, `text-wrap: balance` |
| `--m-t-h2` | `clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)` | 20 | 20 | 21.5 | Section titles |
| `--m-t-accent` | `clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)` | 22 | 22.3 | 25.3 | Green service lead (desktop `--t-display` role) |
| `--m-t-lead` | `clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)` | 18 | 18.2 | 19.5 | Lead paragraphs, lh 1.45 |
| `--m-t-h3` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 17 | 17.2 | 18.3 | Row titles, lh 1.3 |
| `--m-t-body` | `clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)` | 16 | 16.2 | 17 | **All running copy**, lh 1.5 |
| `--m-t-stat` | `clamp(1.75rem, 1.4rem + 1.8vw, 2.5rem)` | 28 | 29.4 | 36.2 | Case stats, tabular, ls −0.02em |
| `--m-t-ui` | `0.9375rem` | 15 | 15 | 15 | Buttons and row links (all 600 weight; never paragraphs) |
| `--m-t-meta` | `0.8125rem` | 13 | 13 | 13 | Counters, dates, sources, stat captions: **the floor** |

The rules: running copy is never below 16px (A-home-16, B-pages-13, C-cross-23), and nothing is below 13px (C-cross-18: the wordmark goes from 12px to 13px). `text-wrap: balance` is on every heading and `pretty` is on every paragraph. Measure: 16px text at a 350px width runs about 43–46 characters a line. At ≥600 the `.measure` class caps prose at 34em, which is about 60 characters (fixes C-cross-19 and B-pages-20). Hero H1 at 375: 33.6px gives 3 lines, plus "Education / Companies" at ≤ 360, so **4 lines at most, with no orphan** (verified at 320: 4 lines).

### 2.2 Spacing: 4px base

`--s-1 4 · --s-2 8 · --s-3 12 · --s-4 16 · --s-5 20 · --s-6 24 · --s-8 32 · --s-10 40 · --s-12 48 · --s-14 56 · --s-16 64`

| Semantic token | Phone (<600) | Tablet (600–1023) |
|---|---|---|
| `--m-gutter` | 20 (`--s-5`) | 32 (`--s-8`) |
| `--m-section-top` / `-bottom` | 40 / 48 | 56 / 64 |
| `--m-head-gap` (rule header to content) | 24 | 24 |
| `--m-row-y` (ledger row padding) | 16 | 16 |
| `--m-header-h` | 56 | 56 |
| `--m-tap` | 44 | 44 |

The header, the content and the footer all use `--m-gutter`, so every left edge lines up (C-cross-17).

### 2.3 One breakpoint scale

CSS custom media is not native yet, and adding PostCSS would be a new build dependency. So the scale is defined **once** in `app/breakpoints.ts` (for `useMediaQuery`) and documented at the top of `tokens.css`. `scripts/qa/breakpoints-lint.mjs` (tiny, no new dependencies) greps every `*.css` and fails on any `@media` width that is not one of these literals:

| Name | Query | Covers |
|---|---|---|
| `--bp-xs` | `(width < 360px)` | 320–359 phones: drops the " VENTURE PARTNERS" wordmark tail visually and narrows the logo tiles |
| phone (default) | *(no query)* | 320–599, all phones |
| `--bp-tablet` | `(width >= 600px)` | 600–1023: 32px gutter, 34em measure, 2-up cases and capabilities, 4-up logos and proof |
| `--bp-tablet-wide` | `(width >= 820px)` | 820–1023: 3-up phases, results as a real 4-column table, partner headshot beside the bio |
| `--bp-desktop` | `(width >= 1024px)` | **Frozen.** No new rule may use it. Every mobile rule lives in `(width < 1024px)` |
| `--bp-short` | `(orientation: landscape) and (max-height: 500px)` | 844×390 and similar: the hero sizes to its content, and the menu sheet scrolls |

This replaces the 359/439/599/799/819/820/899/1087 patch queries (C-cross-21). The rule 1087 lives inside the frozen range, so it stays as it is. The others fold into this scale.

### 2.4 Radii, elevation, motion

- **Radii:** `--m-radius: 0` (images, inputs, rows, sheet, as on desktop). `--m-radius-pill: 999px` for buttons only (the Menu pill, Show all, SUBMIT and the Contact pill).
- **Elevation:** `--m-elev-0: none` (default, since ledger rows are flat). `--m-elev-1: 0 1px 0 var(--line)` (the solid header). `--m-elev-2: 0 0 18px rgba(27,36,49,.16)`, which is the existing `--shadow-card` value, used only for things that float: the Contact pill and the menu sheet.
- **Motion:** `--m-dur-1 150ms` (press or `:active`), `--m-dur-2 200ms` (disclosure reveal, dot, pill show/hide), `--m-dur-3 240ms` (menu sheet). **One easing token:** `--m-ease: var(--ease)` = `cubic-bezier(.2,.7,.2,1)`. Only `transform` and `opacity` animate. There is no height animation, and a disclosure panel fades in with `opacity 0→1` and `translateY(4px→0)`. Under `prefers-reduced-motion` every duration is set to 0.01ms. There is no parallax and no scroll-jacking.
- **Touch feedback:** `-webkit-tap-highlight-color: transparent` on `body`. Every button and pill gets `:active { transform: scale(.97); opacity: .85 }`, and every row link gets `:active { color: var(--growth-ink) }`. Hover styles sit behind `@media (hover: hover)`, so there are no sticky 70% states (C-cross-20).
- **Hero scrim:** `--m-hero-scrim: linear-gradient(180deg, rgba(27,36,49,.30), rgba(27,36,49,.18) 34%, rgba(27,36,49,.80))`. This is `--ink` at alpha values, not a new colour. It keeps the photo's faces clear and gives bottom-anchored white text a solid ground.

---

## 3. Mobile-native section header (SectionShell)

```
────────────────────────────────────────  1px --ink, full content width
01  Our Promise                          counter 13/600 --slate tabular · 12px gap · h2 20/600
                                         24px
content, full width (350px at 390)
```

- In `SectionShell.module.css`, at `(width < 1024px)`: `.head { display:flex; align-items:baseline; gap:12px; border-top:1px solid var(--ink); padding-top:12px }`. `.body { display:block }`, and its empty `aria-hidden` spacer `span` gets `display:none` (it is decorative, not content). `.container { padding: var(--m-section-top) var(--m-gutter) var(--m-section-bottom) }`.
- The DOM, heading levels and landmarks are unchanged. The `h1` on Select Clients and legal pages keeps its tag.
- Item numbers inside sections (capabilities, phases, services) use `.idx`: 13px 600 **`--growth`**, inline before the title. Section counters are `--slate` and sit on the ink rule. The two number systems no longer look alike (B-pages-06).

---

## 4. Page layouts (measurements at 390 unless stated; measured from the render)

### 4.1 Home: 6,961px

| # | Section | Height | Layout |
|---|---|---:|---|
| — | Hero | **608** | `height: clamp(480px, 72svh, 640px)`. Poster-first `<picture>` with a 4:5 crop and the scrim. H1 and lead are bottom-anchored with 32px bottom padding. At 390×844 the first screen shows the hero plus the rule header and the first line of "01 Our Promise": the page tells you there is more. |
| 01 | Our Promise | 777 | The lead at 18px ink, then p2 and p3 at 16px `--ink-2`, with 16px between. "Read More" is a 44px-tall row link with `aria-label="Read More about EdCloud"`, which fixes SEO `link-text` (A-home-05). That label has to be added to the qa:content allowlist. Visible text is unchanged. |
| 02 | Services & Results | 558 | **An exclusive accordion** (see §5.1): three 56px rows. The open row shows the green 22px lead, the 16px body and a 44px "Services & Results" row link. The indicator is the site's own **8px square dot**: filled `--growth` and scaled 1.25 when open, a 1px `--slate` outline when closed. It is not a chevron. |
| 03 | Featured Projects | 1,057 | **A scoreboard ledger.** Four rows. Each row opens with a stat line: the stat (29px green, tabular, min-width 3.4em so the four stats line up in a column) with its caption to the right (13px `--slate`). Then the 17px title and the 16px body. `order:-1` puts the stat first visually. No cards, no shadow. The four stats sit on one aligned axis, so a scan down the column reads $3.5B / $3B / $100M / $500M. |
| 04 | Deliverables | 1,224 | The lead, then **one** 16:9 photo (conference-room crop, lazy), then six ledger rows: `01` inline plus a 17px title, then the full-width 16px description. The photo/list/photo stack is gone. The stairway picture becomes the band below. |
| — | Stairway figure | 140 | A full-bleed 39:14 band (828w crop, lazy). It stays in the DOM, with its alt text, as the breathing moment before the proof sections. |
| 05 | Select Clients | 654 | **A ruled logo table**: a 3-column grid with 1px `--line` gaps on white, so it reads like a printed client list. Tiles are 116×72. Logos are sized by an area model tuned for phones (`sqrt(2200·ratio)`, capped at 100w × 44h): median rendered height 22px, and even 8:1 wordmarks such as GiveCampus render at 100×12px (about 15px type). **18 are visible, and 30 more sit behind "Show all clients 48"** (§5.2). All 48 `<img>` and alts stay in the DOM. |
| 06 | Press | 785 | Ledger rows: the source (13px 600 ink) left and the date (13px `--slate`, tabular) right on one line, then the 17px headline, then a 44px "Read The Full Article" row link. **The newest 3 are visible, and 6 more sit behind "Show all press 9."** "K‑12" uses a non-breaking hyphen in the render layer only (A-home-17). The DOM text of the qa:content snapshot has to match, so the engineer uses CSS `hyphens: manual` plus a `white-space:nowrap` span only if the content check allows it. Otherwise the balance wrap is accepted. |
| 07 | Contact Us | 873 | The rule header, then a 39:14 photo band (the classroom photo drops from 468px to 125px, A-home-12), the H2 in two lines at 26px, and the form. First and last name are **2-up** (165px each, which is fine for names), then email, phone and message go full width. Labels are 14px 600 ink above 48px inputs with 16px text (no iOS zoom). The textarea is 120px (rows 4). The **SUBMIT** pill is full width and 52px, in the thumb zone at the end of the form. |
| — | Footer | 412 | Black, 2 columns (1.25fr/1fr), every link a 44px row. Column 1: Book a Meeting (600), the email, the three address lines (14px), and LinkedIn as a 44×44 target. Column 2: the four nav links. The bar holds the brand and © on 13px 44px rows (fixes A-home-21 and C-cross-10). |

The header over the hero is transparent and 56px tall: the mark, the 13px/0.08em wordmark, and a 44px Menu pill. **Home-only Contact pill:** fixed bottom-right at `bottom: calc(16px + env(safe-area-inset-bottom))`, an ink pill with `--m-elev-2`. It appears once the hero has scrolled out and fades out when `#contact` is on screen or any input has focus (§5.4). See `dense-home-scrolled.png`.

**At 320:** the same structure. The wordmark tail hides visually below 360px (the `span` stays in the DOM). The H1 runs 4 lines, the hero is 480px (the clamp minimum), and logo tiles are 92×72. Height 7,204. No overflow (the render scan checks every element's right edge).
**Landscape 844×390 (`--bp-short`):** the hero drops its fixed height and sizes to its content: 56px of header clearance plus a 32px H1 in 3 lines and a 3-line lead, about 305px. The rule for "01" peeks at the bottom of the first screen (A-home-09, C-cross-14). Content uses the tablet 34em measure.
**Tablet 768/820:** 32px gutters. Prose is capped at 34em and left-aligned, so there is deliberate white space to the right rather than a stretched phone layout. Cases go 2×2 (B-pages-09 style: no stranded card). Capabilities go 2-up. Logos are 4-up with 24 visible. The Deliverables photo is 3:2 at 34em. The services accordion stays in use below 1024, so there is no 160px dead panel (A-home-15). The hero is `clamp(480px, 72svh, 640px)`, which gives 640px at 768×1024 instead of a full 1,180px screen of photo (A-home-18). Home at 768 is 6,595px, against 10,923 at baseline and 9,842 at 1024 (C-cross-24).

### 4.2 Services & Results: 6,874px (`dense-services.png`)

| Section | Height | Layout |
|---|---:|---|
| Hero | 473 | `min-height: clamp(420px, 56svh, 560px)` with a 4:5 crop, the scrim, and the H1 plus a 16px lead bottom-anchored. At 320×568 the proof strip's first row is visible (B-pages-12). |
| Proof strip | 261 | **2×2 ruled grid** on white, with a vertical `--line` hairline between the columns and a horizontal one between the rows. Stat 22–32px green, tabular, `nowrap` ("300 → 1.5M" fits in 155px). Label 14px `--ink-2`. Client 13px 600 ink. At ≥600 it is 4-up in one row, with the labels aligned to the top of the grid (B-pages-16). |
| 01 How an engagement works | 843 | The lead, then three ledger rows: a meta line (`01` green plus "2 to 3 weeks" in `--slate` 600), a 17px title and a 16px body. 3-up from 820. |
| 02 What we do | 2,937 | The lead, then six service entries, each with: `01` inline plus a 20px title, the 16px pitch, the result in 16px 600 ink, and a **spec box**: a `--paper` panel (12/16 padding) holding the `<dl>` with **run-in** `dt` (600 ink) plus `dd` (`--ink-2`), each row wrapping to the full 318px (B-pages-01: the answer column goes from 102–212px to 318px). The markup stays `div > dt + dd`. Only `display: inline` changes, so the semantics are untouched. |
| 03 Results | 1,101 | The table is kept (`<table>` semantics). Below 820, `display:block` rows and `thead` visually hidden (not `display:none`, so the header text stays reachable). Each client block puts the **outcome first** (`order:-1`, 18px 600 green: the punchline), then the client name (17px 600), then run-in `data-label::before` labels ("Where we started:", "What we built:" in 600 ink) with values in `--ink-2`. From 820–1023 it is a real 4-column table with the "What we built" column at `minmax(14em, 1.3fr)` (B-pages-17). |
| 04 Is this a fit | 847 | Two ledger lists, each with a 17px title. Every item is a hairline row with a 20px check (green) or dash (`--slate`) icon in a 20px hanging column, then the 16px text (B-pages-22: 1,097px down to about 690). |
| Footer | 412 | As on home. **No contact pill, no booking CTA, and no Contact row in the menu sheet on this page.** The footer's existing Book a Meeting link is untouched, as the owner asked. |

At 320: 7,585px (the gate is at 390). No overflow.

### 4.3 About: 3,970px measured (`dense-about.png`)

- **Hero:** `min-height: clamp(320px, 44svh, 440px)` with a 4:5 crop of `hero-about` and the H1 "About Us" bottom-anchored. The first screen shows the H1, the rule header and the start of "About EdCloud" (B-pages-12).
- **01 Mission & History:** the H2 "About EdCloud" at 24px, then the intro, **"Our mission" and "How we think about scale" open as prose**, 16px/1.5 at the full measure. Lists use 6px green square bullets (the site's dot, not a new glyph). The **seven remaining subsections** ("Our approach…", "A brief history", "Who we serve", "What success looks like", "How engagements work", "Why now") become **independent disclosures**. Each `h3` wraps a 56px `<button aria-expanded>` whose label is **the existing heading text, so no new copy is needed**. The collapsed rows read as the section's table of contents, which removes the need for a separate TOC. Panels use `hidden="until-found"`, so find-in-page and text fragments open them (B-pages-04: a 6,011px prose wall becomes about 2,100px).
- **02 Managing Partner:** an 88×88 square headshot (`object-position: top`) beside the H2 "About Aaron Sokol", then the two paragraphs at full width. From 820 up, the headshot moves to a 240px column (B-pages-15).
- **03 By The Numbers:** four ledger rows in a `4.25rem | 1fr` grid, with the stat (29px green, tabular) on the left and the title plus body on the right. There is no negative offset, so the content starts on the gutter (B-pages-14). 2×2 from 600.

Without any disclosure, About at full measure measures about 6,450px. That passes, but only just. The disclosures buy about 2,500px of headroom.

### 4.4 Legal pages (Privacy Policy, Accessibility Statement)

The rule header carries the counter plus the **H1 at `--m-t-display`**, set 32px above the rule, as a page title (B-pages-10: the H1 is now clearly above the H2s). Section `h2`s use the About `.proseH3` treatment: a 17px title with a `--line` hairline above it and 32px of space before. Lists use green square bullets. The pages stop importing `about.module.css` and get `legal.module.css` (B-pages-19). The contact emails become `mailto:` links with 44px rows (B-pages-18, P2). That needs an href allowlist entry in qa:content. Estimated heights: Privacy about 3,300px and Accessibility about 1,950px at 390.

---

## 5. Interaction patterns

### 5.1 Home services: exclusive accordion without duplicating the DOM

Today `ServicesTabs` renders the titles plus **one** panel holding the active service's text, and qa:content snapshotted exactly that. The Ledger keeps that DOM and **moves the single panel under the active row with CSS grid**. The `<ol>` and `<li>`s get `display: contents` below 1024. The panel gets `grid-row: var(--panel-row)`, where `--panel-row` is set inline from `active + 2`. So there is no duplicated text, and the desktop DOM and pixels are identical.

- Each button carries `aria-expanded={isActive}` and `aria-controls="svc-panel"` (on desktop too: invisible, and better than `aria-pressed` alone). The panel has `role="region"` and `aria-labelledby` pointing at the active button. After a user tap (not on load), focus stays on the button and the panel fades in over 200ms.
- `onMouseEnter` activation only fires under `matchMedia('(hover: hover) and (pointer: fine)')`, so touch never triggers it by hover (A-home-20).
- States: closed row in `--ink-2` 600 with the outline dot. Open row in `--ink` with the filled green dot. `:active` makes the row text `--growth-ink`. Focus is the existing 2px green outline with a 2px offset.
- The mockup uses one panel per row, which is a markup convenience. The production spec is the single moving panel above.

### 5.2 "Show all" (Press and Clients): a real `<button>` over an in-DOM list

- The markup is unchanged: all 9 press `<li>` and all 48 logo `<li>` are server-rendered. The new element is a `<button type="button" aria-expanded="false" aria-controls="press-list">` labelled "Show all press" or "Show all clients" plus a tabular count that comes from `content.length`. When expanded, the label becomes "Show fewer". These three strings are the only additions for qa:content's allowlist. The button is `display:none` at ≥1024.
- **Collapse without layout shift, and with a no-JS fallback:** below 1024, `@media (scripting: enabled)` hides items after the threshold (`:nth-child(n+4)` for press; `n+19` for logos on phones, `n+25` on tablets) until the list has `data-open`. With scripting disabled, everything shows and the button is hidden. After hydration, the client component swaps the CSS collapse for `hidden="until-found"` on the same items and listens for `beforematch`, so Ctrl-F and `#:~:text=` links open the list and set `aria-expanded="true"`. Collapsed items drop out of flow (`position:absolute; padding:0; border:0`), so they leave no stray hairlines. This was a real bug found in the first render and fixed.
- On expand, focus moves to the first revealed item's link (press) or stays on the button (logos), and the new rows fade in over 200ms. Collapsed logo `<img loading="lazy">` never load until they are revealed, which saves about 60 KB on first load.

### 5.3 Header (56px) and menu sheet

- **Header:** 56px plus `env(safe-area-inset-top)`, transparent over heroes, and solid white with `--m-elev-1` after `scrollY > 40`. The existing logic is kept. The solid state is a **background-colour change only**, with no height change, so there is no layout shift. Sticky, with no hide-on-scroll (fewer moving parts, zero CLS). `--nav-h` is overridden to 56px below 1024, so the hero's `margin-top` and `scroll-padding-top` follow. The collapse point moves from 820 to **1024**, so touch tablets at 820–1023 get the Menu pill instead of 18px links (C-cross-11).
- **The sheet (`dense-menu.png`):** `role="dialog" aria-modal="true" aria-label="Menu"`. It is full height (`100dvh`, `overflow-y:auto`, `overscroll-behavior:contain`) on a `--paper` background, and its header row mirrors the site header with the button reading "Close" in the same spot.
  - Primary rows: Home, About, Services & Results, each 56px tall, in 24px 600 ink, separated by hairlines. The current page gets the filled green square dot and `aria-current="page"`.
  - Secondary row: Privacy Policy and Accessibility, 48px tall, in 15px 600 `--ink-2`.
  - Pinned to the bottom (`margin-top:auto`, in the thumb zone) under an ink rule: **home only**, a "Contact" link to `#contact`, which closes the sheet and then jumps. On every page: `info@edcloud.org` (mailto) and "Tel: 510-306-2403". **No Contact and no booking on /services-and-results.**
  - Behaviour: the trigger has `aria-expanded` and `aria-controls="mobile-menu"`. Opening sets `inert` on `<main>` and `<footer>` and traps focus (Tab and Shift-Tab cycle between the first and last focusable). Esc closes. So does tapping any link, or crossing to ≥1024. Focus returns to the trigger. **iOS-safe scroll lock:** `body { position:fixed; top:-scrollY; width:100% }` on open, then restore and `scrollTo` on close. Motion: `opacity 0→1` and `translateY(-8px→0)` over 240ms with `--m-ease`. Reduced motion shows it instantly. In landscape (390 tall) the sheet scrolls, so every link is reachable (C-cross-01, C-cross-02).

### 5.4 Home-only Contact pill

`<a href="#contact" class="pill">Contact</a>` is rendered **only by `app/page.tsx`**, so it can never ship on Services. An IntersectionObserver on the hero shows it once the hero leaves the screen. A second observer on `#contact` hides it while the form is on screen. `focusin` on any input hides it too, so it never sits over the keyboard (it is fixed, and hidden whenever an input has focus). Show and hide use `opacity` plus `translateY(12px)` over 200ms. It is `display:none` at ≥1024. Right-aligned and 44px tall, it covers at most one line-end of text. It is fixed with `env(safe-area-inset-bottom)` padding. This resolves C-cross-03 on home. Other pages reach Contact through the email and phone in the menu sheet footer.

### 5.5 Form

The fields, names, `required`, the endpoint and submit behaviour are unchanged. Additions: `autocomplete` (given-name, family-name, email, tel), `inputmode` (email, tel), and `enterkeyhint` ("next" on the four inputs, "enter" on the message box). Inputs are 48px, with a 16px font, a 1px `--slate` border and a 2px green `:focus-visible` outline (the existing ring) in place of `outline:none` (C-cross-12, C-cross-13). The textarea has `rows` 4 and a 120px minimum height. The status `role="status"` line stays under SUBMIT.

### 5.6 Semantics kept

Heading order and landmarks are unchanged, and the `<table>` stays a table. Accordion and disclosure buttons live inside their `h3` (the heading-plus-button pattern), so the heading outline is unchanged. Every interactive element is at least 44×44 with at least 8px to its neighbour: row links have 44px min-height, and consecutive rows are separated by padding plus hairlines. The 2px green focus ring is kept everywhere. Content reflows at 320 with 200% zoom, because nothing has a fixed height except the hero, and the hero `clamp` uses `svh` with a `min-height` fallback.

---

## 6. Image and video strategy

- **Crops**: a committed script, `scripts/images/build-mobile-crops.py` (Pillow, like `scripts/icon/` and `scripts/logos/`), writes `public/images/m/<name>-<w>.webp` at **480 / 828 / 1170** widths with q≈74:
  - `hero-poster`, `hero-services` and `hero-about` at **4:5** (focal x = 0.60 / 0.40 / 0.44, full height). Tablet 3:2 crops at 1200/1600 serve 600–1023.
  - `conference-room` at 16:9 (phones) and 3:2 (tablets). `stairway` and `classroom-lecture` as 39:14 bands.
  - Measured on the mockup crops: hero 4:5 at 828w is **36 KB**, against 111 KB for today's 1920 poster. Services hero 68 KB against 168 KB. Stairway band 19 KB against 84 KB. Conference 16:9 53 KB against 158 KB.
- **Markup**: `<picture style="display:contents">`, with `<source media="(width < 600px)" srcset="…480w, …828w, …1170w" sizes="100vw">` and a tablet source, and the **existing `<img>` unchanged as the fallback for ≥1024**, so desktop decodes the same file into the same box. `display:contents` on `<picture>` means the `img` keeps its current CSS box on desktop (desktop-freeze critical, and proven by qa:desktop-parity). Explicit `width`/`height` on every source.
- **LCP**: the hero image is the only element with `fetchpriority="high"`, on all three hero pages. About and Services get it too, which they lack today (B-pages-08, C-cross-08). Everything below the fold is `loading="lazy" decoding="async"`. Non-lazy below-fold images are what made React emit `<link rel=preload>` for three home photos and what made `/` prefetches pull 404 KB onto subpages (C-cross-04, C-cross-05, B-pages-07). Below 1024, the `rise` reveal on the hero H1 is removed, so the text LCP is not held back by a 600ms animation (A-home-03). Media Engineer: evaluate `experimental.inlineCss` to remove the 2 render-blocking CSS files.
- **Video, poster first**: on phones (<600) `HeroVideo` does not mount until `load` plus `requestIdleCallback`. It never mounts under `prefers-reduced-motion`, under `navigator.connection.saveData`, or when `effectiveType` is not "4g". When it does mount, it uses a **mobile encode**: 540×676 portrait, 12s, WebM VP9 plus MP4 H.264, about 600 KB, down from 3.15 MB (C-cross-06). It fades in over the poster via `opacity` (240ms) once `canplaythrough` fires. No pause control, as the owner decided.

Expected home first load at 390 (excluding the deferred video): today it is 621 KB. With the 36 KB hero crop, 30 lazy logos not loaded, and lazy photos loading only when reached, the first-load image transfer is under 100 KB, so the total comes to roughly 260–300 KB (≤ 50% of today, which meets the ≤ 60% gate). JS grows by about 1.2 KB gz (the disclosure and show-all hook plus the sheet's focus trap, both in existing client components).

---

## 7. Page heights: estimate against target (390)

| Page | Baseline | Ledger (measured on mockup) | Target | Headroom |
|---|---:|---:|---:|---:|
| Home | 12,065 | **6,961** | ≤ 8,500 | 1,539 |
| Services & Results | 9,867 | **6,874** | ≤ 7,000 | 126 |
| About | 9,153 | **3,970** (about 6,450 with every subsection open) | ≤ 6,500 | 2,530 |
| Privacy Policy | 3,841 | about 3,300 (estimate) | — | — |
| Accessibility | 2,370 | about 1,950 (estimate) | — | — |

No content is removed. Every string and image in the DOM is still there. On Services the margin is thin (126px). If implementation adds to it, the first lever is service padding (`--s-5` down to `--s-4` over 6 rows, 48px). The second is the spec-box padding.

---

## 8. Audit findings resolved (P0 and P1)

| Finding | Resolved by |
|---|---|
| A-home-01, B-pages-03, C-cross-09 (contrast) | **Waived by the owner.** Palette untouched. |
| A-home-02, C-cross-10 (tap targets) | 44px row links everywhere, the 44px Menu pill, a 44px LinkedIn box, footer rows (§4.1, §5.6) |
| A-home-03, C-cross-04/06/07 (LCP, bytes, video) | 4:5 crops plus srcset, only the hero eager, no `rise` on phones, video deferred with a mobile encode (§6) |
| A-home-04, B-pages-02 (length) | 6,961 / 6,874 / 3,970 measured (§7) |
| A-home-05 (link-text) | `aria-label` on Read More (§4.1) |
| A-home-06, A-home-15 (Services panel squeeze and dead space) | Full-width accordion below 1024 (§5.1) |
| A-home-07, A-home-08 (logos unreadable, wall too tall) | Ruled 3-up table (4-up on tablet), phone area model, 18 visible behind Show all (§4.1, §5.2) |
| A-home-09, C-cross-14, B-pages-12 (heroes overflow the first screen) | `svh` clamps and the `--bp-short` content-sized hero (§4) |
| A-home-10 (soft poster) | 1170w crop for DPR-3 phones (§6) |
| A-home-11 (cases 1,957px) | Scoreboard ledger, 1,057px (§4.1) |
| A-home-12 (contact photo) | 39:14 band, 125px (§4.1) |
| A-home-13, B-pages-05, C-cross-15 (counter column) | Rule header (§3) |
| A-home-14 (press 1,963px) | 3 visible plus Show all, 785px (§5.2) |
| B-pages-01 (For/How/When crushed) | Run-in `dl` at full width in a spec box (§4.2) |
| B-pages-04 (About prose wall) | Heading-button disclosures, no new copy (§4.3) |
| B-pages-06 (item vs section numbers) | Green inline `.idx` against the slate counter on the rule (§3) |
| B-pages-07, C-cross-05 (subpages pull Home photos) | Lazy below-fold images, so no preload hints (§6) |
| B-pages-08, C-cross-08 (subpage LCP) | `fetchpriority` plus crops, and inline CSS evaluated (§6) |
| B-pages-09 (stranded tablet items) | 2×2 cases and numbers, 4-up proof, 3-up phases only from 820 (§4) |
| B-pages-10 (legal H1 = H2) | Display-size H1 (§4.4) |
| B-pages-11 (Results labels) | Contrast waived. Labels become 600 ink run-in text (§4.2) |
| B-pages-13, C-cross-23 (15px body) | 16px floor for running copy (§2.1) |
| B-pages-14 (numbers break the left edge) | Ledger rows on the gutter (§4.3) |
| C-cross-01, C-cross-02 (menu) | Full-height scrollable sheet: focus trap, Esc, inert, iOS scroll lock (§5.3) |
| C-cross-03 (Contact unreachable) | Home Contact pill plus a menu-sheet row (home). Email and phone in the sheet elsewhere (§5.3, §5.4) |
| C-cross-11 (touch tablets get the desktop nav) | Collapse at 1024 (§5.3) |
| C-cross-12, C-cross-13 (form) | `--slate` border, 2px ring, autocomplete, inputmode, enterkeyhint, 48px fields, rows 4 (§5.5) |
| C-cross-16 (video pause) | **Waived by the owner.** |

P2s also covered: A-home-16/17/18/19/20/21, B-pages-15/16/17/18/19/20/22, C-cross-17/18/19/20/21/22/24 (safe-area insets on the header, sheet, pill and footer, and `viewport-fit=cover`). B-pages-21 (white hero text) is contrast and waived, although the bottom-weighted scrim helps anyway.

---

## 9. Desktop-freeze safety

1. **Tokens:** every new token is declared inside `@media (width < 1024px) { :root { … } }`. Existing tokens are not edited. Where phones need a different value (`--nav-h: 56px`, `--counter-col`), it is overridden in that same block, so desktop computed styles are byte-for-byte what they were.
2. **Rules:** every new or changed declaration in a CSS Module lives in a `@media (width < 1024px)` block, or in `(width >= 600px) and (width < 1024px)` for tablet, at the end of the module. Old phone patches (`max-width: 359/439/599/799/819/820/899`) are **moved** into those blocks. The desktop cascade never sees them, because at ≥1024 every one of them evaluated false already. `max-width: 1087px` is kept exactly, because it applies inside the frozen range. The breakpoint lint (§2.3) rejects any new query that could match ≥1024.
3. **DOM:** the only additions are (a) `<picture style=display:contents>` around existing `<img>`s, (b) two Show-all buttons and the Contact pill, which are `display:none` at ≥1024, (c) ARIA attributes, and (d) the menu sheet, which already only renders below the collapse point. None of these produce a box at ≥1024. ServicesTabs keeps its DOM (§5.1). About's disclosure buttons wrap existing `h3` text and are styled `all: unset` plus `display: contents`-equivalent at ≥1024: the button is `font: inherit; color: inherit; padding:0; border:0; background:none; display:inline`, and its panel is never `hidden` at ≥1024. The disclosure hook only applies `hidden` when `matchMedia('(width < 1024px)')` matches, and CSS forces `display:block` on the panels at ≥1024.
4. **Proof:** `npm run qa:desktop-parity` (1024/1280/1440, pixelmatch 0.1, zero pixels) runs in every engineer's hand-off. In addition, `qa:content` confirms that the only DOM text additions are "Show all press", "Show all clients", "Show fewer", the count digits and the Read More `aria-label`.

---

## 10. Risks and open questions for the judges

- **Services headroom is 126px.** Measured with the real copy, but a single extra line of padding per service would use it up. §7 lists the levers.
- **Disclosure count:** four patterns (the services accordion, Show-all ×2, and About's subsections). All four use one visual language: a hairline row plus the square dot or a pill button. The judges should weigh whether About's seven collapsed subsections are too aggressive. The page passes open (about 6,450).
- **`hidden="until-found"`** is supported in Chromium and in Safari 18.4 and later. On older Safari it falls back to `hidden`, where the button still works but find-in-page cannot reveal the content. That is acceptable, and the content is in the DOM for crawlers either way.
- **The Contact pill** covers at most one line-end while reading. It is hidden over the form and during input focus. Check on a real device that the iOS keyboard and the address-bar resize do not make it jump (it is fixed with a safe-area inset and `focusin` hides it).
- The logo area model makes the extreme wordmarks (8:1) 12px tall. That is readable as type (about 15px), but the "under 24px tall" metric in A-home-07 will still flag the widest wordmarks (8 logos render under 20px tall). Propose changing the lint to measure the width of wide wordmarks instead (≥ 88px).
