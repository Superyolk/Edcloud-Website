'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { SHARED } from '@/content/copy';
import RouteLink from './RouteLink';
import styles from './SiteHeader.module.css';

type Props = {
  /** Pages with a full-bleed hero: start transparent over it, fade to solid once scrollY > 40. */
  transparentOverHero?: boolean;
};

const MENU_LABELS = { closed: 'Menu', open: 'Close' } as const;

export default function SiteHeader({ transparentOverHero = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Below --nav-collapse (820px). Crossing the breakpoint always closes the menu.
  const mobile = useMediaQuery('(max-width: 819px)', () => setMenuOpen(false));

  useEffect(() => {
    if (!transparentOverHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOverHero]);

  const solid = !transparentOverHero || scrolled || (mobile && menuOpen);
  const menuVisible = mobile && menuOpen;

  return (
    <header className={solid ? styles.header : `${styles.header} ${styles.transparent}`}>
      <nav aria-label="Primary" className={styles.nav}>
        <RouteLink href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element -- hot-linked brand mark, exact 22px box */}
          <img src={SHARED.markSrc} alt={SHARED.markAlt} width={22} height={22} className={styles.mark} />
          {SHARED.wordmark}
        </RouteLink>
        <ul className={styles.links}>
          {SHARED.navLinks.map((l) => (
            <li key={l.label}>
              <RouteLink href={l.href} className={styles.link}>
                {l.label}
              </RouteLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? MENU_LABELS.open : MENU_LABELS.closed}
        </button>
      </nav>
      {menuVisible && (
        <ul id="mobile-menu" className={styles.menu}>
          {SHARED.mobileMenu.map((l) => (
            <li key={l.label} className={styles.menuItem}>
              <RouteLink href={l.href} className={styles.menuLink}>
                {l.label}
              </RouteLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
