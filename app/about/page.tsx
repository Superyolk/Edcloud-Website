/* eslint-disable @next/next/no-img-element -- photos are hot-linked from Wix at a fixed crop; plain <img> keeps the reference's exact boxes */
import type { Metadata } from 'next';
import { ABOUT_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: ABOUT_COPY.meta.title,
  description: ABOUT_COPY.meta.description,
};

const [mission, partner, numbers] = ABOUT_COPY.titles;

export default function AboutPage() {
  const { hero } = ABOUT_COPY;
  return (
    <>
      <SiteHeader />
      <main>
        <section data-screen-label="About hero" className={styles.hero}>
          <img src={hero.imgSrc} alt={hero.imgAlt} className={styles.heroImg} />
          <div aria-hidden="true" className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{hero.h1}</h1>
          </div>
        </section>

        <SectionShell n={mission.n} title={mission.title}>
          <div className={styles.mission}>
            {ABOUT_COPY.mission.map((block, i) => {
              switch (block.tag) {
                case 'h2':
                  return (
                    <h2 key={i} className={styles.h2}>
                      {block.text}
                    </h2>
                  );
                case 'h3':
                  return (
                    <h3 key={i} className={styles.h3}>
                      {block.text}
                    </h3>
                  );
                case 'ul':
                  return (
                    <ul key={i} className={styles.list}>
                      {block.items.map((item) => (
                        <li key={item.text}>
                          {'lead' in item && (
                            <>
                              <strong className={styles.strong}>{item.lead}</strong>{' '}
                            </>
                          )}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  );
                default:
                  return (
                    <p key={i} className={styles.p}>
                      {block.text}
                    </p>
                  );
              }
            })}
          </div>
        </SectionShell>

        <SectionShell n={partner.n} title={partner.title} white>
          <div className={styles.partner}>
            <img src={ABOUT_COPY.partner.imgSrc} alt={ABOUT_COPY.partner.imgAlt} className={styles.headshot} />
            <div className={styles.partnerText}>
              <h2 className={styles.h2}>{ABOUT_COPY.partner.h2}</h2>
              {ABOUT_COPY.partner.paragraphs.map((text, i) => (
                <p key={text} className={i === 0 ? styles.p : styles.partnerP}>
                  {text}
                </p>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* The reference lays the stat cards out directly in the content row (no 72px offset cell). */}
        <SectionShell n={numbers.n} title={numbers.title} offset={false} bodyClassName={styles.numbers}>
          {ABOUT_COPY.numbers.map((c) => (
            <div key={c.title} className={styles.numberCard}>
              <span className={styles.stat}>{c.stat}</span>
              <h3 className={styles.numberTitle}>{c.title}</h3>
              <p className={styles.numberBody}>{c.body}</p>
            </div>
          ))}
        </SectionShell>
      </main>
      <SiteFooter />
    </>
  );
}
