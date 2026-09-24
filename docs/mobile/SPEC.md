# Mobile spec (Phase 2): binding

This is the binding design and engineering spec for the Phase 3 build of the phone (320–599px) and tablet (600–1023px) experience of edcloud.org. Every Phase 3 and Phase 4 agent reads it before touching code. It changes only through the judge panel, with a written reason recorded in §17.

Inputs: the owner brief (sections 2 and 3 are binding), [BASELINE.md](BASELINE.md), [AUDIT.md](AUDIT.md) and the three direction docs in [design/directions/](design/directions/). Measurements are CSS px at 390×844 unless stated otherwise.

Contents
1. Decision record
2. Tokens
3. Breakpoint system
4. Global rules
5. Shared components: SectionShell, header, menu sheet, footer, primitives
6. Page layouts: Home, About, Services & Results, legal pages
7. Interaction specs
8. Images, video, fonts and preloads
9. Performance budget
10. Desktop freeze strategy
11. Content integrity and the allowlist
12. File ownership for Phase 3
13. Expected page heights
14. Traceability: every P0 and P1 finding
15. Non-negotiables checklist
16. Open items for the owner
17. Change log

---

## 1. Decision record

### 1.1 Scores

Three judges each scored the three directions against one lens (1–10).

| Direction | Brand and editorial craft | Mobile usability | Engineering | **Total** |
|---|---:|---:|---:|---:|
| A. Editorial | **8.5** | 7 | 7.5 | **23.0** |
| B. Product-grade | 5.5 | 7 | 6 | 18.5 |
| C. Minimal-dense, "The Ledger" | 7 | **8** | **8** | **23.0** |

Lens preferences: brand preferred Editorial; usability and engineering preferred The Ledger.

### 1.2 Winner: C, "The Ledger", with Editorial's typographic hierarchy grafted on

Editorial and The Ledger tie at 23.0, so the tie is broken on written reasons:

1. **Two of three lenses prefer The Ledger.** One of those lenses, engineering, maps directly onto a hard gate: desktop is pixel-frozen.
2. **The Ledger's weaknesses can be fixed with tokens. Editorial's are structural.** The Ledger's main brand deficit is flat hierarchy: its 20px section titles sit too close to its 17px row titles, and its 29px stats undersell the numbers. A type-scale change fixes both (§2.1), and so does grafting Editorial's stat-first figure. Editorial's deficits are architectural:
   - a three-panel ServicesTabs refactor, which changes the desktop DOM and is the top pixel-parity risk
   - a post-hydration collapse, which is a CLS risk
   - only 115px of Home headroom under the 8,500px gate
   - an ink-on-paper hero that drops the approved desktop's first impression
3. **The combination scores higher than either parent.** It keeps The Ledger's engineering: a single moving panel, the scripting-query collapse, the rule header and symmetric gutters. It adds Editorial's craft: larger section titles, the stat-first figure, the chapter list, the press index and the byline portrait. That answers every "prefers" note from all three judges.

Product-grade is not the base. It scored lowest on two lenses: its mixed vocabulary reads as SaaS, rails hide proof behind swipes, and it planned to delete the 1087 query. Specific Product-grade ideas are grafted below.

### 1.3 Grafts

| # | Idea | Source | Where in this spec |
|---|---|---|---|
| G1 | Larger section titles (`--m-t-h2`, about 27px at 390), so each section announces itself, well above the 17px row titles | Editorial (folio hierarchy) | §2.1, §5.1 |
| G2 | Stat-first Featured Projects: a 42px green figure with a bottom-aligned caption beside it, on one aligned column | Editorial ("the number is the headline") + Ledger (aligned scoreboard axis) | §6.1 row 03 |
| G3 | About Mission & History as an ink-ruled chapter list of independent disclosures | Editorial | §6.2 |
| G4 | Byline-style Managing Partner portrait (4:5, 128×160) with the h2 bottom-aligned beside it | Editorial | §6.2 |
| G5 | Press index: uppercase 13px source left, tabular date flush right, balanced headline, stretched link so the whole row is the target | Editorial (index + stretched link) + Ledger (source/date line) | §6.1 row 06 |
| G6 | 2-column hairline credits grid for logos, with a phone equal-area formula emitted as `--logo-w-m` | Editorial (grid) + Product-grade (`--logo-w-m`) | §6.1 row 05 |
| G7 | Services page: disclosure rows that keep the green result line visible while collapsed, first row open | Product-grade | §6.3 |
| G8 | Run-in For/How/When labels at the full measure | Ledger | §6.3 |
| G9 | Results: client name as a meta line, then the outcome as the green headline, then run-in "Where we started / What we built". This fixes the Ledger's ambiguous grouping and keeps a single column, not Product-grade's 2-column pair. | Product-grade (hierarchy) + Ledger (run-in) | §6.3 |
| G10 | The desktop tab's 10px green square as the only open/closed and current-page indicator. No chevrons, no plus/minus. | Product-grade | §5.5 |
| G11 | Menu sheet foot pinned in the thumb zone: a full-width 48px ink "Contact" pill plus email and tel | Product-grade + Ledger | §5.3 |
| G12 | No `<video>` below 600px, under reduced motion or under Save-Data. The Ledger's mobile encode is dropped. | Editorial | §8.4 |
| G13 | Committed `crops.json` of focal points driving the crop script | Product-grade | §8.1 |
| G14 | Same-origin font preload for the latin woff2 | Product-grade | §8.5 |
| G15 | Classic `max-width: 1023.98px` query syntax instead of range syntax (`width < 1024px`), so iOS 15 and 16.0–16.3 do not drop the whole mobile layer | Editorial (query form), chair decision | §3 |
| G16 | Heading-button reset at ≥1024 uses `display: contents`, not `display: inline` | Engineering judge | §5.5, §10 |
| G17 | Contact dock/pill imported only by `app/page.tsx`, with a test asserting it is absent on /services-and-results | Editorial | §5.6, §12 |

Rejected on purpose:
- Product-grade's horizontal rails for Projects and Logos. They hide proof behind a gesture.
- Product-grade's sticky chip index on About. It is a second navigation system and duplicates H3 text as links.
- Editorial's ink-on-paper hero and 40×2 printer's mark. They break the desktop first impression and add a new motif.
- Editorial's three-panel ServicesTabs. It changes the desktop DOM.
- The Ledger's six always-open spec boxes on Services. They are heavy and leave 126px of headroom.
- The Ledger's 3-up logo table. Wordmarks render about 12px tall.
- Count badges as visible-only UI noise. The count stays, but it is `aria-hidden` and styled as a quiet tabular figure (§5.5).

### 1.4 Owner decisions (made 2026-09-23; they override the brief where they conflict)

| Decision | Effect on this spec |
|---|---|
| **Colour contrast is out of scope.** | No palette token changes (`--slate #7A8494`, `--growth #17916B`, `--line`, etc. stay). The axe gate is **zero violations other than `color-contrast`**. Waived: A-home-01, B-pages-03, the contrast part of B-pages-11, C-cross-09 (and P2 B-pages-21). |
| **The hero video pause control is out of scope.** | No pause button. C-cross-16 is waived. The poster-first strategy, with no video under Save-Data or reduced motion, still applies as a performance item (§8.4). |
| Everything else in the brief stands. | Desktop (≥1024) is pixel-frozen. Copy is frozen. There is no booking CTA on /services-and-results. Links never underline and carry no arrows or chevrons. Only existing brand primitives are used. Static export, CSP `'self'`, no new runtime dependencies. |

---

## 2. Tokens

All new tokens are declared **only** inside the mobile layer in `app/tokens.css`. Existing desktop tokens are never edited. The existing `@media (max-width: 599px) { --counter-col: 28px }` block is **deleted**: the rule header no longer uses the counter column below 1024, and at ≥1024 it never matched.

```css
/* ---- Mobile layer tokens (phones + tablets). Never matches at >= 1024px. ---- */
@media (max-width: 1023.98px) {
  :root {
    /* Type: fluid 320 -> 1023. Values in brackets: px at 320 / 390 / 768. */
    --m-t-display: clamp(2rem, 1.35rem + 3.2vw, 2.75rem);      /* 32 / 34.1 / 44    Home H1, lh 1.06, 600, ls -0.01em; 44px cap from 700 (§17 R4) */
    --m-t-title:   clamp(2.25rem, 1.5rem + 3.5vw, 3.5rem);     /* 36 / 37.7 / 50.9  About, Services and legal H1s, lh 1.05 */
    --m-t-h2:      clamp(1.625rem, 1.3rem + 1.6vw, 2.25rem);   /* 26 / 27.0 / 33.1  section titles, lh 1.1, ls -0.01em */
    --m-t-accent:  clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);   /* 22 / 22.3 / 25.3  green service lead, contact H2 */
    --m-t-lead:    clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem);/* 18 / 18.2 / 19.5  lead paragraphs, lh 1.45 */
    --m-t-h3:      clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);    /* 17 / 17.2 / 18.3  row titles, lh 1.3 */
    --m-t-body:    clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);   /* 16 / 16.2 / 17    ALL running copy, lh 1.5 */
    --m-t-stat:    clamp(2.5rem, 1.8rem + 3.5vw, 3.5rem);      /* 40 / 42.5 / 55.7  project + By The Numbers figures, lh .95 */
    --m-t-stat-sm: clamp(1.375rem, 1rem + 1.8vw, 2rem);        /* 22 / 23.0 / 29.8  proof strip, nowrap */
    --m-t-ui:      0.9375rem;                                  /* 15  buttons, row links, 600 only, never paragraphs */
    --m-t-label:   0.875rem;                                   /* 14  form labels, proof labels, footer address */
    --m-t-meta:    0.8125rem;                                  /* 13  counters, dates, sources, captions: THE FLOOR */
    --m-lh-body: 1.5;
    --m-lh-lead: 1.45;
    --m-lh-head: 1.1;
    --m-measure: 27em;                                         /* prose cap from 600 (median 56 cpl measured; 34em ran 71, 29em 59 with 41% over 60, §17) */

    /* Space: 4px base */
    --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px;
    --s-8: 32px; --s-10: 40px; --s-12: 48px; --s-14: 56px; --s-16: 64px;

    /* Semantic space (phone values; tablet values below) */
    --m-gutter: var(--s-5);          /* 20 */
    --m-section-top: var(--s-10);    /* 40 */
    --m-section-bottom: var(--s-12); /* 48 */
    --m-head-gap: var(--s-6);        /* 24: rule header -> content */
    --m-row-y: var(--s-4);           /* 16: ledger row padding */
    --m-tap: 44px;                   /* minimum target */
    --m-control-h: 48px;             /* inputs, pills */
    --m-disclosure-h: 56px;          /* disclosure rows */

    /* Shape, elevation */
    --m-radius: 0;
    --m-radius-pill: 999px;          /* buttons and pills only */
    --m-elev-0: none;
    --m-elev-1: 0 1px 0 var(--line);                 /* solid header bottom edge */
    --m-elev-2: var(--shadow-card);                  /* floats only: the Contact pill */
    --m-hero-scrim: linear-gradient(180deg, rgba(27,36,49,.30), rgba(27,36,49,.18) 34%, rgba(27,36,49,.80));
                                                     /* --ink (#1B2431) at alpha, not a new colour */

    /* Motion: ONE easing token */
    --m-ease: var(--ease);           /* cubic-bezier(.2,.7,.2,1) */
    --m-dur-press: 150ms;            /* :active */
    --m-dur-open: 200ms;             /* disclosure, show-all, pill */
    --m-dur-sheet: 240ms;            /* menu sheet */

    /* Overrides of existing tokens, phones + tablets only */
    --nav-h: 56px;                   /* header height; hero margin-top and scroll-padding follow */
    --gutter: var(--m-gutter);       /* every existing var(--gutter) rule lines up with the header */
  }
}
@media (min-width: 600px) and (max-width: 1023.98px) {
  :root {
    --m-gutter: var(--s-8);          /* 32 */
    --m-section-top: var(--s-14);    /* 56 */
    --m-section-bottom: var(--s-16); /* 64 */
  }
}
@media (max-width: 1023.98px) and (prefers-reduced-motion: reduce) {
  :root { --m-dur-press: 0.01ms; --m-dur-open: 0.01ms; --m-dur-sheet: 0.01ms; }
}
@media (max-width: 1023.98px) and (prefers-contrast: more) {
  :root { --line: var(--ink-2); }  /* hairlines only; a swap inside a query, not a palette change */
}
```

### 2.1 Type rules
- **Running copy is never below 16px** (`--m-t-body`). **Nothing is below 13px** (`--m-t-meta`). 14px and 15px exist only for labels, UI and the footer address, never for paragraphs. The desktop `--t-body-sm` (15) and `--t-small` (14) are not used for paragraphs below 1024.
- Weights are 400 and 600 only. Tabular figures (`font-variant-numeric: tabular-nums`) apply to every counter, index, stat and date.
- `text-wrap: balance` on every heading and every stat caption. `text-wrap: pretty` on every paragraph.
- Hierarchy ladder at 390: H1 34 → section H2 27 → green accent 22 → lead 18 → row title 17 → body 16 → UI 15 → label 14 → meta 13. Each step is visibly distinct. This is graft G1: the ratio from section title to row title is 1.57.
- **Measure:** at 390, 16px over 350px runs about 43–46 characters a line. From 600, the whole content column (section header, prose and rows together) takes `max-width: calc(var(--m-measure) + 2 * var(--m-gutter))` and is **centred** with `margin-inline: auto`, so the white space is equal on both sides (§18). Individual paragraphs are never capped narrower than their column.
- **Home H1:** 3 lines at 375–430 and at most 4 at 320–374, with no orphan. `h1Lines` keeps its `<br>` plus space, and `text-wrap: balance` is applied. If qa shows an orphan at any phone width, hide the `<br>`s below 600 (`display:none`). The DOM text is unchanged, because the space already gives a word boundary.

### 2.2 Radii, elevation, motion rules
- Square corners everywhere, as on desktop. Pills (999px) are for buttons only: Menu/Close, Show all, SUBMIT and the Contact pill.
- Flat by default. The only shadow below 1024 is `--m-elev-2` on the floating Contact pill. Cards lose their shadows and padding on phones and become ledger rows (§4.3).
- Motion animates only `transform` and `opacity`, over 150–240ms, with `--m-ease`. Height is never animated. No parallax, no scroll-jacking and no `background-attachment: fixed`. Under reduced motion, durations become 0.01ms (the token block above) and the menu sheet appears instantly.

---

## 3. Breakpoint system

Custom media queries are not native, and PostCSS would be a new build dependency. So the scale is a fixed set of **literal query strings**. They are documented at the top of `app/tokens.css` and exported from a new `app/breakpoints.ts` for JS. **These are the only width/height queries any new CSS may use:**

| Name | Literal (copy exactly) | Covers |
|---|---|---|
| `MQ_MOBILE` (the layer) | `(max-width: 1023.98px)` | Every phone and tablet rule sits inside this. It never matches at ≥1024. |
| `MQ_PHONE` | `(max-width: 599.98px)` | 320–599 only: phone-only collapse queries (`collapseQuery` of About chapters and Services rows) and the phone `<source>` in Picture |
| `MQ_XS` | `(max-width: 359.98px)` | 320–359: wordmark tail hidden visually, first/last name stacked, logo cells narrower |
| `MQ_TABLET` | `(min-width: 600px) and (max-width: 1023.98px)` | 600–1023: 32px gutter, `--m-measure` prose cap, 2-up grids |
| `MQ_TABLET_WIDE` | `(min-width: 820px) and (max-width: 1023.98px)` | 820–1023. Kept as a literal; since Phase 4 R1 no rule uses it (the 3-up phases, the 4-column results table and the 240px portrait column were dropped, §17) |
| `MQ_SHORT` | `(max-width: 1023.98px) and (orientation: landscape) and (max-height: 500px)` | 844×390 and similar: hero sizes to its content, the sheet scrolls |

Rules:
- Phones (320–599) are the base of the layer, with no extra query. Tablet rules refine them.
- **Classic `min-width`/`max-width` syntax only.** Range syntax (`width < 1024px`) is unsupported on iOS Safari before 16.4, and an unsupported query evaluates false, so older iPhones would silently lose the whole mobile layer.
- Feature queries that may be combined with the above: `(hover: hover)`, `(hover: hover) and (pointer: fine)`, `(prefers-reduced-motion: reduce)`, `(prefers-contrast: more)`, `(scripting: enabled)`, `(orientation: landscape)`.
- `app/breakpoints.ts` exports `MQ_MOBILE`, `MQ_PHONE`, `MQ_XS`, `MQ_TABLET`, `MQ_TABLET_WIDE` and `MQ_SHORT` as the same strings. `useMediaQuery` callers must import them and never inline a width.
- **Lint:** `scripts/qa/breakpoints-lint.mjs` (new, no dependencies, wired as `npm run qa:breakpoints` and into `qa:all`) scans every `app/**/*.css` and `components/**/*.css` file and every `useMediaQuery(`/`matchMedia(` call. It fails on any width or height media feature that is not one of the literals above. It has **one** exemption: the pre-existing `@media (max-width: 1087px)` in `app/home.module.css`, matched verbatim.

### 3.1 How today's ad-hoc queries are replaced

| Today | Where | Action |
|---|---|---|
| `max-width: 359px` | SiteHeader.module.css:157 | Rules move into `MQ_XS` inside the SiteHeader mobile block |
| `max-width: 439px` | SiteHeader.module.css:140 | Rules folded into the phone base of the mobile block, then the query is deleted |
| `max-width: 599px` ×4 | tokens.css:59, home.module.css:355, 362, 454 | Token block deleted (§2). Home rules rewritten in the Home mobile block (phone base) |
| `max-width: 799px` | services.module.css:333 | Replaced by the phone and tablet base, with `MQ_TABLET_WIDE` restoring the real table |
| `max-width: 820px` | services.module.css:193 | Replaced by the mobile block (its 820-inclusive quirk is removed on purpose) |
| `max-width: 819px` (CSS) and `(max-width: 819px)` (JS) | SiteHeader.module.css:95, SiteHeader.tsx:24 | Replaced by `MQ_MOBILE`. The desktop nav now collapses below **1024**, not 820 (C-cross-11, C-cross-21). This is a deliberate tablet change. |
| `max-width: 899px` | home.module.css:71 | Rules move into the Home mobile block |
| `max-width: 1087px` | home.module.css:429 | **Kept byte-for-byte.** It paints at 1024–1087, which is frozen territory. Where it would leak below 1024, the Home mobile block overrides it, because the block comes later in source order. |
| `--nav-collapse: 820px` token | tokens.css | Left untouched (desktop token). It is no longer read by any mobile rule. Its comment is updated to say the collapse now happens at `MQ_MOBILE`. |

Every deleted query was `max-width ≤ 899px`, so it could never match at ≥1024. Deleting one cannot move a desktop pixel.

---

## 4. Global rules (`app/globals.css`, inside `MQ_MOBILE` unless noted)

1. `body { -webkit-tap-highlight-color: transparent; }`. Every `button`, pill and `LinkButton` gets `:active { transform: scale(.97); opacity: .85; transition: transform var(--m-dur-press) var(--m-ease), opacity var(--m-dur-press) var(--m-ease); }`. Text links and row links get `:active { color: var(--growth-ink); }`. Links never underline and never gain a glyph.
2. **Hover only under `(hover: hover)`.** Inside the mobile layer, the existing hover rules are re-declared or neutralised behind `@media (max-width: 1023.98px) and (hover: none) { … }`, so a tap never leaves a sticky 70%-opacity state (C-cross-20).
3. **Viewport and safe areas.** `app/layout.tsx` sets `viewport.viewportFit = 'cover'`. Every fixed or full-bleed element pads with `env(safe-area-inset-*)`: the header (`padding-inline: max(var(--m-gutter), env(safe-area-inset-left/right))`, `padding-top: env(safe-area-inset-top)`), the menu sheet, the Contact pill (`bottom: calc(16px + env(safe-area-inset-bottom))`) and the footer bar. Full-bleed hero images extend under the insets, and their text respects them.
4. **Viewport units.** `svh`/`dvh` replace `100vh`, and every rule has a `vh` fallback declared first for old engines.
5. **Section rhythm.** Containers pad `var(--m-section-top) var(--m-gutter) var(--m-section-bottom)`. Section background alternation (paper and white) is unchanged from desktop.
6. **Ledger primitives** (in `components/ui.module.css`, mobile layer): `.rule` (1px `--ink` top border), `.hair` (1px `--line` border between rows), `.idx` (13px 600 `--growth` tabular inline item number), `.meta` (13px `--slate` tabular). No card shadow or card padding below 600. From 600, cards may return as 2-up ledger cells, still without shadow.
7. **Focus.** The existing 2px green `:focus-visible` ring stays on every focusable element. Nothing sets `outline: none` without replacing the ring.
8. **Reduced motion.** The existing `[data-reveal]` rise stays for desktop. Below 1024 the hero `rise` animation is removed (`animation: none`), so the text LCP is never held behind a 600ms animation (A-home-03).

---

## 5. Shared components

### 5.1 SectionShell: the rule header

```
────────────────────────────────────────  1px --ink rule, full content width (350 at 390)
01   Our Promise                          counter: 13/600 --slate tabular; 12px gap; title --m-t-h2 (27px) 600 --ink, lh 1.1
                                          24px (--m-head-gap)
content at the full width (350 at 390, 280 at 320)
```

- Mobile block in `SectionShell.module.css`:
  - `.head { display:flex; align-items:baseline; gap: var(--s-3); border-top: 1px solid var(--ink); padding-top: var(--s-3); margin-bottom: var(--m-head-gap); }`
  - `.title` takes `--m-t-h2` with `text-wrap: balance`. A wrapped title keeps its left edge; the counter aligns to the first baseline.
  - `.body { display:block }`, and its empty `span[aria-hidden]` spacer gets `display:none` (it is decorative and holds no content).
  - The `offset={false}` body also starts on the gutter (B-pages-14).
- New optional prop `titleSize?: 'page'` adds a class that sets `--m-t-title` below 1024. Only `LegalPage` uses it; Select Clients stays an `h1` at section size. At ≥1024 the class sets nothing.
- DOM, heading levels and landmarks are unchanged. The counter stays in reading order ("01 Our Promise").
- The margins are symmetric: 20 and 20 at 390, 32 and 32 on tablets. The 68/24 lopsidedness and the 116px nesting are gone (A-home-13, B-pages-05, C-cross-15).
- Two numbering systems: **section counters** are slate and sit on the ink rule. **Item numbers** (capabilities, phases, services) are the green `.idx`, inline before their title (B-pages-06).

### 5.2 SiteHeader (<1024)

- **Height:** `--nav-h` 56px plus `env(safe-area-inset-top)`, with no border (the bottom edge is `--m-elev-1`, a shadow). Sticky, with no hide-on-scroll. The solid state is a white `::before` layer with `--m-elev-1` that fades by opacity over `--m-dur-press` (the desktop's 540ms background transition let body copy show through the wordmark after a jump), with no height change, so CLS stays 0.
- The nav gap is 16px; where the one-line wordmark would come closer than that to Menu (below ~383px) it stacks as EDCLOUD / VENTURE PARTNERS (measured: two lines from 360 to 381px, so 375 gets the two-line lockup; one line from 382). With text enlarged the bar grows (`min-height`, not a fixed height) and the header bar and the sheet's bar are size containers: where the two-line lockup no longer fits beside Menu the tail is visually hidden (as below 360 at 100%), and where "EDCLOUD" itself would not fit the tracking and the pill's padding tighten. Only past that does the brand link clip (`overflow:hidden`) rather than run under Menu. Neither query can match at 100% text.
- **Left:** the 22px mark plus the wordmark at 13px/600/0.08em (C-cross-18: it was 12px). The brand link box is at least 44px tall. Below `MQ_XS` the " VENTURE PARTNERS" tail is visually hidden with the clip pattern and **stays in the DOM**.
- **Right:** the existing Menu/Close pill, at least 44×44, 15px/600.
- The desktop `.links` list gets `display:none` below 1024. The same links are reachable in the sheet and the footer.
- **JS:** `useMediaQuery(MQ_MOBILE, () => setMenuOpen(false))`. Crossing to ≥1024 closes the sheet.
- Over heroes (Home, About, Services) it is transparent, with white text, until `scrollY > 40`. That logic is unchanged.

### 5.3 Menu sheet (`dense-menu.png`, plus the G11 foot)

- **Markup:** rendered only while open, as today, inside `<header>` after `<nav>`: `<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">`. It is fixed, `inset:0`, `height:100dvh` (fallback `100vh`), on `--paper`, and uses `display:grid; grid-template-rows:auto 1fr auto`.
  - **Top row** mirrors the header: the brand link plus a **Close** pill in the same position as Menu. It is 56px plus the top safe area.
  - **Middle** (`overflow-y:auto; overscroll-behavior:contain`):
    - The primary rows are the `SHARED.mobileMenu` pages: Home, About, Services & Results. Each is 56px, `--m-t-accent`-sized text (22px) 600 ink, with a hairline between rows. The current page gets `aria-current="page"` and the filled 10px green square at the row end (G10).
    - The secondary rows are Privacy Policy and Accessibility: 48px, 15px/600 `--ink-2`, with 8px between them.
  - **Foot**, pinned in the thumb zone under a 1px ink rule, with `padding-bottom: calc(16px + env(safe-area-inset-bottom))`:
    - A full-width 48px ink pill "Contact" (the existing `SHARED.navLinks` label and href: `#contact` on Home, `/#contact` elsewhere) on **every page except /services-and-results**. On Home, tapping it closes the sheet, then scrolls to `#contact`.
    - On every page, a 44px row with the `info@edcloud.org` mailto link (the existing footer href) and the "Tel: 510-306-2403" text (see §16 for a `tel:` link).
    - There is no booking link anywhere in the sheet.
- **Behaviour:**
  - The trigger carries `aria-expanded` and `aria-controls="mobile-menu"`.
  - On open:
    - Store `scrollY`, then set `body { position:fixed; top:-{scrollY}px; left:0; right:0; }` (iOS-safe scroll lock).
    - Set `inert` on `<main>`, `<footer>` and the header `<nav>`.
    - Move focus to the sheet's Close button.
  - Tab and Shift+Tab cycle within the dialog. Esc closes it.
  - Tapping any link closes the sheet, and so does crossing to ≥1024.
  - On close: remove `inert`, restore `body` and `scrollTo(0, scrollY)`, and return focus to the Menu trigger.
- **Motion:** `opacity 0→1` plus `translateY(-8px→0)` over `--m-dur-sheet` 240ms with `--m-ease`. It is instant under reduced motion.
- **Fit:** 56 + 3×56 + 2×48 + foot ≈ 132 = 452px. Under `MQ_SHORT` (844×390) the whole sheet scrolls as one column, foot included, so every link is reachable by the same scroll (a pinned foot hid both legal rows with no scroll cue; Phase 4 R1, §17).

### 5.4 SiteFooter (<1024)

- Black, `--m-section-top` padding, and 2 columns sharing the row 1.25 : 1 (a wrapping flex row with em bases, 16px gap) at every phone width, including 320. With text enlarged the columns stack. Stacked links in a column are 8px apart (Phase 4 R1, §17).
- **Column 1:** Book a Meeting (the existing footer link, unchanged and owner-approved; it appears on every page on desktop too), the email, and the three address lines at 14px/1.5 `--footer-text`. LinkedIn becomes a 44×44 target.
- **Column 2:** the four nav links.
- Every link is a block with `min-height:44px` and `display:flex; align-items:center`. The bar holds the brand and © on 44px rows at 13px, and pads with `env(safe-area-inset-bottom)` (A-home-21, C-cross-10).
- Height at 390: about 412px.

### 5.5 Disclosure primitives (Foundation builds them; Home and Pages consume them)

**A. Heading button** (`components/Disclosure.tsx`, client component): used by About chapters and the Services page's "What we do".

- **Markup:** `<h3 class={existing}><button type="button" aria-expanded aria-controls="{panel ids}" id="{btn id}">{existing heading text}</button></h3>`. The panel has `id`. It takes `role="region"` and `aria-labelledby="{btn id}"` only where a page has six or fewer panels (APG); About's eight chapter panels pass `region={false}`, so the landmark list matches the desktop's (Phase 4 R1, §17).
- **At ≥1024** the button is neutral: `all: unset; display: contents;` inside a `@media (min-width: 1024px)` guard. This is the one allowed desktop-side rule type (see §10). The panels are never `hidden` at ≥1024: JS applies `hidden` only while `MQ_MOBILE` matches, and removes it when the query stops matching.
- **Below 1024:**
  - The button is `display:flex; width:100%; min-height: var(--m-disclosure-h); align-items:center; justify-content:space-between; gap: var(--s-3); text-align:start; font: inherit; color: var(--ink);`, with a hairline between rows.
  - **Indicator (G10):** a `::after` 10px square. Closed: transparent with `box-shadow: inset 0 0 0 1px var(--slate)`. Open: filled `--growth`. It transitions `opacity`/`transform: scale(1.1)` over 200ms. There are no chevrons and no plus/minus.
- **States:**
  - rest: title in `--ink`, 600
  - `:active`: title in `--growth-ink`
  - open: indicator filled
  - `:focus-visible`: the 2px green ring
- **Independent, not exclusive:** several panels can be open at once.
- **Collapse without CLS, with a no-JS fallback:**
  1. **SSR** emits no `hidden`. Items that are open by default get `data-open`.
  2. **First paint:** `@media (max-width: 599.98px) and (scripting: enabled) { [data-disclosure]:not([data-open]) [data-panel] { display:none } }` collapses the panels (the query is the component's `collapseQuery`; both current users pass `MQ_PHONE`). With scripting disabled everything shows, and the buttons are inert-looking rows. That is readable.
  3. **After hydration:** the hook replaces the CSS collapse with `el.setAttribute('hidden','until-found')` (set through the DOM, not JSX). It then sets `data-js` on the group, which disables the CSS rule. It also listens for `beforematch`, which sets `aria-expanded="true"` and `data-open`, so find-in-page and `#:~:text=` links open the panel.
  3a. **Before hydration (built pages):** phones hydrate only after the first paint (`scripts/defer-hydration.mjs`), and Chromium's text-fragment search runs before that and is not retried, so it never matched a `display:none` panel. The loader therefore does step 3's DOM part at the end of parsing: `[data-disclosure]` groups' `[data-panel]`s and Show-all items past the limit get `hidden="until-found"` plus `data-js`. A match the browser reveals is marked `data-found` (and its group `data-open`), and the component keeps it open when it hydrates. The same loader starts the chunks on the first pointerdown, key or click, and replays a click on a not-yet-hydrated control (a non-submit `<button>`, or a heading's `data-trigger` stand-in) once React owns it. `npm run qa:early` checks both on a throttled phone (Phase 4 R1, §17).
  4. **No stray layout:** inside the mobile layer, `[data-panel][hidden] { position:absolute; inset-inline:0; margin:0; padding:0; border:0; }`, so a collapsed panel takes no grid gap and draws no hairline.
- **Motion:** revealed panels fade in (`opacity 0→1`, `translateY(4px→0)`, 200ms). Height does not animate.

**B. Show all** (`components/ShowAll.tsx`): used by Press and Select Clients.

- A real `<button type="button" aria-expanded="false" aria-controls="{list id}">` placed after the list. Its label is "Show all press" or "Show all clients". After it, `<span aria-hidden="true" class="meta">9</span>` (or 48), where the count comes from `content.length`, so no copy is typed. When expanded the label reads "Show fewer".
- A full-width 48px outlined pill (1px ink border, 15px/600) with 24px above it.
- At ≥1024 it is `display:none` (a base rule on a new element; see §10).
- **Collapse:** the same three-stage mechanism as A.
  - **First paint:** `@media (max-width:1023.98px) and (scripting: enabled)` hides items after the threshold, using `li:nth-child(n+4)` for press on phones and `n+17` for logos on phones (`n+5` and `n+25` on tablets), unless the list has `data-open`.
  - **After hydration:** the hook swaps to `hidden="until-found"` on the same items, with `beforematch` opening the list.
  - **No stray layout:** the same absolute out-of-flow rule applies.
- **Expand:** press moves focus to the first revealed item's link. Clients keep focus on the button. New rows fade in over 200ms. **Collapse:** focus stays on the button, and the page scrolls the button into view if it moved off screen.
- Collapsed logo `<img loading="lazy">` never fetch until revealed.

### 5.6 Contact pill (Home only)

- **What and where:**
  - `components/home/ContactPill.tsx`, imported **only by `app/page.tsx`**.
  - An `<a href="#contact">` whose text is the existing `navLinks` label "Contact".
  - A fixed ink pill, 48px tall, 15px/600 white, with `--m-elev-2`.
  - Placed at `bottom: calc(16px + env(safe-area-inset-bottom))`. On phones (< 600) `right: var(--gutter)` (20px, or the safe-area inset), so its right edge is the column's, under the Menu pill; on tablets `right: max(16px, env(safe-area-inset-right))` (Phase 4 R3, §17).
- **Visibility:**
  - It is hidden by default: `opacity:0; transform: translateY(12px); visibility:hidden`, so it is out of the tab order.
  - One IntersectionObserver shows it once the hero has left the viewport.
  - It hides while `#contact` or the footer intersects the viewport, and while a Show-all button is in the bottom 96px of the viewport (the band the pill floats over).
  - A `focusin` or `focusout` on any `input`, `textarea` or `select` hides it while a field has focus, so it never rides the on-screen keyboard.
  - It transitions over 200ms.
  - At ≥1024 it is `display:none`. With no JS it never shows, and the header menu still reaches Contact.
- **Tests:** qa asserts it is absent from the DOM on /services-and-results, /about and the legal pages.

### 5.7 Picture helper (`components/Picture.tsx`, server component)

```tsx
<picture className={ui.contents /* display: contents at every width */}>
  <source media="(max-width: 599.98px)" srcSet="/images/m/{name}-{phoneRatio}-480.webp 480w, …-828.webp 828w, …-1170.webp 1170w"
          sizes="{phoneSizes}" width={…} height={…} />
  <source media="(min-width: 600px) and (max-width: 1023.98px)" srcSet="…-{tabletRatio}-1200.webp 1200w, …-1600.webp 1600w"
          sizes="{tabletSizes}" width={…} height={…} />
  <img {...existingImgPropsUnchanged} />   {/* same src/width/height/className/alt as today: desktop decodes the same file into the same box */}
</picture>
```

- Crop names, widths and dimensions come from `components/crops.generated.ts`, which the crop script writes (§8.1). Call sites pass `name`, `phoneSizes`, `tabletSizes`, `loading` and `fetchPriority`. They never hand-type URLs.
- `<source>` media strings use the §3 literals, since `sizes` media conditions follow the same rule.

---

## 6. Page layouts

Heights are at 390. "M" means measured on the winning mockup. "E" means estimated for the grafted version (the mockup value plus the measured deltas of the grafted pattern in the Editorial or Product-grade mockup). Phase 3 must re-measure and record the result in BASELINE.md.

### 6.1 Home (target ≤8,500; spec estimate ~7,430)

| # | Section | 390 height | Layout at 390 |
|---|---|---:|---|
| — | Header | 56 (overlays the hero) | §5.2, transparent over the hero |
| — | Hero | 608 (M) | Height `clamp(480px, 72svh, 640px)` (fallback `72vh`), full-bleed. The poster is a `<picture>` 4:5 crop with `object-fit:cover; object-position: 60% 50%`, under `--m-hero-scrim`. The H1 (`--m-t-display`, white, balance) and the `p` (`--m-t-body`, white at 0.92 opacity, full content width; no `ch` cap, per §18) are bottom-anchored with 32px bottom padding and the gutter on both sides. There is no `rise` animation. At 390×844 the first screen shows the hero, the next section's ink rule and its "01 Our Promise" line, so the page announces that it continues (A-home-09, C-cross-14). The `<video>` is not rendered below 600 (§8.4). |
| 01 | Our Promise | ~785 (E) | The rule header. `lead` at `--m-t-lead` ink, then p2 and p3 at 16px `--ink-2`, 16px apart. "Read More" is a 44px-tall text link (15px/600 `--growth`, no underline, no glyph) with `ariaLabel="Read More about EdCloud"` through RouteLink's existing prop (A-home-05). The accessible name starts with the visible text (WCAG 2.5.3). If Lighthouse `link-text` still fails with only the aria-label, add a visually hidden `<span> about EdCloud</span>` instead and allowlist it. |
| 02 | Services & Results | ~565 (E) | An **exclusive accordion on the existing single panel** (§7.1). There are three 56px rows (the title at `--m-t-h3` 600 plus the 10px indicator), with hairlines between them. The one panel moves under the active row: the green lead at `--m-t-accent`, the rest at 16px, then the 44px "Services & Results" LinkButton. The panel has no card padding or shadow on phones. On tablets the panel is capped at `--m-measure`, which removes the 160px dead space (A-home-06, A-home-15). |
| 03 | Featured Projects | ~1,125 (E) | **Stat-first scoreboard ledger (G2).** Four rows separated by 1px `--ink` rules, 24px row padding. Each row is a grid with the figure line first (`order:-1`; DOM order unchanged): the `stat` at `--m-t-stat` (42px) green 600 tabular, lh 0.95, in a `min-width: 4.2ch` column so all four figures line up ($3.5B / $3B / $100M / $500M). Beside it, `statLabel` at 13px `--ink-2`, balance, bottom-aligned (`align-self:end`). Then 12px, the title at `--m-t-h3`, 8px, and the body at 16px. There are no cards and no shadow. The four figures read as one column (A-home-11: 1,957 down to about 1,125). Tablet: 2×2 with a 32px gap (B-pages-09). |
| 04 | Deliverables | ~1,230 (E) | The lead, then **one** 16:9 conference-room `<picture>` (lazy) at the full content width, then six ledger rows: the green `.idx` inline plus the title at `--m-t-h3`, then the description at 16px, with hairlines between rows. There is no photo/list/photo stack. Tablet: 2-up rows, and a 3:2 photo capped at `--m-measure`. |
| — | Stairway figure | 140 (M) | Its existing DOM position. A full-bleed 39:14 band (`<picture>`, lazy, alt unchanged). |
| 05 | Select Clients (`h1`) | ~890 (E) | **The 2-column credits grid (G6).** A grid of `1fr 1fr` with a 1px `--line` gap on white. Cells are 175×80 at 390 (140×72 at 320). Each logo is sized by the phone equal-area model, `--logo-w-m: min(sqrt(4200 × ratio), 139px, 52px × ratio)`, emitted by `logoStyle()` in `app/page.tsx` next to the existing `--logo-w` (desktop untouched). Most logos land 26–52px tall, and the widest 8:1 wordmarks about 17px. **16 are visible**, and 32 sit behind "Show all clients 48" (§5.5 B). All 48 `<img>` and their alts stay in the DOM. Tablet: 4 columns, 24 visible, 1 show-all. |
| 06 | Press | ~790 (E) | **The index (G5).** Hairline rows with 20px padding and `position:relative`. The meta line has the source in 13px/600 uppercase ink (0.06em tracking) on the left and the date in 13px `--slate` tabular, flush right. Then 8px and the headline at `--m-t-h3` +1 (18px) 600, balance ("K-12" stays together: balance, plus a non-breaking wrap only if qa:content allows it; A-home-17 is P2). Then the "Read The Full Article" link at 15px/600 `--growth`, `min-height:44px`, whose `::after { content:''; position:absolute; inset:0 }` makes the **whole row the target** with a single tab stop. **The newest 3 are visible, and 6 sit behind "Show all press 9"** (§5.5 B). Tablet: a 2-column index with 4 visible. |
| 07 | Contact Us | ~880 (E) | The rule header **first**, so the section boundary stays clear. Then the classroom photo as a 39:14 full-bleed band (`<picture>`, lazy, 140px tall at 390 (390 × 14/39); A-home-12: it was 468px), then the H2 at `--m-t-accent`, then the form. First and last name sit 2-up (165px each; stacked under `MQ_XS`). Email, phone and message are full width. Labels are 14px/600 ink above the fields. Inputs are 48px tall with 16px text (no iOS zoom), a 1px `--slate` border (an existing token) and the 2px green `:focus-visible` ring instead of `outline:none` (C-cross-12). The textarea keeps `rows={2}` (no desktop change) with `min-height:120px` (§7.5; judge ruling, §17 R2). SUBMIT is a full-width 52px ink pill, the last element, in the thumb zone; it uses `aria-disabled` while sending, so focus stays on it. An empty visually hidden `role="status"` live region is mounted from the start and only its text changes; the visible status line under SUBMIT is `aria-hidden`. Inputs carry `scroll-margin-top: 32px`, so a field scrolled to by validation shows its label below the header. Form attributes: §7.5. |
| — | Footer | ~412 | §5.4 |
| | **Total** | **~7,430** | Baseline 12,065. Mockup 6,961 before the grafts. |

**Contact pill:** §5.6. It shows from the end of the hero until the Contact section.

**320×568:** the same structure.
- The hero is at the 480px clamp minimum, with the H1 in 4 lines and no orphan.
- The wordmark tail is hidden.
- Logo cells are 140×72.
- The Featured Projects figures are 40px with the caption beside them. If the caption falls under 11 characters a line, it drops beneath the figure (`MQ_XS`: `grid-template-columns: 1fr`).
- Estimated height about 7,900. `scrollWidth` must equal 320.

**Landscape 844×390 (`MQ_SHORT`):**
- The hero drops its fixed height and sizes to its content: `min-height:auto`, `padding-top: calc(var(--nav-h) + 16px)`, and a 3-line H1. It comes to about 305px, so the "01" rule peeks at the bottom of the first screen.
- The content uses the tablet 32px gutter and the `--m-measure` cap.
- The sheet scrolls.

**Tablet 768×1024 / 820×1180 (`MQ_TABLET`):**
- The hero is `clamp(480px, 72svh, 640px)`, so 640px instead of a full 1,180px screen (A-home-18).
- The video may mount in it (§8.4).
- Gutters are 32px and the content column is capped at `--m-measure` (27em) plus gutters and centred, so the white space is equal on both sides (§18).
- The cases, capabilities and press index stay the phone's single-column ledgers (Phase 4 R1, §17); only the logos go 4-column.
- The services accordion stays below 1024.
- Estimated Home height at 768 is about 6,900 (baseline 10,923; C-cross-24).
- From 820 (`MQ_TABLET_WIDE`), Home layouts do not change further.

### 6.2 About (target ≤6,500; spec estimate ~4,100)

| Section | 390 height | Layout |
|---|---:|---|
| Hero | ~380 | `min-height: clamp(320px, 44svh, 440px)`. A 4:5 crop of `hero-about` (`fetchpriority="high"`, the LCP) under the scrim. "About Us" at `--m-t-title`, white, bottom-anchored. The first screen shows the H1, the rule header and the start of "About EdCloud" (B-pages-12). |
| 01 Mission & History | ~1,650 (E) | The h2 "About EdCloud" at `--m-t-accent` ink, then the intro paragraph at `--m-t-lead`. Then an **ink-ruled chapter list (G3)**: all 8 `h3`s become heading buttons (§5.5 A), each 56px or taller, labelled with the existing h3 text (no new copy). **"Our mission" and "How we think about scale" are open by default** (the firm's thesis; `data-open`). The other six are collapsed: Our approach, A brief history, Who we serve, What success looks like, How engagements work, Why now. The collapsed rows read as the section's table of contents, so no separate TOC is needed. Panels hold the following `p`/`ul` blocks at 16px/1.5, at the full measure. List bullets are a 6px green square (the site's dot). **DOM grouping:** the page groups the flat `ABOUT_COPY.mission` array by `h3` into `<div data-disclosure><h3><button/></h3><div data-panel>…</div></div>`. At ≥1024 both wrappers are `display: contents`, so the `.mission` grid (gap 20) sees exactly today's children. `.mission` has no sibling combinators, so the selectors cannot shift. Tablet: every chapter is open, in the `--m-measure` reading column. The Disclosure component takes `collapseQuery={MQ_PHONE}` here, so both its first-paint CSS collapse and its `hidden` swap apply only below 600. On tablets the rows still render as headings with their indicator filled and remain toggleable. |
| 02 Managing Partner | ~640 (E) | **Byline (G4).** A 112×140 4:5 portrait (128×160 on tablets; a `<picture>` crop of `aaron-sokol`, lazy) with the h2 "About Aaron Sokol" at `--m-t-accent`, vertically centred beside it (Phase 4 R1, §17) (`.partnerText { display: contents }` below 1024, so the h2 joins the portrait's grid row without a DOM change). Then the bio at the full measure (16px), and the second paragraph as a 600-weight ink coda. The byline keeps this shape up to 1023 (the 240px portrait column from 820 left the bio ~220px wide in the 29em column, §17). |
| 03 By The Numbers | ~680 (E) | A ledger, not cards: an ink rule, then four rows. Each row puts the figure (`--m-t-stat`, green, tabular) and the title (17/600) on one line, on a shared baseline, in an `auto 1fr` grid whose columns the rows share (subgrid), and then the body (16px) across the full column (the Home scoreboard pattern; Phase 4 R1, §17). There is no negative offset, and the content starts on the gutter (B-pages-14). Tablet: the same single-column ledger. |
| Footer | ~412 | §5.4 |
| **Total** | **~4,100** | Baseline 9,153. With every chapter opened, about 6,600. |

At 320: about 4,500. Landscape: phone layout with the 32px gutter and the measure cap. Tablets: every chapter open, and the estimate at 768 is about 6,800. There is no length gate for tablets.

### 6.3 Services & Results (target ≤7,000; spec estimate ~5,220)

| Section | 390 height | Layout |
|---|---:|---|
| Hero | ~473 | `min-height: clamp(420px, 56svh, 560px)`. A 4:5 `hero-services` crop (`fetchpriority="high"`) under the scrim, with the H1 at `--m-t-title` and the `p` at 16px, bottom-anchored. At 320×568 and 844×390 the proof strip's first row is visible (B-pages-12; landscape uses content-sized `MQ_SHORT`). |
| Proof strip | ~261 | **A 2×2 ruled grid**: a vertical `--line` hairline between the columns and a horizontal one between the rows, with 12px cell padding. Stat at `--m-t-stat-sm` green 600 tabular `nowrap` ("300 → 1.5M" fits the 151px cell at 23px). Label 14px `--ink-2`. Client 13px/600 ink uppercase. Each cell is a three-row grid (figure / label / client) whose label row takes the slack, so the client names in a row share a baseline. The columns are `repeat(auto-fit, minmax(min(100%, 5.75em), 1fr))` in em of the figure size, so with text enlarged the strip falls back to one column. Tablet: 2×2 as well (judge ruling, Phase 4 R1: a 4-up cell in the 29em column cannot hold the nowrap "300 → 1.5M"; §17). |
| 01 How an engagement works | ~850 | The lead, then three ledger rows. Each has a meta line (the green `.idx` plus "2 to 3 weeks" in 13px `--slate` 600 tabular), the title at `--m-t-h3` and the body at 16px, with hairlines between rows. The phase card's desktop 2px ink top rule becomes the row rule. Tablet: stacked, to 1023 (Phase 4 R1, §17). |
| 02 What we do | ~1,250 (E) | **Six disclosure rows with the result line always visible (G7), first row open.** Per `li`: the green `.idx` inline before the heading button (the existing `serviceIndex` span, placed by grid, so it is not confused with the section counter; B-pages-06), then the `serviceTitle` `h3 > button` at `--m-t-h3`+2 (19px) 600. **Collapsed:** the `serviceResult` stays visible under the title (16px 600 `--growth`, balance), so a reader can scan all six outcomes. `servicePitch` and the `dl` are hidden. **Open:** DOM order, with no visual reorder: pitch (16px `--ink-2`), result, then the `dl`. `aria-controls` lists both hidden ids (pitch and spec). **For/How/When (G8):** a 1px `--line` rule above the `dl`. Each `div` is one block, with a **run-in** `dt` (`display:inline`, 600 ink, followed by a space) and the `dd` (`display:inline`, `--ink-2`), wrapping at the full 350px (B-pages-01: from 102–212px). The markup stays `div > dt + dd`. Tablet: all six open (`collapseQuery={MQ_PHONE}`), as the same single-column rows, with the run-in labels kept (Phase 4 R1, §17). The heading button glues each title's last two words (`keepLastWords`, mobile button only), so a two-line title never ends on one word. |
| 03 Results | ~1,120 (E) | The `<table>` stays a table. Below 1024, `tr` becomes a `display:grid` block with an ink rule on top, and the `thead` is visually hidden with the clip pattern (not `display:none`), so the header text stays in the accessibility tree. **Order (G9):** the client `th`/cell is a 13px/600 uppercase ink meta line (order 0). The **Outcome** cell is the headline, `--m-t-lead` 600 `--growth` (order 1). Then "Where we started" and "What we built" run in (order 2 and 3), with `td::before { content: attr(data-label) ": " / "" }` in 600 ink and the value in `--ink-2`, each at the full width. The data-label pseudo text is decorative and carries empty alternative text, because AT reads the real `th`. The last block drops its bottom padding, so the section ends on `--m-section-bottom`. Tablet: the same stacked blocks to 1023 (the 4-column table set 102–172px columns in the 29em column; Phase 4 R1, §17). |
| 04 Is this a fit | ~850 | Two ledger lists under 17px h3s. Each item is a hairline row with the existing check or dash icon in a 20px hanging column, then 16px text (B-pages-22: from 1,097). Tablet: the same two lists, one after the other (Phase 4 R1, §17). |
| Footer | ~412 | §5.4 as on every page. **No Contact pill, no booking CTA, and no Contact pill in the menu sheet on this page.** |
| **Total** | **~5,220** | Baseline 9,867. With all six services open, about 6,900 (the Ledger measured 6,874), which still passes. |

At 320: about 5,900.

### 6.4 Legal pages (Privacy Policy, Accessibility Statement)

- `LegalPage` passes `titleSize="page"`: the rule header carries the counter plus the H1 at `--m-t-title`, clearly above the h2s (B-pages-10).
- Section `h2`s (styled today by `about.module.css .h3`) get 17px 600 ink with a `--line` hairline above them and 32px of space before. Paragraphs and lists are 16px/1.5, with green square bullets.
- **Optional P2 (B-pages-19):** move the styles into `components/LegalPage.module.css` by copying the desktop rules verbatim, then add the mobile block. This is allowed only if qa:desktop-parity stays at zero.
- The emails stay as text unless the owner approves `mailto:` (§16).
- Estimates: Privacy about 3,300 and Accessibility about 1,950 at 390.

---

## 7. Interaction specs

### 7.1 Home Services: exclusive accordion on the single existing panel

- **DOM is unchanged** from today: `ol > li > button` plus one `.panel` sibling holding the active service. The qa:content snapshot and the desktop DOM are identical by construction.
- **Below 1024:**
  - `.services { display:grid; grid-template-columns:1fr }`.
  - `.tabs` and each `li` get `display:contents`, so the three buttons become grid rows 1–3.
  - `.panel { grid-row: var(--panel-row) }`, where `--panel-row` is set inline on `.services` as `active + 2`. Each button carries an explicit `style={{ gridRow: i + 1 + (i > active ? 1 : 0) }}`, so the panel sits directly under the active row.
  - Inline custom properties and grid-row styles on these elements are ignored by the desktop CSS, which does not reference them. The parity gate proves it.
- **ARIA** (added at all widths; invisible):
  - Each button gets `aria-expanded={isActive}` and `aria-controls="svc-panel"`. `aria-pressed` is removed, because it is superseded.
  - The panel gets `id="svc-panel" role="group" aria-labelledby={active button id}` (a labelled group, not a region: a region added a landmark to the frozen desktop; Phase 4 R1, §17).
  - The open row carries `aria-disabled="true"`: the accordion is exclusive, so pressing it does nothing (APG).
  - Below 1024, opening a row that sits under the open one keeps the tapped row where it was on screen: its `getBoundingClientRect().top` is recorded before the change and restored with `scrollBy` in a layout effect, before paint.
  - On desktop this also announces the tab change (A-home-20).
- **Hover:** `onMouseEnter` activates only when `matchMedia('(hover: hover) and (pointer: fine)')` matches, so touch never activates by hover.
- **Keyboard:** Enter and Space activate. There is no roving focus. After a tap or keypress, focus stays on the button.
- **States:** closed row `--ink-2` 600 with the outline square. Open row `--ink` with the filled green square. `:active` is `--growth-ink`. The 2px ring shows on focus.
- **Motion:** the panel content fades in (opacity plus 4px translate, 200ms), keyed on `active`.

### 7.2 About chapters and Services "What we do"
§5.5 A. Independent disclosures. Enter and Space toggle. `beforematch` opens a panel. Everything is in the DOM.

### 7.3 Show all (Press, Clients)
§5.5 B.

### 7.4 Menu sheet
§5.3. Focus trap, Esc, focus return, `inert`, iOS scroll lock, `aria-expanded` and `aria-controls`, 240ms motion that is instant under reduced motion.

### 7.5 Contact form (`components/home/ContactForm.tsx`)

The fields, `name`s, `required`, validation, endpoint and submit behaviour are **unchanged**. Only attributes are added:

| Field | `autocomplete` | `inputmode` | `enterkeyhint` |
|---|---|---|---|
| First name | `given-name` | (text) | `next` |
| Last name | `family-name` | (text) | `next` |
| Email | `email` | `email` | `next` |
| Phone | `tel` | `tel` | `next` |
| Message | `off` | (text) | `enter` |

Plus `rows={2}` on the textarea with `min-height: 120px` (the min-height wins, so it renders 120px tall at every width; `rows` is the existing attribute, left as is for desktop parity), 48px inputs, 16px text, and the 2px focus ring (C-cross-13).
- The attribute map lives in the component as a lookup keyed by field `id`, so `content/*` is untouched.
- Fixed elements never sit over the keyboard: the Contact pill hides on `focusin`. The header is sticky, not fixed, so the iOS keyboard cannot detach it.

### 7.6 Semantics and progressive enhancement (all patterns)
- Heading order, landmarks and the table semantics are unchanged. Disclosure buttons live **inside** their `h3`.
- **With JS off:** every section renders fully open and readable, and the show-all and disclosure buttons do nothing (all items are already visible). The menu trigger still toggles nothing without JS, as today. The footer carries every nav link.
- All content stays in the DOM. Nothing uses `display:none` at load without a working reveal, except the empty SectionShell spacer, the decorative hero overlay if unused, and the desktop `.links` list, whose links live in the sheet and the footer.
- Targets are at least 44×44 with at least 8px to the neighbour. Full-width stacked rows separated by hairlines count as adjacent spacing under WCAG 2.5.8's row exception, and each still has at least 44px height.
- Reflow at 320 with 200% text zoom: no fixed heights except the hero (`min-height` with `svh`), and grids collapse to 1 column under `MQ_XS`.

---

## 8. Images, video, fonts and preloads

### 8.1 Crop pipeline (committed, re-runnable)

- `scripts/images/crops.json` (G13): `[{ src, name, ratio, focusX, focusY, widths }]`.
- `scripts/images/build-crops.py` (Pillow, like `scripts/logos/` and `scripts/icon/`). It is deterministic and skips unchanged outputs. It:
  - writes `public/images/m/{name}-{ratio}-{w}.webp` at quality 76, method 6
  - **never upscales**: it drops any width larger than the cropped source
  - writes `components/crops.generated.ts` with each crop's URL, width and height
- Run: `python scripts/images/build-crops.py`. The outputs are committed.

| Source | Phone crop (<600) | Widths | Tablet crop (600–1023) | Widths | Use |
|---|---|---|---|---|---|
| hero-poster.webp (1920×1080) | 4:5, focus x .60 | 480, 828, 1170 | 3:2, x .50 | 1200, 1600 | Home LCP, `fetchpriority=high` |
| hero-about.webp | 4:5, x .44 | 480, 828, 1170 | 3:2 | 1200, 1600 | About LCP, `fetchpriority=high` |
| hero-services.webp | 4:5, x .40 | 480, 828, 1170 | 3:2 | 1200, 1600 | Services LCP, `fetchpriority=high` |
| conference-room.webp (1200×900) | 16:9 | 480, 828, 1170 | 3:2 | 1200 (source cap) | Deliverables, lazy |
| stairway.webp (1450×700) | 39:14 | 480, 828, 1170 | 21:9 | 1450 (cap) | Figure band, lazy |
| classroom-lecture.webp (980×653) | 39:14 | 480, 828, 980 (cap) | 21:9 | 980 (cap) | Contact band, lazy |
| aaron-sokol.webp (486×450) | 4:5, x .50, focus y top | 256, 360 (cap) | same | same | Partner byline, lazy |

`sizes`:
- Full-bleed crops: `100vw`.
- Conference-room on phones: `calc(100vw - 40px)`. On tablets: `min(31em, calc(100vw - 64px))` (a little over the 459px column, so the chosen source is never too small; `sizes` em is 16px).
- Portrait: `112px` on phones and `128px` on tablets.

Logos are unchanged files. They are lazy, and their phone size comes from `--logo-w-m`.

Crops measured in the mockups: the Home hero 4:5 at 828w is 36 KB, against 111 KB for today's 1920 poster. The stairway band is 19 KB against 84 KB. Conference 16:9 is 53 KB against 158 KB. The 1170w hero serves DPR 3 phones, so the poster is no longer upscaled (A-home-10, C-cross-07).

### 8.2 Markup
Every photo goes through `Picture` (§5.7), with explicit `width`/`height` on every `source`, so CLS stays 0. The `<img>` fallback is today's element with today's attributes, so desktop decodes the same bytes into the same box.

### 8.3 LCP, lazy-loading and the preload and prefetch fixes
- **Exactly one eager image per page:** the hero `<picture>` with `fetchPriority="high"` (Home, About and Services; About and Services lack it today, B-pages-08, C-cross-08). Every other image is `loading="lazy" decoding="async"`: the Deliverables photo, the stairway figure, the contact photo, the portrait and the logos.
- **React preloads (C-cross-04):** React 19 emits `<link rel=preload as=image>` in `<head>` for non-lazy `<img>`. Making every below-fold image lazy removes those hints.
- **The "/" prefetch (C-cross-05, B-pages-07):** the prefetched Home RSC payload carried the same preload hints. They go with them.
  - **Acceptance check:** the Media & Perf engineer adds to `qa:bytes` an assertion that /about, /services-and-results and the legal pages request no `/images/*` file that belongs only to Home.
  - If that still fails, `RouteLink` gets `prefetch={false}` for `href="/"` (Foundation owns the file; Media & Perf specifies).
- **Hero preload correctness:** the built `<head>` of each hero page must contain **at most one** image preload, and at 390 the browser must not request the 1920px fallback. `qa:bytes` asserts this with a request log at 390 and at 1440.
  - If React emits a preload for the `<img>` fallback `src`, replace it with a responsive `ReactDOM.preload(…, { as:'image', imageSrcSet, imageSizes, fetchPriority:'high' })` for the phone crop, restricted with a `media` attribute if the React version supports it. Otherwise drop the auto-preload by relying on the `<picture>`'s own discovery.
  - Desktop parity must still pass.
- **Render-blocking CSS (C-cross-08):** Media & Perf evaluates `experimental.inlineCss` in `next.config`. It ships only if qa:desktop-parity stays at zero and the CSP (`style-src 'self' 'unsafe-inline'`) is satisfied (it is).

### 8.4 Hero video: poster first (G12)
`components/home/HeroVideo.tsx` mounts the `<video>` only when **all** of these hold:
1. hydrated
2. `!matchMedia('(prefers-reduced-motion: reduce)').matches`
3. `navigator.connection?.saveData !== true`
4. `!matchMedia(MQ_PHONE).matches`: **no video element at all below 600px**, so phones download zero video bytes (C-cross-06)
5. below 1024: after `window` `load` plus `requestIdleCallback` (2s timeout), so it never competes with the LCP. At ≥1024 the mount timing is unchanged from today (desktop freeze).

On tablets, `preload="metadata"`. The video fades in over the poster (opacity, 240ms) on `canplay`. There is no mobile encode and no ffmpeg pipeline. There is no pause control (owner decision; C-cross-16 is waived).

### 8.5 Fonts (G14)
`app/layout.tsx` adds `<link rel="preload" href="/fonts/instrument-sans-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous">`. It is same-origin, so it is CSP-safe. The latin-ext file is not preloaded.

### 8.6 Cache headers
`public/_headers` already covers `/images/*`, so `/images/m/*` inherits it. No new rule is needed unless the crops move out of `/images`. Media & Perf confirms this.

---

## 9. Performance budget (Lighthouse mobile, simulated, median of 3, every page)

| Metric | Gate | How this spec meets it |
|---|---|---|
| Performance | ≥95 | Phone LCP is the 36 KB hero crop or the H1 text. There is no video, no `rise` delay, and no below-fold preloads. |
| LCP | ≤2.0s | Same, plus `fetchpriority` on About and Services and the font preload |
| CLS | ≤0.02 | Explicit dimensions on every source. The CSS collapse happens at first paint (`scripting: enabled`), with no post-hydration collapse. The header changes colour only. |
| TBT | ≤100ms | About 1.2 KB gz of new client JS, and no rails or scroll-spy |
| Home transfer at 390 | ≤60% of today | Estimate: 260–300 KB against 621 KB of non-video today (~45%). The hero is 36 KB, 32 logos stay unfetched, and photos load lazily. |
| JS growth | ≤5 KB gz | Estimate ~1.2 KB: Disclosure plus ShowAll hook, sheet focus trap, ContactPill observer |
| Accessibility | 100 | Waived contrast aside; see §16 for how the owner waiver interacts with the LH A11y score |
| Best Practices / SEO | 100 | A-home-05 fixed; metadata unchanged |

---

## 10. Desktop freeze strategy

1. **Tokens:** new tokens and the `--nav-h`/`--gutter` overrides exist only inside `MQ_MOBILE` (§2). No existing token value is edited.
2. **CSS placement:** in every module, the mobile rules live in `@media (max-width: 1023.98px) { … }` blocks (plus the `MQ_XS`/`MQ_TABLET`/`MQ_TABLET_WIDE`/`MQ_SHORT` refinements), **appended at the end of the file** after every desktop rule. That way they also win over the kept 1087 query by source order. **Desktop rules are never edited.** Deleted patch queries are all ≤899px.
3. **Only two kinds of rule may exist outside the mobile layer**, and both are pixel-neutral by construction:
   - (a) Base rules that target **only new elements**, such as `.showAll`, `.contactPill` and the sheet: `display:none` by default, shown inside `MQ_MOBILE`.
   - (b) The `@media (min-width: 1024px)` neutralisers for **new wrappers**: the heading button `all: unset; display: contents`, the About chapter wrappers `display: contents`, and `picture { display: contents }` at every width.

   Nothing else may use `min-width: 1024px`.
4. **DOM changes allowed:**
   - `<picture>` around existing `<img>`s
   - the About chapter wrappers
   - `h3 > button` wrappers (About and Services)
   - ARIA and `id` attributes
   - the Show-all buttons, the Contact pill and the sheet, none of which produce a box at ≥1024
   - `--logo-w-m` next to `--logo-w`
   - inline grid-row styles on ServicesTabs

   JS applies `hidden` only while `MQ_MOBILE` (or the component's narrower `collapseQuery`) matches. SSR never emits `hidden`.
5. **Proof, per engineer, before hand-off:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run qa:desktop-parity` (1024, 1280 and 1440 against the Phase 0 goldens, pixelmatch threshold 0.1, **0 differing pixels**, video on its poster), `npm run qa:breakpoints`, `npm run qa:content` and `npm run qa:mobile-lint`. A parity failure is fixed by the engineer who caused it, **never** by regenerating the goldens or relaxing the threshold.
6. **Highest-risk items**, checked first by the integrator:
   - the About heading-button and wrapper `display:contents` at ≥1024
   - the ServicesTabs ARIA and inline styles
   - the font preload, which changes nothing visually but still has to be checked
   - the `<picture>` wrappers

   **Fallback** if a button with `display:contents` re-wraps text at ≥1024 in any engine: render the heading button only after hydration, when `MQ_MOBILE` matches. Use `useSyncExternalStore` with a server snapshot of false, so SSR and desktop keep the plain `h3`. The rows are below the fold on phones, so the swap causes no CLS.

---

## 11. Content integrity and the allowlist

- Copy is frozen. Every visible string comes from `content/*`. `JSON-LD`, `/llms.txt`, the sitemap, canonicals and metadata are byte-identical.
- **Owned by Foundation, pre-populated in Phase 3 step 1:** additions to `scripts/qa/content-allowlist.json`.
  - `words`/`segments`:
    - "Show all press", "Show all clients", "Show fewer"
    - the counts "9" and "48" (in `aria-hidden` spans)
    - "about EdCloud", only if the visually hidden fallback of §6.1 is used; the `aria-label` route adds no DOM text
    - the duplicated sheet strings ("Contact", "info@edcloud.org", "Tel: 510-306-2403"), which exist only while the sheet is open and are already in the DOM elsewhere
  - `hrefs`: none by default. `tel:` and `mailto:` on the legal pages only if the owner approves them (§16).
- **Services panel note:** Home's ServicesTabs puts only the active service's body in the DOM. That was true before this redesign and is recorded in the Phase 0 snapshot. This spec preserves it exactly (§7.1). It is not a regression, and every body is reachable through its row.

---

## 12. File ownership for Phase 3

Strict. One owner per file. Anything not listed belongs to the Integrator.

| Owner | Files | Notes |
|---|---|---|
| **Foundation** (goes first, merges before the others branch) | `app/tokens.css`, `app/globals.css`, `app/layout.tsx` (viewport-fit and font preload, including the Media & Perf preload line), `app/breakpoints.ts` (new), `components/useMediaQuery.ts`, `components/SectionShell.tsx` + `.module.css`, `components/SiteHeader.tsx` + `.module.css` (sheet included), `components/SiteFooter.tsx` + `.module.css`, `components/ui.module.css`, `components/LinkButton.tsx`, `components/RouteLink.tsx`, `components/Picture.tsx` (new), `components/Disclosure.tsx` + `components/ShowAll.tsx` (new shared primitives), `scripts/images/*` (new), `public/images/m/*` (generated), `components/crops.generated.ts` (generated), `scripts/qa/breakpoints-lint.mjs` (new) + its `package.json` script, `scripts/qa/content-allowlist.json` | `package.json` is Foundation's only for the `qa:breakpoints` line |
| **Home** | `app/page.tsx`, `app/home.module.css`, `components/home/ServicesTabs.tsx`, `components/home/ContactForm.tsx`, `components/home/ContactPill.tsx` (new) | Consumes Picture, Disclosure and ShowAll without editing them. Change requests go to Foundation. |
| **Pages** | `app/about/page.tsx`, `app/about/about.module.css`, `app/services-and-results/page.tsx`, `app/services-and-results/services.module.css`, `components/LegalPage.tsx`, `components/LegalPage.module.css` (new, optional), `app/privacy-policy/page.tsx`, `app/accessibility-statement/page.tsx` | `about.module.css` is shared with LegalPage today, so Pages owns both sides |
| **Media & Perf** | `components/home/HeroVideo.tsx`, `public/_headers`, `next.config.*`, `scripts/qa/bytes.mjs` and `scripts/qa/perf.mjs` (new assertions only) | Reviews every call site's `sizes`/`fetchPriority`/`loading` against §8. Specifies the font preload and any `prefetch={false}` change, but does not edit Foundation's files. |
| **Integrator** | `scripts/visual-diff.spec.ts` (parity only at ≥1024, with the mobile divergence recorded), `scripts/interactions.spec.ts` (selectors updated for the sheet, accordion and collapse point, each change listed in the PR), `scripts/qa/all.mjs`, `playwright.config.ts`, `docs/mobile/BASELINE.md` | Never touches `scripts/qa/golden/*` |

Resolved double claims:
- `components/home/HeroVideo.tsx` goes to Media & Perf, not Home.
- `app/layout.tsx` goes to Foundation, which carries the font preload for Media & Perf.
- The Picture helper goes to Foundation. Media & Perf owns only the wiring review, not the file.
- `about.module.css` goes to Pages (LegalPage imports it).
- `scripts/qa/*` is split per file as listed.

### Foundation API
How to call what Foundation built (breakpoint constants, the added `--m-column`/`--m-bar-h` tokens, the `ui` primitives, `SectionShell titleSize`, `Picture`, `Disclosure`, `ShowAll`, the header sheet and the new QA checks) is in [FOUNDATION.md](FOUNDATION.md). That page is a usage guide. Where it and this spec disagree, this spec wins.

---

## 13. Expected page heights at 390

| Page | Baseline | Winning mockup (measured) | This spec (estimate) | Target | Headroom |
|---|---:|---:|---:|---:|---:|
| Home | 12,065 | 6,961 | **~7,430** | ≤8,500 | ~1,070 |
| Services & Results | 9,867 | 6,874 (all six open) | **~5,220** (1 of 6 open) | ≤7,000 | ~1,780 |
| About | 9,153 | 3,970 | **~4,100** (2 of 8 open) | ≤6,500 | ~2,400 |
| Privacy Policy | 3,841 | — | ~3,300 | — | — |
| Accessibility | 2,370 | — | ~1,950 | — | — |

If Home drifts past 8,200 in Phase 3, the levers are, in order:
1. Press headline down to `--m-t-h3` (−30)
2. Clients cell height from 80 to 72 (−64)
3. Deliverables row padding down to `--s-3` (−48)

Content is never removed.

---

## 14. Traceability: every P0 and P1 finding in AUDIT.md

| ID | Sev | Finding (short) | Resolved by |
|---|---|---|---|
| A-home-01 | P0 | Colour contrast (axe) | **Waived by owner** (§1.4). The axe gate excludes `color-contrast`. |
| A-home-02 | P0 | Tap targets under 44px | §4, §5.2–5.4, §6.1 (44px row links, stretched press rows, footer rows), §7.6 |
| A-home-03 | P0 | Perf 90, LCP 3.7s, 3.6 MB | §8.1–8.5 (crops, lazy, no phone video, no `rise`), §9 |
| A-home-04 | P0 | Home 12,065px | §6.1, §13 (~7,430) |
| A-home-05 | P0 | "Read More" link-text | §6.1 row 01 (aria-label, or the visually hidden fallback) |
| A-home-06 | P1 | Services panel squeezed to 148px | §7.1, §6.1 row 02 (full-width accordion, no panel padding) |
| A-home-07 | P1 | Logos unreadable | §6.1 row 05 (2-column grid, `--logo-w-m`, 26–52px tall) |
| A-home-08 | P1 | Logo wall 2,630px on tablets and in landscape | §6.1 row 05 (4 columns, 24 visible on tablets; show-all), §5.5 B |
| A-home-09 | P1 | Hero overflows short phones and landscape | §6.1 hero (svh clamp), `MQ_SHORT` content-sized hero |
| A-home-10 | P1 | Poster upscaled 2.3× | §8.1 (1170w 4:5 crop) |
| A-home-11 | P1 | Featured Projects 1,957px | §6.1 row 03 (stat-first ledger, ~1,125) |
| A-home-12 | P1 | Contact photo pushes the form 468px down | §6.1 row 07 (39:14 band, 140px at 390) |
| A-home-13 | P1 | Counter indent, lopsided margins | §5.1 (rule header, symmetric gutters) |
| A-home-14 | P1 | Press 1,963px, nine repeated links | §6.1 row 06 (index, 3 visible plus Show all, stretched link) |
| A-home-15 | P1 | ~160px dead panel space on tablets | §7.1, §6.1 row 02 (accordion below 1024, measure cap) |
| B-pages-01 | P0 | For/How/When crushed to 102–212px | §6.3 row 02 (run-in `dt`/`dd` at 350px) |
| B-pages-02 | P0 | About and Services miss the length gate | §6.2, §6.3, §13 (~4,100 / ~5,220) |
| B-pages-03 | P0 | Colour contrast on four pages | **Waived by owner** (§1.4) |
| B-pages-04 | P1 | About 6,011px prose wall | §6.2 (chapter list, §5.5 A) |
| B-pages-05 | P1 | Counter-column indent | §5.1 |
| B-pages-06 | P1 | Service numbers look like section numbers | §5.1 (green inline `.idx` against the slate counter on the rule), §6.3 row 02 |
| B-pages-07 | P1 | Subpages download 413 KB of Home photos | §8.3 (lazy, so no preloads in the RSC payload; qa:bytes assertion; `prefetch={false}` fallback) |
| B-pages-08 | P1 | Subpage heroes 1920×1080 and not prioritised | §8.1, §8.3 (4:5 crops, `fetchpriority=high`) |
| B-pages-09 | P1 | Tablet grids strand items (3+1, 2+1) | §6.1 row 03 (2×2), §6.2 (2×2 numbers), §6.3 (phases 3-up only from 820, proof 4-up) |
| B-pages-10 | P1 | Legal H1 equals the H2s | §6.4, §5.1 `titleSize="page"` |
| B-pages-11 | P1 | Results labels 14px slate, invisible to axe | Contrast part **waived by owner**. The rest: §6.3 row 03 (run-in labels in 600 ink, `thead` kept in the a11y tree) |
| B-pages-12 | P1 | Heroes fill the first screen | §6.2 and §6.3 hero rows (svh clamps, `MQ_SHORT`) |
| B-pages-13 | P1 | Body copy at 15px | §2.1 (16px floor for running copy) |
| B-pages-14 | P1 | By The Numbers breaks the left edge | §6.2 row 03, §5.1 |
| C-cross-01 | P0 | Menu taller than a landscape phone | §5.3 (full-height sheet, scrolling middle) |
| C-cross-02 | P1 | Menu has no dismissal, focus or scroll lock | §5.3, §7.4 |
| C-cross-03 | P1 | Contact unreachable below 820 | §5.3 (sheet foot Contact pill, all pages except Services), §5.6 (Home pill) |
| C-cross-04 | P1 | React preloads below-fold photos | §8.3 |
| C-cross-05 | P1 | "/" prefetch pulls 404 KB | §8.3 |
| C-cross-06 | P1 | 3.15 MB video on phones | §8.4 (no `<video>` below 600, under Save-Data or reduced motion) |
| C-cross-07 | P1 | 1920 landscape heroes on portrait phones, no srcset | §8.1, §8.2, §5.7 |
| C-cross-08 | P1 | Subpage LCP 2.3–2.4s | §8.3 (`fetchpriority`, crops, inline CSS evaluation), §8.5 |
| C-cross-09 | P1 | Two tokens fail contrast | **Waived by owner** (§1.4) |
| C-cross-10 | P1 | 22–24px footer, brand and inline links | §5.2, §5.4, §4 |
| C-cross-11 | P1 | Touch tablets get the desktop nav | §3.1, §5.2 (collapse at 1024) |
| C-cross-12 | P1 | Input border 1.45:1, focus by glow | §6.1 row 07 (`--slate` border, 2px ring) |
| C-cross-13 | P1 | No autocomplete or enterkeyhint, 40px fields | §7.5 |
| C-cross-14 | P1 | 100vh hero 1.4 screens and a full tablet screen | §6.1 hero (svh clamp; tablet 640px), `MQ_SHORT` |
| C-cross-15 | P1 | Counter column squeezes text to 21–25 cpl | §5.1 |
| C-cross-16 | P1 | Video has no pause control | **Waived by owner** (§1.4). Phones get no video anyway (§8.4). |

P2s this spec also resolves (not gated):
- A-home-16 (§2.1), A-home-17 (§6.1 row 06), A-home-18 (§6.1 tablet), A-home-19 (§6.1 row 04, lazy), A-home-20 (§7.1), A-home-21 (§5.4)
- B-pages-15 (§6.2), B-pages-16 (§6.3), B-pages-17 (§6.3), B-pages-19 (§6.4, optional), B-pages-20 (§2.1 measure), B-pages-22 (§6.3)
- C-cross-17 (§2 `--gutter` override), C-cross-18 (§5.2), C-cross-19 (§2.1), C-cross-20 (§4), C-cross-21 (§3), C-cross-22 (§4.3), C-cross-23 (§2.1), C-cross-24 (§6.1 tablet)

Open: B-pages-18 (owner question, §16). Waived: B-pages-21 (contrast).

---

## 15. Non-negotiables checklist (brief §2, item by item)

| # | Non-negotiable | How this spec respects it |
|---|---|---|
| 1 | Desktop pixel-identical at 1024, 1280 and 1440 on every page (full page, pixelmatch 0.1, 0 px, video on poster) | §10: tokens and rules live only in `MQ_MOBILE`; only two pixel-neutral rule kinds exist outside it; the 1087 query is kept verbatim; the DOM additions produce no box at ≥1024; `qa:desktop-parity` runs at every hand-off; a failure is fixed by its author, never by regenerating goldens |
| 2 | CSS structure is free if the gate proves desktop unchanged | Max-width layer appended per module (§10.2), proven by the gate |
| 3 | Tablet (600–1023) changes are deliberate and shown in review | Listed deliberately: §3.1 (collapse at 1024), §6.1–6.3 tablet rows. The Integrator lists them in the PR with 768/820 screenshots. |
| 4 | Copy frozen: not a word, number, name, date or link changes | All strings come from `content/*`. Counts come from `.length`. New UI strings are limited to §11 and allowlisted. No link text or href changes; `tel:`/`mailto:` wait for the owner (§16). |
| 5 | All content sourced from `content/*` | Yes. The form attribute map and crop manifest are not copy. |
| 6 | All content reachable and in the DOM; disclosure allowed, no `display:none` at load without a reveal | §5.5 (`hidden="until-found"` set after hydration, CSS collapse only with `scripting: enabled` and a working button, `beforematch`), §7.6, §11 (the ServicesTabs status quo is preserved) |
| 7 | JSON-LD, `/llms.txt`, sitemap, canonicals and metadata byte-identical | Untouched. `viewport` gains `viewportFit` only (a meta viewport attribute, not metadata or JSON-LD), and qa:content verifies the rest. |
| 8 | No booking or "Book a meeting" CTA on /services-and-results | No new CTA anywhere on that page. The Contact pill is Home-only (G17, tested). The sheet foot has no Contact on Services and no booking link on any page. The pre-existing footer link is unchanged (it is frozen on desktop and owner-approved). |
| 9 | Links change colour slightly on hover, never underline, no arrow or chevron glyphs | §4.1–4.2: colour-only hover (behind `hover:hover`) and `:active` colour. The indicators are the 10px square on **buttons**, never on links. No glyphs. |
| 10 | Only brand primitives: mark, palette tokens, Instrument Sans; no new colours or fonts unless tokenised with a reason | No new colours or fonts. The scrim is `--ink` at alpha (tokenised as `--m-hero-scrim`, §2). `prefers-contrast` swaps existing tokens. The square indicator is the desktop tab dot. |
| 11 | Static export only; no new third-party requests | Crops are static files and all JS runs client-side. No external hosts. |
| 12 | CSP stays `'self'` | Same-origin font preload and images. Inline `style` attributes are already permitted by the current CSP. `_headers` is unchanged. |
| 13 | No new runtime dependencies (dev dependencies fine) | None. Pillow is a dev tool, as in `scripts/logos`. |
| 14 | Contact form fields, validation, endpoint and submit unchanged | §7.5: attributes only |
| 15 | Never commit secrets | No secrets are involved. The integrator checks the diff. |
| 16 | Lint, typecheck and build clean | §10.5 hand-off commands |
| 17 | `interactions.spec.ts` intent holds; selectors change only for deliberate behaviour changes, listed in the PR | §12, Integrator row (sheet, accordion ARIA, collapse at 1024) |
| 18 | `visual-diff.spec.ts` asserts reference parity only at ≥1024 and records the mobile divergence | §12, Integrator row |

---

## 16. Open items for the owner (defaults apply until answered)

1. **`tel:` link** on "Tel: 510-306-2403" (footer and sheet). It is a new href. **Default: no** (text only). `formatDetection.telephone` is already true, so iOS may auto-link it.
2. **`mailto:` links** in the legal body text (B-pages-18). **Default: no.**
3. **Lighthouse Accessibility 100 while contrast is waived:** LH A11y includes `color-contrast`, so the brief's A11y 100 cannot be met without palette changes. **Default:** the gate reads "100 excluding the `color-contrast` audit", in line with the owner's axe decision. qa:perf records the raw score next to it.

---

## 18. Text and margins (owner requirement, 2026-09-23; binding, overrides anything above)

The owner's words: "make sure the text looks good on the page, the site is mostly text. please make sure the margins are equal on both sides of the screen." These are **hard gates** for Phase 3 and every Phase 4 round, not polish.

### 18.1 Equal margins
1. At every width from 320 to 1023, the left inset and the right inset of every section's content column are equal within 1px. Phones: 20/20. Tablets and landscape: the column is capped (`--m-measure` plus gutters) and **centred**, so the white space is split evenly. Nothing is left-aligned with extra space on the right.
2. No text block starts inside the gutter or runs past it. Every `h1`–`h4`, `p`, `li`, `dt`, `dd`, `blockquote`, `figcaption`, `label` and table cell has `left ≥ gutter` and `right ≤ viewport − gutter`, with safe-area insets added in landscape.
3. On phones, no paragraph gets a narrower `max-width` than its column. Full-bleed media may reach the screen edges, but the text on or under it keeps the gutter on both sides.
4. The header wordmark and Menu button, the section rule headers, the body copy, the ledger hairlines and the footer all share the same left and right edges. Nested insets like the old 68/24 counter indent are not allowed.
5. **Enforced by qa.** The Foundation Engineer adds a `margins` check to `scripts/qa/mobile-lint.mjs` for rules 1 and 2. It runs at every lint width on every page, reports the offending selector with its L/R insets, and fails on any violation. Phase 4 critics also measure the L/R insets on their screenshots.

### 18.2 Text that reads well
1. Body text is 16–17px (`--m-t-body`), at line-height 1.5, 45–60 characters a line. Leads use 1.45. Text is left-aligned, never justified.
2. No stranded words. Headings and stat captions use `text-wrap: balance`, and paragraphs use `text-wrap: pretty`. Nothing a heading renders may leave a single word alone on its last line at any phone width (320–430). Phase 4 critics check paragraphs by eye at 320, 375 and 390, and fix bad breaks with CSS only, never by changing copy.
3. No automatic hyphenation (`hyphens: manual`). A compound like "K-12" must not break at its hyphen (A-home-17). Wrap it in a `<span data-nowrap>` (`keepTogether()` in `components/KeepTogether.tsx`); the DOM text stays identical and qa:content unwraps the span. "K-12", "long-term", dates and "Level AA" are wrapped in the server markup. Every other hyphenated compound ("non-text", "go-to-market", "sole-source") and a state + ZIP ("CA 94108") is wrapped by `components/KeepCompounds.tsx` once the page has hydrated below 1024, because a new span in desktop text moves its glyphs by a subpixel and desktop is pixel-frozen. A slash between two words stays a break opportunity: Chromium gives none after "/" there, so `KeepCompounds` adds a `<wbr>` after it (no character added; qa:content drops it). The word before a spaced dash is glued to it ("GiveCampus -"), so the dash ends a line and never starts one. Below 1024 the span is an inline `white-space: nowrap` run, **never an inline-block**: Chromium's find-in-page and `#:~:text=` treat an atomic inline as a block boundary, so a search across one fails (R3-a11y-01; `qa:mobile-lint`'s `find` check gates it). Every prose phrase fits a 320px line at 200% text except a full date (297px at 200%): its span is `data-nowrap="date"`, and a container query on the section column releases it where the column is narrower than 9.5em of body text (never at 100%). A disclosure heading's glued phrases (its last two words, or a parenthetical) hold only while the row fits them: the button is a size container and a container query in em of the title releases the glue below that, so enlarged text still reflows (WCAG 1.4.10).
4. Vertical rhythm comes only from the 4px spacing tokens: paragraph gap `--s-4` (16), heading-to-body `--s-3`/`--s-4`, section spacing per §4.5. No one-off margins.
5. Mobile type never gets tighter than the desktop brand (letter-spacing ≥ −0.01em on headings, 0 on body). No faux bold and no synthetic italics: weights are 400 and 600 only.
6. Phase 4's principal-designer critic reviews the rag, widows, measure, hierarchy and margin symmetry on every page at 320, 375, 390, 430, 768 and 844×390. Each finding cites a crop and a measurement.

---

## 17. Mockups and change log

Reference images (390px, DPR 2, real copy):
- [design/dense-home.png](design/dense-home.png): the winning base, Home (before grafts G1, G2, G5 and G6)
- [design/dense-services.png](design/dense-services.png): the winning base, Services (before G7 and G9: all six services shown open there)
- [design/dense-menu.png](design/dense-menu.png): the menu sheet (before the G11 Contact pill foot)
- [design/editorial-about.png](design/editorial-about.png): the grafted About chapter list, byline portrait and ledger numbers (G3, G4). The Editorial hero cover and plus/minus icons in it are **not** adopted (use the §6.2 hero and the §5.5 square).

Where a mockup and this text disagree, **this text wins**. The direction docs are kept for the record in [design/directions/](design/directions/) (`minimal-dense.md`, `editorial.md`, `product-grade.md`). Image paths inside them point at the designers' scratch folders.

| Date | Change | By |
|---|---|---|
| 2026-09-23 | Initial binding spec (Phase 2) | Judge panel chair |
| 2026-09-23 | §18 Text and margins (owner requirement): centred tablet column, no phone text caps, qa margins check, typography gates | Owner via lead |
| 2026-09-23 | **Phase 4 round 1.** (1) `--m-measure` 34em → **29em** (`--m-column` 578 → 493px at 17px): Instrument Sans sets ~0.47em a character, so 34em measured 71 cpl median on tablets, over §18.2's 45–60 (R1-designer-01). (2) **Tablets keep the phone's single-column ledgers**: cases, capabilities, press index, services, fit lists, results (stacked to 1023) and By The Numbers; the 3-up phases, the 4-column results table and the 240px partner column are gone. In the capped column those grids set text in 102–273px cells, narrower than a phone (R1-designer-02). Only the logo grid (4 columns) and the proof strip (2×2) stay multi-column; they hold no running text. This supersedes the 2-up/3-up/4-column tablet rules in §6.1–6.3 and B-pages-09's 2×2 remedies. (3) Proof strip 2×2 on tablets instead of 4-up: judge ruling ACCEPT (a 4-up cell cannot hold the nowrap "300 → 1.5M"). (4) By The Numbers: figure and title share a line, body at the full column (R1-designer-03). (5) Byline portrait 112×140 (128×160 on tablets) with the name vertically centred (R1-client-09). (6) No `role="region"` on About's eight chapter panels or on Home's `#svc-panel` (now `role="group"`): the landmarks match baseline (R1-a11y-07). (7) Pre-hydration collapse and tap replay in the defer-hydration loader, checked by `qa:early` (R1-a11y-05, -06). (8) Header 56px with a shadow edge and an opacity fade (R1-designer-10, R1-client-08); sheet scrolls whole in landscape (R1-a11y-13); footer flex columns with 8px between links (R1-a11y-01, -14). | Phase 4 fixer, per critics' findings and judge rulings |
| 2026-09-23 | **Phase 4 round 2.** (1) Disclosure and Home accordion rows are padded 16px top and bottom (`min-height` 56 kept), so a title that wraps keeps its one-line neighbours' ~22px from the hairline instead of ~14px (R2-designer-01). (2) `keepLastWords` glues two words and `&` counts as one: "GTM Strategy / & Positioning", not "GTM / Strategy & Positioning" (R2-designer-02). (3) §18.2.3: every hyphenated compound and a state + ZIP are kept whole below 1024, glued after hydration by `KeepCompounds` so desktop is untouched (R2-client-02, R2-designer-03, R2-client-03). (4) Footer: the link column is never narrower than its longest link (R2-client-03). (5) Tablet project captions keep the phone's two-line block (~14em), centred on the figure (R2-designer-04). (6) About byline: the bio and coda are both body copy, 16px/1.5; the lead rule is scoped to the Mission intro (R2-client-01; matches §6.2). (7) Find-in-page and `#:~:text=` into a collapsed Show-all list or disclosure reveal the whole list or group inside `beforematch`, so the browser scrolls to the final layout (R2-a11y-01). (8) Disclosure panel children get `min-width: 0` (200% text reflow, R2-a11y-02); the menu sheet's column is `minmax(0, 1fr)` (R2-a11y-03). (9) Forced-colours rules draw the disclosure/accordion squares, the current-page square and the filled pills in system colours; the palette is unchanged (R2-a11y-04). (10) Corrections from the judge's rulings: the contact band is 140px at 390 (390 × 14/39), the textarea is `rows={2}` with a 120px min-height, and the wordmark wraps from 360 to 381px. (11) `SiteHeader` is a server wrapper that passes its copy to `SiteHeaderClient` as props, so the client bundle no longer ships all of `content/copy.ts` (~2 KB gz); that keeps About and Services inside the §9 5 KB JS growth budget with `KeepCompounds` added. | Phase 4 fixer, per critics' findings and judge rulings |
| 2026-09-23 | **Phase 4 round 3.** (1) §18.2.3: glued phrases are inline `white-space: nowrap`, not inline-blocks, so find-in-page and `#:~:text=` match across them below 1024 (60 of 60 searches failed before; R3-a11y-01). Disclosure-heading glue is held by a container query on the button (last pair from 12em, a parenthetical from 16em of the title), so it lets go at 200% text. `qa:mobile-lint` gains a `find` check. (2) `--m-measure` 29em → **27em** (`--m-column` 493 → 459px at 17px): 29em still set 41% of About's tablet lines past 60 cpl, up to 68; 27em measures median 56, max 63 (R3-designer-03). (3) §5.6: on phones the Contact pill's right inset is `var(--gutter)` (20px), the column's edge, not 16px (R3-designer-02); it also hides while a Show-all button is in the bottom 96px, where the two pills overlapped (R3-client-01). (4) Home project captions are capped at 14em on phones too, so all four are 2-line blocks from 360 up (R3-designer-01). (5) Fit lists and legal list items use `text-wrap: balance` (short items; pretty left one-word last lines at 320; R3-designer-04). (6) A disclosure title's parenthetical is glued, "Our approach / (operator first, not just advisory)" (R3-designer-05). (7) The word before a spaced dash is glued to it, so no line starts with "-" (R3-client-02). (8) Results outcomes glue the first two words after a semicolon, so balance breaks at the semicolon (R3-client-03). | Phase 4 fixer, per critics' findings |
| 2026-09-23 | **Phase 4 round 4.** (1) `--m-t-display` stops at 44px (`clamp(…, 2.75rem)`): from 600 the hero text sits in the fixed 459px column, and past ~45px "Education Companies" no longer fit one line, so the Home H1 set in 4 lines at 737–1023. It is now 3 lines from 366 to 1023; `qa:mobile-lint` gains a `headline` check (R4-designer-01). (2) The hero lead is glued like the rest of the site (`keepTogether`), so "experience -" no longer starts a line at 356–364, 449–460, 468–487 or 600–1023. Its line count is unchanged at every width from 320 to 1023, so the bottom-anchored H1 does not move when the spans arrive; `qa:mobile-lint` gains a site-wide `dash` check (R4-designer-02). (3) The 10px square on disclosure and Home accordion rows sits on the title's first line (`align-self: start`, `margin-top: (1lh − 10px) / 2`), not the middle of a wrapped title (R4-designer-03). (4) §5.2: at enlarged text the header and sheet bars grow and answer container queries (tail hidden, then tracking and pill padding tightened) instead of clipping the wordmark (R4-a11y-01). (5) §18.2.3: the date glue is released where the column is narrower than the date (R4-a11y-02); a `<wbr>` follows a slash between words (R4-a11y-03). (6) SectionShell's column is a size container; under 11em of body text (200% text on phones only) the section counter, the service number, the By The Numbers figure and the capability number take their own line above the title, and the press date wraps under its source, so no title breaks mid-word beside a side element (R4-a11y-04). (7) Legal list items under 90 characters balance; longer ones keep the prose `pretty`, which leaves no one-word last line from 320 to 430, instead of balance pulling every line of a 4-line bullet in by 50–76px (R4-client-01). (8) The footer LinkedIn glyph is pulled back by its 3.13px viewBox inset so it starts on the shared left edge (§18.1 rule 4; R4-client-02). (9) `qa:mobile-lint`'s 200% pass runs at 320 and 390 and adds `clip`, `nowrapEdge` and `split` checks. (10) Doc corrections from the judge's rulings: §6.1 row 07 now says `rows={2}` (it contradicted §7.5); the Results client line stays SPEC §6.3 G9 13px/600 uppercase, and that deviation record is closed; About chapter rows keep 16px vertical padding (the 4px proposal is rejected); the wordmark's two-line range is 360–381, as §5.2 says. | Phase 4 fixer, per critics' findings and judge rulings |
