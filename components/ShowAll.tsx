/**
 * "Show all" for long lists below 1024 (SPEC §5.5 B): Home's Press and Select Clients. Usage and
 * props: docs/mobile/FOUNDATION.md.
 *
 *   const PRESS_LIMIT = { phone: 3, tablet: 4 };
 *   <ul id="press-list" className={`${styles.press} ${showAllList}`}>
 *     {items.map((p, i) => <li key={p.href} className={`${styles.pressRow} ${showAllItem(i, PRESS_LIMIT)}`}>…</li>)}
 *   </ul>
 *   <ShowAll controls="press-list" label="Show all press" count={items.length} limit={PRESS_LIMIT} focusOnExpand="first-revealed" />
 *
 * Every item stays in the DOM. Items past the limit collapse at first paint by CSS (only with
 * scripting enabled), then after hydration by hidden="until-found", so find-in-page still reaches
 * them. At >= 1024 nothing is hidden and the button has no box.
 *
 * This module is server-safe: the two helpers are plain functions a server component can call.
 * The button itself is the client component in ShowAllButton.tsx.
 */
import styles from './ShowAll.module.css';

export type ShowAllLimit = {
  /** Items visible on phones (< 600) while collapsed. */
  phone: number;
  /** Items visible on tablets (600-1023) while collapsed. */
  tablet: number;
};

/** Add to the list element's className, next to its own class. */
export const showAllList = styles.list;

/** Add to each item's className, next to its own class. `index` is the item's position in the list. */
export function showAllItem(index: number, limit: ShowAllLimit): string {
  return [styles.item, index >= limit.phone && styles.restPhone, index >= limit.tablet && styles.restTablet]
    .filter(Boolean)
    .join(' ');
}

export { default } from './ShowAllButton';
export type { ShowAllProps } from './ShowAllButton';
