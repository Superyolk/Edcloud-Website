# EdCloud Venture Partners — Design System

Design system for **EdCloud Venture Partners** (edcloud.org), a San Francisco growth consultancy that helps post-traction education technology companies (typically $0–$1M ARR) scale to $20M+ ARR in K-12, higher education, and workforce learning. Operator-led, not advisory: positioning, sales engines, procurement, pricing, and RevOps. Clients include Handshake, Clever, Outschool, Wayfinder, TutorMe.

## Sources

- https://www.edcloud.org (home), /about, /research-and-technology (Services & Results). Wix-built; structure, copy, and component inventory read directly from the live pages.
- `uploads/edcloud-design-system.html` — a user-supplied design-system spec for edcloud.org. **This file is the ground truth** for tokens, type scale, component anatomy, and voice rules; this project implements it.
- The live site's stylesheet could not be read (Wix injects styles via script), so hex values and the typeface are the spec's proposal (Instrument Sans, via Google Fonts), chosen to match the brand's tone. Swap for live values if provided.
- No logo asset exists: the site uses a text wordmark plus a tiny cloud favicon that couldn't be copied. Wherever a mark would go, render a 22px ink square + the uppercase wordmark. Do not draw a logo.

## CONTENT FUNDAMENTALS

- **Voice**: operator tone. Short declarative headlines, second person, present tense, active verbs. "We can help you", "your fastest path".
- **Proof over polish**: lead with the client and the number — "30 to 550 universities", "10% to 90% share". Numbers do the persuading, not adjectives.
- **Case titles** are puns on the client name plus the outcome, under eight words: "Join Handshake. 520 times." / "Get Clever. To 90% market share."
- **Casing**: sentence case with title-style capitals in headlines as the site writes them. Uppercase only for the wordmark (+0.08em) and form submit labels.
- **Vocabulary** the buyer uses: ARR, ASP, NRR, ACV, procurement, sole-source, RFP, pilot, rollout, GTM, RevOps, MEDDICC.
- **Avoid**: "cutting-edge", "solutions", "leverage", exclamation marks, hedging, emoji (never used).
- **Errors** say what to do, not what went wrong: "Enter a full email address, like name@school.edu."
- **Page shape**: one long numbered document (01 Promise → 06 Contact); every page ends with a contact block; logo wall before the footer.

## VISUAL FOUNDATIONS

- **Color**: paper background (#FAFAF7), white cards, ink text (#1B2431). One interactive accent — signal blue #1F5EFF (links, focus, hover → #1541B8). Growth green #17916B is reserved for outcome numbers; error red #B42318 for form validation only. Never add accent hues; emphasize with ink on paper-2 (#F1F2EE) bands instead.
- **Type**: one family, Instrument Sans, weights 400/500/600. Personality from scale contrast: clamp(44–72px) display at lh 1.05 / −0.01em against 15px slate counters. Body 17px/1.6, max 62ch. Stats 48px/1/−0.02em tabular. Wordmark 14px/600/+0.08em uppercase.
- **Spacing**: 8pt scale (4→144). 1200px max width, 12 columns, 24px gutters, left-aligned. Sections: 64px vertical padding (48px mobile), separated by 1px lines. Section heads: 72px counter column + title.
- **Shape**: radius 0 on cards, inputs, images; pill radius on buttons only. No drop shadows, no blur, no gradients — hierarchy comes from 1px line outlines and background steps. Case cards get a 2px ink top rule.
- **Motion**: 180ms cubic-bezier(.2,.7,.2,1), color/background transitions only. No entrances, bounces, or parallax. Honors prefers-reduced-motion.
- **Hover**: primary button → signal-ink fill; secondary → inverts to ink fill; links → signal-ink; nav links → underline. Press states: none beyond hover.
- **Backgrounds**: flat paper/paper-2; no textures, patterns, or full-bleed washes. Photography (on the live site) is documentary — classrooms, campuses — never stock-abstract; none was extractable, so omit rather than substitute.
- **Counters** (01, 02, …) are the only ornament; they mark real order — never decorative.
- **Logo walls**: monochrome ink names/logos at ~60% opacity on paper-2 tiles with 1px gaps.

## ICONOGRAPHY

The brand uses **no icon system**. No icon font, no SVG set, no emoji, no unicode glyphs-as-icons. Structure is carried by numbered counters, rules, and type weight instead of icons. The only mark-like element is a 22px ink square standing in for the (unavailable) cloud logo. Social links render as text ("LinkedIn", "X"). If an icon ever becomes unavoidable, prefer a plain text label first; flag any icon-library substitution to the user.

No image, logo, or illustration assets were copyable from the Wix site — `assets/` is intentionally absent.

## Index

- `styles.css` — global entry; imports `tokens/` (colors, typography, spacing, fonts via Google Fonts, base element styles).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`.
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand voice).
- `components/` — reusable primitives (inventory from the spec; nothing invented):
  - `actions/` — **Button** (primary / secondary / link)
  - `forms/` — **Input** (text + textarea + error), **Checkbox**
  - `navigation/` — **NavBar**, **Footer**
  - `marketing/` — **Hero**, **SectionHead**, **ServiceCard**, **CaseCard**, **CapabilityList**, **Stat** / **StatRow**, **PressRow**, **LogoWall**
- `ui_kits/website/` — click-through recreation of edcloud.org (Home, About, Services & Results).
- `uploads/edcloud-design-system.html` — the source spec (keep; ground truth).
- `SKILL.md` — agent skill entry point.

### Intentional additions

- **SectionHead** — the site's numbered section header extracted as a component (it appears on every page; the spec documents it as the "sec-head" pattern).
