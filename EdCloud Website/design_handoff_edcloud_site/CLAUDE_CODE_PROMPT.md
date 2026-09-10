# Claude Code prompt — implement the EdCloud site at pixel fidelity

Paste everything below this line into Claude Code, run from the root of the target repo with this handoff folder copied in as `design_handoff_edcloud_site/`.

---

You are implementing a three-page marketing site from a high-fidelity HTML design reference. Fidelity target: **pixel-for-pixel** against the reference at 375, 820, 1024 and 1440 px viewports. Read `design_handoff_edcloud_site/README.md` fully before writing any code, then follow this plan.

## 0. Ground rules
- The reference files in `design_handoff_edcloud_site/reference/*.dc.html` are the source of truth. Inline `style="…"` attributes there are exact. When README prose and reference markup disagree, the markup wins.
- Copy and data come only from `design_handoff_edcloud_site/content.js`. Never retype strings; import them.
- Tokens come only from `design_handoff_edcloud_site/tokens.css`. No new colors, radii, shadows or fonts.
- Photos are full color. Do not add grayscale filters.
- No component library, no icon library. The single icon is the inline LinkedIn SVG path in the reference footer.
- Prefer CSS Grid/Flex with `gap`. Preserve every `clamp()`, `minmax()`, `auto-fit`/`auto-fill` value verbatim; they are what make the responsive behaviour match.

## 1. Stack
Detect the existing framework. If none: `npx create-next-app@latest` (TypeScript, App Router, no Tailwind, ESLint) and use CSS Modules + `tokens.css` as global variables. Load Instrument Sans with `next/font/google` (weights 400, 600, `display: 'swap'`) and set `--font` from it. Three routes: `/` (Home), `/about`, `/services-and-results`. Shared `SiteHeader`, `SiteFooter` (footer + newsletter) components.

## 2. Build order
1. Global: `tokens.css`, body reset (`margin:0; background:var(--paper); color:var(--ink-2); font-family:var(--font); -webkit-font-smoothing:antialiased`), default link styles, `@keyframes rise`, `prefers-reduced-motion` rule.
2. `SectionShell` helper: container (`max-width:1200px; margin:0 auto; padding:var(--section-pad) 24px`) + the `72px minmax(0,1fr)` header grid + the offset content grid. Every numbered section on every page uses it so all content aligns with the title word.
3. `SiteHeader` (with `transparentOverHero` prop used only on Home; scroll listener switches at 40px; `matchMedia('(max-width: 819px)')` drives Menu/Close).
4. `SiteFooter` (black footer + newsletter block).
5. Home sections in order: Hero (poster + video + overlay + text), 01, 02 (interactive tabs), 03, 04, 05 (+ full-bleed figure), 06 logo wall, 07 contact.
6. About page, Services page.
7. Verification loop (section 4). Do not declare done before it passes.

## 3. Implementation details that are easy to get wrong
- **Alignment:** header row is `grid-template-columns:72px minmax(0,1fr); gap:16px; align-items:baseline`; content row is the same grid with an empty first cell, `margin-top:32px`. Hero/page-title containers use `max-width:1248px; padding-inline:24px; box-sizing:border-box` so hero text shares the same left edge.
- **Home nav over hero:** hero `margin-top:-64px`; header `position:sticky; top:0`. Transparent state: `background:transparent; border-color:transparent; color:#fff` (wordmark, links, Menu button border). Solid state: `#fff / #C5DCCB / #1B2431`.
- **Hero video:** `<video autoPlay muted loop playsInline preload="auto" aria-hidden tabIndex={-1}>`; on mount set `playbackRate = 0.85` and call `play().catch(()=>{})`; on `timeupdate` set opacity 0 when `duration - currentTime < 0.8` else 1, with `transition: opacity 900ms ease`. Render the poster `<img>` underneath always. Under `prefers-reduced-motion: reduce` do not render the video.
- **Services tabs (Home 02):** `useState(0)`; each `<button>` gets `onClick` and `onMouseEnter` → set index; `aria-pressed`. Split body at the first `". "` for the green lead line. Detail panel `min-height:360px; align-content:space-between`.
- **Cards:** `box-shadow: 0 0 18px rgba(27,36,49,0.16)`; radius 0. Only the Services page phase cards have a `2px solid #1B2431` top border; Home project cards have none.
- **Logo wall:** `grid-template-columns: repeat(auto-fill, minmax(min(100%/3 - 16px, 220px), 1fr)); gap:24px`; tiles `height:132px; padding:20px`; white on white; images `object-fit:contain; max-height:100%`; 48 logos in `HOME.logos` order.
- **Contact photo crop:** `object-position:62% 50%; transform:scale(1.35); transform-origin:62% 50%` inside an `overflow:hidden` wrapper with `min-height:420px`.
- **Inputs:** 1px `#C5DCCB` border, radius 0, `padding:9px 12px`; focus `border-color:#17916B; box-shadow:0 0 0 2px rgba(23,145,107,0.25)`. Newsletter input uses the design-system variant instead (`padding:12px 14px`, border `#DCE0E5`, focus `outline:2px solid #17916B`).
- **Footer:** `#000` background, LinkedIn glyph is bare white SVG, copyright `© 2026 by EdCloud, LLC`.
- **Buttons:** pill 999px only on buttons; letter-spacing `.08em` uppercase labels (`SUBMIT`, `BOOK A MEETING`).

## 4. Verification loop (mandatory)
Install Playwright (`npm i -D @playwright/test && npx playwright install chromium`). Serve the reference folder statically (`npx serve design_handoff_edcloud_site/reference -l 4174`) and the app (`npm run dev`). Write `scripts/visual-diff.spec.ts` that, for each page pair
- `/` ↔ `http://localhost:4174/EdCloud%20Home.dc.html`
- `/about` ↔ `…/EdCloud%20About.dc.html`
- `/services-and-results` ↔ `…/EdCloud%20Services.dc.html`

and each viewport `375×812`, `820×1180`, `1024×768`, `1440×900`:
1. Load both, `await page.evaluate(() => document.fonts.ready)`, wait for `networkidle`, pause the hero video (`document.querySelectorAll('video').forEach(v=>{v.pause(); v.currentTime=0;})`) and disable animations via `page.emulateMedia({ reducedMotion: 'reduce' })` on **both** sides so the comparison is deterministic.
2. Take full-page screenshots and compare with `pixelmatch` (threshold 0.1). Report mismatch %.
3. Also dump a layout fingerprint on both sides and diff it as JSON: for every `h1,h2,h3,p,li,button,input,img,video,section` collect `{tag, text.slice(0,40), x, y, w, h, fontSize, fontWeight, lineHeight, color, backgroundColor}` via `getBoundingClientRect()` + `getComputedStyle()`. Any element off by >1px or any style token mismatch is a defect.

Iterate until every page × viewport is **≤0.5% pixel mismatch** and the layout fingerprint diff is empty (allowing ±1px). Anti-aliasing of text is the only acceptable residual. Fix the app, never the reference.

## 5. Interaction checks (Playwright)
- Home: at 1440, `scrollY` 0 → header background `transparent`; scroll 200 → `rgb(255, 255, 255)`.
- Home: hover the second service title → detail lead text starts with "Don't just adopt the gold standard."; first title color becomes `rgb(122, 132, 148)`.
- 375: header shows `Menu`; click → list with 5 links; button reads `Close`.
- Contact form: submit with empty required fields → browser validation blocks; Tab through the page → every focused element shows the 2px green outline/ring.
- Hero `<video>` is playing (`!paused`) at 1440 when reduced motion is off; absent when `reducedMotion: 'reduce'`.
- Lighthouse accessibility ≥ 95 on all three pages.

## 6. Deliver
Commit with the visual-diff spec included and a `README` section showing the final mismatch table per page/viewport. List anything you could not match exactly and why.
