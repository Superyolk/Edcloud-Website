# Audit A-home: Home page (`/`) on phones, landscape and tablets

Auditor A-home, Phase 1, 2026-09-22. Build: untouched `mobile-redesign` tree (no source changes since `95beb8d`), `out/` served by `serve` on :4180.

**Scope:** the hero (poster and video), 01 Our Promise, 02 Services & Results (`components/home/ServicesTabs.tsx`), 03 Featured Projects, 04 Deliverables, the full-bleed stairway figure, 05 Select Clients, 06 Press, 07 Contact Us (photo and `ContactForm`), and the footer as it appears on Home.

**Method:**
- **Captures.** Playwright Chromium, using the harness conditions (`scripts/qa/lib.mjs`: `isMobile`, `hasTouch`, iPhone UA, DPR 1, reduced motion, frozen animations, lazy images forced eager).
- **Screenshots reviewed.** Every section was screenshotted and viewed at all 10 non-desktop viewports.
- **Measurements.** Box, font and line counts come from a DOM script. Chars/line is the element's text length divided by its rendered line count.
- **Reports cross-read.** `scripts/qa/output/{mobile-lint,a11y,perf,bytes}.json`.
- **Crops.** Produced with Playwright clip screenshots and live injected outlines, which were not saved to source. They are in `docs/mobile/audit/crops/A-home-NN.png`.

**Severity:**
- **P0:** broken, or fails a hard gate in the quality bar (axe = 0, Lighthouse mobile budgets, tap targets ≥44px, the page-length target).
- **P1:** looks amateur, or badly hurts reading or using the page.
- **P2:** polish.

**Counts:** P0 5 · P1 10 · P2 6 (21 findings).

---

## Home section heights (px, measured)

| Viewport | Hero | 01 Promise | 02 Services | 03 Projects | 04 Deliverables | Figure | 05 Clients | 06 Press | 07 Contact | Footer | **Total** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 320x568 | 811 | 1354 | 1204 | 2257 | 1975 | 220 | 1490 | 2163 | 1301 | 535 | **13311** |
| 360x780 | 780 | 1188 | 1035 | 2050 | 1784 | 220 | 1490 | 2063 | 1301 | 535 | **12446** |
| 375x667 | 734 | 1131 | 1008 | 1980 | 1747 | 220 | 1490 | 2013 | 1301 | 535 | **12158** |
| 390x844 | 844 | 1074 | 979 | 1957 | 1735 | 220 | 1490 | 1963 | 1269 | 535 | **12065** (target ≤8500) |
| 393x852 | 852 | 1074 | 979 | 1957 | 1737 | 220 | 1490 | 1938 | 1269 | 535 | **12051** |
| 414x896 | 896 | 989 | 922 | 1771 | 1626 | 220 | 1490 | 1913 | 1269 | 535 | **11631** |
| 430x932 | 932 | 989 | 922 | 1732 | 1615 | 220 | 1490 | 1913 | 1269 | 497 | **11579** |
| 844x390 | 524 | 600 | 889 | 948 | 1577 | 304 | **2635** | 1343 | 806 | 351 | **9977** |
| 768x1024 | 1024 | 652 | 884 | 1057 | 1584 | 277 | **2630** | 1388 | 1077 | 351 | **10923** |
| 820x1180 | 1180 | 627 | 886 | 945 | 1556 | 295 | **2632** | 1340 | 1114 | 351 | **10927** |

---

## P0: broken or fails a hard gate

### A-home-01: Colour contrast fails axe on 41 nodes at 390 and 42 at 1440
- **Viewports:** every viewport. axe ran at 390x844 and 1440x900; the tokens are the same at every width.
- **Crop:** `crops/A-home-01.png` (Press rows at 390, with the failing nodes outlined).
- **Evidence** (`scripts/qa/output/a11y.json`, home 390x844):

  | Nodes | Element | Colours | Ratio |
  |---:|---|---|---:|
  | 7 | Section counters "01"…"07", 15px | `#7A8494` on `#F2F9F4` (`#FFFFFF` on Select Clients) | 3.53:1 (3.77:1) |
  | 2 | Inactive Services tabs, 20px regular | `#7A8494` | 3.53:1 |
  | 6 | Deliverables index "01"…"06", 15px/600 | `#17916B` on paper | 3.70:1 |
  | 18 | Press source and date, 14px | slate | 3.53:1 |
  | 9 | "Read The Full Article" links, 15px/600 | green | 3.70:1 |

  All of these need 4.5:1.
- **Root cause:**
  - `app/tokens.css:6` (`--slate: #7A8494`) and `app/tokens.css:10` (`--growth: #17916B`).
  - These are used at `components/SectionShell.module.css:21-24` (counter), `app/home.module.css:166` (tab), `app/home.module.css:326` (capabilityIndex), `app/home.module.css:370` (pressMeta) and `app/home.module.css:394` (pressLink).
- **Fix direction:** darken slate and green for small text below 1024px only. Desktop goldens use the same tokens, so a global change needs an explicit re-baseline decision.

### A-home-02: Tap targets under 44px (Home has 15 unique selectors; 25 elements at 390)
- **Viewports:** every viewport from 320 to 1023.
- **Crop:** `crops/A-home-02.png` (contact form at 390; every control is outlined).
- **Evidence** (mobile-lint plus the DOM script at 390):
  - "Read More": 70.1×22.4.
  - Services panel "Services & Results": 120.8×22.4.
  - 9 × "Read The Full Article": 144.8×24.
  - First name, Last name, Email and Phone inputs: 234×40 at 390, 164×40 at 320.
  - SUBMIT: 115.9×40.
  - Footer links: 41.5–120.8 × 22.4, with 8.4px between them vertically.
  - LinkedIn: 24×24.
  - Footer brand: 205.7×22.4.
- **Root cause:**
  - `components/ui.module.css:14` (`.linkButton` has `padding: 0`).
  - `app/home.module.css:391-396` (`.pressLink` has no padding or min-height).
  - `app/home.module.css:536` (`.input` has `padding: 9px 12px` with a 17px font, so it renders 40px tall).
  - `app/home.module.css:567-568` (`.submit` has `padding: 11px 28px; min-height: 40px`).
  - Footer: `components/SiteFooter.module.css` (shared).
- **Fix direction:** give link-buttons, press links, inputs and Submit a hit area of at least 44px below 1024px, using padding or min-height rather than a bigger font, and keep at least 8px between targets.

### A-home-03: Lighthouse mobile: Perf 90, LCP 3679 ms (budget ≤2000), 3.6 MB transfer
- **Viewport:** Lighthouse mobile (412 wide), confirmed at 390x844 by qa:bytes.
- **Crop:** `crops/A-home-03.png` (first viewport at 390: the poster/video hero is all the phone sees).
- **Evidence:**
  - `perf.json` median: Perf 90, LCP 3678.8 ms, FCP 1053.8 ms, CLS 0, TBT 9.5 ms. The LCP element is the `h1`.
  - Failing audits: `largest-contentful-paint`, `total-byte-weight`, `image-delivery-insight`, `network-dependency-tree-insight`, `render-blocking-insight` and `unused-javascript`.
  - `bytes.json` at 390: 3,523,203 B in total, of which `hero.webm` is 2,887,350 B (partial, in 5 s) and non-video is 635,853 B.
  - Non-video images at 390:

    | Image | Size | Rendered box | Intrinsic width / box width |
    |---|---:|---|---:|
    | `hero-poster.webp` 1920×1080 | 111,747 B | 390×844 | 4.9× |
    | `conference-room.webp` 1200×900 | 158,161 B | 298×224, top at y=5138 | 4.0× |
    | `stairway.webp` 1450×700 | 84,625 B | 390×220, top at y=6589 | 3.7× |
    | `classroom-lecture.webp` 980×653 | 59,930 B | 402×567 (includes the `scale(1.35)`), top at y=10298 | 2.4× |

  - None of these four has a `srcset`. The last three are below the fold but load eagerly.
  - The unthrottled Chromium LCP is 60 ms, so the 3.7 s is the simulated-throttling graph: the LCP text waits behind the video, images and JS that start in the same window.
- **Root cause:**
  - `components/home/HeroVideo.tsx:20`: `show = hydrated && !reduced` has no width, Save-Data or connection gate, so every phone mounts the video.
  - `components/home/HeroVideo.tsx:46`: `preload="auto"` on a 3.15 MB webm or 2.74 MB mp4.
  - `app/page.tsx:62-69`: a single-size poster with no `srcset`/`sizes`.
  - `app/page.tsx:130`, `:148` and `:192`: below-fold `<img>` tags without `loading="lazy"`.
- **Fix direction:** keep the video off the LCP path on phones (defer it until after load, or skip it on small screens or Save-Data), and serve width-appropriate images, lazy-loading the ones below the fold.

### A-home-04: Page length at 390 is 12065px, target ≤8500 (+3565px, +42%)
- **Viewports:** all phones (320: 13311; 430: 11579). Tablets are also long: 10923 at 768, which is 10.7 screens.
- **Crop:** `crops/A-home-04.png` (the whole page at 390, scaled to 2000px tall).
- **Evidence:**
  - The four biggest sections at 390 make up 7145px (59%): 03 Projects 1957, 06 Press 1963, 04 Deliverables 1735, 05 Clients 1490. See the height table above.
  - Vertical padding alone is 7 sections × 96px = 672px (48px top and bottom).
  - Horizontal space is lost to the counter column (A-home-13). That lengthens every text block: Promise body runs at 33 chars/line over 12 lines at 390, versus 66 chars/line over 6 lines at 768.
- **Root cause:**
  - `app/tokens.css:44` (`--section-pad` clamps to a 48px minimum).
  - `app/tokens.css:59-62` together with `components/SectionShell.module.css:36-41` (a 28px counter column plus a 16px gap on every body).
  - The per-section causes are in A-home-07, -11, -12, -13 and -14.
- **Fix direction:** budget the height per section. The largest savings are the logo wall, Press, Featured Projects and the contact photo, and giving back the 44px counter indent.

### A-home-05: SEO 92: the "Read More" link fails Lighthouse `link-text`
- **Viewports:** all (Lighthouse mobile).
- **Crop:** `crops/A-home-05.png`.
- **Evidence:**
  - `perf.json` Home SEO median is 92, with the `link-text` audit failing on every run.
  - The link is 70.1×22.4 at 390 and its accessible name is "Read More" (8 chars) with no context. Every other page scores SEO 100.
- **Root cause:** `app/page.tsx:98` (`<LinkButton href="/about">{HOME_COPY.promise.readMore}</LinkButton>`).
- **Fix direction:** add an accessible name with context (for example an `aria-label`, or visually hidden text naming About) and add the new text to `scripts/qa/content-allowlist.json`. The visible copy does not change.

---

## P1: looks amateur, or hurts reading or use

### A-home-06: Services panel text is squeezed to 148px at 320 (15 chars/line)
- **Viewports:** 320x568 is the worst. Also 360x780 (188px, 20 chars/line), 375/390 (203/218px, 23 chars/line) and 414/430 (242/258px, 26 chars/line).
- **Crop:** `crops/A-home-06.png`.
- **Evidence at 320:**
  - Panel 228×670px.
  - `panelLead` is 24px/600 over 6 lines at 148px wide. The body is 17px over 12 lines at 15.3 chars/line.
  - Of the 320px viewport, 172px goes on 24px page gutters, the 28+16px counter column and 2×40px panel padding.
  - At 390 the panel is still 475px tall, with the body at 23 chars/line.
- **Root cause:** `app/home.module.css:198` (`.panel` has `padding: 40px` at every width), stacked on the counter offset at `components/SectionShell.module.css:38`.
- **Fix direction:** cut panel padding and the section indent on phones so the text measure reaches about 35–45 chars/line.

### A-home-07: Client logos are unreadable on phones: 27 of 48 are under 24px tall at 390, the smallest 6.3px at 320
- **Viewports:** all phones (below 600px).
- **Crop:** `crops/A-home-07.png` (390 at DPR 2, with tiles outlined; the tiles are invisible without the outline).
- **Evidence:**
  - Every wide wordmark is clamped to the tile's inner width: 75.3px at 390 and 52px at 320.
  - At 390: GiveCampus 9.1px tall, Wonderschool 10.2, BookNook 11.4, Handshake 12.0, EVERFI 12.9.
  - At 320: GiveCampus 6.3px, Wonderschool 7.0. Logos under 24px tall: 33 of 48 at 320, 27 at 390, 20 at 430.
  - The tile is `#FFFFFF` on a `#FFFFFF` section, so the 3-column grid is invisible and the logos read as a ragged cloud.
  - The section is 1490px (12.3% of the page) in 16 rows of 72px plus 12px gaps.
- **Root cause:**
  - `app/home.module.css:464-466` (`.logo { width: min(calc(var(--logo-w) * 0.5), 100%) }`).
  - `app/home.module.css:459-462` (tile 72px tall with 8px padding).
  - `app/home.module.css:437` (tile background is white on the white section, from `SectionShell` `white`).
  - `app/page.tsx:39-44` (the area formula assumes desktop tile sizes).
- **Fix direction:** size logos on phones by a minimum ink height rather than half the desktop width, and rethink how many logos show per screen (fewer columns, a denser wall or a scroller) without removing any from the DOM.

### A-home-08: The logo wall is 2630px on tablets and in landscape (24% of the page, 2.6–6.7 screens)
- **Viewports:** 768x1024 (2630), 820x1180 (2632), 844x390 (2635, which is 6.8 viewport heights).
- **Crop:** `crops/A-home-08.png` (the whole section at 768, scaled).
- **Evidence:**
  - From 600px to 1087px the wall is 3 columns × 16 rows of 132px tiles with 24px gaps, 2472px in total.
  - Logos use only 72–180px of a 195–220px tile.
  - At 1024 the same section is 2657px (desktop is frozen, so this is outside the redesign's reach).
- **Root cause:**
  - `app/home.module.css:429-433` (`--cols: 3` below 1087px).
  - `app/home.module.css:438` (`height: 132px`).
  - `app/home.module.css:442` (`padding: 20px`).
- **Fix direction:** from 600 to 1023px use more columns or shorter tiles so the wall fits in about 1–1.5 screens.

### A-home-09: The hero overflows the first screen on short phones and in landscape
- **Viewports:** 320x568 and 844x390. At 375x667 the lead ends at y=638 of 667.
- **Crop:** `crops/A-home-09.png` (320x568 on the left, 844x390 on the right; both are the first viewport).
- **Evidence:**
  - 320x568: the hero is 811px tall on a 568px viewport. The `h1` is 44px over 6 lines. The lead ends at y=715, so its last 147px, 3 of 9 lines, are below the fold.
  - 844x390: the hero is 524px tall. The `h1` is 54.9px over 3 lines, and the lead ends at y=428, below the 390 fold. The 65px sticky header takes 16.7% of the viewport.
- **Root cause:**
  - `app/tokens.css:23` (`--t-hero` has a 2.75rem = 44px floor).
  - `app/home.module.css:37` (`.heroInner` has `padding: 128px var(--gutter) 96px`, which includes 64px of header clearance).
  - `app/home.module.css:5` (`min-height: 100vh`).
- **Fix direction:** scale the hero type and padding with viewport height as well as width, so the `h1` and lead fit one screen at 320x568 and 844x390.

### A-home-10: The hero poster is upscaled about 2.3× on 3× phones, so the LCP image looks soft
- **Viewports:** every portrait phone. The worst case is tall phones at DPR 3 (390x844, 393x852, 430x932).
- **Crop:** `crops/A-home-10.png` (a 220×200 CSS-px region at DPR 3, with text hidden).
- **Evidence:**
  - `object-fit: cover` scales the 1920×1080 poster to 844px tall, which makes it 1500 CSS px wide. The phone shows 390/1500 = 26% of the frame width.
  - At DPR 3 that crop needs 2532 device px of height from a 1080px source, which is 2.34× upscaling.
  - At the same time, 111,747 B are spent on the 74% of the frame that is never shown.
  - The video has the same portrait crop (26% of its 16:9 frame).
- **Root cause:** `app/page.tsx:62-69` (one 16:9 source, no `srcset`/`<picture>` art direction) and `app/home.module.css:14-20` (`object-fit: cover` fills the full hero).
- **Fix direction:** add a portrait-cropped poster source for phones, and let the designers decide whether the video runs on portrait at all.

### A-home-11: Featured Projects stacks into four ~430px cards (1957px at 390, 16% of the page)
- **Viewports:** all phones (1732–2257px). Tablets use 2 columns (945–1057px), which is fine.
- **Crop:** `crops/A-home-11.png` (the section at 390, scaled).
- **Evidence:**
  - At 390 the cards are 426, 449, 426 and 426px tall.
  - With 32px card padding plus the counter indent, the body text is 234px wide at 390 (29 chars/line) and 164px wide at 320 (20.5 chars/line), running 7–8 lines.
  - Each 48px stat sits under a 1px rule, with 20px row gaps.
- **Root cause:** `app/home.module.css:228` (`minmax(min(100%, 260px), 1fr)` gives one column below about 560px), `:239` (`.case { padding: 32px }`) and `:245` (`gap: 20px`).
- **Fix direction:** make the phone card denser (less padding, a wider measure, the stat placed next to or above the title) so each card is at most about 300px.

### A-home-12: The contact photo pushes the form 468px down on phones
- **Viewports:** all phones. At 768/820 the photo is 632×421 / 684×456, stacked above the form.
- **Crop:** `crops/A-home-12.png` (the first 844px of 07 Contact at 390: the photo fills the screen and only the form's heading is visible).
- **Evidence:**
  - At 390 the photo is 298×420 (a portrait crop of a 980×653 landscape photo, with a further `scale(1.35)`), plus a 48px gap. The form card starts at y+578 within the section.
  - At 320 the photo is 228×420: the visible crop is 54% as wide as it is tall, from a 1.5:1 source.
  - The section is 1269px at 390, or 1301px at 320.
- **Root cause:** `app/home.module.css:480` (`.contactPhotoWrap { min-height: 420px }`), `:474` (`gap: 48px`) and `:489` (`transform: scale(1.35)`).
- **Fix direction:** put the form first, or cap the photo to a short landscape band on phones and tablets.

### A-home-13: A 44px counter indent makes the margins lopsided (68px left vs 24px right) and nests up to 116px
- **Viewports:**
  - All phones: content x=68, right gutter 24.
  - Tablets and landscape: content x=112, right gutter 24–30.
- **Crop:** `crops/A-home-13.png` (Deliverables at 390, with guides at x=24 (red), 68 (blue), 116 (green) and 366 (red)).
- **Evidence:**
  - At 390 section content is 298px wide (76% of the viewport).
  - Nested blocks lose more width:

    | Block at 390 | Text starts at | Text width |
    |---|---:|---:|
    | Deliverables item text (32px index column plus 16px gap) | x=116 | 250px (64% of the viewport) |
    | Services panel text | x=108 | 218px |
    | Case body | x=100 | 234px |
    | Contact inputs | x=100 | 234px |

  - The empty `<span aria-hidden>` cell holds space in every section.
- **Root cause:**
  - `components/SectionShell.module.css:36-41` (`.body` is a two-column grid).
  - `app/tokens.css:59-62` (`--counter-col: 28px` below 600px).
  - `app/home.module.css:362-366` (`.capability` uses a 32px index column below 600px).
- **Fix direction:** below 600px drop the body offset (the counter can sit inline with the title) and recover about 44px of measure in every section.

### A-home-14: Press is 1963px at 390, nine rows of 181–231px with nine identical "Read The Full Article" links
- **Viewports:** all phones (1913–2163px). Tablets are 1340–1388px.
- **Crop:** `crops/A-home-14.png` (the section at 390, scaled).
- **Evidence:**
  - Each row at 390 stacks source (14px), date (14px), a headline of 2–4 lines at 20px, and the link, with 24px padding top and bottom.
  - The headline itself is not a link. The only target is the 144.8×24 "Read The Full Article" link, and all 9 share the same text.
  - On desktop the rows are 131px.
- **Root cause:**
  - `app/home.module.css:355-360` (the phone stack), `:346-352` (row padding 24px), `:369-374` (the two `pressMeta` lines stack as a grid).
  - `app/page.tsx:173-184` (the link wraps only the label).
- **Fix direction:** put source and date on one line and make the whole row one tap target. Consider showing fewer rows with a reveal, keeping all items in the DOM.

### A-home-15: On tablets and in landscape the Services panel has about 160px of dead space
- **Viewports:** 768x1024, 820x1180, 844x390. From 600 to 1023 the panel is stacked under the tabs.
- **Crop:** `crops/A-home-15.png` (768; the children are outlined with dashes).
- **Evidence:**
  - At 768 the panel is 632×440.
  - Its content is a 29px lead, an 82px body and a 43px footer. Between them are gaps of 103px (lead to body) and 102px (body to footer), against the 24px grid gap, so about 158px is empty.
  - At 844x390 the panel is 440px, taller than the viewport.
- **Root cause:** `app/home.module.css:201-202` (`.panel { align-content: space-between; min-height: 360px }`). This is meant for the side-by-side desktop layout.
- **Fix direction:** below 1024px drop `min-height`/`space-between` when the panel stacks, or put tabs and panel side by side from 768px.

---

## P2: polish

### A-home-16: Card body copy is 15px, under the 16px body minimum (10 elements)
- **Viewports:** all widths from 320 to 1023.
- **Crop:** `crops/A-home-16.png` (Deliverables items at 390, outlined).
- **Evidence:**
  - mobile-lint `bodyText` flags `.cardBody` at 15px: 4 elements in Featured Projects cases and 6 in Deliverables.
  - The form status message is also 15px (`app/home.module.css:581`; it only renders after submit).
  - Form labels (14px) and the stat labels are captions, not body copy.
- **Root cause:** `app/tokens.css:32` (`--t-body-sm: 15px`), used at `app/home.module.css:107`.
- **Fix direction:** use 16px or more for `.cardBody` and the form status below 1024px.

### A-home-17: A press headline breaks at "K-" / "12" on 390 and 393
- **Viewports:** 390x844 and 393x852. The break is not present at 320, 768 or 844.
- **Crop:** `crops/A-home-17.png`.
- **Evidence:** in "Lemnis, Public Charity Born From NWEA Sale, Makes First K-12 Acquisition", "K" sits on the line at y=8509 and "12" on the line at y=8534 (25px line height apart). The title is 3 lines at 298px.
- **Root cause:** `app/home.module.css:381-389` (`.pressTitle` uses `text-wrap: pretty` and does nothing to stop a break at a hyphen). The copy is frozen, so no non-breaking hyphen can be added in the text.
- **Fix direction:** fix the break through layout, such as a wider measure from A-home-13 or a CSS-only rule, and verify it at every phone width.

### A-home-18: The tablet hero is a full screen of poster with no hint of what follows
- **Viewports:** 768x1024 and 820x1180.
- **Crop:** `crops/A-home-18.png` (the 768x1024 first viewport, scaled).
- **Evidence:**
  - At 768 the hero is 1024px, and the text ends at y=670, leaving 354px (35%) of empty poster. At 820 it ends at y=753 of 1180, leaving 427px (36%).
  - No part of 01 Our Promise shows in the first viewport.
  - On iOS Safari `100vh` is the large viewport, so the hero bottom also sits under the toolbar.
- **Root cause:** `app/home.module.css:5` (`min-height: 100vh`) and `:7` (`align-items: center`).
- **Fix direction:** cap the hero height on tablets (for example `svh`-based, or a max-height), so the next section peeks into view.

### A-home-19: In landscape, the Deliverables photo is taller than the screen, and it loads early on phones
- **Viewports:**
  - 844x390: the photo is 708×531, 136% of the viewport height.
  - 768x1024: 632×474.
  - 820x1180: 684×513.
- **Crop:** `crops/A-home-19.png`.
- **Evidence:**
  - The 4:3 photo spans the full content width.
  - At 390 the same asset, `conference-room.webp`, is 158,161 B and loads at page start even though its top is at y=5138 (6.1 screens down). It is the largest non-video request on Home.
- **Root cause:** `app/home.module.css:301-307` (`.photo { width: 100%; aspect-ratio: 4/3 }`) and `app/page.tsx:130` (no `loading="lazy"`).
- **Fix direction:** from 600 to 1023 use a wider, shorter crop or a bounded height, and lazy-load it.

### A-home-20: Services tab changes are not announced, and the tabs activate on hover on touch
- **Viewports:** all. This matters most on phones, where the panel sits 321px below the first tab at 390.
- **Crop:** `crops/A-home-20.png` (tabs and panel at 390).
- **Evidence:**
  - The tabs are `<button aria-pressed>` with no `aria-controls` and no live region.
  - Pressing a tab swaps the panel text, but a screen reader hears only "pressed" and nothing about the new content. axe passes because the markup is valid.
  - `onMouseEnter` also fires from the compatibility mouse events on a tap, which does no harm, but it is desktop hover logic running on touch.
  - The tabs are 87–117px tall (hit size is fine).
- **Root cause:** `components/home/ServicesTabs.tsx:30-31` (`onMouseEnter`, `aria-pressed`) and `:40` (the panel has no relationship or `aria-live`).
- **Fix direction:** tie the panel to the tabs (tab semantics, or `aria-controls` plus a polite live region) and gate hover activation to `(hover: hover)`.

### A-home-21: The footer on Home has 22px-tall links and a phone number that cannot be tapped
- **Viewports:** all phones and tablets. The footer is 535px at 390 and 351px at 768.
- **Crop:** `crops/A-home-21.png` (links outlined).
- **Evidence:**
  - The links are 22.4px tall with 8.4px between them. The same targets are counted in A-home-02.
  - "Tel: 510-306-2403" is a `<span>` (`content/copy.ts:87`, `href: null`), so it is not a `tel:` link. Copy and links are frozen, so this needs an explicit decision.
  - The footer is shared, so these findings apply to every page.
- **Root cause:** `components/SiteFooter.module.css` (shared) and `content/copy.ts:85-90` (the phone number has no link).
- **Fix direction:** increase the footer link hit areas on mobile, and ask the owners whether a `tel:` link counts as an allowed link addition.

---

## Not findings (checked and clean)
- **Horizontal overflow:** 0 at every width from 320 to 1023 (mobile-lint).
- **Input font size:** 17px, so iOS does not zoom on focus.
- **Media dimensions:** every `<img>` has width and height attributes, and CLS is 0.
- **Third-party requests:** none (qa:bytes).
- **Services tab hit size:** 87–117px tall at full width.
- **Stats** ($3.5B and the others, 48px/600 green on white) pass as large text at 3.96:1. The green panel lead at 24px/600 also passes as large text.
- **Contact form:** 1 column on phones and 2 columns from 768 up. The fields are correctly labelled with wrapping `<label>`s.
- **Landscape 844x390:** the Contact section switches to 2 columns (photo and card, each 330px), which reads well.

## Coverage

Every Home section was screenshotted and viewed at each viewport below, and the DOM script ran at all of them. mobile-lint covers every width from 320 to 430 in 1px steps, plus 600, 700, 768, 800, 820, 900, 1000 and 1023.

| Page | Viewport | Screens viewed | DOM metrics | axe | Lighthouse |
|---|---|---|---|---|---|
| Home `/` | 320x568 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 360x780 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 375x667 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 390x844 | ✓ all sections | ✓ | ✓ (a11y.json) | ✓ (LH mobile 412) |
| Home `/` | 393x852 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 414x896 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 430x932 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 844x390 (landscape) | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 768x1024 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 820x1180 | ✓ all sections | ✓ | (not run here) | (not run here) |
| Home `/` | 1024 / 1280 / 1440 | Heights only (desktop frozen; used for comparison) | ✓ | 1440 ✓ | (not run here) |

Other pages (/about, /services-and-results, /privacy-policy, /accessibility-statement) are outside A-home's scope. Shared header and footer issues are noted only where they show on Home.
