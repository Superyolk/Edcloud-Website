/* eslint-disable @next/next/no-img-element -- every photo and logo is self-hosted at a fixed, pre-sized crop; plain <img> keeps those exact boxes */
import type { Metadata } from 'next';
import { Fragment, type CSSProperties } from 'react';
import { HOME } from '@/content/content';
import { HOME_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import JsonLd from '@/components/JsonLd';
import { organizationLd, pageMeta, pressLd, SEO_DESCRIPTION, websiteLd } from '@/content/seo';
import LinkButton from '@/components/LinkButton';
import HeroVideo from '@/components/home/HeroVideo';
import ServicesTabs from '@/components/home/ServicesTabs';
import ContactForm from '@/components/home/ContactForm';
import ContactPill from '@/components/home/ContactPill';
import Picture from '@/components/Picture';
import ShowAll, { showAllItem, showAllList, type ShowAllLimit } from '@/components/ShowAll';
import styles from './home.module.css';

export const metadata: Metadata = pageMeta({
  title: HOME_COPY.meta.title,
  description: SEO_DESCRIPTION.home,
  path: '/',
});

const [promise, services, projects, deliverables, press, clients, contact] = HOME_COPY.titles;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 2026" -> a sortable number. Anything unparseable sorts last rather than landing at random. */
function pressDateKey(date: string): number {
  const [month, year] = date.trim().split(/\s+/);
  const m = MONTHS.indexOf(month);
  const y = Number(year);
  return m < 0 || !Number.isFinite(y) ? -Infinity : y * 12 + m;
}

// Newest first, so a story added to content.js lands in the right place without anyone reordering
// the array by hand. Sorted on a copy; HOME.press keeps the order it was written in.
// Client logos are sized by shape, not by box: each gets about the same ink area, so a square
// crest and a long wordmark carry equal weight on the wall. Capped at 200px wide and 88px tall.
const LOGO_AREA = 9000;
// Phones (--logo-w-m, read only below 1024): the same equal-area model, sized for the 2-column
// credits grid's 175x80 cells (SPEC §6.1 row 05). Capped at 139px wide and 52px tall.
const LOGO_AREA_M = 4200;
function logoStyle(w: number, h: number): CSSProperties {
  const ratio = w / h;
  const width = Math.min(Math.sqrt(LOGO_AREA * ratio), 200, 88 * ratio);
  const widthM = Math.min(Math.sqrt(LOGO_AREA_M * ratio), 139, 52 * ratio);
  return { '--logo-w': `${Math.round(width)}px`, '--logo-w-m': `${Math.round(widthM)}px` } as CSSProperties;
}

// How many items stay visible below 1024 until "Show all" (SPEC §6.1 rows 05 and 06).
const CLIENTS_LIMIT: ShowAllLimit = { phone: 16, tablet: 24 };
const PRESS_LIMIT: ShowAllLimit = { phone: 3, tablet: 4 };

const pressItems = [...HOME.press].sort((a, b) => pressDateKey(b.date) - pressDateKey(a.date));
// Select Clients now runs before Press, so the two sections trade section numbers and the
// counters still read 01…07 down the page.
const clientsSection = { ...clients, n: press.n };
const pressSection = { ...press, n: clients.n };

export default function HomePage() {
  const { hero } = HOME_COPY;
  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, pressLd]} />
      <SiteHeader transparentOverHero />
      <main>
        <section data-screen-label="Hero" className={styles.hero}>
          {/* The largest-contentful paint on the home page: sized so the hero reserves its space,
              and fetched at high priority rather than competing with the logo grid below. */}
          <Picture
            name="hero-poster"
            src={hero.posterSrc}
            alt={hero.posterAlt}
            width={1920}
            height={1080}
            fetchPriority="high"
            className={styles.heroLayer}
            phoneSizes="100vw"
            tabletSizes="100vw"
          />
          <HeroVideo src={hero.videoSrc} webmSrc={hero.videoWebmSrc} className={`${styles.heroLayer} ${styles.heroVideo}`} />
          <div aria-hidden="true" className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <div data-reveal="" className={styles.heroReveal}>
              <div>
                <h1 className={styles.heroTitle}>
                  {hero.h1Lines.map((line, i) => (
                    <Fragment key={line}>
                      {/* The space matters: a <br> alone yields no word boundary, so a crawler or
                          screen reader reads the h1 as "GreatEducation Companiesto". It collapses
                          against the break, so nothing moves on screen. */}
                      {i > 0 && <> <br /></>}
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
              {/* The accessible name starts with the visible text (WCAG 2.5.3); "Read More" alone failed link-text. */}
              <LinkButton href="/about" ariaLabel={`${HOME_COPY.promise.readMore} about EdCloud`}>
                {HOME_COPY.promise.readMore}
              </LinkButton>
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
                <Picture
                  name="conference-room"
                  src={HOME_COPY.deliverables.imgSrc}
                  alt={HOME_COPY.deliverables.imgAlt}
                  className={styles.photo}
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  phoneSizes="calc(100vw - 40px)"
                  tabletSizes="min(34em, calc(100vw - 64px))"
                />
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

        <figure className={styles.figure}>
          <Picture
            name="stairway"
            src={HOME_COPY.press.figureSrc}
            alt={HOME_COPY.press.figureAlt}
            className={styles.figureImg}
            width={1450}
            height={700}
            loading="lazy"
            decoding="async"
            phoneSizes="100vw"
            tabletSizes="100vw"
          />
        </figure>

        <SectionShell n={clientsSection.n} title={clientsSection.title} white>
          <ul id="clients-list" className={`${styles.logos} ${showAllList}`}>
            {HOME.logos.map((l, i) => (
              <li key={l.src} className={`${styles.logoTile} ${showAllItem(i, CLIENTS_LIMIT)}`}>
                <img
                  src={l.src}
                  alt={l.alt}
                  width={l.w}
                  height={l.h}
                  loading="lazy"
                  decoding="async"
                  className={styles.logo}
                  style={logoStyle(l.w, l.h)}
                />
              </li>
            ))}
          </ul>
          <ShowAll controls="clients-list" label="Show all clients" count={HOME.logos.length} limit={CLIENTS_LIMIT} />
        </SectionShell>

        <SectionShell n={pressSection.n} title={pressSection.title}>
          <ul id="press-list" className={`${styles.press} ${showAllList}`}>
            {pressItems.map((p, i) => (
              <li key={p.href} className={`${styles.pressRow} ${showAllItem(i, PRESS_LIMIT)}`}>
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
          <ShowAll
            controls="press-list"
            label="Show all press"
            count={pressItems.length}
            limit={PRESS_LIMIT}
            focusOnExpand="first-revealed"
          />
        </SectionShell>

        <SectionShell n={contact.n} title={contact.title} id="contact">
          <div className={styles.contact}>
            <div className={styles.contactPhotoWrap}>
              <Picture
                name="classroom-lecture"
                src={HOME_COPY.contact.imgSrc}
                alt={HOME_COPY.contact.imgAlt}
                className={styles.contactPhoto}
                width={980}
                height={653}
                loading="lazy"
                decoding="async"
                phoneSizes="100vw"
                tabletSizes="min(34em, calc(100vw - 64px))"
              />
            </div>
            <div className={styles.contactCard}>
              <h2 className={styles.contactTitle}>
                {HOME_COPY.contact.h2Lines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <> <br /></>}
                    {line}
                  </Fragment>
                ))}
              </h2>
              <ContactForm />
            </div>
          </div>
        </SectionShell>
        {/* Phones and tablets only: a floating jump to the form once the hero has scrolled away. */}
        <ContactPill />
      </main>
      <SiteFooter />
    </>
  );
}
