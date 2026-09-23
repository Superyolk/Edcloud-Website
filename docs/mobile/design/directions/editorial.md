# Direction A: "Editorial"

*A premium printed report, set for a phone.*

Designer brief: magazine rhythm, generous type, calm. This document is the whole argument. The mockups are in `mock/` (`home.html` and `about.html` are generated from the real `content/copy.ts` and `content/content.js` by `mock/build.mjs`, so no string is retyped). The renders sit next to this file:

| File | What it is |
|---|---|
| `editorial-home.png` | Home at 390 wide, DPR 2, full page: **8,385px** tall |
| `editorial-home-320.png` | Home at 320 wide: 8,853px, `scrollWidth == clientWidth` (no overflow) |
| `editorial-about.png` | About at 390 wide: **3,925px** tall |
| `editorial-about-320.png` | About at 320 wide: 4,318px, no overflow |
| `editorial-home-states.png` | Three 390×844 frames: first screen, the menu sheet open, and mid-page with the Contact dock showing |

The render script measured zero elements past the viewport edge and zero text nodes under 13px at 390 and 320.

Owner decisions applied today: palette contrast is out of scope, so no token changes (A-home-01, B-pages-03, B-pages-11's contrast part and C-cross-09 are waived). The hero pause control (C-cross-16) is out of scope. The poster-first approach, with no video on phones, still applies, as a performance item.

---

## 1. The idea

The desktop site is a confident corporate page: a full-bleed video, white type over it, and numbered sections in a gutter. Squeezed onto a phone, that becomes a video that eats the first screen, and then twelve thousand pixels of narrow indented columns.

Editorial doesn't shrink the desktop. It **re-sets the same content the way a well-made annual report or a long-read magazine sets it**, on the page itself:

1. **Type leads and photographs punctuate.** Every page opens with its headline set large in ink on the paper colour, with the standfirst beneath it. The photograph follows as a full-bleed **plate**, the way a print feature places its opening image. Nothing is laid over a photo, so reading never depends on the image.
2. **Folios, not gutters.** The desktop's `01` counter column becomes a running **folio**: a small tabular numeral, a hairline to the margin, and the chapter title beneath at display size. Text runs the full measure (390 − 2×24 = 342px, 40–46 characters a line at 16px).
3. **Hairline rules instead of cards and shadows.** Lists are set as ledgers: a 1px ink rule opens each block and 1px `--line` hairlines separate the rows. The desktop's 2px ink top rule on the services phase cards is the one existing motif that already reads as print, so it becomes the system. Shadows appear once, on the floating Contact dock, because it floats.
4. **The number is the headline.** Stats (`$3.5B`, `22`, `30 → 550`) are set as 48–72px green figures with a caption set beside them, like a figure in a report. They come first visually in each ledger entry.
5. **Calm disclosure, never hiding.** Long runs of parallel items (the three services, the eight About chapters, the six services on the Services page, press, clients) are shown partly open, with the rest one tap away. All of it stays in the DOM, and `hidden="until-found"` keeps it reachable by find-in-page.

Brand primitives only: the existing colour tokens, Instrument Sans at weights 400 and 600, square corners (`--radius: 0`), and pills for buttons. The one "new" visual element is a 40×2px `--growth` bar above each page's H1: a colour and shape already in the system, used as a printer's mark.

---

## 2. Tokens

The tokens are added to `app/tokens.css` inside the phone/tablet layer (§8), so none of them exists at ≥1024px. The names use an `m-` prefix so they can never collide with the frozen desktop tokens.

### 2.1 Type: one fluid scale, from 320 up to 1023

| Token | Value | 320 | 390 | 768 | Use |
|---|---|---|---|---|---|
| `--m-caption` | `0.8125rem` | 13 | 13 | 13 | folios, press meta, table labels (floor) |
| `--m-small` | `0.875rem` | 14 | 14 | 14 | stat captions, form labels, footer bar |
| `--m-body` | `clamp(1rem, 0.9rem + 0.5vw, 1.0625rem)` | 16 | 16.4 | 17 | all body copy, line-height 1.55 |
| `--m-lead` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` | 20 | 20 | 22.2 | standfirsts, line-height 1.4, ink |
| `--m-h3` | `clamp(1.1875rem, 1.1rem + 0.4vw, 1.375rem)` | 19 | 19.2 | 20.7 | entry, row and disclosure titles |
| `--m-deck` | `clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)` | 22 | 22.3 | 25.3 | the green service deck (the desktop `--t-display` role) |
| `--m-section` | `clamp(1.875rem, 1.4rem + 2.2vw, 2.5rem)` | 30 | 31 | 39.3 | chapter titles (h2) |
| `--m-stat` | `clamp(3rem, 2rem + 5vw, 4.5rem)` | 48 | 51.5 | 70 | ledger figures |
| `--m-hero` | `clamp(2.125rem, 1.25rem + 4vw, 3.5rem)` | 34 | 35.6 | 50.7 | home H1, line-height 1.08, letter-spacing −0.02em |
| `--m-title` | `clamp(2.5rem, 1.6rem + 4.4vw, 4rem)` | 40 | 42.8 | 59.4 | About, Services and legal H1s |

Rules:
- **Nothing is smaller than 13px, and body is ≥16px** (this closes A-home-16, B-pages-13, C-cross-23 and C-cross-18; the header wordmark goes from 12px to 13px).
- Headings use `text-wrap: balance` and body uses `text-wrap: pretty`. The home H1's `<br>`s get `display:none` on phones, so balance can set the line breaks. The DOM text is unchanged, and the `" <br>"` space already gives a word boundary. At 375 the H1 sets in **4 lines** ("We Bring Great / Education / Companies to / National Scale."), with no orphan.
- Measure: body at 342px is 40–46 characters a line on phones. On tablets the text column is capped at `--m-measure: 38rem` (about 62 characters), which closes C-cross-19 and B-pages-20.
- Weights are 400 and 600 only. Uppercase appears only on press meta (13px, 600, tracking 0.06em) and the wordmark.

### 2.2 Space: a 4px scale

`--s-1 4 · --s-2 8 · --s-3 12 · --s-4 16 · --s-5 20 · --s-6 24 · --s-8 32 · --s-10 40 · --s-12 48 · --s-14 56 · --s-16 64 · --s-20 80`

| Semantic token | Phone | Tablet |
|---|---|---|
| `--m-gutter` | 24px (20px below 360) | 40px |
| `--m-section-y` (chapter padding, top and bottom) | `--s-12` 48 | `--s-16` 64 |
| folio to title | `--s-3` 12 | `--s-3` |
| title to body | `--s-6` 24 | `--s-8` |
| between ledger entries | `--s-8` 32 | `--s-10` |
| row padding (rows, press, capabilities) | `--s-5` 20 | `--s-6` |
| `--m-header-h` | 56 | 64 (the tablet keeps the phone header, one size up) |
| `--m-tap` | 44 min; 48 for pill buttons and inputs; 64 min for disclosure rows | same |

The header gutter and the content gutter are now the same token, so their edges line up (C-cross-17).

### 2.3 Breakpoints: one scale

CSS custom properties cannot be used inside media queries, so the scale is written as **three literal query strings, and nothing else is allowed**. They are documented in `tokens.css`, and the mobile-lint job greps for any other `@media` width in the phone/tablet layer:

| Name | Query | Covers |
|---|---|---|
| `--bp-narrow` | `(max-width: 359.98px)` | 320–359: 20px gutter, the wordmark drops its "VENTURE PARTNERS" tail, the form stacks first and last name |
| `--bp-mobile` (the layer) | `(max-width: 1023.98px)` | every phone and tablet rule lives inside this; **≥1024 is never matched** |
| `--bp-tablet` | `(min-width: 600px) and (max-width: 1023.98px)` | 600–1023 (768 and 820 portrait, and phones in landscape wider than 600) |
| `--bp-short` (feature) | `(max-height: 500px) and (orientation: landscape)` | 844×390 and similar |

Phones (320–599) are the base of the layer, and tablet rules refine them. The patch queries (359, 439, 599×4, 799, 819/820 and 899) are deleted: every one of them applies only below 1024, so deleting them cannot move a desktop pixel. **The 1087px query stays exactly as it is**, because it paints 1024–1087, which is frozen territory. Where its rules would leak below 1024, the mobile layer overrides them later in source order. The header's JS query moves from `(max-width: 819px)` to `(max-width: 1023.98px)`, so touch tablets at 820–1023 get the menu instead of 14px desktop links (C-cross-11 and C-cross-21).

### 2.4 Radii, elevation, motion

- **Radii:** `--m-radius: 0` everywhere (brand) and `--m-radius-pill: 999px` for buttons and the dock only.
- **Elevation (three levels, mostly flat):**
  - `e0`: `1px solid var(--line)`, the hairline.
  - `e1`: `1px solid var(--ink)`, the ledger's opening rule.
  - `e2`: `0 6px 24px rgba(27,36,49,.18)`, used only by the Contact dock. It is the existing `--shadow-card` ink at a larger blur, because the dock floats over content. The menu sheet is a full plane and needs no shadow.
- **Motion:** one easing token, `--m-ease: cubic-bezier(.2,.7,.2,1)`, which is the existing `--ease`, reused. Three durations:
  - `--m-dur-press` 150ms (`:active` scale 0.98 plus opacity 0.8)
  - `--m-dur-open` 200ms (the disclosure icon rotates; the panel fades in on opacity and `translateY(4px)`)
  - `--m-dur-sheet` 250ms (the menu sheet: `translateY(-8px)` plus opacity; the dock: `translateY(16px)` plus opacity)

  Only transform and opacity animate. No height animation; panels appear in place. Under `prefers-reduced-motion: reduce` every duration becomes 0ms. There is no parallax and no scroll-jacking.
- **Tap:** `-webkit-tap-highlight-color: transparent` is set on `body`, and every control gets a deliberate `:active` state instead: buttons scale to 0.98, links go `--growth`, and disclosure rows tint their title green (C-cross-20). Hover rules are wrapped in `@media (hover:hover)` in the mobile layer, so taps don't leave sticky hover states.

---

## 3. The chapter header ("folio"): replacing the counter column

```
01 ───────────────────────────────────   13px/600, tracking .08em, --slate, tabular; ::after hairline flex:1 in --line
Our Promise                               --m-section (31px at 390), 600, ink, lh 1.1, ls -0.015em, balance
                                          24px
[body at the full 342px measure]
```

- `SectionShell` keeps its markup: the counter `<span>` and the heading `<Tag>` stay siblings in `.head`, and heading order is unchanged. In the mobile layer, `.head` becomes `display:grid` (row 1 is the counter plus its `::after` rule, row 2 is the title), and `.body` becomes `display:block` with its empty `<span aria-hidden>` set to `display:none`. That span holds no content, so this is allowed.
- The counter stays readable as text ("01 Our Promise" in reading order), the same as today.
- This is the root fix for A-home-13, B-pages-05, C-cross-15 and B-pages-14: the left and right margins are both 24px, and no nested inset is left. On the Services page the six service items use a different numeral treatment from the section folios (§6.3, B-pages-06).

---

## 4. Header and menu sheet

### Header (all pages, <1024)
- **Size:** 56px tall, `position: sticky; top: 0`, with `padding-top: env(safe-area-inset-top)` and side padding `max(var(--m-gutter), env(safe-area-inset-left/right))`.
- **Always solid** `--paper` on phones. Because the hero type sits on paper (§5.1), no transparent-over-video state is needed, and the old 540ms fade and its layout thrash both go. A 1px `--line` bottom border appears once `scrollY > 0` (a class toggle only, so there is no layout shift).
- **Left:** a 24px mark plus the wordmark at 13px, 600, tracking 0.08em, as a ≥44px-tall link. Below 360 only "EDCLOUD" shows.
- **Right:** "Menu" as text at 15px/600, in a 44×56 target with no border, which reads more editorial than a pill. Its `:active` state is green.

### Menu sheet (the "contents page")
Frame 2 of `editorial-home-states.png` shows it.

- **Structure:** a `<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">` rendered as a fixed full-height plane, `inset:0; height:100dvh`, `--paper` background. It repeats the 56px header row, with **"Close"** in the Menu position.
- **Primary rows:** the `mobileMenu` pages (Home, About, Services & Results) plus the `navLinks` Contact. Each is set at `--m-section` (31px) ink 600, in a 72px row with a hairline below, and a CSS-counter numeral (`01–04`, 13px slate, generated content, so no new DOM text). The current page gets `aria-current="page"` and is set in `--growth`.
- **Secondary row:** Privacy Policy and Accessibility at 15px/600, `--ink-2`, each 44px tall and 24px apart.
- **Pinned contact line** at the bottom: the `info@edcloud.org` link and the "Tel: 510-306-2403" text, reused from `SHARED.footer`. It is not a booking link, so it is safe on /services-and-results.
- **Behaviour:**
  - Opening moves focus to the first link.
  - Tab and Shift+Tab are trapped inside the dialog, and the Close button is part of the cycle.
  - Esc closes the sheet and returns focus to the trigger.
  - `aria-expanded` and `aria-controls="mobile-menu"` sit on the trigger.
  - The body scroll lock is iOS-safe: store `scrollY`, set `body{position:fixed; top:-Ypx; width:100%}`, and restore on close. The sheet's own list gets `overflow-y:auto; overscroll-behavior:contain`.
  - Crossing 1024 closes the sheet. Tapping a link closes it.
  - Motion: `--m-dur-sheet` 250ms (translate plus opacity), none under reduced motion.
- **Fit:** the sheet scrolls internally, so at 844×390 every row is reachable. It needs 56 + 4×72 + 68 + 96 ≈ 510px, and the nav list scrolls inside a 390px-tall sheet with the contact line pinned (C-cross-01 and C-cross-02).
- **Contact below 820** (C-cross-03) is reachable from the sheet on every page.

---

## 5. Home, section by section (measured in the 390 mockup)

| # | Section | 390 height | Baseline at 390 |
|---|---|---:|---:|
| – | Header | 56 | 64 |
| – | Hero (cover plus plate) | 713 | 844+ |
| 01 | Our Promise | 935 | ~1,560 |
| 02 | Services & Results | 665 | ~1,150 |
| 03 | Featured Projects | 1,278 | 1,957 |
| 04 | Deliverables | 1,523 | ~2,050 |
| – | Stairway plate | 156 | ~190 |
| 05 | Select Clients | 899 | ~1,500 |
| 06 | Press | 793 | 1,963 |
| 07 | Contact | 949 | ~1,250 |
| – | Footer | 418 | ~520 |
| | **Total** | **8,385** (target ≤8,500) | 12,065 |

At 320 the total is 8,853. The gate is set at 390, and 320 carries narrower lines by design.

### 5.1 Hero: the cover
- **Order and spacing:** a 32px top pad, the 40×2 green mark, 24px, then the H1 at `--m-hero` (4 lines at 375 and 390, 4 lines at 320). Then 20px and the hero `p` as the dek (18px/1.5, `--ink-2`, `max-width: 36ch`, 7 lines). Then a 32px pad and the **plate**: the poster at 3:2, full-bleed, 390×260.
- **DOM and CSS:** the markup is unchanged: `img` and `video` layers, the overlay and `.heroInner`. On <1024 the section becomes `display:flex; flex-direction:column`:
  - `.heroInner` gets `order:0` and switches from white on photo to ink on paper.
  - The poster `img` gets `order:1; position:static; aspect-ratio:3/2`.
  - The overlay is `display:none`, since it is decorative and empty.
- **Video:** the `<video>` is not rendered below 600px (see §7). Frame 1 of the states image is the first screen: the whole headline and dek, and the top 60% of the plate, so the page plainly continues (C-cross-14, A-home-09, A-home-18).
- **Landscape (`--bp-short`):** two columns, with the cover text left (55%) and the plate right (45%, 4:5 crop, `max-height: calc(100svh - 56px)`), so the hero is exactly one screen.
- **Tablet:** the cover gets `--m-gutter` 40, the H1 at 51px on 3 lines, the dek at `max-width: 34rem`, and the plate at 16:9, 768×432. The video may play in the plate (§7).

### 5.2 01 Our Promise
- The `promise.lead` is a standfirst: `--m-lead` 20/28, ink, 9 lines. `p2` and `p3` follow at body size, 16px apart.
- "Read More" is an ink 600 text link with `min-height: 44px`; no arrow and no underline. It carries `aria-label="Read More about EdCloud"`, and the added words go into `scripts/qa/content-allowlist.json`. That fixes SEO `link-text` (A-home-05) while the visible copy stays unchanged.
- The whole section stays open. It is the firm's thesis and should read as prose.

### 5.3 02 Services & Results: a numbered disclosure list (replaces the hover tabs)
- **Structure:** an ink rule opens the list (`e1`). Three rows, each `<h3><button aria-expanded aria-controls>`, at least 64px tall:
  - a CSS-counter numeral (32px column, 13px slate)
  - the title at `--m-h3`
  - a 14px plus/minus drawn with two CSS bars, which rotates on open (200ms). It is not an arrow or a chevron.
- **Panel:** an open row's title turns `--growth`. The panel (`role="region"`, indented 40px to the title's left edge) holds the lead at `--m-deck` 22px green 600, then the rest at body size (the same `split()` as today).
- **Default state:** the first row is open. Opening one row does **not** close the others, so users can compare. That is simpler and more forgiving than a single-open accordion.
- The "Services & Results" link sits after the list. The section is on white, which alternates paper and white bands like the pages of a report.
- **DOM change, needed for phones:** today only the active service's body is in the DOM. The component renders **all three panels**, inside their `<li>`, after each button.
  - **Desktop:** the `<li>`s are `display:contents` and the grid positions the panels in the right-hand column. Inactive panels are hidden with the `hidden` attribute, which is what the desktop's click and hover already swap. Desktop parity is proven by the gate.
  - **Phone:** hover activation is disabled (`matchMedia('(hover:hover)')` guards `onMouseEnter`), and changes are announced through `aria-expanded` (A-home-20, A-home-06, A-home-15).
- **Tablet:** the same list, with the panel at `max-width: 38rem`. The dead space goes (A-home-15).

### 5.4 03 Featured Projects: the ledger (stacked, and chosen over a rail)
Each case is an entry: a 1px ink rule, 20px, then the **figure row**:
- `stat` at `--m-stat` 51px green 600, line-height 0.9, tabular, and `statLabel` at 14px `--ink-2`, bottom-aligned beside it (`grid-template-columns:auto 1fr`)
- 20px, the title at `--m-h3`, 8px, and the body at 16px. Entries are 32px apart.

The figure comes first visually through `order:-1`. The DOM order (title, body, stat) is unchanged, so screen readers still hear the story first. The stat is supplementary, so reading sequence is not harmed; this is noted for the a11y critic.

*Why not a rail:* a rail would save about 600px, but it hides three of the four biggest proof points behind a gesture, and horizontal swipes on a reading page break the calm vertical rhythm this direction is built on. The ledger removes the card chrome (padding, shadows and the 44px indent) and goes from 1,957 to 1,278px (A-home-11). On tablets it becomes a 2×2 grid with a 40px gap (1,116px at 844 wide).

### 5.5 04 Deliverables: one photo, one list
- **Order:** the standfirst lead (4 lines), then **one** full-bleed plate (the conference-room photo at 16:9, 390×219, lazy), then the list.
- **List:** an ink-ruled ordered list of six rows. Each row has the `capabilityIndex` numeral (13px green 600) in a 32px column, the title at `--m-h3`, and the description at 16px, with hairlines between rows and 20px row padding.
- This replaces the photo, list, photo stack (A-home-19). The **stairway figure** that follows becomes a 5:2 full-bleed plate (390×156, lazy): a deliberate breather between the "what" and the "who".
- **Tablet:** the list is 2 columns × 3 rows, and the plate is 21:9.

### 5.6 05 Select Clients: the credits grid
- A 2-column grid with hairline cell borders (the print "credits" look). Cells are 171×80, and logos use a phone version of the equal-area rule: `LOGO_AREA_M = 4200`, width capped at 139 and height at 52. The widest wordmarks are about 17–20px tall, and most logos are 26–52px, so A-home-07 is fixed (today 27 of 48 are under 24px).
- **Disclosure:** 16 logos (8 rows) are visible. Then a full-width pill `<button aria-expanded="false" aria-controls="client-logos">`, labelled "Show all clients" or "Show fewer clients" (new UI strings, added to the allowlist). It reveals the other 32 in place, and focus stays on the button.
- The hidden logos are `<li hidden="until-found">`: in the DOM, indexable, and findable in Chrome's find-in-page. Without JS they are hidden but still in the markup. That is acceptable under the rule, because the button reveals them.
- **Tablet:** 4 columns, all 48 shown, no button: 12 rows × 88 = 1,056px, where today's wall is 2,630px (A-home-08).

### 5.7 06 Press: the index
- An ink-ruled list. Each item has:
  - a meta line: source uppercase 13px/600 ink, then a `·` rendered with `::before`, then the date in slate
  - 8px, the headline at 19px/1.3 ink 600
  - the "Read The Full Article" link in 15px green 600, `min-height:44px`
- The link's `::after` is stretched over the whole row, so the **entire item is the tap target**. The repeated labels no longer need to be read as nine buttons (A-home-14, A-home-17: `text-wrap:balance` keeps "K-12" together).
- **Disclosure:** the 3 newest are shown, then a "Show all press" `<button>` (label toggles to "Show less press") reveals the other 6 from the same `<ul>` (`hidden="until-found"`). 793px at 390, from 1,963.
- **Tablet:** 2-column index, 4 shown.

### 5.8 07 Contact
- The section opens with the classroom photo as a 16:7 **band plate** (390×171, lazy), then the folio, the title, and the h2 ("Ready to get started? / Let's get in touch.") at 28–36px.
- **Form:** First and last name share a row (2×165), then Email, Phone and Message (5 rows, 132px) at full width, then the full-width 52px ink pill "SUBMIT".
  - Labels sit above their fields at 14px/600 ink. Fields are 48px tall, with 16px text (no iOS zoom), a 1px `--slate` border instead of `--line` (an existing token, just used more strongly), a 2px `--growth` focus outline, and `outline-offset:0` (C-cross-12).
  - `autocomplete`: given-name, family-name, email, tel. `inputmode`: email, tel. `enterkeyhint`: next on the inputs and send on the textarea (C-cross-13).
  - The field names, validation, endpoint and submit behaviour are unchanged.
- The form now starts 380px into the section, instead of after a 468px photo (A-home-12). Below 360, first and last name stack.
- **The Contact dock (home only):** a fixed ink pill, "Contact" (the `navLinks` label), 48px tall. It sits at `right: 16px + safe-area`, `bottom: 16px + safe-area`, in the thumb zone. It links to `#contact` and appears (translate plus opacity, 250ms) once the hero has left the viewport. It hides when `#contact` or the footer intersects the viewport, and while an input has focus, so it never sits over the on-screen keyboard.
  - It is driven by one `IntersectionObserver` of about 0.4 KB, in a `ContactDock` client component that is imported **only by `app/page.tsx`**. It therefore cannot appear on /services-and-results, and a test asserts that.
  - With no JS it never shows, and the header menu still reaches Contact.

### 5.9 Footer: the colophon
- **Layout:** black, 48px top pad, two columns at 390 (1.15fr and 1fr):
  - Left column: **Book a Meeting**, info@edcloud.org, the three address lines (15px/1.5 `--footer-text`), and LinkedIn as a 44×44 target.
  - Right column: About, Services & Results, Privacy Policy and Accessibility.
  - Then a hairline and the brand bar: the mark plus "EdCloud Venture Partners", then the copyright.
- **Tap targets:** every link has `min-height:44px` (C-cross-10, A-home-21), and the bar gets `padding-bottom: env(safe-area-inset-bottom)`.
- **Book a Meeting** is the existing footer link, which the owner kept on every page. It is not a new CTA on Services.
- **Optional (needs the owner's OK, because it changes the link inventory):** wrap "Tel: 510-306-2403" in `<a href="tel:+15103062403">` with the visible text unchanged.

---

## 6. The other pages

### 6.1 About (mocked: `editorial-about.png`, 3,925px at 390; target ≤6,500)

| Section | 390 height | Layout |
|---|---:|---|
| Header plus cover | 457 | 40px pad, the green mark, "About Us" at `--m-title` 43px, then the plate (the robot classroom at 3:2, 390×260, `fetchpriority=high`; it is the LCP element) |
| 01 Mission & History | 1,550 | See below |
| 02 Managing Partner | 766 | White band. **Byline:** the headshot as a 128×160 4:5 portrait, with "About Aaron Sokol" (24px) bottom-aligned beside it, the way a magazine credits a contributor. Then the bio at full measure (16px), and the second paragraph set as a 600-weight ink coda. `.partnerText` is `display:contents` on phones, so the h2 can share the portrait's row without a DOM change. Tablet: the portrait is 200px wide, and the bio column is capped at 38rem (B-pages-15). |
| 03 By The Numbers | 734 | A ledger, not cards: an ink rule, then four rows with the figure (44–56px green) in a 76px column, the title at 17px/600 and the body at 16px. It is flush to the gutter (B-pages-14). Tablet: 2×2 with no stranded card (B-pages-09). |
| Footer | 418 | |

**01 Mission & History, as "chapters":**
- The section h2 "About EdCloud" at 24px, then its paragraph as an 18px ink standfirst.
- The eight `h3` chapters become an ink-ruled **chapter list**: `<h3><button aria-expanded aria-controls>` rows of at least 64px, with a CSS-counter numeral and a plus/minus. The chapter's following `p`/`ul` blocks form its `role="region"` panel, indented 40px.
- **"Our mission" is open by default.** The others are collapsed with `hidden="until-found"`, and a `beforematch` listener syncs `aria-expanded` when find-in-page opens one.
- The rendering groups the flat `ABOUT_COPY.mission` array by `h3`, so the heading order (h2 → h3…) and every word are unchanged.
- This fixes B-pages-04: a 6,011px wall becomes a 1,550px table of contents the reader opens chapter by chapter.
- **With every chapter open**, the page is about 7,050px (measured: full prose at 342px is about 4,550px). The default state fits the gate with 2,575px of margin, which is also room to open a second chapter by default if the panel prefers. On tablets all chapters are open, with no disclosure, as a 38rem reading column, because the length gate is phone-only and tablets read like print.

### 6.2 Legal pages (Privacy Policy, Accessibility Statement)
- **Cover:** the header, a 40px pad, the green mark, then the H1 at `--m-title` (43px), which is clearly above the h2s (B-pages-10). No plate. The folio still shows `01` above it, so the counter column pattern disappears here too.
- **Section headings:** the `h2`s are at `--m-h3` +2 (21px) with an ink rule above each, like a report's numbered clause.
- **Body:** paragraphs and lists at 16px/1.55, list markers in `--growth`.
- **The effective date** is a 13px slate meta line under the H1. It is a `p` in the DOM order today, and it stays there.
- **Emails in the body** stay plain text by default. Linking them (B-pages-18) is optional: `mailto:` is a link-inventory change and needs the owner's OK.
- **CSS:** it moves from `about.module.css` to a `legal.module.css` of its own (B-pages-19).
- **Heights:** Privacy about 3,300 at 390 (from 3,841), Accessibility about 1,900 (from 2,370).

### 6.3 Services & Results (specified; estimate about 5,800 at 390; target ≤7,000)

| Section | Estimate at 390 | Layout |
|---|---:|---|
| Header plus cover | ~620 | "Services & Results" at `--m-title` (2 lines), the hero `p` as a 20px standfirst (6 lines), then the plate (classroom at 3:2, `fetchpriority=high`) |
| Proof strip | ~340 | A white band with a **2×2 hairline grid**. Each cell has the stat at 28px green 600 tabular ("30 → 550" fits in 171px at 28px), the label at 14px `--ink-2`, and the client at 13px uppercase ink 600. Cell padding 20. Tablet: 4 columns in one row, with labels top-aligned by `align-content:start` (B-pages-16). |
| 01 How an engagement works | ~950 | The lead as a standfirst, then the three phases as a ledger. Each phase has a 2px ink top rule (the existing motif), a meta line "01 · 2 to 3 weeks" (13px: slate numeral, green duration), the title at 22px and the body at 16px. No card boxes and no shadow. Tablet: 3 columns (B-pages-09). |
| 02 What we do | ~1,230 | The lead, then **six disclosure rows**: an ink rule, then `<h3><button>` rows of at least 64px. The service numerals (`s.n`) sit in a **square 28px outlined token** (a 1px ink border, 13px ink figure), so they no longer look like section folios (B-pages-06). The first row is open. The panel holds the pitch at 16px, the `result` as a green 19px/600 deck, and then the **For / How / When stack**: each `dt` label is a 13px/600 uppercase ink eyebrow *above* its `dd` value at full measure (342px, about 44 characters; it was 102–212px), with 16px between pairs and a hairline above the `dl` (B-pages-01). Tablet: all six open, 2-column grid, `dt` beside `dd` at 7rem/1fr. |
| 03 Results | ~1,376 | The lead, then four client blocks as a ledger. Each has the client at 22px ink, then three label-above-value pairs ("Where we started", "What we built", "Outcome"), with the labels at 13px/600 uppercase **ink** (not slate, so axe sees real text: the `data-label` values are rendered as `aria-hidden` visual labels, with the `<th>` still present for AT). The outcome value is set in `--growth` 600. Tablet 800–1023: the real table comes back at 4 columns, with "What we built" given `minmax(14rem, 1.4fr)` (B-pages-17). |
| 04 Is this a fit | ~830 | Two lists, each under a 19px h3, with the existing check and minus glyphs in a 24px column and items at 16px/1.5, with a hairline between items. It goes from 1,097 to about 700 (B-pages-22). Tablet: the two columns side by side. |
| Footer | 418 | **No booking CTA and no Contact dock on this page.** The dock is imported only by the home page, and the footer's existing Book a Meeting link is the owner-approved exception. |

---

## 7. Images and video

**Art-directed crops.** A new committed script, `scripts/images/make-crops.py` (Pillow, which is already in use, and re-runnable), writes crops to `public/images/m/` at **480, 828 and 1170** widths. The mockup's `mock/img/*.webp` are its first outputs.

| Asset | Phone crop | Tablet crop | Notes |
|---|---|---|---|
| hero-poster | 3:2 (x 180–1800) | 16:9 (the original) | Home LCP |
| hero-about | 3:2 | 16:9 | About LCP |
| hero-services | 3:2 | 16:9 | Services LCP |
| conference-room | 16:9 | 21:9 | |
| stairway | 5:2 | 21:9 | |
| classroom-lecture | 16:7 | 21:9 | |
| aaron-sokol | 4:5 (360×450 source, so ≤480 wide) | same | |

- **Markup:** `<picture>` with `<source media="(max-width: 599.98px)" srcset="…-480.webp 480w, …-828.webp 828w, …-1170.webp 1170w" sizes="100vw">`, a tablet source, and the existing `<img>` as the desktop fallback, byte-identical at ≥1024. A tiny `components/Picture.tsx` helper does this.
- **Sizing:** explicit `width` and `height` on each `<source>`, so each crop reserves its own aspect ratio and CLS stays 0.
- **LCP:** `fetchpriority="high"` goes only on the real LCP image (the hero plate on every page), and everything else is `loading="lazy" decoding="async"`.
- **Preloads:** the three below-the-fold home photos that React currently preloads in `<head>` are removed. They are rendered through `<picture>`/lazy, so no `ReactDOM.preload` fires (C-cross-04). The `/` prefetch that pulls Home photos into subpages is also removed, by removing React's `<link rel=preload>` for them (C-cross-05 and B-pages-07). The About and Services LCP images get `fetchpriority=high` (B-pages-08 and C-cross-08).
- **Soft poster fixed:** the 1170w crop serves DPR 3 at 390, so the poster is no longer upscaled (A-home-10 and C-cross-07). The phone hero goes to about 40 KB: the 828w crop at q78 measured 39.7 KB in scratch.

**Video: poster-first, and the plate is a photograph on phones.**
- **Below 600px, and under `prefers-reduced-motion`, and under Save-Data:** `HeroVideo` renders nothing. The plate is the poster, and phones download no video (C-cross-06). This is the calmest and fastest option, and it also avoids the pause-control question the owner has waived.
- **600–1023 and ≥1024:** as today, `HeroVideo` mounts after `load` and `requestIdleCallback`, and it only sets `src` if `navigator.connection?.saveData !== true`. It stays muted, `playsinline`, and plays inside the plate box (tablet) or full-bleed (desktop, unchanged).
- **LCP on phones:** the H1 text or the ~40 KB plate, well under 2.0s on simulated 4G. The home first load is estimated at about 0.9 MB, down from 3.6 MB (budget ≤60%).

---

## 8. Keeping desktop frozen: how the CSS is scoped

1. **Every new rule lives inside `@media (max-width: 1023.98px)`.** That covers each module file (`home.module.css`, `about.module.css`, `services.module.css`, `SectionShell.module.css`, `SiteHeader.module.css` and `SiteFooter.module.css`) plus one `:root` block in `tokens.css` for the `--m-*` tokens. The block is appended at the end of each file, after every desktop rule, so source order also wins over the 1087 query where they overlap.
2. **Desktop rules are never edited.** Deleted patch queries are all max-width ≤899, so they cannot match at ≥1024. The 1087 query is kept verbatim.
3. **DOM changes are desktop-neutral by construction:**
   - The ServicesTabs panels move into their `<li>` and use `display:contents` on desktop. This is the only real risk, and it is proven by the parity gate at 1024, 1280 and 1440.
   - The About chapters' wrappers get `display:contents` on desktop. Their `hidden` attribute only applies below 1024, via JS gated on `matchMedia('(max-width:1023.98px)')`. On desktop the chapters render open and unwrapped, exactly as today.
   - The press and client "show all" buttons exist in the DOM but are `display:none` at ≥1024, and their `hidden` items are forced visible there (`@media (min-width:1024px){ [data-m-collapsible] > [hidden] { display: revert } }`). Alternatively, the collapse is applied only from the same `matchMedia`, so desktop HTML never carries `hidden` after hydration. **The engineer picks the matchMedia route**, which keeps desktop markup identical after hydration, and SSR emits no `hidden`. Phones get the collapsed state on hydration, below the fold, so it adds no CLS.
   - `<picture>` falls back to the same `<img>` with the same `src` at ≥1024.
4. **The gate:** `npm run qa:desktop-parity` (1024, 1280 and 1440, 0 differing pixels) runs after each feature branch, and a failure is fixed by its author.

---

## 9. Measured and estimated heights at 390

| Page | Baseline | Editorial | Target | How |
|---|---:|---:|---:|---|
| Home | 12,065 | **8,385 (mock, measured)** | ≤8,500 ✓ | Folio at full measure, ledger instead of cards, services disclosure, 16 of 48 logos plus a button, 3 of 9 press items plus a button, one deliverables photo, contact photo as a band |
| About | 9,153 | **3,925 (mock, measured)** | ≤6,500 ✓ | Chapters with 1 of 8 open (all open is about 7,050) |
| Services | 9,867 | ~5,800 (estimated) | ≤7,000 ✓ | 2×2 proof strip, ledger phases, 1 of 6 services open, label-above-value `dl`, results ledger |
| Privacy | 3,841 | ~3,300 | – | Full measure |
| Accessibility | 2,370 | ~1,900 | – | Full measure |

At 320: Home 8,853 and About 4,318 (measured). Neither page overflows horizontally at 320 (`scrollWidth === clientWidth`, and no element's box extends past the viewport).

**Landscape 844×390:**
- The hero fits one screen (§5.1).
- The sheet scrolls internally.
- Chapters use their phone layout with a 40px gutter and text capped at 38rem.

**Tablets 768 and 820:**
- 40px gutter and a 64px header, with the menu sheet (no desktop nav below 1024).
- Two-column ledgers: projects 2×2, deliverables 2×3, press 2 columns.
- Logos 4 columns, all shown.
- Services and About chapters fully open.
- Proof strip 4 columns, phases 3 columns, and the real results table from 800 up.
- Expected home height at 768 is about 7,600, down from 10,923 (C-cross-24).

---

## 10. Interaction patterns: states and semantics

| Pattern | Element and ARIA | States | Keyboard | Motion |
|---|---|---|---|---|
| Disclosure row (Home services, About chapters, Services list) | `h3 > button[aria-expanded][aria-controls]`, panel `div[role=region][aria-labelledby][hidden=until-found]` | rest, `:active` (green title, 150ms), open (green title, minus sign), `:focus-visible` (2px green ring) | Enter and Space toggle; no roving focus (independent disclosures, not tabs) | Plus/minus rotation 200ms; panel opacity and translateY(4px) 200ms; 0 under reduced motion |
| Show all (press, clients) | `button[aria-expanded][aria-controls=list-id]`; label toggles "Show all …" / "Show fewer …" (allowlisted UI text) | rest (1px ink pill), `:active` scale 0.98, expanded | Focus stays on the button; the revealed items follow it in tab order | Items fade in 200ms |
| Menu sheet | `div[role=dialog][aria-modal=true]`, trigger `aria-expanded`/`aria-controls` | closed, open | Focus trap, Esc, focus returns to the trigger | 250ms translate and opacity |
| Contact dock (home only) | `<a href="#contact">` with the existing "Contact" label | hidden, shown, `:active` | In tab order only while shown (`visibility:hidden` when hidden) | 250ms translateY and opacity |
| Stretched press link | `a::after{inset:0}` inside `li{position:relative}` | whole-row `:active` tint on the headline | The one tab stop per item is the link | – |
| Form | Labels wrap their inputs (existing); `autocomplete`, `inputmode`, `enterkeyhint` added | focus: 2px green outline; `:user-invalid`: ink-2 message (existing text) | Enter moves to the next field (enterkeyhint) | – |

**Accessibility notes:**
- Heading order and landmarks are unchanged. The existing 2px green `:focus-visible` ring stays on everything.
- `prefers-contrast: more` turns the `--line` hairlines to `--ink-2` and drops the `--slate` folio in favour of `--ink-2`. That is a token swap inside a media query, not a palette change.
- Every target is ≥44px, with ≥8px between adjacent targets: the footer rows are 44px with 0 gap but are full-width stacked links, the row pattern WCAG 2.5.8 exempts.
- Text reflows at 320 with 200% zoom, because every width is fluid and the grids collapse to 1 column at `--bp-narrow`.
- The only visual reorder is the ledger figure. It is supplementary, and the reason is documented in §5.4.

---

## 11. Audit findings this resolves

| Finding | Severity | Resolved by |
|---|---|---|
| A-home-02, C-cross-10 (tap targets) | P0/P1 | `--m-tap` 44 minimum; header, footer and link rows; stretched press rows (§2.2, 4, 5.9) |
| A-home-03, C-cross-04/05/06/07/08, B-pages-07/08 (LCP, bytes, video) | P0/P1 | §7: crops, `<picture>`, no video under 600, preloads removed, fetchpriority on the real LCP only |
| A-home-04, B-pages-02 (page length) | P0 | §9: 8,385 / 3,925 / ~5,800 |
| A-home-05 (link-text) | P0 | aria-label on Read More (§5.2) |
| B-pages-01 (For/How/When) | P0 | Label-above-value at full measure (§6.3) |
| C-cross-01/02/03 (menu) | P0/P1 | Full-height sheet (§4) |
| A-home-06, A-home-15, A-home-20 (services tabs) | P1/P2 | Disclosure list (§5.3) |
| A-home-07, A-home-08 (logos) | P1 | 2-column credits grid, 16 visible; tablets get 4 columns (§5.6) |
| A-home-09, A-home-18, B-pages-12, C-cross-14 (hero fills or overflows the screen) | P1/P2 | Cover on paper plus a 3:2 plate; landscape 2-column; svh (§5.1) |
| A-home-10 (soft poster) | P1 | 1170w crop (§7) |
| A-home-11 (projects) | P1 | Ledger (§5.4) |
| A-home-12 (contact photo) | P1 | Band plate above the folio, form at +380px, dock (§5.8) |
| A-home-13, B-pages-05, B-pages-14, C-cross-15, C-cross-17 (counter column, lopsided margins) | P1 | Folio (§3) |
| A-home-14, A-home-17 (press) | P1/P2 | Index plus show-all, balance (§5.7) |
| B-pages-04 (mission wall) | P1 | Chapters (§6.1) |
| B-pages-06 (service numerals) | P1 | Square numeral token (§6.3) |
| B-pages-09, B-pages-15, B-pages-16, B-pages-17 (tablet grids) | P1/P2 | §6 tablet rules |
| B-pages-10 (legal H1) | P1 | §6.2 |
| B-pages-11 (results labels, a11y part) | P1 | Ink labels; `th` kept for AT (§6.3). The contrast part is waived. |
| B-pages-13, A-home-16, C-cross-23, C-cross-18 (small text) | P1/P2 | §2.1 floors |
| C-cross-11, C-cross-21 (820–1023 desktop nav, breakpoint mess) | P1/P2 | §2.3 (one scale, header at <1024) |
| C-cross-12, C-cross-13 (form) | P1 | §5.8 |
| C-cross-19, B-pages-20 (long lines on tablet) | P2 | `--m-measure` 38rem |
| C-cross-20 (touch feedback) | P2 | §2.4 tap and `:active` |
| C-cross-22 (safe areas) | P2 | viewport-fit=cover plus env() on the header, sheet, dock and footer |
| C-cross-24 (tablet stretched) | P2 | §9 tablet rules |
| B-pages-18, B-pages-19, B-pages-21, B-pages-22, A-home-19, A-home-21 | P2 | §6.2, §5.5, §5.9; B-pages-21 is moot on phones (no type on photos) |
| A-home-01, B-pages-03, C-cross-09 (contrast), C-cross-16 (pause) | – | **Waived by owner** |

---

## 12. Non-negotiables check

| Rule | Status |
|---|---|
| Desktop pixel-frozen | All rules are under `max-width: 1023.98px`; DOM changes are `display:contents` or matchMedia-gated; the parity gate is enforced (§8) |
| Copy frozen | The mock is generated from `content/*`. New strings are UI only ("Show all clients", "Show fewer clients", "Show all press", "Show less press", the Read More aria-label suffix) and go into the allowlist. Numerals come from CSS counters (no DOM text). |
| All content in the DOM | Collapsed items use `hidden=until-found` with a real toggle. Nothing uses `display:none` without a way to reveal it (the empty counter spacer and decorative overlay excepted). |
| JSON-LD, llms.txt, sitemap and meta | Untouched |
| No booking CTA on /services-and-results | The dock is imported only in `app/page.tsx`; the menu contact line is email plus phone only |
| Links: no underline, no arrows or chevrons | Links change colour only. The disclosure icon is a plus/minus on buttons, not links. |
| Brand primitives only | Existing tokens and Instrument Sans 400/600. The 40×2 green mark is an existing colour and shape. |
| Static export, CSP 'self', no new runtime dependencies | Pure CSS Modules plus about 1.2 KB of new client JS (dock observer, sheet focus trap, disclosure toggles); `hidden=until-found` is native |
| Form unchanged | Only attributes are added (autocomplete, inputmode, enterkeyhint); names, validation and endpoint are unchanged |

**Risks for the judge panel:**
- The ServicesTabs `display:contents` refactor is the one real parity risk.
- `hidden="until-found"` falls back to plain `hidden` in Safari: the content is still in the DOM and the toggle still works.
- The visual reorder in the ledger figure.
- The About page opens 1 of 8 chapters. The owner may prefer 2 open; there is room for it (+~500px).
