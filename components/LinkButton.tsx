import Link from 'next/link';
import type { ReactNode } from 'react';
import ui from './ui.module.css';

type Props = {
  href: string;
  children: ReactNode;
  /**
   * Accessible name when the visible text alone is ambiguous ("Read More" -> "Read More about
   * EdCloud"). It must START with the visible text (WCAG 2.5.3).
   */
  ariaLabel?: string;
  /** Extra classes from the call site, e.g. a page's mobile placement. Appended after the button's own. */
  className?: string;
};

/** "Read More" / "Services & Results": the design-system Button in its link variant, rendered as an <a>. */
export default function LinkButton({ href, children, ariaLabel, className }: Props) {
  return (
    <Link href={href} className={className ? `${ui.linkButton} ${className}` : ui.linkButton} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
