'use client';

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { MQ_MOBILE } from '@/app/breakpoints';
import { route } from '@/content/site';
import { useMediaQuery } from './useMediaQuery';
import RouteLink from './RouteLink';
import type { HeaderCopy } from './SiteHeader';
import styles from './SiteHeader.module.css';

type Props = {
  /** Pages with a full-bleed hero: start transparent over it, fade to solid once scrollY > 40. */
  transparentOverHero?: boolean;
  /** The existing copy this header shows, picked from SHARED by the server wrapper (SiteHeader.tsx). */
  copy: HeaderCopy;
};

const MENU_LABELS = { closed: 'Menu', open: 'Close' } as const;

/**
 * The menu icons. The svg box is the ink box: 15 x 11, so the three lines end exactly on the
 * gutter, mirroring the "e" mark on the left. The close cross sits centred in the same box.
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className={styles.menuIcon} width="15" height="11" viewBox="0 0 15 11" aria-hidden="true" focusable="false">
      {open ? (
        <path d="M3.2 0.7 11.8 10.3M11.8 0.7 3.2 10.3" />
      ) : (
        <path d="M0.7 0.7h13.6M0.7 5.5h13.6M0.7 10.3h13.6" />
      )}
    </svg>
  );
}

// Owner decision: no Contact call to action on the Services & Results page.
const NO_CONTACT_PATH = route('EdCloud Services.dc.html');

type Release = (opts?: { restoreScroll?: boolean; returnFocus?: boolean }) => void;

function Brand({ className, markClassName, copy }: { className: string; markClassName: string; copy: HeaderCopy }) {
  // "EDCLOUD" always shows; "VENTURE PARTNERS" is visually hidden on the narrowest phones so Close /
  // Menu stays on screen. It stays in the DOM (and in the accessible name) either way.
  const [wordmarkHead, ...wordmarkRest] = copy.wordmark.split(' ');
  const wordmarkTail = wordmarkRest.join(' ');
  return (
    <RouteLink href="/" className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted brand mark, exact 22px box */}
      <img src={copy.markSrc} alt={copy.markAlt} width={22} height={22} className={markClassName} />
      <span>
        {/* The space sits outside the tail so that, below 1024, the wordmark can break there (and
            only there) on phones too narrow for one line. The DOM text is unchanged. */}
        {wordmarkHead}{' '}
        <span className={styles.wordmarkTail}>{wordmarkTail}</span>
      </span>
    </RouteLink>
  );
}

export default function SiteHeaderClient({ transparentOverHero = false, copy }: Props) {
  // mobileMenu is the three pages, then the two legal pages. The sheet sets the pages as large
  // rows and the legal pages as smaller ones beneath them (SPEC §5.3).
  const SHEET_PAGES = copy.mobileMenu.slice(0, 3);
  const SHEET_LEGAL = copy.mobileMenu.slice(3);
  const { contact: CONTACT, email: EMAIL, phone: PHONE } = copy;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Below 1024 (MQ_MOBILE) the links collapse into the sheet. Crossing the breakpoint either way
  // always closes it.
  const mobile = useMediaQuery(MQ_MOBILE, () => setMenuOpen(false));
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const releaseRef = useRef<Release | null>(null);

  useEffect(() => {
    if (!transparentOverHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOverHero]);

  const solid = !transparentOverHero || scrolled || (mobile && menuOpen);
  const menuVisible = mobile && menuOpen;

  // While the sheet is open the page behind it is locked and unreachable (SPEC §5.3).
  useEffect(() => {
    if (!menuVisible) return;
    const { body } = document;
    const y = window.scrollY;
    const prevStyle = body.getAttribute('style');
    // iOS Safari ignores overflow:hidden on body for touch scrolling; pinning the body is the lock
    // that holds there. The offset keeps the page visually where it was.
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.left = '0';
    body.style.right = '0';
    // inert takes the page out of the tab order and the accessibility tree in one attribute.
    const behind = [...Array.from(document.querySelectorAll<HTMLElement>('main, body > footer')), navRef.current].filter(
      (el): el is HTMLElement => !!el,
    );
    for (const el of behind) el.setAttribute('inert', '');
    closeRef.current?.focus();

    let released = false;
    const release: Release = ({ restoreScroll = true, returnFocus = true } = {}) => {
      if (released) return;
      released = true;
      for (const el of behind) el.removeAttribute('inert');
      if (prevStyle === null) body.removeAttribute('style');
      else body.setAttribute('style', prevStyle);
      if (restoreScroll) window.scrollTo(0, y);
      if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
    };
    releaseRef.current = release;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      releaseRef.current = null;
      release();
    };
  }, [menuVisible]);

  // Tab and Shift+Tab cycle inside the sheet.
  const onSheetKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !sheetRef.current) return;
    const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Any link in the sheet closes it. Capture phase, so the page is unlocked and scrolled back
  // BEFORE the link's own handler runs: RouteLink's scroll-to-top and the "/#contact" jump then
  // start from the real page instead of being undone by the unlock afterwards.
  const onSheetClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!(e.target instanceof Element) || !e.target.closest('a[href]')) return;
    releaseRef.current?.({ returnFocus: false });
    setMenuOpen(false);
  };

  const showContact = CONTACT && pathname !== NO_CONTACT_PATH;

  return (
    <header className={solid ? styles.header : `${styles.header} ${styles.transparent}`}>
      <nav aria-label="Primary" className={styles.nav} ref={navRef}>
        <Brand className={styles.brand} markClassName={styles.mark} copy={copy} />
        <ul className={styles.links}>
          {copy.navLinks.map((l) => (
            <li key={l.label}>
              <RouteLink href={l.href} className={styles.link}>
                {l.label}
              </RouteLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          ref={triggerRef}
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuVisible}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? MENU_LABELS.open : MENU_LABELS.closed}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </nav>
      {menuVisible && (
        <div
          id="mobile-menu"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={MENU_LABELS.closed}
          className={styles.sheet}
          onKeyDown={onSheetKeyDown}
          onClickCapture={onSheetClickCapture}
        >
          {/* Mirrors the header bar, so the close icon sits exactly where the hamburger was. */}
          <div className={styles.sheetBar}>
            <div className={styles.sheetBarInner}>
              <Brand className={styles.brand} markClassName={styles.mark} copy={copy} />
              <button
                type="button"
                ref={closeRef}
                className={styles.menuButton}
                onClick={() => setMenuOpen(false)}
                aria-label={MENU_LABELS.open}
              >
                <MenuIcon open />
              </button>
            </div>
          </div>
          <div className={styles.sheetBody}>
            <ul className={styles.sheetPages}>
              {SHEET_PAGES.map((l) => (
                <li key={l.label}>
                  <RouteLink
                    href={l.href}
                    className={styles.sheetPage}
                    ariaCurrent={route(l.href) === pathname ? 'page' : undefined}
                  >
                    {l.label}
                  </RouteLink>
                </li>
              ))}
            </ul>
            <ul className={styles.sheetLegal}>
              {SHEET_LEGAL.map((l) => (
                <li key={l.label}>
                  <RouteLink
                    href={l.href}
                    className={styles.sheetLegalLink}
                    ariaCurrent={route(l.href) === pathname ? 'page' : undefined}
                  >
                    {l.label}
                  </RouteLink>
                </li>
              ))}
            </ul>
          </div>
          {/* Pinned in the thumb zone (G11). */}
          <div className={styles.sheetFoot}>
            <div className={styles.sheetFootInner}>
              {showContact && (
                <RouteLink href={CONTACT.href} className={styles.sheetContact}>
                  {CONTACT.label}
                </RouteLink>
              )}
              <div className={styles.sheetReach}>
                {EMAIL?.href && (
                  <a href={EMAIL.href} className={styles.sheetEmail}>
                    {EMAIL.text}
                  </a>
                )}
                {PHONE && <span className={styles.sheetPhone}>{PHONE.text}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
