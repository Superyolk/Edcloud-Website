import { SHARED } from '@/content/copy';
import RouteLink from './RouteLink';
import styles from './SiteFooter.module.css';

const { footer } = SHARED;
// The "Contact" link was removed from this column on request. Book a Meeting, the address and
// LinkedIn stay; the header still carries Contact.
const [, book, email, ...rest] = footer.col1;
const address = rest.filter((r) => r.tag === 'span');
const linkedin = rest.find((r) => r.tag === 'a' && r.svgPath);
// The "Navigate" heading was removed on request, so this column is now just its links.
const navLinks = footer.col2;

export default function SiteFooter() {
  return (
    <footer data-screen-label="Footer" className={styles.footer}>
        <div className={styles.grid}>
          <div className={styles.col1}>
            <RouteLink href={book.href!} className={`${styles.white} ${styles.book}`}>
              {book.text}
            </RouteLink>
            <RouteLink href={email.href!} className={styles.white}>
              {email.text}
            </RouteLink>
            {address.map((a) => (
              <span key={a.text}>{a.text}</span>
            ))}
            {linkedin && (
              <RouteLink href={linkedin.href!} className={styles.linkedin} ariaLabel={linkedin.ariaLabel!}>
                {/* The one icon on the site: a bare white LinkedIn glyph, no box behind it. */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={linkedin.svgPath!} />
                </svg>
              </RouteLink>
            )}
          </div>

          <div className={styles.col2}>
            {navLinks.map((l) => (
              <RouteLink key={l.text} href={l.href!} className={styles.white}>
                {l.text}
              </RouteLink>
            ))}
          </div>
        </div>
        <div className={styles.bar}>
          <div className={styles.barInner}>
            <RouteLink href="/" className={styles.brand}>
              {/* eslint-disable-next-line @next/next/no-img-element -- hot-linked brand mark, exact 22px box */}
              <img src={SHARED.markSrc} alt="" width={22} height={22} className={styles.brandMark} />
              {footer.brand}
            </RouteLink>
            <span>{footer.copyright}</span>
          </div>
        </div>
    </footer>
  );
}
