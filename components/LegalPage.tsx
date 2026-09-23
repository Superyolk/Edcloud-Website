import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import type { LegalBlock } from '@/content/legal';
import styles from './LegalPage.module.css';

type Props = { n: string; title: string; blocks: LegalBlock[] };

/** Privacy Policy / Accessibility Statement: the About page's text styles under a numbered section header. */
export default function LegalPage({ n, title, blocks }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        {/* titleSize="page": below 1024 the H1 takes the page-title size, well above the h2s. */}
        <SectionShell n={n} title={title} as="h1" titleSize="page">
          <div className={styles.body}>
            {blocks.map((b, i) => {
              // Top-level sections under the page title, so h2 — styled with the About page's
              // smaller heading rule to match the design.
              if (b.tag === 'h3') return <h2 key={i} className={styles.h2}>{b.text}</h2>;
              if (b.tag === 'ul') return <ul key={i} className={styles.list}>{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
              return <p key={i} className={styles.p}>{b.text}</p>;
            })}
          </div>
        </SectionShell>
      </main>
      <SiteFooter />
    </>
  );
}
