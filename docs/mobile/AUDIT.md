# Mobile audit (Phase 1)

Three auditors covered every page at every matrix viewport. Their full findings are in [audit/A-home.md](audit/A-home.md) (home), [audit/B-pages.md](audit/B-pages.md) (About, Services, legal) and [audit/C-cross.md](audit/C-cross.md) (header, menu, footer, forms, type, media, perf, a11y). Each finding there includes its crop in `audit/crops/<id>.png`, the measured evidence, and the root cause as file:line.

Overlaps: A-home-01, B-pages-03 and C-cross-09 are the same contrast root cause (`--slate` and `--growth` tokens). A-home-02 and C-cross-10 are both tap-target findings. A-home-04 and B-pages-02 are both page-length findings. A-home-13, B-pages-05 and C-cross-15 all come from the counter column. A-home-03 and C-cross-04/06 overlap on home LCP. B-pages-07 and C-cross-05 are the same prefetch issue.

| ID | Severity | Finding |
|---|---|---|
| [A-home-01](audit/A-home.md) | P0 | Colour contrast fails axe on 41 nodes at 390 and 42 at 1440 |
| [A-home-02](audit/A-home.md) | P0 | Tap targets under 44px (Home has 15 unique selectors; 25 elements at 390) |
| [A-home-03](audit/A-home.md) | P0 | Lighthouse mobile: Perf 90, LCP 3679 ms (budget ≤2000), 3.6 MB transfer |
| [A-home-04](audit/A-home.md) | P0 | Page length at 390 is 12065px, target ≤8500 (+3565px, +42%) |
| [A-home-05](audit/A-home.md) | P0 | SEO 92: the "Read More" link fails Lighthouse `link-text` |
| [A-home-06](audit/A-home.md) | P1 | Services panel text is squeezed to 148px at 320 (15 chars/line) |
| [A-home-07](audit/A-home.md) | P1 | Client logos are unreadable on phones: 27 of 48 are under 24px tall at 390, the smallest 6.3px at 320 |
| [A-home-08](audit/A-home.md) | P1 | The logo wall is 2630px on tablets and in landscape (24% of the page, 2.6–6.7 screens) |
| [A-home-09](audit/A-home.md) | P1 | The hero overflows the first screen on short phones and in landscape |
| [A-home-10](audit/A-home.md) | P1 | The hero poster is upscaled about 2.3× on 3× phones, so the LCP image looks soft |
| [A-home-11](audit/A-home.md) | P1 | Featured Projects stacks into four ~430px cards (1957px at 390, 16% of the page) |
| [A-home-12](audit/A-home.md) | P1 | The contact photo pushes the form 468px down on phones |
| [A-home-13](audit/A-home.md) | P1 | A 44px counter indent makes the margins lopsided (68px left vs 24px right) and nests up to 116px |
| [A-home-14](audit/A-home.md) | P1 | Press is 1963px at 390, nine rows of 181–231px with nine identical "Read The Full Article" links |
| [A-home-15](audit/A-home.md) | P1 | On tablets and in landscape the Services panel has about 160px of dead space |
| [A-home-16](audit/A-home.md) | P2 | Card body copy is 15px, under the 16px body minimum (10 elements) |
| [A-home-17](audit/A-home.md) | P2 | A press headline breaks at "K-" / "12" on 390 and 393 |
| [A-home-18](audit/A-home.md) | P2 | The tablet hero is a full screen of poster with no hint of what follows |
| [A-home-19](audit/A-home.md) | P2 | In landscape, the Deliverables photo is taller than the screen, and it loads early on phones |
| [A-home-20](audit/A-home.md) | P2 | Services tab changes are not announced, and the tabs activate on hover on touch |
| [A-home-21](audit/A-home.md) | P2 | The footer on Home has 22px-tall links and a phone number that cannot be tapped |
| [B-pages-01](audit/B-pages.md) | P0 | Services "For / How / When" rows crush the answer column to 102–212px |
| [B-pages-02](audit/B-pages.md) | P0 | About and Services miss the 390px page-length gate by 41% and 41% |
| [B-pages-03](audit/B-pages.md) | P0 | color contrast. axe reports 35 failing nodes across the four pages at 390 and 39 at 1440 (gate: axe zero) |
| [B-pages-04](audit/B-pages.md) | P1 | About "Mission & History" is a 6011px single-column wall of prose |
| [B-pages-05](audit/B-pages.md) | P1 | the 44px counter-column indent narrows every section's text on phones |
| [B-pages-06](audit/B-pages.md) | P1 | Services items numbered 01–06 share the column and style of section numbers 01–04 |
| [B-pages-07](audit/B-pages.md) | P1 | every subpage downloads 413,326 bytes of Home-only photos on first load |
| [B-pages-08](audit/B-pages.md) | P1 | About and Services hero images are 1920x1080 on phones and not prioritised, and they are the LCP (2395 / 2397ms) |
| [B-pages-09](audit/B-pages.md) | P1 | tablet grids strand one item on its own row (3+1 and 2+1) |
| [B-pages-10](audit/B-pages.md) | P1 | legal pages set the H1 at the same size and weight as their H2s |
| [B-pages-11](audit/B-pages.md) | P1 | Results column labels on phones are 14px `#7A8494` on white (3.77:1), and axe cannot see them |
| [B-pages-12](audit/B-pages.md) | P1 | heroes fill the first screen; Services at 320x568 and 844x390 shows nothing but the hero |
| [B-pages-13](audit/B-pages.md) | P1 | body copy at 15px on phones (lint `bodyText`: Services 18 instances, About 4) |
| [B-pages-14](audit/B-pages.md) | P1 | About "By The Numbers" cards break the page's left edge by 44px on phones |
| [B-pages-15](audit/B-pages.md) | P2 | at 768–1023, the partner headshot leaves an empty column beside the long bio |
| [B-pages-16](audit/B-pages.md) | P2 | proof-strip labels sit 7px lower in one column at 768 |
| [B-pages-17](audit/B-pages.md) | P2 | at 800–1023, the Results table squeezes "What we built" to 185–194px, giving four-line cells |
| [B-pages-18](audit/B-pages.md) | P2 | legal pages print the contact emails as plain text, with no tap target |
| [B-pages-19](audit/B-pages.md) | P2 | the legal pages import the About page's CSS module |
| [B-pages-20](audit/B-pages.md) | P2 | prose exceeds 75 cpl on tablets and in landscape |
| [B-pages-21](audit/B-pages.md) | P2 | white hero text over the photos drops to 2.73–3.35:1 in places |
| [B-pages-22](audit/B-pages.md) | P2 | the "Is this a fit" list spends 1097px at 390 on 7 short sentences |
| [C-cross-01](audit/C-cross.md) | P0 | The open mobile menu is taller than a landscape phone, so its last link cannot be reached |
| [C-cross-02](audit/C-cross.md) | P1 | The menu has no dismissal, focus handling or scroll lock, and it stays open over the scrolling page |
| [C-cross-03](audit/C-cross.md) | P1 | "Contact", the primary conversion link, cannot be reached from any navigation below 820px |
| [C-cross-04](audit/C-cross.md) | P1 | Home LCP is 3.6s because React preloads every non-lazy photo, including three below the fold, in `<head>` |
| [C-cross-05](audit/C-cross.md) | P1 | Every other page downloads 404 KB of Home photos through the prefetch of "/" |
| [C-cross-06](audit/C-cross.md) | P1 | A 3.15 MB hero video downloads in full on phones in the first 5 seconds |
| [C-cross-07](audit/C-cross.md) | P1 | 1920x1080 landscape hero images go to portrait phones: soft crops and wasted bytes, with no `srcset` anywhere |
| [C-cross-08](audit/C-cross.md) | P1 | About and Services miss the LCP budget at 2.3–2.4s: the hero preload has no priority and two CSS files block render |
| [C-cross-09](audit/C-cross.md) | P1 | Two design tokens fail WCAG contrast on every page (axe `color-contrast`, LH A11y 96) |
| [C-cross-10](audit/C-cross.md) | P1 | Footer, header brand and inline links are 22–24px tap targets on every page |
| [C-cross-11](audit/C-cross.md) | P1 | Touch tablets at 820–1023px get the desktop nav with 18px-tall, 14px links |
| [C-cross-12](audit/C-cross.md) | P1 | Contact inputs have a 1.45:1 border, and focus is shown by a 1px colour change plus a 1.36:1 glow (`outline: none`) |
| [C-cross-13](audit/C-cross.md) | P1 | The contact form has no `autocomplete` or `enterkeyhint`, 40px fields and a 2-row message box |
| [C-cross-14](audit/C-cross.md) | P1 | The `100vh` Home hero is 1.4 screens tall at 320x568 and a full 1180px screen of mostly empty photo on tablets |
| [C-cross-15](audit/C-cross.md) | P1 | The SectionShell counter column plus nested insets squeeze phone text to 21–25 characters a line (11 in Services `dd`) |
| [C-cross-16](audit/C-cross.md) | P1 | The 44-second looping background video has no pause control (WCAG 2.2.2) |
| [C-cross-17](audit/C-cross.md) | P2 | The header uses a 16px gutter on phones and the content uses 24px, so edges don't line up |
| [C-cross-18](audit/C-cross.md) | P2 | The header wordmark drops to 12px with 0.05em tracking on phones (under the 13px floor) |
| [C-cross-19](audit/C-cross.md) | P2 | Tablet and landscape body copy runs 79–92 characters a line |
| [C-cross-20](audit/C-cross.md) | P2 | Touch feedback is hover-only: tapped links stick at 70% opacity, there is no `:active` state and the tap highlight is the default |
| [C-cross-21](audit/C-cross.md) | P2 | The ad-hoc breakpoints disagree: 799, 819 and 820 leave dead zones and an off-by-one at 820 |
| [C-cross-22](audit/C-cross.md) | P2 | No `viewport-fit=cover` or safe-area insets: iOS landscape letterboxes the full-bleed hero and the sticky header |
| [C-cross-23](audit/C-cross.md) | P2 | Body copy sits under the 16px floor through `--t-body-sm` (15px) and `--t-small` (14px) on phones |
| [C-cross-24](audit/C-cross.md) | P2 | Tablets get stretched phone layouts: Home is 1,081px taller at 768 than at 1024 |
