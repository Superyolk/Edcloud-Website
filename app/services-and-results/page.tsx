import type { Metadata } from 'next';
import { SERVICES } from '@/content/content';
import { SERVICES_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import Picture from '@/components/Picture';
import Disclosure, { DisclosureHeading, DisclosurePanel } from '@/components/Disclosure';
import { MQ_PHONE } from '@/app/breakpoints';
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
  const { hero } = SERVICES_COPY;
  return (
    <>
      <JsonLd data={[servicesLd, breadcrumbLd('Services & Results', '/services-and-results')]} />
      <SiteHeader transparentOverHero />
      <main>
        <section data-screen-label="Services hero" className={styles.hero}>
          <Picture
            name="hero-services"
            src={hero.imgSrc}
            alt={hero.imgAlt}
            className={styles.heroImg}
            width={1920}
            height={1080}
            fetchPriority="high"
            phoneSizes="100vw"
            tabletSizes="100vw"
          />
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
              {/* Each service is a disclosure row on phones (G7): the title is the button, the
                  green result line stays visible, and the pitch and For/How/When open with it.
                  The first row starts open; tablets start with all six open. At >= 1024 the
                  heading is a plain <span> and nothing is ever hidden. */}
              {SERVICES.services.map((s, i) => (
                <Disclosure
                  key={s.n}
                  as="li"
                  className={styles.service}
                  collapseQuery={MQ_PHONE}
                  defaultOpen={i === 0}
                  parts={['pitch', 'spec']}
                >
                  <span className={styles.serviceIndex}>{s.n}</span>
                  <div className={styles.serviceInner}>
                    <div className={styles.serviceText}>
                      <DisclosureHeading as="h3" className={styles.serviceTitle} keepLastWords>
                        {s.title}
                      </DisclosureHeading>
                      <DisclosurePanel as="p" part="pitch" className={styles.servicePitch}>
                        {s.pitch}
                      </DisclosurePanel>
                      <p className={styles.serviceResult}>{s.result}</p>
                    </div>
                    <DisclosurePanel as="dl" part="spec" className={styles.dl}>
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
                    </DisclosurePanel>
                  </div>
                </Disclosure>
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
                {/* Below 1024 the rows stack; the header is clipped, not removed, so screen
                    readers still pair every cell with its column. */}
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
                      <td className={styles.td} data-label={SERVICES_COPY.tableHead[1]}>
                        {r.start}
                      </td>
                      <td className={styles.td} data-label={SERVICES_COPY.tableHead[2]}>
                        {r.built}
                      </td>
                      <td className={`${styles.td} ${styles.tdOutcome}`} data-label={SERVICES_COPY.tableHead[3]}>
                        {r.outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionShell>

        <SectionShell n={fit.n} title={fit.title} white className={styles.bordered}>
          <div className={styles.fit}>
            {[fitYes, fitNo].map((col, i) => {
              const yes = i === 0;
              return (
                <div key={col.title} className={styles.fitCol}>
                  <h3 className={styles.fitTitle}>{col.title}</h3>
                  <ul className={styles.fitList}>
                    {col.items.map((item) => (
                      <li key={item} className={styles.fitItem}>
                        <span aria-hidden="true" className={yes ? `${styles.fitMark} ${styles.fitMarkYes}` : styles.fitMark}>
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            {yes ? <path d="M4 10.5l4 4 8-9" /> : <path d="M4.5 10h11" />}
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </SectionShell>
      </main>
      <SiteFooter />
    </>
  );
}
