# Phase 1 audit C-cross: cross-cutting concerns

Auditor: C-cross. Build: untouched `out/` from `mobile-redesign` (source = 95beb8d), served locally by `serve` on :4191. Measured on 2026-09-22 with Playwright 1.63 Chromium (isMobile, hasTouch, iPhone UA, DPR 1 for screenshots) and Lighthouse 13 in system Chrome (mobile preset, simulated throttling).

**Scope:** SiteHeader and Menu, SiteFooter, the SectionShell counter column, ContactForm, type scale and line length, spacing, ad-hoc breakpoints, images and hero media, fonts and preloads, performance, accessibility (axe, tap targets, focus, reduced motion), safe areas, `100vh`, tap highlight and `:active`, and tablets.

**Evidence sources:**
- `scripts/qa/output/{mobile-lint,a11y,perf,bytes}.json` and `matrix/*`.
- Three new probes: a per-viewport geometry and line-length sweep, a menu interaction probe, and one extra Lighthouse run each for Home and About.
- Every crop is in `docs/mobile/audit/crops/`.

**No source code was edited. Nothing was committed.**

**Counts: P0 1, P1 15, P2 8 (24 findings).**

---

## P0: broken

### C-cross-01: The open mobile menu is taller than a landscape phone, so its last link cannot be reached
- **Pages / viewports:** all 5 pages. It fails at any viewport below 820px wide and under 378px tall, for example 568x320 (iPhone SE landscape). At 667x375 the last link fits with 22px to spare. The matrix's 844x390 is not affected, because 844 ≥ 820 shows the desktop nav.
- **Crop:** `crops/C-cross-01.png` (About, 568x320, menu open and page scrolled to y=2000)
- **Evidence:**
  - The open header measures 377.9px (64px bar plus a 312.9px menu). The viewport is 320px tall.
  - "Accessibility" spans y=297.75 to 352.9, so only 22px of its 55px row is on screen.
  - The menu sits inside the `position: sticky; top: 0` header, so it stays pinned when the page scrolls. The hidden 33px can never be scrolled into view, and scrolling the document to 2000 does not change it.
- **Root cause:** `components/SiteHeader.tsx:67-77` renders the menu `<ul>` inside the sticky `<header>`. `components/SiteHeader.module.css:2` (`position: sticky`) and `:105-114` (`.menu`) give it no max-height and no overflow scrolling.
- **Fix direction:** make the open menu a surface capped at the viewport height (`100dvh` minus the bar) that scrolls internally, or use a full-screen sheet.

---

## P1: looks amateur, or fails a quality-bar gate

### C-cross-02: The menu has no dismissal, focus handling or scroll lock, and it stays open over the scrolling page
- **Pages / viewports:** all pages at 320–819px (all 7 phones and 768x1024).
- **Crop:** `crops/C-cross-02.png` (Home 390x844, menu open, page scrolled 1200px underneath)
- **Evidence** (menu probe at 390x844, 667x375, 320x568 and 768x1024):
  - **Escape:** the menu stays open (`openAfterEsc: true`).
  - **Scrolling:** with the menu open the document scrolls to y=1200 and the menu stays open. A 378px panel covers 45% of an 844px viewport and 67% of a 568px one. `body` overflow stays `visible`, so there is no scroll lock.
  - **Same-page link:** tapping the current page's link (About on /about) scrolls to the top, and the menu stays open. See C-cross-20.
  - **Focus:** it stays on the Close button. There is no `role="dialog"` or `aria-modal` and no focus trap. Tab goes Home, About, Services, Privacy, Accessibility, then straight into page content behind the panel ("Read More").
  - **ARIA:** `aria-controls="mobile-menu"` points to a node that is absent from the DOM while the menu is closed.
  - **Tap outside:** nothing handles it.
- **Root cause:**
  - `components/SiteHeader.tsx:22-24`: the menu state closes only when the breakpoint is crossed.
  - `:57-65`: the button has no key or outside-tap handlers.
  - `:67`: the menu is conditionally rendered, which leaves `aria-controls` dangling.
  - `components/RouteLink.tsx:36-46`: a same-page click only scrolls.
- **Fix direction:** decide on a menu pattern: either a disclosure that closes on scroll, Escape, outside tap or any link tap, or a modal sheet with focus trap, scroll lock and focus return. Keep `#mobile-menu` in the DOM, hidden, so `aria-controls` resolves.

### C-cross-03: "Contact", the primary conversion link, cannot be reached from any navigation below 820px
- **Pages / viewports:** all pages at 320–819px.
- **Crop:** `crops/C-cross-03.png` (Home 390x844, menu open: Home, About, Services & Results, Privacy Policy, Accessibility)
- **Evidence:**
  - The desktop nav has 3 links (About, Services & Results, Contact → `/#contact`). Below 820px it is `display: none`.
  - `SHARED.mobileMenu` has 5 links and none of them is Contact.
  - The footer lost its Contact link on request. Its links are Book a Meeting (an external calendar), mailto, LinkedIn, About, Services & Results, Privacy Policy and Accessibility.
  - On a phone, the form at `#contact` is therefore reachable only by scrolling Home to about y=10,300 of 12,065 at 390px.
- **Root cause:** `components/SiteHeader.module.css:95-98` hides `.links` below 820px, and `components/SiteHeader.tsx:69` maps only `SHARED.mobileMenu`.
- **Fix direction:** show the existing Contact nav link, which is already in the DOM, on mobile, either in the bar or in the menu. Copy is not touched. If the markup is duplicated, the duplicate needs a content-allowlist entry.

### C-cross-04: Home LCP is 3.6s because React preloads every non-lazy photo, including three below the fold, in `<head>`
- **Page / viewport:** Home, Lighthouse mobile (412x823 emulation), and every phone viewport.
- **Crop:** `crops/C-cross-04.png` (Home 390x844 first screen; the LCP element is the `<h1>`)
- **Evidence:**
  - **Scores:** LH median LCP is 3679ms with FCP at 1054ms and Perf 90. My extra run gave LCP 3605, FCP 1055 and Perf 90.
  - **Real paint:** the LCP element is the hero `<h1>` (text). The observed, unthrottled LCP is 67ms and equals FCP, so the 2.55s gap is added by the simulation.
  - **Preloads:** `out/index.html` carries `<link rel="preload" as="image">` for `hero-poster.webp` (111 KB, fetchpriority high), `conference-room.webp` (158 KB, y=5138), `stairway.webp` (84 KB, y=6589), `classroom-lecture.webp` (60 KB, y=10298) and `edcloud-mark.png` (10 KB).
  - **Why the simulation adds time:** all of these start before the text paints, so Lantern's pessimistic graph counts about 424 KB of images ahead of LCP on slow 4G.
  - **Wasted bytes** (image-delivery-insight): conference-room 123 KB of 158 KB, stairway 56 KB of 84 KB, and the mark 10 KB.
- **Root cause:** `app/page.tsx:130`, `:148` and `:192`: the `<img>` elements have no `loading="lazy"`. React 19 then emits a preload hint for each one, both in the HTML head and as `:HL` rows in `out/__next.__PAGE__.txt`.
- **Fix direction:** lazy-load, or otherwise opt out of auto-preload, every image below the first screen, so the only early image request on Home is the hero.

### C-cross-05: Every other page downloads 404 KB of Home photos through the prefetch of "/"
- **Pages / viewport:** About, Services, Privacy and Accessibility at 390x844 (qa:bytes). The same happens at every viewport where a "/" link is visible.
- **Crop:** `crops/C-cross-05.png` (Privacy 390x844; the header brand link to "/" triggers the prefetch)
- **Evidence:**
  - `bytes.json` for privacy-policy lists `conference-room.webp` 158,161 B, `hero-poster.webp` 111,747 B, `stairway.webp` 84,625 B and `classroom-lecture.webp` 59,930 B, plus `/__next.__PAGE__.txt`.
  - Privacy's own only image is the 10 KB mark, so 404 KB of its 415 KB image transfer belongs to Home. Accessibility is the same: 619 KB total.
  - The LH About run fetched `hero-poster.webp` at High priority.
  - The cause: the prefetched `__next.__PAGE__.txt` contains `:HL["/images/hero-poster.webp","image",{"fetchPriority":"high"}]` and 3 more image hints, which React executes on arrival.
- **Root cause:** `components/RouteLink.tsx:41` and `components/LinkButton.tsx:8` use `next/link`'s default viewport prefetch. The header brand (`SiteHeader.tsx:40`) and footer brand (`SiteFooter.tsx:48`) point at "/", and together with C-cross-04 the Home payload carries image preload hints.
- **Fix direction:** once C-cross-04 is fixed, remove the image hints from the Home RSC payload, or turn off viewport prefetch for "/". Verify that a subpage then transfers no Home images.

### C-cross-06: A 3.15 MB hero video downloads in full on phones in the first 5 seconds
- **Page / viewports:** Home at every viewport where reduced motion is not set (all phones, landscape and tablets).
- **Crop:** `crops/C-cross-06.png` (Home 390x844, motion allowed, video playing)
- **Evidence:**
  - The video is 1280x720 and 44.44s long, served as `/video/hero.webm` (3,151,862 B). The mp4 fallback is 2,735,085 B.
  - At 390x844 all 3,151,862 B arrived within 5s of load (local).
  - LH total-byte-weight fails at 3.79 MB, of which the video is 3.15 MB.
  - A portrait phone shows only a 390x844 slice of it: 32% of its width at 390.
  - It uses `preload="auto"`. There is no width, Save-Data or connection gating.
- **Root cause:** `components/home/HeroVideo.tsx:20` (`show = hydrated && !reduced`, gated on motion only) and `:46` (`preload="auto"`). The source list is at `:52-55`.
- **Fix direction:** decide whether phones get the video at all. If they do, serve a phone-sized or portrait encode, gate it on Save-Data and viewport, and start it after LCP.

### C-cross-07: 1920x1080 landscape hero images go to portrait phones: soft crops and wasted bytes, with no `srcset` anywhere
- **Pages / viewports:** Home, About and Services at all phones; the effect is strongest at 390x844 and 430x932.
- **Crop:** `crops/C-cross-07.png` (Services hero at 390x844, rendered 390x672)
- **Evidence** (at DPR 3; `object-fit: cover` on a tall box shows only a narrow slice of the landscape source):

  | Hero | Rendered box | Source pixels visible | Needed for 390 at DPR 3 | Upscale | File | Share of source width on screen |
  |---|---|---|---|---|---|---|
  | Home poster | 390x844 | about 499x1080 | 1170 wide | 2.3x | 111 KB | 26% |
  | Services | 390x672 | 627x1080 | 1170 wide | 1.9x | 168 KB | 33% |
  | About | 390x537 | 784x1080 | 1170 wide | 1.5x | 78 KB | 41% |

  - No `<img>` on the site has `srcset`, `sizes` or `<picture>`.
  - `edcloud-mark.png` is 256x256 (10 KB) for a 22px box, and it is preloaded on every page (LH image-delivery wastes 10,051 B).
  - `aaron-sokol.webp` (486x450) is preloaded on About even though it sits at y=6658 at 390.
- **Root cause:**
  - `app/page.tsx:62-69`, `app/about/page.tsx:27` and `app/services-and-results/page.tsx:30` use one fixed source each.
  - `components/SiteHeader.tsx:42` and `components/SiteFooter.tsx:50` use the 256px mark.
  - `app/about/page.tsx:78` has no lazy loading on the headshot.
- **Fix direction:** add art-directed portrait crops for phones (`<picture>`/`media`) with DPR-aware widths, a small mark asset, and lazy loading below the fold.

### C-cross-08: About and Services miss the LCP budget at 2.3–2.4s: the hero preload has no priority and two CSS files block render
- **Pages / viewport:** About and Services (LH mobile). Privacy and Accessibility also miss at 2.17s, from the CSS and JS alone.
- **Crop:** `crops/C-cross-08.png` (About hero at 390x844; this image is the LCP element)
- **Evidence:**
  - LCP medians: About 2395ms, Services 2397ms, Privacy 2167ms, Accessibility 2168ms. The budget is 2000.
  - `lcp-discovery-insight` fails with "fetchpriority=high should be applied to the image preload request". `hero-about.webp` was requested at **Low** priority, at 12–17ms.
  - `render-blocking-insight` names `2xg9eq7bu1vcl.css` (4.7 KB, est. 302ms) and `41723krdm25am.css` (1.6 KB, est. 152ms).
  - `unused-javascript` finds 27.8 KB. The JS is 149.3 KiB gz across 7 chunks on subpages.
  - The font preload appears twice in each `<head>` (`app/layout.tsx:69` plus the React-hoisted one). The browser dedupes it, but it is noise.
- **Root cause:** `app/about/page.tsx:27` and `app/services-and-results/page.tsx:30` have no `fetchPriority="high"` (Home's poster has one at `app/page.tsx:67`). The CSS is split into two render-blocking chunks by the build.
- **Fix direction:** give each subpage hero high fetch priority and a phone-sized source (see C-cross-07), and consider inlining or merging the 6 KB of critical CSS.

### C-cross-09: Two design tokens fail WCAG contrast on every page (axe `color-contrast`, LH A11y 96)
- **Pages / viewports:** all 5 pages at 390 and 1440. Failing nodes at 390/1440: Home 41/42, About 3/3, Services 30/34, Privacy 1/1, Accessibility 1/1.
- **Crop:** `crops/C-cross-09.png` (Home 390x844: the "02" counter and the inactive service tabs in `--slate`)
- **Evidence:**
  - `--slate` #7A8494 is 3.53:1 on #F2F9F4 and 3.77:1 on white.
  - `--growth` #17916B is 3.70:1 on #F2F9F4 and 3.96:1 on white, used for text at 14–17px.
  - The required ratio is 4.5:1.
  - `--growth-ink` #0F6B4F would give 6.07:1 on #F2F9F4. `--ink-2` gives 7.07:1.
- **Root cause:** `app/tokens.css:6` (`--slate`) and `:10` (`--growth`). They are consumed by `components/SectionShell.module.css:21-25` (the counter), `app/home.module.css:166` (inactive tabs), `:326` (capability index), `:370` (press meta), `:394` (press link) and the services proof, phase, index and table styles.
- **Fix direction:** darken the text uses of both tokens, scoped below 1024px, or get an explicit decision to re-baseline the desktop goldens (BASELINE quirk 5).

### C-cross-10: Footer, header brand and inline links are 22–24px tap targets on every page
- **Pages / viewports:** all 5 pages at 320–1023px (every matrix phone and tablet).
- **Crop:** `crops/C-cross-10.png` (Privacy 390x844 footer)
- **Evidence** (mobile-lint plus the probe at 390):

  | Target | Size (px) |
  |---|---|
  | Footer: Book a Meeting | 102x22 |
  | Footer: info@edcloud.org | 117x22 |
  | Footer: LinkedIn | 24x24 |
  | Footer: About | 41x22 |
  | Footer: Services & Results | 121x22 |
  | Footer: Privacy | 90x22 |
  | Footer: Accessibility | 84x22 |
  | Footer: bottom brand | 206x22 |
  | Header brand | 229.6x22 at 360–430, 95.2x22 at 320 |
  | Home "Read More" | 70x22.4 |
  | Home "Services & Results" | 121x22.4 |
  | Home press links (9 of them) | 145x24 |

  - The footer's column-2 links sit 8px apart (tops at 11794, 11824, 11855 and 11885 give a 30px pitch). Column-1 links have a 4px gap.
  - Instances flagged at 390: 25 on Home and 9 on every other page.
- **Root cause:**
  - `components/SiteFooter.module.css:21` (`.col1 gap: 4px`), `:27` (`.col2 gap: 8px`), `:48` (`.white`, inline text links with no padding) and `:63-69` (`.linkedin`, a bare 24px SVG).
  - `components/SiteHeader.module.css:32-43` (`.brand` has no min-height).
  - `components/ui.module.css:5-25` (`.linkButton` has `padding: 0`).
- **Fix direction:** give every standalone link a hit area of at least 44px (padding or min-height) with 8px or more of separation. Desktop visuals can stay as they are by scoping this below 1024px.

### C-cross-11: Touch tablets at 820–1023px get the desktop nav with 18px-tall, 14px links
- **Pages / viewports:** all pages at 820x1180, and at 900, 1000 and 1023 (mobile-lint).
- **Crop:** `crops/C-cross-11.png` (Privacy 820x1180 header)
- **Evidence:**
  - The nav links measure 41.5x18 (About), 120.8x18 (Services & Results) and 53.7x18 (Contact), 32px apart, at 14px text.
  - The brand is 274.6x22.4.
  - At 820x1180 (iPad Air portrait), a touch device gets hover-sized targets with no Menu button.
- **Root cause:** `components/SiteHeader.module.css:57-64` (`.links` at 14px, gap 32px, `.link` with no padding) and `:95` (the `max-width: 819px` collapse point, `--nav-collapse`, `app/tokens.css:47`).
- **Fix direction:** either raise the link hit areas to at least 44px for the 820–1023 range, or move the collapse point, given that desktop starts at 1024 and must stay pixel-identical.

### C-cross-12: Contact inputs have a 1.45:1 border, and focus is shown by a 1px colour change plus a 1.36:1 glow (`outline: none`)
- **Page / viewports:** Home at all viewports.
- **Crop:** `crops/C-cross-12.png` (Home 390x844 form with Email focused)
- **Evidence:**
  - The input border is `--line` #C5DCCB on white: **1.45:1**. WCAG 1.4.11 needs 3:1 to identify a control, and the empty fields read as faint boxes.
  - On focus, `outline: none`. The only indicator is a 1px border turning #17916B (3.96:1) plus a `0 0 0 2px rgba(23,145,107,.25)` ring, which composites to #C5E4DA: **1.36:1 against white**.
  - The global `:focus-visible` rule (a 2px green outline) is overridden for inputs.
- **Root cause:** `app/home.module.css:534` (border `var(--line)`), `:539` (`outline: none`) and `:547-550` (`.input:focus`).
- **Fix direction:** give the fields a border of at least 3:1, and a focus indicator of at least 2px that reaches 3:1 against both the field and the card.

### C-cross-13: The contact form has no `autocomplete` or `enterkeyhint`, 40px fields and a 2-row message box
- **Page / viewports:** Home, all phones (and all widths).
- **Crop:** `crops/C-cross-13.png` (Home 390x844 contact card)
- **Evidence:**
  - Probe results: `autocomplete=""`, `inputMode=""` and `enterKeyHint=""` on all 5 fields.
  - The types are text, text, email, tel and textarea, so the email and phone keyboards are already correct.
  - With no autocomplete tokens (given-name, family-name, email, tel), iOS and Android offer no contact autofill. That also fails WCAG 1.3.5 Identify Input Purpose (AA).
  - Field height is 40px, below 44. The textarea is `rows=2`, 64px tall. SUBMIT is 115.9x40.
  - The input font is 17px, which passes because it is at least 16.
  - Labels are 14px.
- **Root cause:** `components/home/ContactForm.tsx:54` and `:56` (no autocomplete or enterkeyhint; `rows={2}`), `app/home.module.css:536` (`padding: 9px 12px` gives 40px), `:544` (`min-height: 64px`) and `:568` (`.submit min-height: 40px`).
- **Fix direction:** add autocomplete tokens and enterkeyhint per field, raise the field and button heights to 44px or more, and make the message field taller on phones. The attributes change no copy.

### C-cross-14: The `100vh` Home hero is 1.4 screens tall at 320x568 and a full 1180px screen of mostly empty photo on tablets
- **Pages / viewports:** Home at all phones and tablets (the About and Services heroes use `vh` via `min()` too).
- **Crops:** `crops/C-cross-14.png` (Home at 320x568: the hero is 811px) and `crops/C-cross-14b.png` (Home at 820x1180: the hero is 1180px)

| Viewport | Home hero height | Share of viewport |
|---|---:|---:|
| 320x568 | 811 | 143% (the content overflows `min-height`) |
| 375x667 | 734 | 110% |
| 390x844 | 844 | 100% |
| 430x932 | 932 | 100% |
| 844x390 | 524 | 134% |
| 768x1024 | 1024 | 100% |
| 820x1180 | 1180 | 100% (the text block is about 280px, so about 900px is photo) |

- **More evidence:**
  - `100vh` on iOS Safari is the *large* viewport. With the toolbars showing, the hero bottom and the first content are pushed further below the fold than Chromium shows.
  - The hero, a menu-free first screen, costs 844px of the 12,065px Home page at 390, against an 8,500 target.
  - Services and About use `min(72vh, 640px)` and `min(56vh, 480px)` plus 64px: 672px and 537px at 390.
- **Root cause:** `app/home.module.css:5` (`min-height: 100vh`) and `:37` (`padding: 128px var(--gutter) 96px`). Also `app/services-and-results/services.module.css:7` and `app/about/about.module.css:8`.
- **Fix direction:** size the phone and tablet heroes with `svh`/`dvh` and a content-driven cap, not a full-viewport minimum, and cut the top and bottom padding on phones.

### C-cross-15: The SectionShell counter column plus nested insets squeeze phone text to 21–25 characters a line (11 in Services `dd`)
- **Pages / viewports:** all pages at every phone. It is worst at 320x568 and 360x780.
- **Crop:** `crops/C-cross-15.png` (Services at 320x568: first service, with the "For/How/When" rows at 102px wide)
- **Evidence:**
  - Below 600px the counter column is 28px plus a 16px gap, which costs 44px of every section: 13.8% of 320 and 11.3% of 390.
  - Section text starts at x=68, the counter at x=24 and the phone content column is 228px at 320. At 390 it is 298px.
  - Measured average characters per line at 320:
    - Home lead 23, body 25, hero lead 24, `cardBody` 21 (164px wide).
    - Services `dd` 11 (102px wide beside a 110px `dt` column), phaseBody 20.
    - Privacy 19–27, About 20–28.
  - At 390: 23–37 characters per line. Comfortable reading is roughly 45–75.
  - The results: Home is 13,311px tall at 320, About 10,930 and Services 12,109.
- **Root cause:** `app/tokens.css:43` and `:59-63` (`--counter-col` 72 → 28), `components/SectionShell.module.css:14-19` (`.head`) and `:36-41` (`.body`: counter column + 16 gap + content). Stacked on top: `app/home.module.css:239` (`.case padding: 32px`), `app/services-and-results/services.module.css:263-267` (`.dlRow 110px`) and `:201` (`.service` repeats the counter column).
- **Fix direction:** on phones, drop the counter to its own line or inline it with the title so content runs the full gutter-to-gutter width, and collapse nested label columns.

### C-cross-16: The 44-second looping background video has no pause control (WCAG 2.2.2)
- **Page / viewports:** Home at all viewports when motion is allowed.
- **Crop:** `crops/C-cross-16.png` (Home 390x844, video playing, no control visible)
- **Evidence:**
  - The `<video>` has `autoPlay muted loop` and `aria-hidden="true"`, `tabIndex=-1`, `controls=false`, and runs 44.44s.
  - The only buttons on the page are Menu, the 3 service tabs and SUBMIT.
  - WCAG 2.2.2 (Level A) requires a pause mechanism for moving content that starts automatically and lasts more than 5s. `prefers-reduced-motion` is honoured, but it does not satisfy 2.2.2 on its own.
- **Root cause:** `components/home/HeroVideo.tsx:39-56`, which has no pause UI.
- **Fix direction:** add a visible pause/play toggle of at least 44px, placed clear of the safe areas, or stop the loop after 5s.

---

## P2: polish

### C-cross-17: The header uses a 16px gutter on phones and the content uses 24px, so edges don't line up
- **Pages / viewports:** all pages at 320–439px (all 7 phones).
- **Crop:** `crops/C-cross-17.png` (Privacy 390x844 top: the brand mark is at x=16, the "01" counter and menu links at x=24)
- **Evidence:**
  - The brand is at x=16 at every phone width and at x=24 at 768 and above.
  - The SectionShell counter is at x=24 and the hero text at x=24.
  - The open menu's links are at x=24 (padding `8px 24px`), and its dividers run from 24 to 366 while the bar runs from 16 to 374.
- **Root cause:** `components/SiteHeader.module.css:142` (`.nav padding: 0 16px` below 440px) against `--gutter: 24px` (`app/tokens.css:42`) and `.menu padding` at `:108`.
- **Fix direction:** use one phone gutter for the bar, the menu and the content.

### C-cross-18: The header wordmark drops to 12px with 0.05em tracking on phones (under the 13px floor)
- **Pages / viewports:** all pages at 320–439px. At 320–359px only "EDCLOUD" shows.
- **Crop:** `crops/C-cross-18.png` (Privacy 360x780 header)
- **Evidence:**
  - mobile-lint `textSize` flags "EDCLOUD" at 12px (320–430) and "VENTURE PARTNERS" at 12px (360–430).
  - Desktop is 14px with 0.08em tracking.
  - The brand hit box is 22px tall (see C-cross-10).
- **Root cause:** `components/SiteHeader.module.css:146-150` (the `.brand` override inside `@media (max-width: 439px)`) and `:157-161` (the tail hidden below 360px).
- **Fix direction:** keep the wordmark at 13px or more, and pick how it shortens (mark only, or "EdCloud") so it doesn't shrink.

### C-cross-19: Tablet and landscape body copy runs 79–92 characters a line
- **Pages / viewports:** About, Home, Privacy and Accessibility at 820x1180, 844x390 and 768x1024.
- **Crop:** `crops/C-cross-19.png` (About 820x1180 mission block, 684px wide)
- **Evidence** (average characters per line at 17px):
  - About `.p`: 82 at 820.
  - Home `.body`: 79 at 820 and 844.
  - Privacy `.p`: 79 at 820.
  - Accessibility: up to 88 at 820.
  - The measure is capped at `68ch`, but `ch` is the width of the "0" glyph, so real prose averages more characters per line.
  - Phones sit at the other extreme (C-cross-15).
- **Root cause:** `app/about/about.module.css:49` (`.mission max-width: 68ch`, also reused by `components/LegalPage.tsx:17`) and `app/home.module.css:130` (`.promise max-width: 62ch`, with a 17px body inside a 20px-based `ch`).
- **Fix direction:** set the tablet measure in characters of the body size, aiming for about 60–70 characters per line.

### C-cross-20: Touch feedback is hover-only: tapped links stick at 70% opacity, there is no `:active` state and the tap highlight is the default
- **Pages / viewports:** all pages at all touch viewports.
- **Crop:** `crops/C-cross-20.png` (About 390x844: after tapping "About" in the open menu, the menu stays open and the link is stuck at opacity 0.7)
- **Evidence:**
  - Across `app/**` and `components/**` there are 0 `:active` rules, 0 `@media (hover: hover)` guards and 0 `-webkit-tap-highlight-color` rules.
  - The computed tap highlight is the UA default, `rgba(51,181,229,0.4)` in Chromium (grey on iOS).
  - After a tap, `.menuLink:hover` keeps `opacity: 0.7` (probe: `opacity: '0.7'`, `open: true`).
  - `ServicesTabs` uses `onMouseEnter`, which fires on tap. That is harmless.
- **Root cause:**
  - `components/SiteHeader.module.css:45`, `:73` and `:133` (`:hover` opacity rules).
  - `components/SiteFooter.module.css` (`.white:hover` etc.).
  - `components/ui.module.css:27` and `:53`.
  - `app/home.module.css` `.submit:hover` and `.pressLink:hover`.
  - All are unguarded.
- **Fix direction:** wrap hover styles in `(hover: hover)`, and define an explicit pressed state and tap-highlight policy for touch.

### C-cross-21: The ad-hoc breakpoints disagree: 799, 819 and 820 leave dead zones and an off-by-one at 820
- **Pages / viewports:** Services at 800–819 and at exactly 820. The spread across all pages is 359 / 439 / 599 / 799 / 819 / 820 / 899 / 1087.
- **Crops:** `crops/C-cross-21.png` (Services 800x1024: the nav has collapsed to Menu while the results table is still the 4-column desktop table) and `crops/C-cross-21b.png` (Services 820x1180: the desktop nav shows, but the service list has lost its desktop indent because of `max-width: 820px`)
- **Evidence:**
  - `SiteHeader` collapses at `max-width: 819px`, but `.serviceList` uses `max-width: 820px`. At exactly 820 (iPad Air portrait, in the matrix) the two disagree.
  - The results table switches to cards at 799, so 800–819 shows a collapsed header over a `min-width: 640px` table.
  - Home's hero lead unlocks its fixed height at 899, and the logos go to 3 columns at 1087, which is inside the frozen desktop range.
  - 8 distinct breakpoint values are hand-written across 4 files.
- **Root cause:**
  - `components/SiteHeader.module.css:95`, `:140` and `:157`.
  - `app/services-and-results/services.module.css:193` and `:333`.
  - `app/home.module.css:71`, `:355`, `:362`, `:429` and `:454`.
  - `app/tokens.css:59`.
- **Fix direction:** agree on a small named breakpoint set (phone, tablet, desktop at 1024) and move every rule below 1024 onto it.

### C-cross-22: No `viewport-fit=cover` or safe-area insets: iOS landscape letterboxes the full-bleed hero and the sticky header
- **Pages / viewports:** all pages in iPhone landscape (844x390 in the matrix); the sticky header is flagged at every mobile-lint width.
- **Crop:** `crops/C-cross-22.png` (Home 844x390 as Chromium renders it edge to edge. On an iPhone with a notch, Safari instead pads left and right with the `body` background, #F2F9F4, beside the dark hero and header.)
- **Evidence:**
  - The viewport meta is `width=device-width, initial-scale=1`, with no `viewport-fit`.
  - There are 0 `env(safe-area-inset-*)` rules. mobile-lint `safeArea` flags `header` (sticky at top, left and right) on all 5 pages.
  - `themeColor` #1B2431 tints only the status bar.
- **Root cause:** `app/layout.tsx:12-14` (the `viewport` export has only `themeColor`), `components/SiteHeader.module.css:2-3`, and `components/SiteFooter.module.css:4-9` (no bottom inset).
- **Fix direction:** if the design goes edge to edge, add `viewport-fit=cover` and pad the header, footer, hero text and any future fixed controls with `env(safe-area-inset-*)`.

### C-cross-23: Body copy sits under the 16px floor through `--t-body-sm` (15px) and `--t-small` (14px) on phones
- **Pages / viewports:** Home, About and Services at all phones and tablets.
- **Crop:** `crops/C-cross-23.png` (Home 390x844 case card: the 15px `cardBody` at 234px wide, 29 characters a line)
- **Evidence:**
  - mobile-lint `bodyText` at 390 flags these at 15px:
    - Home: `cardBody` (4 case cards and 6 capabilities).
    - About: `numberBody` (4).
    - Services: `dd` (18).
  - These are 14px:
    - The form labels.
    - The footer text (`.footer` font-size 14px).
    - `pressMeta`, `statLabel` and `proofClient`.
- **Root cause:** `app/tokens.css:32` (`--t-body-sm: 15px`) and `:34` (`--t-small: 14px`), consumed at `app/home.module.css:105-111` and `:521`, `components/SiteFooter.module.css:6` and `app/services-and-results/services.module.css:259`.
- **Fix direction:** define a phone type ramp in which reading text is at least 16px and only meta labels use 13–14px.

### C-cross-24: Tablets get stretched phone layouts: Home is 1,081px taller at 768 than at 1024
- **Pages / viewports:** Home, About and Services at 768x1024 and 820x1180.
- **Crop:** `crops/C-cross-24.png` (Home 768x1024 Services section: the tabs stack above a 360px-minimum panel with about 100px of dead space between its lead and body)
- **Evidence:**

  | Page | 768 | 820 | 1024 (desktop) |
  |---|---:|---:|---:|
  | Home | 10,923 | 10,927 | 9,842 |
  | About | 5,758 | 5,548 | 5,053 |
  | Services | 7,059 | 6,560 | 5,363 |

  - At 768 the counter column goes back to 72+16=88px, so 11.5% of the width goes to counters.
  - `.services` needs 2×360+48=768px of content width to sit side by side, but 632px is available, so it stacks.
  - `.panel` keeps `min-height: 360px` and `align-content: space-between`, which creates a gap inside the panel.
- **Root cause:** `app/tokens.css:43` and `:59` (the counter only shrinks below 600), `app/home.module.css:137-142` (`.services` auto-fit `minmax(360px)`) and `:195-203` (`.panel min-height: 360px; align-content: space-between`).
- **Fix direction:** design an explicit 600–1023 tablet layout (two-column where it fits, no reserved panel height) and don't let the phone and desktop rules meet by accident.

---

## Checked and passing (no finding)
- **Horizontal overflow:** 0 at every width from 320 to 1023 (mobile-lint), which the menu and form probes confirmed.
- **Input font size:** 17px on all 5 fields, so iOS will not zoom on focus.
- **Reduced motion:** `HeroVideo` does not mount under `prefers-reduced-motion: reduce` (`components/home/HeroVideo.tsx:18-20`), and `[data-reveal]` animation is disabled (`app/globals.css:72-76`).
- **Fonts:**
  - The single latin variable woff2 (30 KB) is preloaded with `font-display: swap`, and the latin-ext face is gated by `unicode-range`. CLS is 0 on every page.
  - The duplicate preload tag is noted under C-cross-08.
- **Image dimensions:** every `<img>` has width and height (mobile-lint `mediaDims` is 0).
- **Global focus ring:** `:focus-visible` gives a 2px #17916B outline. That is 5.30:1 on the black footer and 3.94:1 on the ink hero overlay, visible on the Menu/Close button (seen in the C-cross-02 probe). Inputs are the exception (C-cross-12).
- **Menu link rows:** 55px tall and full width, which passes the 44px rule.
- **Menu / Close button:** 68.6x44 on phones and 76.6x44 at 768.
- **Third-party requests:** none. CSP-compatible.

## Coverage

✔ = examined (matrix screenshot and geometry probe). Extra = viewports outside the matrix used for a specific check.

| Page | 320x568 | 360x780 | 375x667 | 390x844 | 393x852 | 414x896 | 430x932 | 844x390 | 768x1024 | 820x1180 | Extra |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | ✔ geometry, hero, cpl, menu | ✔ | ✔ | ✔ menu, form, video, LH, bytes, axe | ✔ | ✔ | ✔ | ✔ | ✔ menu, layout | ✔ hero, nav | 667x375 menu |
| About | ✔ | ✔ | ✔ | ✔ menu same-page tap, LH, axe | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ cpl | 568x320 menu |
| Services & Results | ✔ dd cpl | ✔ | ✔ | ✔ hero, axe | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ breakpoint | 800x1024 breakpoint |
| Privacy Policy | ✔ | ✔ header | ✔ | ✔ header, footer, bytes, axe | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ nav | — |
| Accessibility Statement | ✔ | ✔ | ✔ | ✔ bytes, axe | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ cpl | — |

**Other sources:**
- mobile-lint swept 320–430 in 1px steps, plus 600, 700, 768, 800, 820, 900, 1000 and 1023, on all 5 pages.
- axe ran at 390 and 1440.
- Lighthouse medians came from `perf.json` (3 runs per page), plus one extra run each for Home and About, used to diagnose LCP.
- Desktop 1024, 1280 and 1440 were out of scope; they are frozen and were not audited.

## Method notes (for reproducing the numbers)
- **Characters per line:** text length ÷ (element height ÷ computed line-height), averaged per element, for elements with more than 80 characters.
- **Hero upscale:** (rendered height ÷ 1080) gives the cover scale. The visible source width is viewport width ÷ scale, compared with 3 × viewport width for a DPR-3 phone.
- **Contrast:** the WCAG relative-luminance formula. The focus glow was composited at 25% alpha over white (#C5E4DA).
- **Probe scripts:** these lived in the session scratchpad and are not committed. The menu probe opened the menu, pressed Escape, scrolled, tabbed 7 times and tapped the current page's link. The geometry sweep read `getBoundingClientRect` and computed styles at all 10 non-desktop matrix viewports × 5 pages.
