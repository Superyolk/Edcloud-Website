'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isRoute, route } from '@/content/site';

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

/**
 * An internal link that always lands at the top of its destination.
 *
 * The App Router scrolls to the top when the route actually changes, but does nothing when the
 * href matches the page you are already on. That left the brand mark and the nav links looking
 * dead: clicking "About" while on /about, or the wordmark while half-way down the home page, kept
 * you exactly where you were. This scrolls those clicks itself.
 *
 * Hash links are deliberately exempt. "/#contact" is supposed to land part-way down the page.
 *
 * External URLs and mailto: fall through to a plain anchor.
 */
export default function RouteLink({ href, className, children, ariaLabel }: Props) {
  const pathname = usePathname();
  const target = isRoute(href) ? route(href) : href;

  if (!target.startsWith('/')) {
    return (
      <a href={target} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  const samePage = !target.includes('#') && target === pathname;
  return (
    <Link
      href={target}
      className={className}
      aria-label={ariaLabel}
      onClick={samePage ? () => window.scrollTo(0, 0) : undefined}
    >
      {children}
    </Link>
  );
}
