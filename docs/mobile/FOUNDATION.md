# Foundation API (Phase 3)

This is what the Foundation commit gives the Home, Pages and Media & Perf engineers. Consume these files; don't edit them (SPEC §12). Send change requests to Foundation. [SPEC.md](SPEC.md) is still the binding spec. This page covers only how to call the pieces.

## 1. Breakpoints and tokens

- **Queries.** Use the literals in `app/tokens.css` (header comment) or the constants in `app/breakpoints.ts`: `MQ_MOBILE`, `MQ_PHONE`, `MQ_XS`, `MQ_TABLET`, `MQ_TABLET_WIDE`, `MQ_SHORT`. Copy them exactly. `npm run qa:breakpoints` rejects any other width or height query in CSS, in `useMediaQuery`/`matchMedia` calls and in JSX `media=` attributes.
- **`MQ_DESKTOP`** (`(min-width: 1024px)`) exists only for the §10.3(b) `display: contents` neutralisers on new wrappers. Don't use it for anything else.
- **Where rules go.** Put each module's mobile rules in `@media (max-width: 1023.98px) { … }` blocks, appended after every desktop rule (§10.2). Never edit a desktop rule.
- **Tokens** (inside `MQ_MOBILE` only): everything in SPEC §2, plus two tokens Foundation added:
  - `--m-column` is the width of the capped, centred content column. It's `none` on phones and `34 × --m-t-body` (≈ 561–578px) from 600. It's the SPEC's `--m-measure` resolved at body size, so the header, sections and footer share one set of edges even where their own font size differs. For any section that isn't a `SectionShell`, put `max-width: var(--m-column); margin-inline: auto; padding-inline: var(--gutter)` on a **content-box** element. The margins are then equal on both sides at every width (SPEC §18).
  - `--m-bar-h: 56px` is the header bar. `--nav-h` becomes `56px + env(safe-area-inset-top)`, so the existing hero pull-ups (`margin-top: calc(-1 * var(--nav-h) - 1px)`) and `scroll-padding-top` stay correct under a notch.
- **`--gutter`** below 1024 is `max(--m-gutter, left inset, right inset)`. It's 20px on phones and 32px on tablets, and it's used on **both** sides, so a landscape notch can't unbalance the margins. Existing `var(--gutter)` rules pick it up automatically.
- **Globals (`app/globals.css`, below 1024):**
  - body copy is `--m-t-body`/1.5
  - headings get `text-wrap: balance`
  - `p`/`li`/`dd` get `text-wrap: pretty`
  - `hyphens: manual`
  - no tap highlight
  - `[data-reveal]` has no animation
  - every `button` gets the `:active` press (`scale(.97)`, `opacity .85`). **Full-width row buttons opt out with a `data-row` attribute** (Disclosure does this itself). Home's services rows should add `data-row=""` too.
- **Hover on touch:** neutralise your own `:hover` rules in `@media (max-width: 1023.98px) and (hover: none) { … }` (SPEC §4.2). Foundation has done this for the header, footer and `ui.module.css`.

## 2. `components/ui.module.css`

| Class | Width | Use |
|---|---|---|
| `ui.contents` | all | `display: contents` (Picture uses it) |
| `ui.srOnly` | all | Clip pattern. Use it on **new** elements only. |
| `ui.srOnlyMobile` | <1024 | Clip pattern for **existing** elements that must stay in the accessibility tree, e.g. the results-table `thead` |
| `ui.rule` | <1024 | 1px `--ink` top border |
| `ui.hair` | <1024 | 1px `--line` bottom border (a ledger row) |
| `ui.idx` | <1024 | Inline item number: 13px, 600, `--growth`, tabular |
| `ui.meta` | <1024 | 13px, `--slate`, tabular (dates, sources, counts) |

`LinkButton` now takes `ariaLabel` (it must start with the visible text, e.g. `ariaLabel="Read More about EdCloud"`) and `className`. Below 1024 it's a 44px-tall target at 15px/600 in `--growth`. `RouteLink` takes `ariaCurrent` and `prefetch` (leave `prefetch` unset unless Media & Perf measures a reason, §8.3).

## 3. `SectionShell`

- Below 1024 it renders the rule header: a 1px ink rule, then `01  Title` at `--m-t-h2`, then 24px, then content at the full column width. From 600 the column is capped and centred.
- Section padding is `--m-section-top`/`--m-section-bottom`.
- New prop: `titleSize="page"` sets the title in `--m-t-title` below 1024. `LegalPage` should pass it.
- Nothing changes at 1024 and above.
- `offset={false}` bodies (`bodyClassName`) start on the gutter. Watch for a doubled gap if your body class also sets `margin-top: var(--head-gap)`: the head already carries `margin-bottom: var(--m-head-gap)` below 1024.

## 4. `Picture` (server component)

```tsx
import Picture from '@/components/Picture';

<Picture
  name="hero-poster"                 // a key of CROPS in components/crops.generated.ts
  src={hero.posterSrc} alt={hero.posterAlt} width={1920} height={1080}   // today's <img>, unchanged
  className={styles.heroLayer} fetchPriority="high"                      // any other <img> prop passes through
  phoneSizes="100vw"                 // sizes for the < 600 crop
  tabletSizes="100vw"                // sizes for the 600–1023 crop; media conditions must be MQ_* literals
/>
```

- **Output:** `<picture class="contents">` holds a phone `<source media=MQ_PHONE>`, a tablet `<source media=MQ_TABLET>` and the unchanged `<img>`. At ≥1024 no source matches, so desktop decodes today's file into today's box.
- **Sources** carry their crop's `width`/`height`, so there's no layout shift.
- **Crops** available: `hero-poster`, `hero-about`, `hero-services` (4:5 phone / 3:2 tablet), `conference-room` (16:9 / 3:2), `stairway` and `classroom-lecture` (39:14 / 21:9), `aaron-sokol` (4:5 on both).
- **Your CSS still sizes the image.** Below 1024, set the box (e.g. `aspect-ratio: 4 / 5` or `16 / 9` plus `object-fit: cover`) in your mobile block, because the desktop `aspect-ratio`/height rules still apply to the `<img>`.
- **Loading:** one eager `fetchPriority="high"` image per page (the hero). Everything else takes `loading="lazy" decoding="async"` (§8.3).
- **Pipeline:** `python scripts/images/build-crops.py` reads `scripts/images/crops.json` and writes `public/images/m/*.webp` plus `components/crops.generated.ts`.
  - It's deterministic: unchanged outputs aren't rewritten.
  - It never upscales. A requested width wider than the crop becomes the crop's own width. For example, the 4:5 hero crops top out at **864w** (the height of a 1080px source), not 1170w.

## 5. `Disclosure` (client): heading-button rows (About chapters, Services "What we do")

```tsx
import Disclosure, { DisclosureHeading, DisclosurePanel } from '@/components/Disclosure';
import { MQ_PHONE } from '@/app/breakpoints';

// About: a NEW wrapper per chapter; both wrappers vanish at >= 1024 so .mission sees today's children.
<Disclosure collapseQuery={MQ_PHONE} defaultOpen={isThesis} contentsOnDesktop>
  <DisclosureHeading as="h3" className={styles.h3}>{h3.text}</DisclosureHeading>
  <DisclosurePanel contentsOnDesktop>{…following p / ul blocks…}</DisclosurePanel>
</Disclosure>

// Services: the EXISTING <li> is the group; the existing <p> and <dl> are the panels.
<Disclosure as="li" className={styles.service} collapseQuery={MQ_PHONE} defaultOpen={i === 0} parts={['pitch', 'spec']}>
  …<DisclosureHeading className={styles.serviceTitle}>{s.title}</DisclosureHeading>
  <DisclosurePanel as="p" part="pitch" className={styles.servicePitch}>{s.pitch}</DisclosurePanel>
  <p className={styles.serviceResult}>{s.result}</p>          {/* stays visible */}
  <DisclosurePanel as="dl" part="spec" className={styles.dl}>…</DisclosurePanel>
</Disclosure>
```

**`Disclosure` props:**

| Prop | Default | What it does |
|---|---|---|
| `as` | `'div'` | `div`, `li`, `section` or `article` |
| `className` | | Merged onto the group element |
| `defaultOpen` | | Open at first paint even where the group would otherwise collapse |
| `collapseQuery` | `MQ_MOBILE` | `MQ_PHONE` or `MQ_MOBILE`: where the group **starts** collapsed. Toggling works everywhere below 1024; with `MQ_PHONE`, tablets start open. |
| `parts` | `['panel']` | The `part` names of the group's panels, for `aria-controls` |
| `contentsOnDesktop` | | For **new** wrappers only; makes the group `display: contents` at ≥1024 |

**`DisclosureHeading` props:** `as` (`'h3'` by default), `className` (the heading's existing class) and `children` (the existing text; no new copy).

- Below 1024, once hydrated, it renders `<h3><button aria-expanded aria-controls data-row>…</button></h3>`.
- Before hydration, and at ≥1024, it renders a `<span>` with the same class instead. So desktop gets no new tab stop and no new landmark, and the row doesn't shift when the button arrives.

**`DisclosurePanel` props:**

| Prop | Default | What it does |
|---|---|---|
| `as` | `'div'` | `div`, `p`, `dl`, `ul`, `ol` or `section` |
| `part` | `'panel'` | Must match one of the group's `parts` |
| `className` | | Merged onto the panel |
| `contentsOnDesktop` | | For new wrappers only |
| `region` | `true` for `div`/`section`, `false` otherwise | Adds `role="region"` labelled by the heading. The default keeps a `<dl>`/`<ul>` panel's own semantics. |

**Behaviour** (§5.5 A):
1. The server renders every panel, none `hidden`.
2. At first paint, CSS collapses the groups that start closed, but only under `(scripting: enabled)`.
3. After hydration, before paint, closed panels get `hidden="until-found"` and the group gets `data-js`.
4. `beforematch` (find-in-page, `#:~:text=`) opens a group.
5. Safari lacks until-found, so it gets a plain `hidden`.
6. Collapsed panels are `position: absolute` with no margin, padding or border, so they cause no gap or hairline.
7. When the reader opens a panel it fades in over 200ms. Panels that are open by default don't animate.

**Indicator:** the 10px square after the heading text, filled when open, outlined when closed. Put hairlines between rows in **your** CSS (e.g. `ui.hair` on the group).

## 6. `ShowAll`: "Show all press" / "Show all clients"

```tsx
import ShowAll, { showAllItem, showAllList } from '@/components/ShowAll';   // server-safe helpers + client button
const PRESS_LIMIT = { phone: 3, tablet: 4 };

<ul id="press-list" className={`${styles.press} ${showAllList}`}>
  {pressItems.map((p, i) => <li key={p.href} className={`${styles.pressRow} ${showAllItem(i, PRESS_LIMIT)}`}>…</li>)}
</ul>
<ShowAll controls="press-list" label="Show all press" count={pressItems.length} limit={PRESS_LIMIT} focusOnExpand="first-revealed" />
```

**Props:**

| Prop | Default | What it does |
|---|---|---|
| `controls` | | The list's `id` |
| `label` | | The collapsed label. It's allow-listed only for `"Show all press"` and `"Show all clients"`. |
| `count` | | Always `items.length`, never a typed number. Rendered `aria-hidden` as a quiet figure. |
| `limit` | | `{ phone, tablet }`: how many items stay visible while collapsed. Clients use `{ phone: 16, tablet: 24 }`. |
| `focusOnExpand` | `'button'` | `'first-revealed'` moves focus to the first link of the first revealed item (Press). `'button'` keeps focus on the button (Clients). |
| `className` | | Merged onto the button |

**Behaviour:**
- Collapsing always keeps focus on the button and scrolls it back into view.
- Expanded, the label reads "Show fewer".
- The button is a full-width 48px outlined pill, 24px under the list. It has no box at ≥1024 and is hidden under `(scripting: none)`, where every item already shows.
- It also hides itself at any width where `count <= limit`.
- Items use the same first-paint CSS collapse, then `hidden="until-found"`, then `beforematch` sequence as Disclosure.
- Collapsed lazy `<img>`s aren't fetched.

## 7. Header, sheet and footer (done; nothing to wire)

- **Header:** a 56px bar plus the top safe area, sticky. The link list collapses below **1024** (it used to be 820).
- **Sheet:** a `role="dialog"` at full height.
  - The page behind it is locked with a pinned body, the only lock that holds on iOS, and made `inert`.
  - Focus is trapped inside the sheet. Esc closes it and focus returns to Menu.
  - Any link closes the sheet before it navigates, so `/#contact` lands correctly.
  - It animates in over 240ms, instantly under reduced motion.
  - The foot has the Contact pill on every page except /services-and-results, plus the email and phone line.
  - The header has `z-index: 10`. **The Home Contact pill must sit below it (z-index ≤ 9)** so the sheet covers it.
- **Footer:** 2 columns at every phone width. Every link is a 44px row, and the bar pads the bottom safe area.

## 8. QA

- `npm run qa:breakpoints` is new. It isn't wired into `qa:all` yet, because `scripts/qa/all.mjs` belongs to the Integrator.
- `qa:mobile-lint` has a new `margins` check (SPEC §18.1 rules 1 and 2):
  - Each region is the header nav, each `main` section, and each footer row. A region's text column must have left and right insets within 1px of each other.
  - Every visible `h1`–`h4`/`p`/`li`/`dt`/`dd`/`blockquote`/`figcaption`/`label`/`td`/`th` must keep `left ≥ gutter` and `right ≤ viewport − gutter`.
  - It skips collapsed (`[hidden]`), `[inert]`, invisible, fixed-position and fully off-screen elements.
  - The report gives each offender's selector with its L/R insets.
- `qa:content`:
  - accepts the exact `viewport-fit=cover` meta swap listed under `"meta"` in `content-allowlist.json`
  - compares `/sitemap.xml` with `<lastmod>` treated as build time. `app/sitemap.ts` stamps it at build, so the old byte compare failed on every rebuild. Each `<lastmod>` must still be a valid ISO timestamp.
