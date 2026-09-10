/* eslint-disable @next/next/no-img-element -- every photo and logo is hot-linked from Wix at a fixed crop; plain <img> keeps the reference's exact boxes */
import type { Metadata } from 'next';
import { Fragment } from 'react';
import { HOME } from '@/content/content';
import { HOME_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import LinkButton from '@/components/LinkButton';
import HeroVideo from '@/components/home/HeroVideo';
import ServicesTabs from '@/components/home/ServicesTabs';
import ContactForm from '@/components/home/ContactForm';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: HOME_COPY.meta.title,
  description: HOME_COPY.meta.description,
};

const [promise, services, projects, deliverables, press, clients, contact] = HOME_COPY.titles;

export default function HomePage() {
  const { hero } = HOME_COPY;
  return (
    <>
      <SiteHeader transparentOverHero />
      <main>
        <section data-screen-label="Hero" className={styles.hero}>
          <img src={hero.posterSrc} alt={hero.posterAlt} className={styles.heroLayer} />
          <HeroVideo src={hero.videoSrc} className={`${styles.heroLayer} ${styles.heroVideo}`} />
          <div aria-hidden="true" className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <div data-reveal="" className={styles.heroReveal}>
              <div>
                <h1 className={styles.heroTitle}>
                  {hero.h1Lines.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </h1>
                <p className={styles.heroLead}>{hero.p}</p>
              </div>
            </div>
          </div>
        </section>

        <SectionShell n={promise.n} title={promise.title}>
          <div className={styles.promise}>
            <p className={styles.lead}>{HOME_COPY.promise.lead}</p>
            <p className={styles.body}>{HOME_COPY.promise.p2}</p>
            <p className={styles.body}>{HOME_COPY.promise.p3}</p>
            <div>
              <LinkButton href="/about">{HOME_COPY.promise.readMore}</LinkButton>
            </div>
          </div>
        </SectionShell>

        <SectionShell n={services.n} title={services.title}>
          <ServicesTabs />
        </SectionShell>

        <SectionShell n={projects.n} title={projects.title}>
          <div className={styles.cases}>
            {HOME.cases.map((c) => (
              <article key={c.n} className={styles.case}>
                <div className={styles.caseTop}>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardBody}>{c.body}</p>
                </div>
                <div className={styles.rule} />
                <div className={styles.caseStat}>
                  <span className={styles.stat}>{c.stat}</span>
                  <span className={styles.statLabel}>{c.statLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell n={deliverables.n} title={deliverables.title}>
          <div className={styles.deliverables}>
            <div className={styles.deliverablesIntro}>
              <p className={styles.lead}>{HOME_COPY.deliverables.lead}</p>
              <div className={styles.photoCard}>
                <img src={HOME_COPY.deliverables.imgSrc} alt={HOME_COPY.deliverables.imgAlt} className={styles.photo} />
              </div>
            </div>
            <ol className={styles.capabilities}>
              {HOME.capabilities.map((c) => (
                <li key={c.n} className={styles.capability}>
                  <span className={styles.capabilityIndex}>{c.n}</span>
                  <div className={styles.capabilityText}>
                    <h3 className={styles.cardTitle}>{c.label}</h3>
                    <p className={styles.cardBody}>{c.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </SectionShell>

        <SectionShell
          n={press.n}
          title={press.title}
          sectionExtra={
            <figure className={styles.figure}>
              <img src={HOME_COPY.press.figureSrc} alt={HOME_COPY.press.figureAlt} className={styles.figureImg} />
            </figure>
          }
        >
          <ul className={styles.press}>
            {HOME.press.map((p) => (
              <li key={p.href} className={styles.pressRow}>
                <div className={styles.pressMeta}>
                  <span>{p.source}</span>
                  <span>{p.date}</span>
                </div>
                <div className={styles.pressText}>
                  <h3 className={styles.pressTitle}>{p.title}</h3>
                  <a href={p.href} className={styles.pressLink}>
                    {HOME_COPY.press.linkLabel}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell n={clients.n} title={clients.title} as="h1" white>
          <ul className={styles.logos}>
            {HOME.logos.map((l) => (
              <li key={l.src} className={styles.logoTile}>
                <img src={l.src} alt={l.alt} loading="lazy" className={styles.logo} />
              </li>
            ))}
          </ul>
        </SectionShell>

        <SectionShell n={contact.n} title={contact.title} id="contact">
          <div className={styles.contact}>
            <div className={styles.contactPhotoWrap}>
              <img src={HOME_COPY.contact.imgSrc} alt={HOME_COPY.contact.imgAlt} className={styles.contactPhoto} />
            </div>
            <div className={styles.contactCard}>
              <h2 className={styles.contactTitle}>
                {HOME_COPY.contact.h2Lines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </h2>
              <ContactForm />
            </div>
          </div>
        </SectionShell>
      </main>
      <SiteFooter />
    </>
  );
}
