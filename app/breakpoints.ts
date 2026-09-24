/**
 * The breakpoint scale (docs/mobile/SPEC.md §3), as the same literal strings app/tokens.css
 * documents. Every useMediaQuery / matchMedia call and every <source media> imports one of these
 * rather than typing a width; `npm run qa:breakpoints` fails on any other width or height query.
 *
 * Classic min/max-width syntax on purpose: iOS Safari before 16.4 evaluates range syntax
 * (`width < 1024px`) as false, which would silently drop the whole mobile layer.
 */

/** Phones and tablets: every mobile rule sits inside this. Never matches at >= 1024. */
export const MQ_MOBILE = '(max-width: 1023.98px)';
/** 320-599: phone-only collapses and the phone <source> in Picture. */
export const MQ_PHONE = '(max-width: 599.98px)';
/** 320-359: the narrowest phones. */
export const MQ_XS = '(max-width: 359.98px)';
/** 600-1023: 32px gutter, capped and centred column, 2-up grids. */
export const MQ_TABLET = '(min-width: 600px) and (max-width: 1023.98px)';
/** 820-1023: the wide-tablet refinements. */
export const MQ_TABLET_WIDE = '(min-width: 820px) and (max-width: 1023.98px)';
/** Landscape phones (844x390 and similar). */
export const MQ_SHORT = '(max-width: 1023.98px) and (orientation: landscape) and (max-height: 500px)';
/**
 * The frozen desktop. Only for SPEC §10.3(b): neutralising NEW wrappers (display: contents).
 * Never use it to restyle anything that exists on desktop today.
 */
export const MQ_DESKTOP = '(min-width: 1024px)';

export const BREAKPOINTS = { MQ_MOBILE, MQ_PHONE, MQ_XS, MQ_TABLET, MQ_TABLET_WIDE, MQ_SHORT, MQ_DESKTOP } as const;
