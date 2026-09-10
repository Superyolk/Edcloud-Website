import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import type { LegalBlock } from '@/content/legal';
import styles from '@/app/about/about.module.css';

type Props = { n: string; title: string; blocks: LegalBlock[] };

/** Privacy Policy / Accessibility Statement: the About page's text styles under a numbered section header. */
export default function LegalPage({ n, title, blocks }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <SectionShell n={n} title={title} as="h1">
          <div className={styles.mission}>
            {blocks.map((b, i) => {
              if (b.tag === 'h3') return <h3 key={i} className={styles.h3}>{b.text}</h3>;
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
