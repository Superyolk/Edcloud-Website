/* eslint-disable @next/next/no-img-element -- photos are hot-linked from Wix at a fixed crop; plain <img> keeps the reference's exact boxes */
import type { Metadata } from 'next';
import { SERVICES } from '@/content/content';
import { SERVICES_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, pageMeta, SEO_DESCRIPTION, servicesLd } from '@/content/seo';
import styles from './services.module.css';

export const metadata: Metadata = pageMeta({
  title: SERVICES_COPY.meta.title,
  description: SEO_DESCRIPTION.services,
  path: '/services-and-results',
});

const [engagement, whatWeDo, results, fit] = SERVICES_COPY.titles;
const [bestFor, youGet, timeline] = SERVICES_COPY.dlLabels;
const [fitYes, fitNo] = SERVICES_COPY.fit;

export default function ServicesPage() {
  const { hero, start } = SERVICES_COPY;
  return (
    <>
      <JsonLd data={[servicesLd, breadcrumbLd('Services & Results', '/services-and-results')]} />
      <SiteHeader />
      <main>
        <section data-screen-label="Services hero" className={styles.hero}>
          <img src={hero.imgSrc} alt={hero.imgAlt} className={styles.heroImg} />
          <div aria-hidden="true" className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{hero.h1}</h1>
            <p className={styles.heroLead}>{hero.p}</p>
          </div>
        </section>

        <section data-screen-label="Proof strip" className={styles.proof}>
          <div className={styles.proofInner}>
            {SERVICES.proof.map((p) => (
              <div key={p.stat} className={styles.proofItem}>
                <span className={styles.proofStat}>{p.stat}</span>
                <span className={styles.proofLabel}>{p.label}</span>
                <span className={styles.proofClient}>{p.client}</span>
              </div>
            ))}
          </div>
        </section>

        <SectionShell n={engagement.n} title={engagement.title}>
          <div className={styles.engagement}>
            <p className={styles.lead}>{SERVICES_COPY.engagementLead}</p>
            <ol className={styles.phases}>
              {SERVICES.phases.map((ph) => (
                <li key={ph.n} className={styles.phase}>
                  <div className={styles.phaseMeta}>
                    <span className={styles.phaseIndex}>{ph.n}</span>
                    <span className={styles.phaseDuration}>{ph.duration}</span>
                  </div>
                  <h3 className={styles.phaseTitle}>{ph.title}</h3>
                  <p className={styles.phaseBody}>{ph.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </SectionShell>

        <SectionShell
          n={whatWeDo.n}
          title={whatWeDo.title}
          white
          className={styles.bordered}
          containerExtra={
            <ol className={styles.serviceList}>
              {SERVICES.services.map((s) => (
                <li key={s.n} className={styles.service}>
                  <span className={styles.serviceIndex}>{s.n}</span>
                  <div className={styles.serviceInner}>
                    <div className={styles.serviceText}>
                      <h3 className={styles.serviceTitle}>{s.title}</h3>
                      <p className={styles.servicePitch}>{s.pitch}</p>
                      <p className={styles.serviceResult}>{s.result}</p>
                    </div>
                    <dl className={styles.dl}>
                      <div className={styles.dlRow}>
                        <dt className={styles.dt}>{bestFor}</dt>
                        <dd className={styles.dd}>{s.fit}</dd>
                      </div>
                      <div className={styles.dlRow}>
                        <dt className={styles.dt}>{youGet}</dt>
                        <dd className={styles.dd}>{s.deliverables}</dd>
                      </div>
                      <div className={styles.dlRow}>
                        <dt className={styles.dt}>{timeline}</dt>
                        <dd className={styles.dd}>{s.timeline}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          }
        >
          <p className={styles.lead}>{SERVICES_COPY.whatWeDoLead}</p>
        </SectionShell>

        <SectionShell n={results.n} title={results.title}>
          <div className={styles.results}>
            <p className={styles.lead}>{SERVICES_COPY.resultsLead}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.thead}>
                    {SERVICES_COPY.tableHead.map((h) => (
                      <th key={h} className={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.results.map((r) => (
                    <tr key={r.client}>
                      <td className={`${styles.td} ${styles.tdClient}`}>{r.client}</td>
                      <td className={styles.td}>{r.start}</td>
                      <td className={styles.td}>{r.built}</td>
                      <td className={`${styles.td} ${styles.tdOutcome}`}>{r.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionShell>

        <SectionShell n={fit.n} title={fit.title} white className={styles.bordered}>
          <div className={styles.fit}>
            <div className={styles.fitCol}>
              <h3 className={styles.fitTitle}>{fitYes.title}</h3>
              <ul className={styles.fitList}>
                {fitYes.items.map((item) => (
                  <li key={item} className={`${styles.fitItem} ${styles.fitItemYes}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.fitCol}>
              <h3 className={styles.fitTitle}>{fitNo.title}</h3>
              <ul className={styles.fitList}>
                {fitNo.items.map((item) => (
                  <li key={item} className={styles.fitItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionShell>

        <section data-screen-label={`${start.n} Start`} className={styles.start}>
          <div className={styles.startInner}>
            <span className={styles.startIndex}>{start.n}</span>
            <div className={styles.startGrid}>
              <h2 className={styles.startTitle}>{start.h2}</h2>
              <div className={styles.startActions}>
                <a href={start.cta.href} className={styles.cta}>
                  {start.cta.label}
                </a>
                <a href={start.email.href} className={styles.email}>
                  {start.email.label}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
