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
    // Safari has no hidden="until-found" yet; there a plain `hidden` is the collapse.
    const untilFound = 'onbeforematch' in document.body;
    for (const el of panels.current) {
      if (mobile && !open) el.setAttribute('hidden', untilFound ? 'until-found' : '');
      else el.removeAttribute('hidden');
    }
    group.setAttribute('data-js', '');
  }, [hydrated, mobile, open]);

  // Find-in-page (and #:~:text= links) into a collapsed panel opens it.
  useEffect(() => {
    const onMatch = () => setUserOpen(true);
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

export type DisclosureHeadingProps = {
  /** The existing heading level. Default 'h3'. */
  as?: 'h2' | 'h3' | 'h4';
  /** The heading's existing class, unchanged. */
  className?: string;
  /** The existing heading text. No new copy. */
  children: ReactNode;
};

/**
 * `<h3 class={existing}><button …>{text}</button></h3>` below 1024 once hydrated. Before
 * hydration and at >= 1024 the button is a <span> with the same class, so the row keeps its
 * size (no shift when the button arrives) and desktop gets no new tab stop.
 */
export function DisclosureHeading({ as: Tag = 'h3', className, children }: DisclosureHeadingProps) {
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
          {children}
        </button>
      ) : (
        <span id={id} className={styles.button}>
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
      className={cx(styles.panel, contentsOnDesktop && styles.contentsDesktop, className)}
      role={isRegion ? 'region' : undefined}
      aria-labelledby={isRegion ? `${baseId}-button` : undefined}
    >
      {children}
    </Tag>
  );
}
