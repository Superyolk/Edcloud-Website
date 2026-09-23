'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { MQ_MOBILE } from '@/app/breakpoints';
import { HOME } from '@/content/content';
import { HOME_COPY } from '@/content/copy';
import LinkButton from '@/components/LinkButton';
import styles from '@/app/home.module.css';

/** Lead = up to and including the first ". "; rest = everything after it. */
function split(body: string) {
  const i = body.indexOf('. ') + 2;
  return { lead: body.slice(0, i - 1), rest: body.slice(i) };
}

const PANEL_ID = 'svc-panel';
const tabId = (i: number) => `svc-tab-${i}`;

// Hover previews a service only with a real mouse. On touch a tap fires mouseenter too, and a row
// that opened on hover would fight the tap (SPEC §7.1).
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Desktop: titles on the left, one detail panel beside them. Below 1024 the same DOM becomes an
 * exclusive accordion (SPEC §7.1): home.module.css flattens the list with display: contents so the
 * three buttons are grid rows, and the inline grid rows below slot the single panel directly under
 * the active one. Desktop CSS never reads --panel-row or the buttons' grid-row (their parent <li> is
 * not a grid there), so nothing moves at >= 1024.
 */
export default function ServicesTabs() {
  const [active, setActive] = useState(0);
  const current = split(HOME.services[active].body);
  // Below 1024, opening a row collapses the open panel ABOVE it, which would pull the row you
  // just tapped ~260px up from under your thumb. The row's screen position is recorded before
  // the change and restored in the same frame (before paint), so the tapped row stays put and
  // its panel opens beneath it. Desktop layout never moves, so it is left alone.
  const anchor = useRef<{ index: number; top: number } | null>(null);

  const open = (i: number) => {
    if (i === active) return;
    const el = document.getElementById(tabId(i));
    anchor.current = el && window.matchMedia(MQ_MOBILE).matches ? { index: i, top: el.getBoundingClientRect().top } : null;
    setActive(i);
  };

  useLayoutEffect(() => {
    const a = anchor.current;
    anchor.current = null;
    if (!a || a.index !== active) return;
    const el = document.getElementById(tabId(a.index));
    if (!el) return;
    const shift = el.getBoundingClientRect().top - a.top;
    if (Math.abs(shift) >= 1) window.scrollBy(0, shift);
  }, [active]);

  return (
    <div className={styles.services} style={{ '--panel-row': active + 2 } as CSSProperties}>
      <ol className={styles.tabs}>
        {HOME.services.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.n}>
              <button
                type="button"
                id={tabId(i)}
                className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => open(i)}
                onMouseEnter={() => finePointer() && setActive(i)}
                aria-expanded={isActive}
                aria-controls={PANEL_ID}
                // One row is always open (the accordion is exclusive), so pressing the open row
                // does nothing; saying so keeps a screen reader from promising a collapse (APG).
                aria-disabled={isActive || undefined}
                // A full-width row: it answers a press with colour, not the global button shrink.
                data-row=""
                style={{ gridRow: i + 1 + (i > active ? 1 : 0) }}
              >
                <span className={styles.tabTitle}>{s.title}</span>
                <span aria-hidden="true" className={styles.tabDot} />
              </button>
            </li>
          );
        })}
      </ol>
      {/* key: a new service remounts the panel, which replays its fade-in on phones. No
          role="region": it added a landmark the frozen desktop never had. A labelled group
          keeps the panel named by its row without joining the landmark list. */}
      <div key={active} id={PANEL_ID} role="group" aria-labelledby={tabId(active)} className={styles.panel}>
        <p className={styles.panelLead}>{current.lead}</p>
        <p className={styles.body}>{current.rest}</p>
        <div className={styles.panelFoot}>
          <LinkButton href="/services-and-results">{HOME_COPY.servicesLink}</LinkButton>
        </div>
      </div>
    </div>
  );
}
