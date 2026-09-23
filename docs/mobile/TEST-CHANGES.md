# Test and harness changes in Phase 3 (for the PR)

The brief allows a selector or expectation in `scripts/interactions.spec.ts` to change only where the mobile design deliberately changes behaviour. Every such change is listed here, along with the Phase 3 changes to `scripts/visual-diff.spec.ts` and the QA harness.

## scripts/interactions.spec.ts

| Test | Change | Why |
|---|---|---|
| service tabs › hovering the second title switches the detail panel | The selector `button[aria-pressed]` is now `button[aria-controls="svc-panel"]`, and the test expects `aria-expanded="true"`. The panel is found as `#svc-panel` instead of by XPath. A check was added that the panel's `aria-labelledby` follows the active row. | SPEC §7.1: below 1024 the same three buttons form an exclusive accordion. `aria-pressed` gave way to `aria-expanded` plus `aria-controls`, at every width. Desktop hover behaviour and colours are unchanged, and the test still asserts both. |
| same test | The lead expectation `/^Don't just adopt the gold standard\./` is now `/^Don't just adopt the gold standard - become one\.$/`. | **This failure predates Phase 3.** `content/content.js` has read "…gold standard - become one." since before the Phase 0 baseline. The old test fails on `95beb8d` too (re-run on a baseline worktree on 2026-09-23). |
| service accordion (phones) › tapping a row opens it and moves the panel under it | **New.** | This behaviour is new below 1024 (SPEC §7.1). |
| mobile menu › Menu opens a five-link sheet that closes with Close and Esc | Was "Menu toggles a five-link list and reads Close". The trigger selector is now scoped to `header nav`. The test now expects `#mobile-menu[role="dialog"]`, focus on the sheet's Close button, and `inert` on `<main>`. It closes the sheet with its Close button and with Esc, not by clicking Menu again, and checks that focus returns to Menu. The five-link count and the solid header are still asserted. | SPEC §5.3: the menu is now a full-height modal sheet that covers the Menu trigger. |
| mobile menu › the nav collapses below 1024 | **New.** | This is a deliberate tablet change (SPEC §3.1). The desktop links now collapse below 1024 instead of 820. |
| contact pill › is on Home only | **New.** | SPEC §5.6 and G17. The floating Contact pill appears only on Home. `main` on /services-and-results has no booking link or button. |

Unchanged: the home header transparency test, both contact form tests (the focus-ring walk passed 32 stops at 1440), both hero video tests and the Lighthouse accessibility ≥95 tests. All 13 tests in the file pass against `next dev`.

## scripts/visual-diff.spec.ts

- Reference parity is now asserted only at **1024×768 and 1440×900**. The 375×812 and 820×1180 runs are recorded in `MOBILE_DIVERGENCE` and reported as skipped, with the reason "Intentional mobile divergence from the design reference (docs/mobile/SPEC.md)".
- **Known issue from before Phase 3:** the remaining ≥1024 runs fail against the old design reference, with Home 23.8% / 26.2%, About 7.5% / 6.7% and Services 14.0% / 16.9% mismatch. Those numbers are **identical to the pixel** on the untouched baseline `95beb8d`, which was re-run on 2026-09-23 against a baseline worktree. They come from owner-approved desktop changes merged to main after the reference was frozen (for example the client logos and copy edits in #28–#33), not from this redesign. Desktop is frozen against the Phase 0 goldens by `qa:desktop-parity`, which reports 0 px.

## QA harness (scripts/qa)

| File | Change | Reason |
|---|---|---|
| `a11y.mjs` | Only axe's `color-contrast` rule is disabled. | Owner decision of 2026-09-23 (SPEC §1.4). Every other rule runs. |
| `perf.mjs` (Media & Perf) | A11y is gated on the score without `color-contrast`, and the raw score is printed as `(raw N)`. The test also asserts that phones fetch no video and no uncropped desktop source. | SPEC §16.3 and §8.3–8.4 |
| `bytes.mjs` (Media & Perf) | New assertions: no Home-only images on subpages, at most one image preload per head, no `<picture>` fallback fetched at 390, no crops fetched at 1440, and video gating at each width. | SPEC §8.3–8.4 and §9 |
| `all.mjs` | Now runs `qa:breakpoints` first. | SPEC §3 |
| `content.mjs` (Foundation) | 1. Exact `<meta>` swaps can be allow-listed. Only `viewport-fit=cover` is listed. 2. `/sitemap.xml` `<lastmod>` values are compared as `BUILD-TIME`, but each must still be valid ISO. | 1. SPEC §15 item 7. 2. `app/sitemap.ts` stamps the build time, so the byte compare failed on every rebuild. |
| `content.mjs` (Integrator) | `words` is now built from the text-node segments on both sides instead of from `body.textContent`. | `textContent` glued adjacent elements into one token ("Clients06PressEdWeek"), so any element inserted between sections broke tokens that were never copy. Segments are still compared as their own multiset, so a changed or removed word still fails. |
| `content-allowlist.json` | `hrefs: ["#contact"]` (the Home Contact pill, SPEC §5.6) and the segment `"about EdCloud"`. | The segment is the visually hidden tail of Home's "Read More" link. It is the SPEC §6.1 fallback, because Lighthouse `link-text` ignores `aria-label`. |
| `.gitattributes` | `public/robots.txt`, `public/_headers` and `public/_redirects` are pinned to LF. | With `core.autocrlf=true`, a Windows checkout produced CRLF, and `qa:content` then failed `/robots.txt` on bytes alone. |

## Deliberate tablet (600–1023) changes to show in review

- The nav collapses to Menu and the sheet below **1024**, not 820.
- Home:
  - the services accordion is kept on tablets
  - 2×2 featured projects, with the caption under the figure
  - 2-up capabilities
  - 4-column logos (24 visible)
  - a 2-column press index (4 visible)
  - the contact band sits inside the column
  - the hero is 640px
- About: every chapter starts open, in the centred 34em column.
- Services & Results:
  - all six services start open, 2-up
  - the proof strip is **2×2, not 4-up**, a deviation from SPEC §6.3 that needs judge sign-off: "300 → 1.5M" doesn't fit a quarter of the capped column at the tablet stat size
  - results stack below 820 (previously below 800)
  - phases are 3-up from 820
- Every page: the content column is capped at 34em plus gutters and centred, so the margins are equal on both sides (SPEC §18).
