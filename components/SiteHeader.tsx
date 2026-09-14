'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { SHARED } from '@/content/copy';
import { isRoute, route } from '@/content/site';
import styles from './SiteHeader.module.css';

type Props = {
  /** Pages with a full-bleed hero: start transparent over it, fade to solid once scrollY > 40. */
  transparentOverHero?: boolean;
};

const MENU_LABELS = { closed: 'Menu', open: 'Close' } as const;

function NavAnchor({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return isRoute(href) ? (
    <Link href={route(href)} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

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
        <Link href="/" className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element -- hot-linked brand mark, exact 22px box */}
          <img src={SHARED.markSrc} alt={SHARED.markAlt} width={22} height={22} className={styles.mark} />
          {SHARED.wordmark}
        </Link>
        <ul className={styles.links}>
          {SHARED.navLinks.map((l) => (
            <li key={l.label}>
              <NavAnchor href={l.href} className={styles.link}>
                {l.label}
              </NavAnchor>
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
              <NavAnchor href={l.href} className={styles.menuLink}>
                {l.label}
              </NavAnchor>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
