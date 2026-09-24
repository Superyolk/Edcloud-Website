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

## Phase 4 round 1 (QA harness)

| File | Change | Reason |
|---|---|---|
| `content.mjs` | Before collecting text-node segments, every `<span data-nowrap>` is unwrapped on a copy of the body and the text nodes are merged back (`normalize()`). | SPEC §18.2 rule 3: "K-12", "long-term", dates and "Level AA" are kept on one line by a wrapper span (`components/KeepTogether.tsx`). The span splits one text node into three without changing a character; unwrapping it compares the sentence as the one segment it always was. Any real text change still fails. |
| `mobile-lint.mjs` | `bodyText` (p/li/dd/td under 16px) skips a cell set as a meta line: computed `text-transform: uppercase`, weight 600 or more, 13px or more. `textSize` (nothing under 13px) still applies to it. | Judge ruling 2 (R1-designer-08) requires SPEC G9's Results client cell as a 13px/600 uppercase meta line, the same treatment as the proof strip's client names and Home's press sources. It is a one-word label, not running copy; every other p/li/dd/td is still held to 16px. |
| `early.mjs` (new, `npm run qa:early`, in `qa:all`) | On a throttled phone (CPU 4x, 150ms RTT, 1.6 Mbps): a `#:~:text=` link into a collapsed Press story and into a collapsed About chapter must land on the text, open, after hydration; a tap on Menu and on a collapsed chapter 300ms after first paint, before React attaches, must take effect. | R1-a11y-05 and R1-a11y-06: since phones hydrate after the first paint, both failed on 2 of 2 runs. Both checks fail on the pre-fix build. |

`scripts/interactions.spec.ts`, **mobile menu › Menu opens a five-link sheet…**: "the open menu turns the home header solid" now reads the header's `::before` layer (white, opacity 1) instead of the header's own `background-color`. Below 1024 the solid state is that layer, which fades by opacity over 150ms, so the header itself stays transparent (SPEC §5.2; R1-client-08, R1-designer-10). The desktop transparency test is unchanged. Nothing else in the file changed.

## Phase 4 round 2 (QA harness)

| File | Change | Reason |
|---|---|---|
| `early.mjs` | Three more `#:~:text=` cases on Home Press: item 7 ("Zovio Sells Tutoring Services") and item 9 ("Now Valued at") throttled, and item 9 again unthrottled (after hydration). The pass rule for every fragment case is stricter: the matched text's top must sit below the 56px sticky header and at least 24px above the bottom edge (it was `top >= 0` and `< 844`). | R2-a11y-01: the browser scrolled to a deep Press item before items 4-6 were revealed, which pushed it 52-369px below the screen. On the pre-fix build all three new cases fail (text top 851, 1168 and 1167px); on the fixed build all pass (407-408px). The existing two cases pass under the stricter rule too. |
| `mobile-lint.mjs` | After the width sweep, each page runs once more at 320px with `html { font-size: 200% }` and every disclosure open, and reports `overflow` and `margins` findings from that pass (selector suffixed "(text 200%)"). | R2-a11y-02: About's "workforce/enterprise" ran 10px past a 320px screen at 200% text (a grid item's `min-width: auto`), and no 100% sweep could see it. With the old rule forced back on, the page measures scrollWidth 330 and this pass fails; with the fix it is 320 on every page. |

## Phase 4 round 3 (QA harness)

| File | Change | Reason |
|---|---|---|
| `mobile-lint.mjs` | New `find` check, run last on each page at 390 with every disclosure and Show-all list open: for each `[data-nowrap]` span in `main` and the footer, `window.find()` on the span's text plus the word either side must match. Findings are keyed by the phrase. | R3-a11y-01: while the glue spans were inline-blocks, all 60 such searches failed below 1024 (Chromium treats an atomic inline as a block boundary for find-in-page and `#:~:text=`). On the fixed build 80 of 80 spans pass at 320, 390 and 768; forcing the old `display: inline-block` back on fails 80 of 80. The existing checks and the 200% pass are unchanged, and the new pass runs after them, so it cannot change what they see. |

## Phase 4 round 4 (QA harness)

| File | Change | Reason |
|---|---|---|
| `mobile-lint.mjs` | New `dash` check at every sweep width: no visible text line may start with the spaced dash (" - "), the hero included. | R4-designer-02: the hero lead started a line with "-" at 356–364, 449–460, 468–487 and 600–1023, and nothing measured it. It fails on the pre-fix build and passes on the fixed one. |
| `mobile-lint.mjs` | New `headline` check, Home only, from 366 up: the hero H1 sets in at most 3 lines. | R4-designer-01: the H1 fell to 4 lines at 737–1023 once the display size outgrew the fixed 459px column. The 4 lines accepted at 320–365 (judge ruling 6) are outside the check. |
| `mobile-lint.mjs` | The 200% text pass runs at **320 and 390** (it was 320 only). Beside `overflow` and `margins`, it adds `clip` (a text-bearing header box, and the open menu sheet's bar, with `scrollWidth > clientWidth + 1`), `nowrapEdge` (a `[data-nowrap]` line box past its block's content edge) and `split` (a word on two lines although it is no wider than the column). The existing checks and their thresholds are unchanged. | R4-a11y-01 to -04: the clipped wordmark, the privacy date 17px into the gutter, "justificati / on" at 390 and the 11 mid-word breaks beside index numbers, figures and dates were invisible to the overflow check (an `overflow:hidden` box, or a break that stays inside the column). A word wider than the whole column ("Accessibility" at 72px) may still break, which WCAG 1.4.10 allows. With the round 4 fixes forced off (`container-type: normal`, glue re-forced), the checks report the wordmark `clip`, the date `nowrapEdge`, and `split` on "Privacy" and "Perpetuating". |
| `content.mjs` | `<wbr>` elements are removed from the body copy (with the `data-nowrap` unwrap) before text-node segments are collected. | R4-a11y-03: `KeepCompounds` puts a `<wbr>` after a slash between words below 1024. It adds no character, but it splits "providers/contractors" into two text nodes, which read as a changed segment. Any real text change still fails. |

## Phase 5 (merging main #34 and #35)

| File | Change | Reason |
|---|---|---|
| `scripts/qa/content-snapshot/home.1440.json`, `home.390.json` | The Contact image alt changed from "Classroom Lecture" to "Students raising their hands in a classroom". These two files were re-snapshotted from a build of `origin/main` `1b6f6c9`, not from this branch. | Owner PR #34 changed the alt on main after the Phase 0 snapshot. Nothing else in the snapshot changed. |
| `scripts/qa/golden/` | **Unchanged.** | The goldens predate #34 and #35, so `qa:desktop-parity` reports Home at 1024, 1280 and 1440 as different (179,434, 175,036 and 175,123 px). A build of `1b6f6c9` gives exactly the same counts against the goldens, and this branch against a build of `1b6f6c9` is 15/15 at 0 px (BASELINE.md, Phase 5). The Home goldens need re-capturing from main after merge. |

## Deliberate tablet (600–1023) changes to show in review

- The nav collapses to Menu and the sheet below **1024**, not 820.
- Home:
  - the services accordion is kept on tablets
  - featured projects, capabilities and the press index (4 visible) stay the phone's single-column ledgers (Phase 4 R1: 2-up cells in the capped column were narrower than a phone's)
  - 4-column logos (24 visible)
  - the contact band sits inside the column
  - the hero is 640px
- About: every chapter starts open, in the centred 27em column; By The Numbers is the single-column ledger; the byline keeps its phone shape with a 128×160 portrait.
- Services & Results:
  - all six services start open, in one column
  - the proof strip is **2×2, not 4-up** (judge ruling ACCEPT, Phase 4 R1): "300 → 1.5M" doesn't fit a quarter of the capped column at the tablet stat size
  - phases, the fit lists and the results stay stacked up to 1023 (previously phases 3-up and a 4-column table from 820)
- Every page: the content column is capped at 27em plus gutters (459px at 17px, median 56 characters a line) and centred, so the margins are equal on both sides (SPEC §18; 34em in Phase 3 measured 71 cpl, and 29em in round 1 still ran 41% of About's lines past 60).
