import Link from 'next/link';
import type { ReactNode } from 'react';
import { SHARED } from '@/content/copy';
import { isRoute, route } from '@/content/site';
import NewsletterForm from './NewsletterForm';
import styles from './SiteFooter.module.css';

function Anchor({ href, className, children, ariaLabel }: { href: string; className: string; children: ReactNode; ariaLabel?: string }) {
  return isRoute(href) ? (
    <Link href={route(href)} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

const { footer, newsletter } = SHARED;
const [contact, book, email, ...rest] = footer.col1;
const address = rest.filter((r) => r.tag === 'span');
const linkedin = rest.find((r) => r.tag === 'a' && r.svgPath);
const [navigate, ...navLinks] = footer.col2;

export default function SiteFooter() {
  return (
    <>
      <footer data-screen-label="Footer" className={styles.footer}>
        <div className={styles.grid}>
          <div className={styles.col1}>
            <Anchor href={contact.href!} className={styles.heading}>
              {contact.text}
            </Anchor>
            <Anchor href={book.href!} className={`${styles.white} ${styles.book}`}>
              {book.text}
            </Anchor>
            <Anchor href={email.href!} className={styles.white}>
              {email.text}
            </Anchor>
            {address.map((a) => (
              <span key={a.text}>{a.text}</span>
            ))}
            {linkedin && (
              <Anchor href={linkedin.href!} className={styles.linkedin} ariaLabel={linkedin.ariaLabel!}>
                {/* The one icon on the site: a bare white LinkedIn glyph, no box behind it. */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={linkedin.svgPath!} />
                </svg>
              </Anchor>
            )}
          </div>

          <div className={styles.col2}>
            <Anchor href={navigate.href!} className={`${styles.heading} ${styles.headingNav}`}>
              {navigate.text}
            </Anchor>
            {navLinks.map((l) => (
              <Anchor key={l.text} href={l.href!} className={styles.white}>
                {l.text}
              </Anchor>
            ))}
          </div>
        </div>
        <div className={styles.bar}>
          <div className={styles.barInner}>
            <Link href="/" className={styles.brand}>
              {/* eslint-disable-next-line @next/next/no-img-element -- hot-linked brand mark, exact 22px box */}
              <img src={SHARED.markSrc} alt="" width={22} height={22} className={styles.brandMark} />
              {footer.brand}
            </Link>
            <span>{footer.copyright}</span>
          </div>
        </div>
      </footer>

      <section data-screen-label="Newsletter">
        <div className={styles.news}>
          <div className={styles.newsIntro}>
            <Link href="/" className={styles.newsTitle}>
              {newsletter.title}
            </Link>
            <p className={styles.newsBody}>{newsletter.body}</p>
          </div>
          <div>
            <NewsletterForm />
            <div className={styles.newsLinks}>
              {newsletter.links.map((l) => (
                <Anchor key={l.label} href={l.href} className={styles.newsLink}>
                  {l.label}
                </Anchor>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
