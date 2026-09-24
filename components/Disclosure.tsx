'use client';

/**
 * Independent heading-button disclosures (SPEC §5.5 A): About's chapter list and the Services
 * page's "What we do" rows. Usage and props: docs/mobile/FOUNDATION.md.
 *
 *   <Disclosure as="div" defaultOpen collapseQuery={MQ_PHONE} contentsOnDesktop>
 *     <DisclosureHeading as="h3" className={styles.h3}>{text}</DisclosureHeading>
 *     <DisclosurePanel contentsOnDesktop>…</DisclosurePanel>
 *   </Disclosure>
 *
 * How it collapses without a layout shift, and still reads with JS off:
 *   1. SSR: every panel is in the DOM and nothing is `hidden`. Groups open by default carry
 *      data-open.
 *   2. First paint: inside `collapseQuery` and `(scripting: enabled)`, CSS hides the panels of
 *      groups without data-open. With scripting disabled everything shows.
 *   3. After hydration (a layout effect, so before the next paint): panels that should be closed
 *      get hidden="until-found", and data-js on the group switches the CSS rule off. Find-in-page
 *      and #:~:text= links fire `beforematch`, which opens the group.
 *   Built pages do step 3's DOM part earlier: the inline loader from scripts/defer-hydration.mjs
 *   sets hidden="until-found" on [data-disclosure] groups' [data-panel]s at the end of parsing, so
 *   a text-fragment link can reach a panel before hydration. A panel the browser revealed that
 *   way carries data-found, and the group opens on hydration instead of collapsing it again.
 *
 * At >= 1024 nothing is ever hidden and the heading renders a plain <span> (no button, no tab
 * stop, no box), so desktop is the same DOM text in the same boxes.
 */
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MQ_MOBILE, MQ_PHONE } from '@/app/breakpoints';
import { useHydrated, useMediaQuery } from './useMediaQuery';
import styles from './Disclosure.module.css';

/** Where a group starts collapsed. Toggling works everywhere below 1024 either way. */
export type CollapseQuery = typeof MQ_PHONE | typeof MQ_MOBILE;

type Ctx = {
  baseId: string;
  parts: readonly string[];
  open: boolean;
  interactive: boolean;
  toggle: () => void;
  register: (el: HTMLElement) => () => void;
};

const DisclosureContext = createContext<Ctx | null>(null);

function useDisclosure(component: string): Ctx {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error(`<${component}> must be inside <Disclosure>`);
  return ctx;
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');
const panelId = (baseId: string, part: string) => `${baseId}-${part}`;

type GroupTag = 'div' | 'li' | 'section' | 'article';

export type DisclosureProps = {
  /** The wrapper element. Use 'li' when the group is an existing list item (Services). Default 'div'. */
  as?: GroupTag;
  className?: string;
  /** Open at first paint even where `collapseQuery` matches (About: "Our mission"). */
  defaultOpen?: boolean;
  /** Where the group starts collapsed: MQ_PHONE (< 600) or MQ_MOBILE (< 1024). Default MQ_MOBILE. */
  collapseQuery?: CollapseQuery;
  /**
   * The `part` names of this group's panels, for the button's aria-controls. Default ['panel'].
   * Services passes e.g. ['pitch', 'spec'] and gives each <DisclosurePanel> the matching part.
   */
  parts?: readonly string[];
  /** A NEW wrapper that must not exist for desktop layout: display: contents at >= 1024. */
  contentsOnDesktop?: boolean;
  children: ReactNode;
};

export default function Disclosure({
  as: Tag = 'div',
  className,
  defaultOpen = false,
  collapseQuery = MQ_MOBILE,
  parts = ['panel'],
  contentsOnDesktop = false,
  children,
}: DisclosureProps) {
  const baseId = useId();
  const hydrated = useHydrated();
  const mobile = useMediaQuery(MQ_MOBILE);
  const phone = useMediaQuery(MQ_PHONE);
  const collapsedByDefault = collapseQuery === MQ_PHONE ? phone : mobile;
  // null until the reader toggles; until then the breakpoint decides.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? (defaultOpen || !collapsedByDefault);
  const interactive = hydrated && mobile;

  const groupRef = useRef<HTMLElement>(null);
  const panels = useRef(new Set<HTMLElement>());

  // Before paint: swap the CSS first-paint collapse for real `hidden` attributes.
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !hydrated) return;
    // A find-in-page or #:~:text= match the browser revealed before hydration (marked by the
    // pre-hydration loader): keep that panel open rather than hiding it under the reader.
    let found = false;
    for (const el of panels.current) {
      if (el.hasAttribute('data-found')) {
        el.removeAttribute('data-found');
        found = true;
      }
    }
    if (found && !open) {
      setUserOpen(true);
      return;
    }
    // Safari has no hidden="until-found" yet; there a plain `hidden` is the collapse.
    const untilFound = 'onbeforematch' in document.body;
    for (const el of panels.current) {
      if (mobile && !open) el.setAttribute('hidden', untilFound ? 'until-found' : '');
      else el.removeAttribute('hidden');
    }
    group.setAttribute('data-js', '');
  }, [hydrated, mobile, open]);

  // Find-in-page (and #:~:text= links) into a collapsed panel opens it. The group's other panels
  // open here too, synchronously: beforematch fires before the browser scrolls to the match, so
  // the scroll then targets the final layout. Revealing Services' pitch only in the next render
  // would push a match in the For/How/When list below it out of view (Phase 4 R2-a11y-01).
  useEffect(() => {
    const onMatch = () => {
      for (const el of panels.current) el.removeAttribute('hidden');
      groupRef.current?.setAttribute('data-open', '');
      setUserOpen(true);
    };
    const els = [...panels.current];
    for (const el of els) el.addEventListener('beforematch', onMatch);
    return () => {
      for (const el of els) el.removeEventListener('beforematch', onMatch);
    };
  }, [hydrated]);

  const ctx: Ctx = {
    baseId,
    parts,
    open,
    interactive,
    toggle: () => setUserOpen(!open),
    register: (el) => {
      panels.current.add(el);
      return () => panels.current.delete(el);
    },
  };

  return (
    <DisclosureContext.Provider value={ctx}>
      <Tag
        ref={groupRef as never}
        // Read by the pre-hydration loader (scripts/defer-hydration.mjs): where this group collapses.
        data-disclosure={collapseQuery === MQ_PHONE ? 'phone' : 'mobile'}
        className={cx(
          styles.group,
          collapseQuery === MQ_PHONE ? styles.collapsePhone : styles.collapseMobile,
          contentsOnDesktop && styles.contentsDesktop,
          className,
        )}
        // Before hydration this is the SSR default the first-paint CSS reads; after, the live state.
        data-open={(hydrated ? open : defaultOpen) || undefined}
        // Only after the reader opens something, so default-open panels do not fade in on load.
        data-animate={userOpen === true || undefined}
      >
        {children}
      </Tag>
    </DisclosureContext.Provider>
  );
}

/**
 * A heading's glued phrases on the mobile button (SPEC §18.2 rules 2 and 3). The DOM text is
 * unchanged (qa:content unwraps data-nowrap). Mobile button only: in desktop text an extra element
 * moved glyphs by a subpixel. Kept here, not in KeepTogether.tsx, so the client bundle stays small.
 *
 *   - A parenthetical ("Our approach (operator first, not just advisory)") is one phrase, so it
 *     drops to the next line whole instead of splitting "(operator / first, …)" (Phase 4
 *     R3-designer-05). Every chapter title gets this.
 *   - With `glue`, the last two words are one phrase, so a two-line title never ends on one word;
 *     balance alone chose "Smarter Procurement / Pathways". "&" counts as a word, so
 *     "& Positioning" is the pair and balance can set "GTM Strategy / & Positioning"; gluing
 *     three words left a one-word first line, "GTM", at 320 (Phase 4 R2-designer-02).
 *
 * The spans are inline, and Disclosure.module.css holds each one only while the row can fit it.
 */
const ASIDE = /(\([^()]+\))/;

function glueHeading(text: string, lastWords: boolean): ReactNode {
  const aside = text.split(ASIDE);
  if (aside.length > 1) {
    return (
      <span>
        {aside.map((part, i) => (i % 2 === 1 ? <span key={i} data-nowrap="aside">{part}</span> : part))}
      </span>
    );
  }
  const words = text.split(' ');
  if (!lastWords || words.length <= 2) return text;
  // One outer span, so the flex button still sees one item; the head and its space are one string.
  return (
    <span>
      {`${words.slice(0, -2).join(' ')} `}
      <span data-nowrap="pair">{words.slice(-2).join(' ')}</span>
    </span>
  );
}

export type DisclosureHeadingProps = {
  /** The existing heading level. Default 'h3'. */
  as?: 'h2' | 'h3' | 'h4';
  /** The heading's existing class, unchanged. */
  className?: string;
  /** The existing heading text. No new copy. */
  children: ReactNode;
  /**
   * Glue the last two words of a string heading (glueHeading above) on the mobile
   * button, so a two-line title never ends on one word. Only the button gets the span: a span in
   * the desktop text moves its glyphs by a subpixel, and desktop is pixel-frozen.
   */
  keepLastWords?: boolean;
};

/**
 * `<h3 class={existing}><button …>{text}</button></h3>` below 1024 once hydrated. Before
 * hydration and at >= 1024 the button is a <span> with the same class, so the row keeps its
 * size (no shift when the button arrives) and desktop gets no new tab stop.
 */
export function DisclosureHeading({ as: Tag = 'h3', className, children, keepLastWords: glue = false }: DisclosureHeadingProps) {
  const { baseId, parts, open, interactive, toggle } = useDisclosure('DisclosureHeading');
  const id = `${baseId}-button`;
  return (
    <Tag className={className}>
      {interactive ? (
        <button
          type="button"
          id={id}
          className={styles.button}
          aria-expanded={open}
          aria-controls={parts.map((p) => panelId(baseId, p)).join(' ')}
          onClick={toggle}
          data-row=""
        >
          {typeof children === 'string' ? glueHeading(children, glue) : children}
        </button>
      ) : (
        // data-trigger: a tap here before hydration is replayed on the button once it exists
        // (scripts/defer-hydration.mjs), by this shared id.
        <span id={id} className={styles.button} data-trigger="">
          {children}
        </span>
      )}
    </Tag>
  );
}

type PanelTag = 'div' | 'p' | 'dl' | 'ul' | 'ol' | 'section';

export type DisclosurePanelProps = {
  /** Element to render. A new wrapper is a 'div'; an existing element (Services' <p>, <dl>) keeps its tag. Default 'div'. */
  as?: PanelTag;
  /** Must match one of the group's `parts`. Default 'panel'. */
  part?: string;
  className?: string;
  /** A NEW wrapper that must not exist for desktop layout: display: contents at >= 1024. */
  contentsOnDesktop?: boolean;
  /**
   * role="region" labelled by the heading (mobile only). Default true for a 'div'/'section'
   * wrapper, false otherwise, so a <dl> or <ul> keeps its own list semantics.
   */
  region?: boolean;
  children: ReactNode;
};

export function DisclosurePanel({ as: Tag = 'div', part = 'panel', className, contentsOnDesktop = false, region, children }: DisclosurePanelProps) {
  const { baseId, interactive, register } = useDisclosure('DisclosurePanel');
  const isRegion = interactive && (region ?? (Tag === 'div' || Tag === 'section'));
  return (
    <Tag
      ref={register as never}
      id={panelId(baseId, part)}
      data-panel=""
      className={cx(styles.panel, contentsOnDesktop && styles.contentsDesktop, className)}
      role={isRegion ? 'region' : undefined}
      aria-labelledby={isRegion ? `${baseId}-button` : undefined}
    >
      {children}
    </Tag>
  );
}
