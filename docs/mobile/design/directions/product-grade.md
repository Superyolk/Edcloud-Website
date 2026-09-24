# Direction B: Product-grade

> The phone site should feel like a best-in-class product site: every section is one component with one job. You can see it in one or two screens, it has one clear interaction, and the controls look identical everywhere they appear.

**Mockups** (all in this folder, built from the repo's real `content/copy.ts` and `content/content.js` by `gen.cjs`, rendered by `shoot.cjs` in Playwright Chromium at DPR 2):

| File | Viewport | Document height |
|---|---|---|
| `product-home.png` | 390 wide, full page | **6,777 px** (baseline 12,065; target ≤ 8,500) |
| `product-services.png` | 390 wide, full page | **5,969 px** (baseline 9,867; target ≤ 7,000) |
| `product-home-320.png` | 320 wide, full page | 7,354 px. `scrollWidth` = 320, so there is **no horizontal overflow** |
| `product-menu.png` | 390×844 | The menu sheet in its open state |

In every render, the automated check found 0 elements past the viewport edge (rails excluded, because they scroll by design) and 0 text nodes under 13 px. The mockup HTML (`product-*.html`) and `product.css` are the source of truth for the measurements below.

Scope, per the owner's decisions today: the colour-contrast findings (A-home-01, B-pages-03, B-pages-11 contrast part, C-cross-09) and the hero pause control (C-cross-16) are **waived**. No palette token changes. The axe gate is "zero violations other than `color-contrast`".

---

## 1. The idea in five moves

1. **One section header, many times.** The desktop's 72px counter column becomes a **counter chip**: "01" in a 26px pill with a 1px `--line` border, placed *beside* the title on the same row. Content then runs the full measure, 390 − 2×20 = 350px. The lopsided 68/24 margins go away, and so does every nested indent (A-home-13, B-pages-05, C-cross-15).
2. **Disclosure, not deletion.** Home Services, Services "What we do" and Press all collapse behind real `<button aria-expanded>` controls. Collapsed content stays in the DOM under `hidden="until-found"`: it is indexable, find-in-page opens it, and it never uses `display:none`.
3. **Rails with a pager.** Featured Projects (4 cards) and the logo wall (48 logos, as 6 pages of 2×4) become scroll-snap rails with a 16px peek and a **square-dot pager**. The dot is the desktop tab's 10px green square, reused, so there are no chevrons anywhere.
4. **One control vocabulary.** There are exactly four interactive shapes: the pill button (the existing Menu/SUBMIT shape), the row button (56px, a hairline between rows, the green square on the right), the square pager dot, and the plain text link (the green and ink link styles as they are). Each looks the same wherever it appears.
5. **The thumb owns conversion.** On Home only, a floating **Contact** pill docks bottom-right after the hero and hides while `#contact` is on screen. It never appears on `/services-and-results`. The menu sheet puts Contact (Home) or email/tel (every page) at the bottom of the sheet, in thumb reach.

The brand stays square: cards, images and inputs keep `--radius: 0`, and only buttons and chips are pills. This direction reads as "product" through precision and consistency, not through rounded corners.

---

## 2. Tokens

The new tokens are added to `app/tokens.css` with the `--m-` prefix, **inside `@media (width < 1024px)`**, so no desktop value is ever redefined. The existing brand tokens are untouched.

### 2.1 Breakpoints (the only media queries allowed)

CSS custom properties cannot be used inside `@media`, and PostCSS custom-media would add a build dependency. So the scale is a **named, closed set of literal queries**. Each one is documented once in `tokens.css`, and a `qa:mobile-lint` grep rule fails the build on any other `@media` width.

| Name | Query | Covers |
|---|---|---|
| `--bp-compact` | `(width < 360px)` | 320 SE (1st gen) only: the wordmark tail drops, the form goes to 1 column |
| `--bp-phone` | `(width < 600px)` | 320–599: every phone in portrait |
| `--bp-wide-phone` | `(414px <= width < 600px)` | Gutter goes from 20 to 24 (Pro Max, 414 and 430) |
| `--bp-tablet` | `(600px <= width < 1024px)` | 600–1023: 768/820 portrait, and phones in landscape |
| `--bp-short` | `(width < 1024px) and (max-height: 500px)` | 844×390 landscape: hero and sheet adjustments |
| `--bp-mobile` | `(width < 1024px)` | **The wrapper for every new rule** |
| (desktop) | `(width >= 1024px)` | No new rules. Existing CSS only |

This replaces 359, 439, 599×4, 799, 819/820, 899 and 1087 (C-cross-21). The desktop nav's 820 collapse moves to 1024, which fixes C-cross-11 (touch tablets at 820–1023 were getting 14px desktop links). Because 1024 and up is unchanged, the parity gate is unaffected.

### 2.2 Type (Instrument Sans only, weights 400/500/600)

| Token | Value | @320 | @390 | @768 | Use |
|---|---|---|---|---|---|
| `--m-t-display` | `clamp(2.25rem, 1.2rem + 4.6vw, 3rem)` | 36 | 37.1 | 48 | Hero H1, page H1s. lh 1.06, `text-wrap: balance` |
| `--m-t-h2` | `clamp(1.625rem, 1.3rem + 1.4vw, 2rem)` | 26 | 26.3 | 31.6 | Section titles, contact H2. lh 1.15 |
| `--m-t-h3` | `clamp(1.125rem, 1.02rem + 0.5vw, 1.3125rem)` | 18 | 18.3 | 20.2 | Card and row titles. lh 1.25 |
| `--m-t-lead` | `clamp(1.125rem, 1.06rem + 0.3vw, 1.25rem)` | 18 | 18.2 | 19.3 | Leads, accordion rows, hero lead. lh 1.5 |
| `--m-t-body` | `clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)` | 16 | 16.2 | 17 | **All body copy**. lh 1.55, `text-wrap: pretty` |
| `--m-t-meta` | `0.875rem` | 14 | 14 | 14 | Labels, buttons, statLabel, form labels |
| `--m-t-micro` | `0.8125rem` | 13 | 13 | 13 | Counters, press meta, dt. **This is the floor** |
| `--m-t-stat` | `clamp(2.5rem, 2rem + 2.4vw, 3rem)` | 40 | 41 | 48 | Case stats, About numbers |
| `--m-t-stat-sm` | `clamp(1.5rem, 1.3rem + 1vw, 1.875rem)` | 24 | 24.7 | 28 | Services proof tiles (2×2) |

Measured results: the hero H1 is **4 lines at 320, 375 and 390**, balanced, with no orphan. Body copy runs 38–46 characters a line at 390 (with a 350px measure at 16.2px). On tablets, prose is capped at `max-width: 62ch` (C-cross-19, B-pages-20). Every `--t-body-sm` 15px and `--t-small` 14px *body* use moves to `--m-t-body` (A-home-16, B-pages-13, C-cross-23).

### 2.3 Space (4px base)

`--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 20 · `--s-6` 24 · `--s-8` 32 · `--s-10` 40 · `--s-12` 48 · `--s-16` 64.

| Role | Token | Phone | Tablet |
|---|---|---|---|
| Gutter `--m-gutter` | `--s-5` | 20 (24 from 414) | 32 |
| Section padding `--m-section` | `--s-12` | 48 | 64 |
| Header → content `--m-head-gap` | `--s-5` | 20 | 24 |
| Card padding | `--s-6` / `--s-5` | 24 top, 20 sides | 32 |
| Rail gap | `--s-3` | 12 | 16 |

The header uses the same gutter as the content, which fixes C-cross-17.

### 2.4 Radius, elevation and motion

- **Radius:** `--m-r-0: 0` (cards, images, inputs, the sheet), `--m-r-pill: 999px` (buttons, counter chips, duration chips). Nothing else.
- **Elevation** is the brand's even, non-offset shadow at two strengths: `--m-e-1` = `--shadow-card` (cards and panels), `--m-e-2: 0 0 28px rgba(27,36,49,.22)` (the floating Contact pill only).
- **Motion:** `--m-dur-1: 150ms` (press feedback), `--m-dur-2: 200ms` (disclosure indicator, pager dot), `--m-dur-3: 250ms` (sheet, dock). There is one easing, `--m-ease: cubic-bezier(.2,.7,.2,1)`, the existing `--ease` value. Only `transform` and `opacity` animate. Under `prefers-reduced-motion: reduce` every duration is 0 and `scroll-behavior` stays `auto`.
- **Touch:** `-webkit-tap-highlight-color: transparent` everywhere, replaced by a deliberate `:active` state: pills `scale(.98)`, row buttons and press rows get a 25%-alpha `--line` wash (`rgba(197,220,203,.25)`), and text links switch to `--growth` on `:active`. Hover styles are wrapped in `@media (hover: hover)`, so taps never stick (C-cross-20).

---

## 3. Chrome

### 3.1 Header (56px)

- Sticky, `height: 56px`. Left and right padding are `max(var(--m-gutter), env(safe-area-inset-left/right))`.
- Brand: the 24px mark plus the wordmark at **13px**, weight 600, tracking 0.08em (C-cross-18: it was 12px). The "VENTURE PARTNERS" tail shows from 360px up and hides only at `--bp-compact`. The link box is ≥44px tall (C-cross-10).
- The **Menu** pill is 44px tall, at least 76px wide, with a 1.5px `--nav-ink` border (the existing shape).
- Over a hero, the header is transparent with white ink. It turns solid white with a `--line` border once `scrollY > 40` (existing logic). The colour change is instant; the only transition is on `opacity` of a pseudo-element background, so there is no layout shift. A 140px top **scrim** (ink at 0.55 fading to 0) sits in each hero, so white ink holds on bright photos (see the Services render).
- The header does not hide on scroll. That behaviour is optional in the brief, and a stable header is calmer.

### 3.2 Menu sheet (`product-menu.png`)

- It is a `role="dialog" aria-modal="true" aria-label="Menu"` element, full height (`height: 100dvh`), white, square, and covers the whole screen. Its own 56px header row repeats the brand, and the button reads **Close** in the same position, so the trigger never moves.
- Primary rows (Home, About, Services & Results from `SHARED.mobileMenu`) are 28px/600 at ≥64px tall with hairlines between them. The current page carries `aria-current="page"` and the 10px green square. Secondary rows (Privacy Policy, Accessibility) are 18px/500 at 56px.
- The **sheet foot** is pinned to the bottom (`grid-template-rows: auto 1fr auto`), on `--paper`, with `padding-bottom: env(safe-area-inset-bottom)`:
  - On Home only, a solid **Contact** pill (`SHARED.navLinks[2].label`) jumps to `#contact` and closes the sheet. This resolves C-cross-03.
  - On every page there is a row with `info@edcloud.org` (mailto) and the existing "Tel: 510-306-2403" string as a `tel:` link. **Book a Meeting is never in the sheet**, so no booking CTA can reach `/services-and-results`.
- Behaviour, in about 1.2 KB of the SiteHeader client code:
  - Focus trap (Tab and Shift+Tab cycle within the sheet), `Esc` closes, and focus returns to the trigger.
  - `aria-expanded` and `aria-controls="menu-sheet"` on the trigger.
  - iOS-safe scroll lock: `position: fixed; top: -scrollY` on `body`, with the scroll position restored on close. `overscroll-behavior: contain` on the sheet.
  - Opening animates `opacity 0→1` and `translateY(-8px)→0` over 250ms `--m-ease`; the animation is off under reduced motion.
  - The sheet element is always in the DOM (`hidden` when closed), so there is no layout on open.
- At 844×390 (`--bp-short`), primary rows drop to 52px at 22px type and the sheet body scrolls. Its last link is always reachable (C-cross-01 P0).

### 3.3 Footer

- Two columns at every phone width (1.3fr / 1fr), 14px. Every link row is ≥44px tall, and the address lines are 26px rows.
- The phone number becomes a `tel:` link on the existing string (A-home-21). This adds an href, so it needs the owner's sign-off and a content-integrity snapshot update (see §9).
- Bottom bar: the brand mark link (44px) and the copyright, with padding-bottom `24px + env(safe-area-inset-bottom)`.
- Tablet: three columns (contact, nav, brand).

### 3.4 Floating Contact (Home only)

- The pill is 48px tall, `--ink` background, white text "Contact" (`SHARED.navLinks[2].label`, an existing string) with an 8px green square before it. `--m-e-2`. It is fixed at `right: max(16px, safe-area)` and `bottom: max(16px, safe-area-bottom)`.
- One IntersectionObserver in the home client bundle (about 0.4 KB) shows it once the hero leaves the viewport and hides it while `#contact` intersects. It also hides while any input has focus (`:has(input:focus)` on `body`, plus a JS class fallback), so it never sits on top of the iOS keyboard.
- Show and hide are `opacity` plus `translateY(12px)` over 250ms. Hidden means `visibility: hidden`, so it is not focusable.
- It is rendered only by `app/page.tsx`. It is not in SiteHeader and not in the layout, so it cannot leak to other pages.
- In `product-home.png` the pill is drawn statically over Deliverables to show where it sits. In the build it is `position: fixed`.

---

## 4. Home, section by section (heights measured at 390)

| Section | 390 | 320×568 | 844×390 | Pattern |
|---|---|---|---|---|
| Hero | 680 | 525 | 404 | Poster-first, 3:4 art-directed crop |
| 01 Our Promise | 806 | 979 | 572 | Lead, then two body paragraphs, then Read More |
| 02 Services & Results | 647 | 766 | 563 | Accordion (first row open) |
| 03 Featured Projects | 561 | 654 | 486 | Rail of 4 with a pager |
| 04 Deliverables | 1,346 | 1,442 | 1,325 | Lead, one 16:9 photo, tight numbered list |
| Stairway figure | 167 | 137 | 362 | 21:9 full-bleed band |
| 05 Select Clients | 518 | 518 | 525 | Rail, 6 pages of 2×4 logos |
| 06 Press | 690 | 713 | 582 | Newest 3, then "Show all press" |
| 07 Contact Us | 957 | 1,043 | 1,163 | Card: photo band, H2, form |
| Footer | 405 | 422 | 367 | |
| **Total** | **6,777** | **7,199** | **6,348** | Target ≤ 8,500 |

**Hero.** `min-height: min(100svh - 72px, 680px)`: at 390×844 the next section's hairline and 48px of paper show at the bottom of the first screen (A-home-09, A-home-18, C-cross-14). The copy is bottom-aligned over a 40%-height ink gradient (0 to 0.62). The H1 is 4 lines, the lead 18px, and there is no CTA in the hero. `.heroLead` loses its fixed 810×92 box below 1024 (it already did below 900).
- At 320×568 the hero is 525px, so the H1 and lead fit above the fold.
- At 844×390 (`--bp-short`) the hero is `min-height: 100svh` minus the 56px header, the lead is capped at 3 lines with `max-width: 60ch`, and the H1 is 2 lines.

**01 Our Promise.** Counter chip, then the title. The lead is at `--m-t-lead` in ink; p2 and p3 are at `--m-t-body`. **Read More** becomes a 44px-tall text link. For A-home-05 (the link-text SEO finding), the spec adds `aria-describedby` pointing at the section H2 ("Our Promise"), so the accessible description is richer while the visible text stays unchanged. This needs to be verified against the Lighthouse `link-text` audit. If it still fails, the fallback is a visually hidden suffix, which counts as a copy change and goes to the owner.

**02 Services & Results → accordion.** The current `aria-pressed` tabs become an APG accordion: `<h3><button aria-expanded aria-controls>` over `<div role="region" hidden="until-found">`.
- Each row button is ≥56px, with the title at 18px (slate when collapsed, ink/600 when open). The indicator is the existing 10px square: an outline when collapsed, and filled green and rotated 45° when open (`transform` only, 200ms).
- The open panel is a white `--m-e-1` card with the lead at 22–26px green/600, the body text, and the "Services & Results" link with a hairline above it.
- Only one row is open at a time, and row 1 is open at load. There is no hover activation on touch (A-home-20). Opening a row doesn't move focus; the expanded state is announced through `aria-expanded`.
- This fixes A-home-06 (the panel is now the full 350px measure, 310px of text) and A-home-15 (no dead space on tablets, see §7).

**03 Featured Projects → rail.**
- The track is `grid-auto-flow: column; grid-auto-columns: calc(100% - 28px)`, which gives cards 322px wide with a 16px peek of the next one, `scroll-snap-type: x mandatory`, a 12px gap, and bleed to the screen edge using negative gutter margins and `scroll-padding-inline: var(--m-gutter)`.
- Cards are white, `--m-e-1`, square, in DOM order: title (18px), body (16px), rule, stat (41px green, tabular), statLabel (14px). Height is set by the tallest card, about 480px.
- The **pager** is 4 buttons, each 44×44, containing an 8px square. The current one is green and `scaleX(2.5)`. Tapping one calls `scrollTo` on the card. The current page is tracked with an IntersectionObserver on the cards (threshold 0.6).
- Semantics: `role="region" aria-roledescription="carousel" aria-label="Featured Projects"`, `tabindex="0"` (arrow keys scroll natively), each card an `<article aria-roledescription="slide" aria-label="n of 4">`, and pager buttons `aria-label="Show project n"` with `aria-current`.
- No autoplay. The scrollbar is hidden on rails only.
- Compared with the stacked alternative: stacking tight cards (no rule, the stat inline beside the title) still measures about 1,350px, while the rail is 561px. The rail wins by about 800px and gives the section a "swipe the wins" gesture. A-home-11 is resolved.

**04 Deliverables.** The lead (18px), then **one** photo (the conference room, 16:9, full-bleed, lazy, `<picture>` 480/828/1170), then the 6 capabilities as a tight list: a 32px green index column (13px/600) plus the title (18px) and the description (16px), 16px vertical padding and a hairline between rows. This resolves the photo/list/photo stack and A-home-19 (the photo is 196px tall and lazy).
- Honest trade-off: this is the tallest section at 1,346px, because all six descriptions stay visible. A disclosure would save about 500px, but these are one-line value statements and should read at a glance. If the judges want more headroom, collapsing the descriptions is the lever.

**Stairway figure.** A 21:9 art-directed crop, full-bleed, 167px tall, lazy.

**05 Select Clients → paged logo rail.**
- 48 logos are laid out as 6 pages × (2 columns × 4 rows): `grid-auto-flow: column; grid-template-rows: repeat(4, 72px); grid-auto-columns: calc((100% - 24px)/2)`. Each tile is 163×72, white with a 1px `#E4EFE7`-equivalent hairline. (That value is `--line` at 50% over white, written as `color-mix(in srgb, var(--line) 50%, white)` so no new colour is added.) `nth-child(8n+1)` is the snap point.
- **Mobile logo sizing:** each logo still gets equal ink area, `min(√(2600·ratio), 131, 40·ratio)` in `app/page.tsx`, emitted as a second custom property `--logo-w-m` next to `--logo-w`, so desktop is untouched. The widest wordmarks (BookNook 6.6:1, Handshake 6.3:1) render about 20px tall, where today the smallest is 6.3px at 320 (A-home-07). Two columns is what makes that possible.
- The 6-dot pager works like the Featured Projects pager.
- The section is 518px at every phone width and 525px in landscape, where the wall was 2,630px on tablets and in landscape (A-home-08).
- All 48 `<li><img alt>` are in the DOM in source order. The rail is `tabindex="0"` with `aria-label="Select Clients"`.

**06 Press → newest three plus a toggle.**
- Each row: a meta line at 13px slate (source · date; the dot is a 3px CSS square, not a glyph), the H3 at 17px/600, then "Read The Full Article" at 14px green/600 in a 44px box. The link's `::after { inset: 0 }` makes **the whole row the tap target** while the link text stays unchanged. Rows are about 150px.
- Items 4–9 carry `hidden="until-found"`, with padding and border zeroed so the collapsed rows take no space.
- **Show all press** is a real `<button aria-expanded="false" aria-controls="press-list">`: a full-width outline pill, 48px. Activating it removes `hidden` from the six rows, sets `aria-expanded="true"`, moves focus to the 4th item's link, and removes the button. There is no "Show fewer", which keeps the added UI strings to one.
- `beforematch` (find-in-page) expands the list the same way.
- The press H3 gets `hyphens: manual; overflow-wrap: normal` plus a `white-space: nowrap` span around "K-12" in the render layer, so the headline no longer breaks as "K-" / "12" (A-home-17). The DOM text is unchanged.
- Result: 690px (it was 1,963). Resolves A-home-14.

**07 Contact.** A single white `--m-e-1` card:
1. A 2:1 photo band (the classroom, 175px, lazy). The photo stays, but it no longer pushes the form down by 468px (A-home-12).
2. The H2 at 26px, balanced.
3. The form: First and Last name side by side (2 × 150px at 390; a single column at `--bp-compact`), then Email, Phone and Message at full width. Labels are 14px/500 ink and sit above the fields.
   - Inputs are **48px tall at 16px** (no iOS zoom), with square corners, a 1px `#9BB8A4`-equivalent border (`color-mix(in srgb, var(--line), var(--ink) 20%)`), and focus shown by the standard 2px green `:focus-visible` outline instead of `outline: none` (C-cross-12).
   - The textarea is 128px (5 rows).
   - Attributes (C-cross-13):

     | Field | `autocomplete` | `enterkeyhint` | `inputmode` |
     |---|---|---|---|
     | First name | `given-name` | `next` | |
     | Last name | `family-name` | `next` | |
     | Email | `email` | `next` | `email` |
     | Phone | `tel` | `next` | `tel` |
     | Message | | `send` | |

   - **SUBMIT** is a full-width 52px solid pill, the last element, in the thumb zone.
   - The field names, validation, endpoint and submit logic are untouched.

At 844×390 the card becomes two columns (photo left, 40%; form right).

---

## 5. Services & Results (`product-services.png`)

| Section | 390 | 320×568 | Pattern |
|---|---|---|---|
| Hero | 560 | 409 | 4:5 crop, bottom-aligned H1 and lead |
| Proof strip | 268 | 267 | 2×2 grid |
| 01 How an engagement works | 934 | 1,029 | Vertical stepper |
| 02 What we do | 1,484 | 1,743 | 6 disclosure cards, result visible |
| 03 Results | 1,449 | 1,593 | 4 outcome-first cards (table semantics kept) |
| 04 Is this a fit | 870 | 962 | Two checked lists |
| Footer | 405 | 422 | |
| **Total** | **5,969** | **6,424** | Target ≤ 7,000 |

**Hero.** `min-height: min(72svh, 560px)`, with a 4:5 crop (`hero-services-828.webp`) focused on the three students. The copy is bottom-aligned over a 25%→100% ink gradient (0 to 0.7), with the header scrim at the top. The proof strip shows at the bottom of the first 844px screen, so the page promises more below (B-pages-12). The image is the LCP element: `fetchpriority="high"`, `<picture>` 480/828/1170 (B-pages-08).

**Proof strip → 2×2.** White tiles with hairline dividers (the cross is drawn by `border-left` on even tiles and `border-top` on tiles 3 and 4). Each tile holds the stat at `--m-t-stat-sm` green, tabular and nowrap ("300 → 1.5M" fits in 150px at 24.7px), the label at 14px, and the client at 13px/600 ink. Every tile uses the same top alignment, so label baselines line up (B-pages-16).

**01 → vertical stepper.** The lead, then an `<ol>` of 3 steps. Each step has a 36px ink square holding the white "01" (13px/600), and a 1px `--line` spine connects the squares. The duration shows as a pill chip ("2 to 3 weeks"), then the H3 title (18px), then the 16px body. This reads as a sequence, which three stacked cards did not.

**02 What we do → disclosure cards.** Six `<li>` cards, 1px `--line` border, square corners. The open card switches to `--m-e-1` with no border.
- The whole header is the APG button inside the `<h3>`: index (13px green, 32px column), title (18px/600), the square indicator, and **the result line visible while collapsed** (14px `--growth-ink`/500). "Predictable pipeline that does not depend on the founder." stays scannable without opening anything.
- The panel (`hidden="until-found"` unless open) holds the pitch (16px), then the **For / How / When** `<dl>` **stacked label-above-value** at the full 294px panel measure. `dt` is 13px/600 slate, `dd` 16px. This resolves B-pages-01 (the answer column was crushed to 102–212px) and C-cross-15 (11 characters a line in `dd`).
- Service 01 is open at load. More than one can be open.
- The index column uses a different element and size from the section chips, so the 01–06 item numbers no longer read like section numbers (B-pages-06).

**03 Results → outcome-first cards.** The `<table>` stays, as a real table for the DOM and desktop. Below 1024 the rows render as `display: grid` cards. Each card has the client (18px/600), the Outcome label (13px) above the outcome at 18px green/600 (the headline of each card), then a hairline and a two-column pair: Where we started / What we built, with 13px labels over 16px values.
- The labels come from the existing `data-label` attributes through `td::before { content: attr(data-label) }`. `thead` is visually hidden, not `display:none`, so the table semantics survive for screen readers. `role` attributes are restored on the `display`-changed elements (`table`/`row`/`cell`) to keep VoiceOver table navigation.
- Resolves B-pages-11 (layout part) and B-pages-17 (tablet uses the same card layout, 2 per row).

**04 Is this a fit.** Two lists stacked, each H3 18px. Items are 16px with the existing check/dash SVGs in a 24px column and a hairline above each row: 870px, where the audit measured 1,097 (B-pages-22).

**No booking or Contact affordance anywhere on this page.** There is no floating pill, and the menu sheet shows email and tel only. The footer's existing Book a Meeting link is untouched (it is an owner-approved footer element present on desktop too).

---

## 6. About and legal (not mocked; same system)

**About** (estimated 5,900px at 390, target ≤ 6,500; baseline 9,153):

- **Hero:** a 4:5 crop at `min(60svh, 480px)`, bottom-aligned H1 "About Us", scrim. About 480px.
- **01 Mission & History (the long prose, B-pages-04, 6,011px today):**
  - The "About EdCloud" H2 and first paragraph are shown in full, 16px on a 350px measure.
  - Then an **in-page index rail**: a horizontal scroll-snap strip of pill chips, one per H3 ("Our mission", "How we think about scale", … "Why now"), each 44px tall. The chips are anchor links **built from the existing H3 strings** (duplicated link text; see §9 for the content-integrity note). The chip for the H3 currently in view gets the green square (IntersectionObserver). The strip is `position: sticky; top: 56px` while the Mission section is in view, which gives the long read an app-like "where am I" rail. It does not collapse any prose.
  - The nine H3 subsections become **accordion rows** exactly like Home Services: the H3 wraps a button, and the panels use `hidden="until-found"`, with "Our mission" open by default. The chips open the matching panel and scroll to it.
  - Collapsed, the section is about 1,450px (intro 700 + 9 rows × 64 + chips). With everything open it is the full 6,000px, by the reader's choice.
  - The two `<ul>` lists inside panels use a 16px hanging indent and `strong` leads.
- **02 Managing Partner:** the headshot is a 96×96 square beside the H2 "About Aaron Sokol" (a media-object header), then the bio at full measure below. That is about 620px, compared with a full-width 350px-tall headshot. On tablets the headshot is 200px in the left column and the bio on the right (B-pages-15).
- **03 By The Numbers:** a 2×2 grid of stat cards (stat 41px, title 16px/600, body 16px) inside the gutter. The negative-margin bleed goes (B-pages-14). About 760px. On tablets it is 4 across at ≥768 and 2×2 at 600–767 (B-pages-09: no stranded item).

**Legal pages (privacy-policy, accessibility-statement):**
- No hero. The page H1 is `--m-t-display` (36–37px), with a 13px "Last updated" style meta line if it exists in `content/legal.ts`. H2s are `--m-t-h2`, H3s `--m-t-h3`. This fixes B-pages-10: H1 and H2 now differ by 11px and a weight step.
- Body text is 16px at `max-width: 62ch`.
- The contact emails in the legal copy are wrapped as `mailto:` links. The text is unchanged but an href is added; this needs owner sign-off (B-pages-18).
- LegalPage gets its own `LegalPage.module.css` instead of importing the About module (B-pages-19).

---

## 7. Tablets (600–1023) and landscape

This is a deliberate change. Tablets get **the phone components at wider values**, not a stretched phone layout (C-cross-24):

- The gutter is 32px and prose is capped at 62ch.
- **Section header:** the chip and title stay on one row.
- **Home:**
  - Services accordion: at ≥768 the accordion switches to *tabs-left / panel-right* (a 40/60 grid). The buttons keep `aria-expanded` semantics, and the panel height follows its content, so there is no dead space (A-home-15).
  - Projects rail: cards are `calc(50% - 8px)`, so two show with a peek.
  - Logos: 4 columns × 3 rows per page (4 pages).
  - Deliverables: the photo is on the left and the list on the right.
  - Press: the newest 4 in a 2×2 grid.
  - Contact: photo and form side by side.
- **Services:** proof strip 4 across at ≥768, phases as a 3-column stepper (a horizontal spine), service cards 2 per row at ≥768 with the For/How/When still stacked, results as 2 cards per row.
- **Hero on tablets:** `min(70svh, 720px)` instead of a full 1,180px screen of photo (C-cross-14, A-home-18).
- **Header on tablets:** the Menu pill. The desktop nav starts at 1024. Touch tablets at 820–1023 no longer get the 14px, 18px-tall desktop links (C-cross-11).
- **844×390 landscape** (`--bp-short`):
  - The hero is `100svh` minus the header.
  - The menu sheet body scrolls (C-cross-01).
  - The Contact card goes two-column.
  - The dock moves to `bottom: max(12px, env(safe-area-inset-bottom))`, `right: max(16px, env(safe-area-inset-right))`.
  - Safe-area insets pad the header and the full-bleed hero content (C-cross-22). `viewport-fit=cover` goes on the viewport meta through Next's `viewport` export.

---

## 8. Image and video strategy

- **Pipeline:** a new script, `scripts/images/build-crops.py` (Pillow, a dev tool like `scripts/logos/`), reads a committed `crops.json` of `{src, name, aspect, focusX, focusY}` and writes `public/images/m/<name>-{480,828,1170}.webp` at q≈78. The mockup's `img/*.webp` files were produced exactly this way, with the focal points recorded in §10.

  | Image | Aspect | Focus (x) |
  |---|---|---|
  | `hero-poster` | 3:4 | 0.40 |
  | `hero-services` | 4:5 | 0.47 |
  | `hero-about` | 4:5 | 0.40 |
  | `conference-room` | 16:9 | 0.5 |
  | `stairway` | 21:9 | 0.55 |
  | `classroom-lecture` | 2:1 | 0.5 |
  | `aaron-sokol` | 1:1 | 0.5 |

- **Markup:** a server component `<ArtImage>` (in components/, owned by the Foundation Engineer) renders
  ```html
  <picture>
    <source media="(width < 1024px)" type="image/webp"
            srcset="/images/m/x-480.webp 480w, …-828.webp 828w, …-1170.webp 1170w" sizes="100vw">
    <img src="/images/x.webp" width height …>
  </picture>
  ```
  The `<img>` src, width and height stay the desktop values, so ≥1024 is byte-identical in rendering. The mobile `<source>` carries its own `width`/`height` attributes so the aspect ratio is known before load. Crops that are not full-bleed use `sizes="calc(100vw - 40px)"`.
- **LCP:**
  - Home: the hero poster `<picture>` with `fetchpriority="high"` and **no lazy loading**. Every other image on Home is `loading="lazy" decoding="async"`, which removes the preloads React emits for non-lazy images (C-cross-04).
  - About and Services: the hero `<img>` gets `fetchpriority="high"` (C-cross-08).
  - The prefetch of `/` from subpages no longer pulls Home photos, because they are lazy (B-pages-07, C-cross-05).
  - An expected LCP of about 1.4s on Home at 390 (a 60–80 KB 828w poster instead of 1920w) is an estimate, to be verified in `qa:perf`.
- **Hero video (poster-first; the pause control is out of scope):**
  - Below 1024, `HeroVideo` renders **no `<video>` source at first paint**.
  - After the `load` event, and only if `matchMedia('(prefers-reduced-motion: no-preference)')` is true and `navigator.connection?.saveData !== true`, it attaches `/video/hero-m.webm` and `/video/hero-m.mp4`: a new lighter mobile encode, 720×960 portrait crop, about 12s loop, target ≤ 700 KB, built by a committed `scripts/video/encode-mobile.sh` using ffmpeg (a dev-time tool, not a dependency).
  - It fades in over the poster (`opacity`, 250ms).
  - LCP is never the video. The 3.15 MB download no longer happens in the first seconds (C-cross-06).
  - Desktop keeps the current behaviour.
- **Logos:** unchanged files, lazy. The mobile width comes from `--logo-w-m`.
- **Fonts:** the existing latin woff2 gets `<link rel="preload" as="font" crossorigin>` (same-origin, CSP-safe).
- `_headers`: `/images/m/*` inherits the `/images` cache rule, and `/video/hero-m.*` inherits `/video`.

---

## 9. Semantics, accessibility and content integrity

- **Landmarks and heading order are unchanged:** one `main`, `header`/`nav`/`footer`, and section H2s. Select Clients stays an `h1`, as in the reference. The new H3 buttons are *inside* the existing H3s. The menu sheet's `nav aria-label="Primary"` replaces the desktop `nav` only below 1024; the desktop nav's `ul` is hidden with `display:none` below 1024, which is allowed because the same links are reachable in the sheet.
- **Focus:** the existing 2px green `:focus-visible` ring on everything, including rail containers (`tabindex="0"`), pager buttons, row buttons and the stretched press links. The ring is on the `<a>`, which is fine because the `::after` overlay only extends the hit area.
- **Targets:** ≥44×44 everywhere, with ≥8px between adjacent targets. The pager dots are 44px buttons that butt against each other; the 8px squares inside are visual only. Under WCAG 2.5.8, a target of 24px or larger passes without spacing, so 44px buttons pass.
- **Reflow at 320 with 200% zoom:** everything is a single column with no fixed heights (the rails' 72px logo rows use `min-height`) and wraps.
- **`prefers-contrast: more`:** the rails and cards drop their shadows for 1px `--ink` borders, and the disclosure squares use `--ink` outlines. This is not a palette change.
- **Everything stays in the DOM:**
  - The accordion panels, extra press items and About subsections use `hidden="until-found"`: in the DOM, searchable, and not `display:none`.
  - At ≥1024 a guard rule `[hidden="until-found"]{ content-visibility: visible; display: revert }` scoped to the components keeps desktop unchanged, because desktop shows everything.
  - The desktop services tabs keep their current DOM and behaviour at ≥1024. The accordion markup is the *same* buttons with `aria-expanded` added and panel regions. At ≥1024, the three panels render as the current single swapping panel (only the active one visible, as today), so the pixels match. This needs careful parity testing, and the Home Engineer owns that risk.
- **New UI strings (the complete list; content-integrity needs a justified allow-list):**
  - "Show all press", to be added as `HOME_COPY.press.showAll` in content/copy.ts (a new key, no existing words changed).
  - The Contact dock and the sheet's Contact pill reuse "Contact" from `SHARED.navLinks`, and the sheet's email and tel reuse existing footer strings.
  - The About chips duplicate the existing H3 strings.
  - All accessible names for rails and pager buttons are `aria-label`s built from existing strings plus numbers.
- **New hrefs:** the `tel:` link (footer and sheet) and the `mailto:` links on the legal pages. Both need owner sign-off; the fallback is to leave them as text.
- JSON-LD, llms.txt, the sitemap and metadata are untouched.

---

## 10. Desktop-freeze safety

1. **Every new rule sits inside `@media (width < 1024px)`**, including the `--m-*` tokens. There is no new rule without a media wrapper, and ESLint cannot see CSS, so `qa:mobile-lint` gets a static check: parse each `*.module.css` and fail on a new top-level rule, diffing against the baseline set captured in Phase 0.
2. **Markup changes are additive and render-neutral at ≥1024:**
   - Rails are only `display: grid` plus `overflow` below 1024. At desktop the containers keep their current class, and the new classes are no-ops.
   - `<picture><source media="(width < 1024px)">` resolves to the existing `<img>` at desktop.
   - The accordion button inside the H3 is reset at ≥1024 (font inherit, padding 0, background none, width 100%, text-align left) to reproduce the current tab button exactly. It is the same element type as today's tab button.
   - The press toggle button and the Contact dock are `display: none` at ≥1024. The dock also has no desktop render path.
   - Press `hidden="until-found"` is overridden at ≥1024.
3. SectionShell gets **one** extra class on the counter and head at <1024, with a flex row instead of the grid. The desktop grid rule is untouched.
4. SiteHeader's collapse query moves from 819 to 1023. At ≥1024 this is identical, because the desktop nav already renders there.
5. **Gate:** `qa:desktop-parity` at 1024, 1280 and 1440, with 0 differing pixels, runs after every feature merge. The riskiest items, in order: services tabs → accordion markup, the SectionShell head, and `<picture>` wrappers changing the inline formatting context. Each wrapper uses `display: contents` at ≥1024 if it introduces any box.

---

## 11. Audit coverage (P0 and P1)

| Finding | Resolved by |
|---|---|
| A-home-01, B-pages-03, C-cross-09 (contrast) | **Waived** by the owner |
| A-home-02, C-cross-10 (tap targets) | 44px minimums: brand, footer rows, links (`.linkBtn` min-height), pager, row buttons, stretched press rows |
| A-home-03, C-cross-04/06/07/08 (LCP, bytes) | Art-directed 828w poster, lazy everything else, deferred and lighter mobile video, `fetchpriority` on subpage heroes |
| A-home-04, B-pages-02 (page length) | Home 6,777 / Services 5,969 (measured); About about 5,900 (estimated) |
| A-home-05 ("Read More" link text) | `aria-describedby` to the section heading. Verify in LH; the copy fallback needs the owner |
| A-home-06, A-home-15 (services panel) | Accordion at the full measure; tablets get a content-height panel |
| A-home-07, A-home-08 (logos) | 2-column paged rail, logos about 20px or taller, 518px section |
| A-home-09, B-pages-12, C-cross-14 (heroes) | `svh`-capped heroes, bottom-aligned copy, next section peeks |
| A-home-10 (soft poster) | 828/1170 portrait crops for 2× and 3× phones |
| A-home-11 (projects) | Rail with pager, 561px |
| A-home-12 (contact photo) | Photo becomes a 175px band inside the form card |
| A-home-13, B-pages-05, C-cross-15 (counter column) | Counter chip beside the title; full 350px measure |
| A-home-14 (press) | 3 plus Show all press (a real button), stretched rows |
| B-pages-01 (For/How/When) | Label-above-value `<dl>` |
| B-pages-04 (About prose wall) | Sticky chip index plus `until-found` accordion subsections |
| B-pages-06 (numbering) | Item index styled differently from the section chip |
| B-pages-07, C-cross-05 (prefetch bytes) | Home photos lazy, so there are no preloads |
| B-pages-08 (subpage LCP) | `fetchpriority` plus mobile `srcset` |
| B-pages-09 (stranded grid items) | 2×2 and 4-across rules; no 3+1 |
| B-pages-10 (legal H1) | Display H1 versus h2 scale |
| B-pages-11 (results labels; contrast part waived) | `dt`/labels at 13px/600 above values; `role`s restored |
| B-pages-13, C-cross-23 (15px body) | `--m-t-body` 16–17px |
| B-pages-14 (numbers bleed) | Cards inside the gutter |
| C-cross-01 (P0, menu unreachable in landscape) | Full-height scrollable sheet |
| C-cross-02 (menu behaviour) | Dialog, trap, Esc, return focus, scroll lock |
| C-cross-03 (Contact unreachable) | Sheet Contact pill plus the floating dock (Home only) |
| C-cross-11 (tablet desktop nav) | Collapse at 1024 |
| C-cross-12, C-cross-13 (form) | 48px 16px inputs, visible focus ring, autocomplete/enterkeyhint/inputmode, 5-row message |
| C-cross-16 (video pause) | **Waived** by the owner |

P2s addressed along the way: A-home-16/17/19/20/21, B-pages-15/16/17/18/19/20/22, C-cross-17/18/19/20/21/22/24.

---

## 12. Implementation notes (file ownership)

- **Foundation:**
  - `app/tokens.css` (`--m-*` inside `--bp-mobile`) and `globals.css` (tap highlight, `:active`, hover-gating, safe areas, `[hidden=until-found]` desktop guard).
  - `SectionShell.module.css` (the chip head).
  - `SiteHeader.tsx` plus its module (the sheet).
  - `SiteFooter` plus its module.
  - The new `components/ArtImage.tsx`, `components/Rail.tsx` (a client component: rail plus pager, about 0.8 KB), and `components/Disclosure.tsx` (about 0.5 KB, shared by Home services, Services "What we do" and About).
  - `scripts/images/build-crops.py` and its outputs.
- **Home:** `app/page.tsx`, `home.module.css`, `components/home/*` (ServicesTabs → Disclosure-backed, PressList with the toggle, ContactDock, ContactForm attributes).
- **Pages:** About (chip index, accordion), Services (stepper, cards, table-as-cards), `LegalPage.module.css`.
- **Media/Perf:** `HeroVideo` deferral, the mobile encode script, the font preload, `_headers`.
- **JS budget:** Rail 0.8 + Disclosure 0.5 + sheet about 1.2 + dock 0.4 + press toggle 0.2 ≈ **3.1 KB gzipped**, under the 5 KB cap.
