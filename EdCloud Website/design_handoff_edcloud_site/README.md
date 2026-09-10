# Handoff: EdCloud Venture Partners website (Home, About, Services & Results)

## Overview
A three-page marketing site for EdCloud Venture Partners (edcloud.org), a growth consultancy for education technology companies. Audience: skeptical edtech founders and university/district procurement officers. The design's job is to read as established and serious: quiet light-green paper, white cards with a soft even shadow, one green accent reserved for outcome numbers, a numbered 01–07 document structure, and a large full-color client logo wall (the single most important selling element on the site).

## About the design files
Everything in `reference/` is a **design reference built in HTML** (a component-based prototype format with `{{ }}` template holes and a small runtime, `support.js`). It is not production code. Your task is to **recreate these pages in the target codebase** (Next.js/React, Astro, plain HTML/CSS, etc.) using its conventions, and to match the reference **pixel for pixel** at 375, 820, 1024 and 1440 px widths. If no codebase exists, use Next.js 14+ (App Router) + plain CSS Modules or Tailwind with the tokens in `tokens.css`. Do not introduce a component library.

Open the references directly in a browser (`reference/EdCloud Home.dc.html` etc.) to inspect; they render standalone. Inline styles on every element in those files are the ground truth. When this README and the reference disagree, the reference wins.

## Fidelity
**High-fidelity.** Final colors, type, spacing, copy, imagery and interactions. Recreate exactly. Use `content.js` for all copy and URLs; do not retype strings. Photos are **full color** (no grayscale filter anywhere).

## Global system

### Type
- One family: **Instrument Sans** via Google Fonts (`https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap`). Weights used: 400, 600. `-webkit-font-smoothing: antialiased`.
- Scale (see `tokens.css`): section header 20px/1.5/600/-0.01em; lead paragraph 20px/1.5/400 ink; body 17px/1.6 ink-2; card body 15px/1.55; captions/labels 14px; counters 15px slate `font-variant-numeric: tabular-nums`; stats 48px/1/600/-0.02em green tabular.
- `text-wrap: pretty` on paragraphs, `text-wrap: balance` on multi-line headings.

### Grid & alignment (the most important rule)
- Content container: `max-width: 1200px; margin: 0 auto; padding: <section-pad> 24px` (content-box, so outer box is 1248px).
- Every numbered section uses a two-column grid `grid-template-columns: 72px minmax(0,1fr); gap: 16px`. Row 1: counter + section title (`align-items: baseline`). Row 2 (`margin-top: 32px`): an empty first cell, then **all** section content in the second column. Result: every line, box, image and form starts flush with the title *word*, never with the number.
- The hero and page-title blocks use `max-width: 1248px; padding-inline: 24px; box-sizing: border-box` so the hero text also lands on this same 24px-inset left edge.
- Sections have no hairline dividers between them; separation comes from the 48–64px padding and the alternating white section (Select Clients).

### Colors
Page `#F2F9F4`; cards `#FFFFFF`; headings `#1B2431`; body `#4B5563`; slate `#7A8494`; hairlines/input borders `#C5DCCB`; accent `#17916B` (hover `#0F6B4F`); footer `#000000`. No other hues, no gradients.

### Shape & effects
- Radius 0 on everything except buttons (pill, 999px).
- Card shadow: `0 0 18px rgba(27,36,49,0.16)` — centered, no offset, on: service detail panel, project cards, deliverables photo, contact form card, About headshot, About stat cards, Services phase cards, Services results table.
- Motion: `180ms cubic-bezier(.2,.7,.2,1)` on color/background only. One hero reveal: `rise` keyframes (opacity 0→1, translateY 12px→0), 600ms, same easing, on the hero text block only. Respect `prefers-reduced-motion: reduce` (disable the reveal; hide the hero video and show the poster image).

### Links
Default `a { color:#17916B; text-decoration: underline; text-underline-offset: 3px }`, hover `#0F6B4F`. Nav links and footer links override this (see below).

## Shared chrome

### Header / nav (64px tall)
- `position: sticky; top: 0; z-index: 10`. Inner: `max-width:1200px; padding: 0 24px; content-box; display:flex; justify-content:space-between; align-items:center; gap:24px`.
- Left: 22×22 favicon image (URL in `content.js`/reference) + wordmark `EDCLOUD VENTURE PARTNERS` 14px/600/+0.08em uppercase, `gap:12px`, `white-space:nowrap`, links to Home.
- Right (≥820px): `About`, `Services & Results`, `Contact` 14px, `gap:32px`, no underline, underline on hover (`text-underline-offset:4px`). Contact → Home.
- <820px: right side becomes a pill button `Menu`/`Close` (14px/600/+0.02em, 1.5px border, `padding:10px 18px; min-height:44px`) toggling a full-width white list: Home, About, Services & Results, Privacy Policy, Accessibility Statement — 17px, each row `padding:14px 0`, 1px `#C5DCCB` bottom rule except last; list has `padding: 8px 24px 24px` and a top rule.
- **Home only:** header starts transparent over the hero video (text/border white/transparent) and becomes solid white with ink text + `#C5DCCB` bottom border once `scrollY > 40` (or when the mobile menu is open). Transition 180ms. The hero has `margin-top: -64px` so it sits under the transparent nav. **About/Services:** header is always solid white.

### Footer (black)
- `background:#000; color:#C8CDD5; font-size:14px; line-height:1.6`.
- Inner grid `repeat(auto-fit, minmax(240px,1fr)); gap:32px; padding:48px 24px`.
- Column 1 (`display:grid; gap:4px`): `Contact` (17px/600 white, no underline, underline on hover, → Home), `Book a Meeting` (white, underlined, → https://calendly.com/aaronsokol/15, `margin-bottom:12px`), `info@edcloud.org` (mailto), `28 Geary St. Ste 650`, `San Francisco, CA 94108`, `Tel: 510-306-2403`, `Fax: 510-306-2403`, then a **24px white LinkedIn "in" glyph** (SVG path in reference; no box behind it) with `margin-top:16px`, hover green, → https://www.linkedin.com/company/edcloud-llc.
- Column 2 (`gap:8px`): `Navigate` heading (17px/600, `margin-bottom:4px`), then `About`, `Services & Results`, `Privacy Policy`, `Accessibility Statement` — white, underlined.
- Bottom bar: 1px `rgba(255,255,255,0.16)` top rule; inner `padding:24px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:16px`. Left: favicon (22px, `mix-blend-mode:screen`) + `EdCloud Venture Partners` (600, white). Right: `© 2026 by EdCloud, LLC`.

### Newsletter block (below footer, on paper bg)
- Grid `repeat(auto-fit,minmax(300px,1fr)); gap:32px; padding: section-pad 24px`.
- Left: `Subscribe` as a link styled 28px/1.25/600 ink, no underline (underline on hover), `margin-bottom:16px`; paragraph 17px/1.6 ink-2 `max-width:38ch`.
- Right: form `display:grid; gap:16px; max-width:480px`: Input label `Email*` (label 14px ink above; input 17px, `padding:12px 14px`, 1px `#DCE0E5` border, radius 0; focus: 2px outline `#17916B`), Checkbox `Yes, subscribe me to your newsletter.` (14px ink-2, native checkbox `accent-color:#17916B`, `gap:8px`), primary Button `SUBMIT`. Below the form: `About` · `Services & Results` links (14px ink, `gap:24px`, `margin-top:32px`).

### Buttons
- Primary: `display:inline-flex; font:600 14px/1 Instrument Sans; letter-spacing:.08em; color:#fff; background:#1B2431; border:0; border-radius:999px; padding:14px 26px (nav-form SUBMIT) or 11px 28px / min-height 40px (contact SUBMIT) or 14px 32px / min-height 48px (BOOK A MEETING)`. Hover `background:#17916B`. Focus: `outline:2px solid #17916B; outline-offset:2px`.
- Link variant ("Read More", "Services & Results"): 14px/600 ink, underlined, `text-underline-offset:4px`, hover `#17916B`.

### Inputs (contact form)
`font:17px Instrument Sans; color:#1B2431; background:#fff; border:1px solid #C5DCCB; border-radius:0; padding:9px 12px; width:100%`. Focus: `border-color:#17916B; box-shadow:0 0 0 2px rgba(23,145,107,0.25)`. Labels 14px ink-2 above, `display:grid; gap:4px`. Textarea `rows=2; min-height:64px; resize:vertical`.

## Page 1 — Home (`reference/EdCloud Home.dc.html`)

### Hero (full viewport)
- `min-height:100vh; display:grid; align-items:center; background:#1B2431; margin-top:-64px`.
- Layers (all `position:absolute; inset:0; object-fit:cover`): (1) poster image `https://static.wixstatic.com/media/11062b_aa9be95a5d7c43ca974ea1c773b8803df000.jpg/v1/fill/w_1920,h_1080,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_aa9be95a5d7c43ca974ea1c773b8803df000.jpg`; (2) `<video autoplay muted loop playsinline preload="auto">` with source `https://video.wixstatic.com/video/11062b_aa9be95a5d7c43ca974ea1c773b8803d/1080p/mp4/file.mp4` (44s, 1920×1080), `playbackRate = 0.85`, `transition: opacity 900ms ease`; fade opacity to 0 when `duration - currentTime < 0.8s` and back to 1 after loop restarts (softens the loop seam); hidden entirely under `prefers-reduced-motion`; (3) overlay `rgba(27,36,49,0.42)`.
- Text block: container `max-width:1248px; padding:128px 24px 96px; border-box`, animated with `rise`. H1 `clamp(2.75rem,6.5vw,5rem)/1.08/600/-0.01em` white, three explicit lines via `<br>`: `We Bring Great` / `Education Companies` / `to National Scale.`; `margin-bottom:32px`. Paragraph 20px/1.5 white `max-width:78ch` (renders as 3 lines at 1440): *EdCloud Venture Partners supercharges post-traction education innovation teams that are actively reinventing instruction, administration, and the student experience - delivering dramatic impact through rapid, sustainable growth.*

### 01 Our Promise
Header `01 / Our Promise`. Content column `max-width:62ch; display:grid; gap:24px`: lead paragraph (20px/1.5 ink), two body paragraphs (17px/1.6 ink-2), link-button `Read More` → About. Copy verbatim in reference.

### 02 Services & Results (interactive)
Content grid `repeat(auto-fit,minmax(min(100%,360px),1fr)); gap:24px 48px; align-items:stretch`.
- Left `<ol>` with 1px top rule. Each item is a full-width `<button>`: `display:grid; grid-template-columns:minmax(0,1fr) 24px; gap:16px; padding:28px 0; border-bottom:1px solid #C5DCCB; text-align:left`. Title 20px/1.5/**400**/-0.01em. Active item color `#1B2431`, inactive `#7A8494` (180ms transition). Right cell: 10×10 green square, opacity 1 when active else 0. Switch on **click and on mouse-enter**. `aria-pressed` reflects state. Focus outline 2px green.
- Right detail panel: white, card shadow, `padding:40px; display:grid; gap:24px; align-content:space-between; min-height:360px`. Top: first sentence of the active service body in `clamp(1.5rem,2.6vw,2.125rem)/1.2/600` **green** (`text-wrap:balance`). Middle: remainder of the body 17px/1.6 ink-2. Bottom: row with 1px top rule, `padding-top:20px`, containing link-button `Services & Results` → Services page.
- Default active = first item. Split rule: lead = text up to and including the first `. `; rest = everything after. Services copy in `content.js` (`HOME.services`; note item 1 begins "From tiny foothold to total ubiquity, …").

### 03 Featured Projects
Grid `repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:24px` → 4 across at 1440. Card: white, card shadow, `padding:32px; display:grid; gap:20px`. Order inside: title (20px/1.25/600 ink) + body (15px/1.55 ink-2); 1px `#C5DCCB` rule; stat (48px green tabular) + stat label (14px/1.4 ink-2). No numbers, no colored top rule. Data: `HOME.cases` (Handshake $3.5B, Outschool $3B, Wayfinder $100M, Clever $500M).

### 04 Deliverables
Grid `repeat(auto-fit,minmax(min(100%,400px),1fr)); gap:48px 64px; align-items:start` (two columns at ≥ ~900px).
- Left column (`display:grid; gap:24px; align-content:start`, **not sticky**): lead paragraph 20px/1.5 ink: *EdCloud can help with everything it takes to move from founder-led sales to a momentum growth engine that never stops working.* Then photo `assets/conference-room.jpg` in a card-shadow wrapper, `aspect-ratio:4/3; object-fit:cover; object-position:50% 30%`.
- Right `<ol>` (1px top rule). Row: `grid-template-columns:56px minmax(0,1fr); gap:16px; padding:28px 0; border-bottom:1px solid #C5DCCB`. Counter `01`–`06` 15px/600 **green** tabular (`padding-top:6px`); title 20px/1.25/600 ink; description 15px/1.55 ink-2 (`gap:8px`). Data: `HOME.capabilities`.

### 05 Press
`<ul>` with 1px top rule. Row `grid-template-columns:minmax(120px,200px) minmax(0,1fr); gap:16px; padding:24px 0; border-bottom:1px solid #C5DCCB`. Left: source and date stacked, 14px slate. Right (`gap:8px`): headline 20px/1.25/600 ink; link `Read The Full Article` 15px green (hover `#0F6B4F`), underline offset 3px. Data: `HOME.press`.
After the container, a **full-bleed figure**: campus image `https://static.wixstatic.com/media/11062b_51f3741c03264d3ebb42126cfb510510~mv2.jpg/v1/fill/w_1450,h_700,q_90,enc_avif,quality_auto/11062b_51f3741c03264d3ebb42126cfb510510~mv2.jpg`, `width:100%; height:clamp(220px,36vw,480px); object-fit:cover`.

### 06 Select Clients (white section)
Header uses an `<h1>` (`06 / Select Clients`) — keep it an h1 for parity. Logo grid `repeat(auto-fill, minmax(min(100%/3 - 16px, 220px), 1fr)); gap:24px` → ≥3-up on mobile, 5-up at 1440. Tile: `height:132px; padding:20px; display:flex; align-items:center; justify-content:center; background:#fff`; no borders, no shadows, no gutters visible (white on white). Image `max-width:100%; max-height:100%; object-fit:contain; loading=lazy`, **full color**, no opacity. 48 logos in order in `HOME.logos` (46 Wix URLs + Worksheets AI + `assets/ucsd-logo.png`). Alt text = client name where known, else "Client logo". Do not shrink this section.

### 07 Contact Us
Grid `repeat(auto-fit,minmax(320px,1fr)); gap:48px; align-items:stretch`.
- Left: image wrapper `overflow:hidden; min-height:420px`; image `https://static.wixstatic.com/media/31d0a93857b149b5ab12ec952dde0516.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Classroom%20Lecture.jpg` alt "Classroom Lecture", `width:100%; height:100%; object-fit:cover; object-position:62% 50%; transform:scale(1.35); transform-origin:62% 50%` (crops out the soft right edge).
- Right: white card with card shadow, `padding:28px 32px; display:grid; gap:24px; align-self:center`. H2 `clamp(1.75rem,2.8vw,2.25rem)/1.15/600` two lines: `Ready to get going?` / `Contact us today.` Form grid `repeat(auto-fit,minmax(200px,1fr)); gap:14px 24px`: `First name*`, `Last name*`, `Email*`, `Phone`, `Message` (textarea, spans full width), then a right-aligned pill `SUBMIT` (11px 28px, min-height 40px). Required markers are literal asterisks in the label text. `onSubmit` prevents default (wire to your form backend).

## Page 2 — About (`reference/EdCloud About.dc.html`)
- Solid white header. Page hero `min-height:min(56vh,480px); align-items:end`, photo `https://static.wixstatic.com/media/11062b_c4449fb00d5143e5bdb41c3924c507ff~mv2_d_4166_2343_s_2.jpg/v1/fill/w_1920,h_1080,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_c4449fb00d5143e5bdb41c3924c507ff~mv2_d_4166_2343_s_2.jpg` (alt "Technology Class", color), overlay 0.42, H1 `About Us` `clamp(2.75rem,6vw,4.5rem)/1.05/600` white, block padding `96px 24px 64px`.
- **01 Mission & History**: content column `max-width:68ch; gap:20px`. H2 `About EdCloud` 28px/1.25/600; H3s 20px/1.25/600 with `margin-top:24px`: Our mission / How we think about scale / Our approach (operator first, not just advisory) / A brief history / Who we serve / What success looks like / How engagements work / Why now. Two bulleted lists (`padding-left:20px; gap:8px`), the second with bold lead-ins (`Define the narrative:` etc., 600 ink). Body 17px/1.6. All copy verbatim in reference.
- **02 Managing Partner** (white section): two-column `repeat(auto-fit,minmax(280px,1fr)); gap:40px`. Headshot `https://static.wixstatic.com/media/c8e843_d6fbe6723c2e4c82a536a7c46f6040f9~mv2.png/v1/fill/w_486,h_450,al_c,q_85,enc_avif,quality_auto/headshot%202.png` `max-width:420px; aspect-ratio:486/450; object-fit:cover` + card shadow. Text: H2 `About Aaron Sokol` 28px; paragraph (says "a California-based growth consultancy"); `Aaron is based in San Francisco, where he lives with his wife and kids.`
- **03 By The Numbers**: grid `repeat(auto-fit,minmax(220px,1fr)); gap:24px`; white cards, card shadow, `padding:32px; gap:8px`: stat 48px green (`22`, `14`, `2`, `8`), H3 20px (`Years of Experience`, `Ongoing Projects`, `Provisional Patents`, `Dedicated Professionals`), description 15px/1.5.
- Footer + newsletter as shared.

## Page 3 — Services & Results (`reference/EdCloud Services.dc.html`)
- Solid header. Hero `min-height:min(72vh,640px); align-items:end`, photo `https://static.wixstatic.com/media/11062b_73e69c0bfc9b49ce8e001cc70aeeb043~mv2.jpeg/v1/fill/w_1920,h_1080,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_73e69c0bfc9b49ce8e001cc70aeeb043~mv2.jpeg` (alt "Modern Classroom"), overlay 0.5, block padding `112px 24px 64px; gap:24px`. H1 `Services & Results` `clamp(2.75rem,6vw,4.5rem)/1.05` `max-width:16ch`; paragraph 20px/1.5 white `max-width:60ch` (copy in reference).
- **Proof strip** (white, 1px `#C5DCCB` bottom border): `padding:40px 24px; grid repeat(auto-fit,minmax(200px,1fr)); gap:32px`. Each: 1px left rule `#C5DCCB`, `padding-left:20px`, stat `clamp(2rem,3.4vw,3rem)/1/600/-0.02em` green, label 15px/500 ink, client 14px slate. Data `SERVICES.proof` (`30 → 550`, `10% → 90%`, `300 → 1.5M` "students using the product", `$500M`).
- **01 How an engagement works**: lead 20px ink `max-width:62ch`; three white cards (`repeat(auto-fit,minmax(260px,1fr)); gap:24px`), `border-top:2px solid #1B2431; padding:28px 28px 32px`, card shadow: row with counter 15px slate + duration 14px/600 green; H3 24px/1.2/600; body 16px/1.55. Data `SERVICES.phases`.
- **02 What we do** (white section with 1px top/bottom borders): lead paragraph; then `<ol>` (1px top rule), rows `grid 72px minmax(0,1fr); gap:16px; padding:40px 0; border-bottom`. Counter 15px slate. Inner `repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:24px 48px`: left = H3 `clamp(1.5rem,2.4vw,2rem)/1.15/600`, pitch 17px/1.6 `max-width:48ch`, result line 17px/1.4/600 green; right = `<dl>` rows `grid 110px minmax(0,1fr); gap:16px`, 15px: `Best for` / `You get` / `Timeline`. Data `SERVICES.services`.
- **03 Results**: lead paragraph; white shadowed wrapper `overflow-x:auto`; table `min-width:640px; border-collapse:collapse; font-size:16px`. Header row 14px/500 slate, `padding:16px 24px`, 1px bottom rule. Body cells `padding:20px 24px`, 1px bottom rule; client 600 ink nowrap; outcome 600 green. Data `SERVICES.results`.
- **04 Is this a fit** (white, borders): two columns `minmax(min(100%,300px),1fr); gap:48px`. H3 20px. Lists: items `padding-left:20px; border-left:2px solid` — green `#17916B` for the "right partner when" list, `#C5DCCB` for the "probably not when" list; 17px/1.55. Copy in reference.
- **05 Start** (dark band `#1B2431`): `padding:clamp(56px,7vw,80px) 24px; grid 72px minmax(0,1fr)`; counter `05` in `#9AA3B0`. Inner `repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:32px; align-items:center`: H2 `Start with a 15 minute call.` `clamp(2rem,4vw,3rem)/1.1/600` white; right: white pill `BOOK A MEETING` (ink text, 14px/600/.08em, `padding:14px 32px; min-height:48px`, hover green bg + white text) → calendly, and `info@edcloud.org` white underlined link.
- Footer + newsletter as shared.

## Interactions summary
| Element | Behaviour |
|---|---|
| Home nav | transparent → white at `scrollY > 40`; 180ms |
| Mobile nav (<820px) | `Menu`/`Close` toggles list; closes on breakpoint change |
| Hero video | autoplay muted loop, 0.85× rate, 900ms opacity fade at loop seam, poster fallback, hidden under reduced-motion |
| Hero text | single `rise` reveal 600ms |
| Services tabs (Home 02) | hover or click sets active; color + dot transition 180ms |
| Links / buttons | color/background 180ms; focus ring 2px `#17916B` offset 2px |
| Forms | native required validation; `preventDefault` placeholder — connect to backend |

## Responsive
Fluid throughout via `auto-fit`/`auto-fill` grids and `clamp()`. Verify: 375px — no horizontal scroll, logo wall ≥3-up, contact form single column, nav collapsed; 820px — nav expands; 1440px — 4 project cards across, 5 logos across, two-column Deliverables and Contact.

## Accessibility
4.5:1 contrast everywhere (white on `#1B2431`/`#000`, `#4B5563` on `#F2F9F4`, `#17916B` on white passes at ≥15px 600). Visible focus on all interactive elements. Labels wrap inputs. Alt text on every image. `aria-pressed` on service tabs, `aria-expanded`/`aria-controls` on the menu button. Video is `aria-hidden` with `tabindex=-1`.

## Assets
- `assets/conference-room.jpg` — Deliverables photo (user supplied).
- `assets/ucsd-logo.png` — UC San Diego logo tile (user supplied).
- All other imagery is hot-linked from `static.wixstatic.com` / `video.wixstatic.com` (URLs in `content.js` and the reference). Recommend downloading and self-hosting before launch; keep the same crop parameters.
- Favicon/mark: `https://static.wixstatic.com/media/c8e843_8fd79574ca964055ac18a120887cc9e8~mv2.png/v1/fill/w_32,h_32,al_c,q_85,enc_avif,quality_auto/55b97715067563_5628c905b5051_edited_edited.png`.

## Files in this bundle
- `README.md` — this spec.
- `CLAUDE_CODE_PROMPT.md` — paste-ready implementation prompt with a pixel-diff verification loop.
- `tokens.css` — all design tokens.
- `content.js` — all copy, data arrays and asset URLs, lifted verbatim.
- `reference/` — the HTML prototypes (open in a browser): `EdCloud Home.dc.html`, `EdCloud About.dc.html`, `EdCloud Services.dc.html`, shared `SiteHeader.dc.html` / `SiteFooter.dc.html`, runtime `support.js`, design-system CSS under `_ds/`, and `uploads/`.
- `assets/` — the two user-supplied images.
