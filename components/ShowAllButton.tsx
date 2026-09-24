'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MQ_PHONE, MQ_TABLET } from '@/app/breakpoints';
import { useHydrated, useMediaQuery } from './useMediaQuery';
import type { ShowAllLimit } from './ShowAll';
import styles from './ShowAll.module.css';

/** The expanded label. UI chrome, allow-listed in scripts/qa/content-allowlist.json. */
const SHOW_FEWER = 'Show fewer';

export type ShowAllProps = {
  /** The id of the list element (the one carrying `showAllList`). */
  controls: string;
  /** The collapsed label, e.g. "Show all press". Must be allow-listed in scripts/qa/content-allowlist.json. */
  label: string;
  /** How many items the list holds: pass `items.length`, never a typed number. Shown as a quiet figure. */
  count: number;
  /** The same limit the items were given with showAllItem(). */
  limit: ShowAllLimit;
  /**
   * Where focus goes on expand. 'first-revealed' moves it to the first link of the first item that
   * was hidden (Press: the reader wants the next story); 'button' leaves it on the button (Clients:
   * nothing in a logo is focusable). Collapsing always keeps focus on the button.
   */
  focusOnExpand?: 'first-revealed' | 'button';
  /** Extra classes from the call site. */
  className?: string;
};

export default function ShowAllButton({ controls, label, count, limit, focusOnExpand = 'button', className }: ShowAllProps) {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const phone = useMediaQuery(MQ_PHONE);
  const tablet = useMediaQuery(MQ_TABLET);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Set by a click, consumed by the layout effect once the DOM reflects the new state.
  const pending = useRef<null | { expand: boolean; firstHidden: Element | null }>(null);

  // Before paint: hide or reveal the items for the current width, then switch the CSS
  // first-paint collapse off with data-js.
  useLayoutEffect(() => {
    const list = document.getElementById(controls);
    if (!list || !hydrated) return;
    // An item a find-in-page or #:~:text= match revealed before hydration (the pre-hydration
    // loader in scripts/defer-hydration.mjs marks it data-found): open the list instead of hiding
    // it again under the reader.
    const found = list.querySelectorAll('[data-found]');
    found.forEach((el) => el.removeAttribute('data-found'));
    if (found.length && !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser changed the DOM before hydration; state follows it before paint
      setOpen(true);
      return;
    }
    const rest = phone ? styles.restPhone : tablet ? styles.restTablet : null;
    const untilFound = 'onbeforematch' in document.body;
    for (const item of Array.from(list.getElementsByClassName(styles.item))) {
      if (rest && !open && item.classList.contains(rest)) item.setAttribute('hidden', untilFound ? 'until-found' : '');
      else item.removeAttribute('hidden');
    }
    list.toggleAttribute('data-open', open);
    list.setAttribute('data-js', '');

    const p = pending.current;
    pending.current = null;
    if (p?.expand && focusOnExpand === 'first-revealed') {
      p.firstHidden?.querySelector<HTMLElement>('a[href], button')?.focus();
    } else if (p && !p.expand) {
      // Collapsing can pull the button up past the top of the screen; bring it back.
      buttonRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [controls, hydrated, phone, tablet, open, focusOnExpand]);

  // Find-in-page into a hidden item expands the list. beforematch bubbles to the list. Every
  // hidden item is revealed here, synchronously: beforematch fires before the browser scrolls to
  // the match, so the scroll targets the final layout. Left to the next render, the items above
  // the match (Press 4-6) arrive after the scroll and push it below the screen (Phase 4 R2-a11y-01).
  useEffect(() => {
    const list = document.getElementById(controls);
    if (!list) return;
    const onMatch = () => {
      for (const item of Array.from(list.getElementsByClassName(styles.item))) item.removeAttribute('hidden');
      list.setAttribute('data-open', '');
      setOpen(true);
    };
    list.addEventListener('beforematch', onMatch);
    return () => list.removeEventListener('beforematch', onMatch);
  }, [controls]);

  const onClick = () => {
    const list = document.getElementById(controls);
    pending.current = { expand: !open, firstHidden: list?.querySelector(`.${CSS.escape(styles.item)}[hidden]`) ?? null };
    setOpen(!open);
  };

  const cls = [
    styles.button,
    count <= limit.phone && styles.nothingOnPhone,
    count <= limit.tablet && styles.nothingOnTablet,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      ref={buttonRef}
      className={cls}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      // Read by the pre-hydration loader (scripts/defer-hydration.mjs), which collapses the list
      // to these limits before React runs.
      data-showall-phone={limit.phone}
      data-showall-tablet={limit.tablet}
    >
      <span>{open ? SHOW_FEWER : label}</span>
      {!open && (
        <span aria-hidden="true" className={styles.count}>
          {count}
        </span>
      )}
    </button>
  );
}
