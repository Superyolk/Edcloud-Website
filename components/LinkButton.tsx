import Link from 'next/link';
import type { ReactNode } from 'react';
import ui from './ui.module.css';

/** "Read More" / "Services & Results": the design-system Button in its link variant, rendered as an <a>. */
export default function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={ui.linkButton}>
      {children}
    </Link>
  );
}
