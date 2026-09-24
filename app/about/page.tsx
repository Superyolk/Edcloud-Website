import type { Metadata } from 'next';
import { ABOUT_COPY } from '@/content/copy';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SectionShell from '@/components/SectionShell';
import Picture from '@/components/Picture';
import Disclosure, { DisclosureHeading, DisclosurePanel } from '@/components/Disclosure';
import { MQ_PHONE } from '@/app/breakpoints';
import JsonLd from '@/components/JsonLd';
import { keepTogether } from '@/components/KeepTogether';
import { breadcrumbLd, pageMeta, personLd, SEO_DESCRIPTION } from '@/content/seo';
import styles from './about.module.css';

export const metadata: Metadata = pageMeta({
  title: ABOUT_COPY.meta.title,
  description: SEO_DESCRIPTION.about,
  path: '/about',
});

const [mission, partner, numbers] = ABOUT_COPY.titles;

type MissionBlock = (typeof ABOUT_COPY.mission)[number];

/** One Mission & History block, exactly as the page has always rendered it. */
function renderBlock(block: MissionBlock, key: number) {
  switch (block.tag) {
    case 'h2':
      return (
        <h2 key={key} className={styles.h2}>
          {block.text}
        </h2>
      );
    case 'ul':
      return (
        <ul key={key} className={styles.list}>
          {block.items.map((item) => (
            <li key={item.text}>
              {'lead' in item && (
                <>
                  <strong className={styles.strong}>{item.lead}</strong>{' '}
                </>
              )}
              {keepTogether(item.text)}
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p key={key} className={styles.p}>
          {'text' in block ? keepTogether(block.text) : null}
        </p>
      );
  }
}

/*
 * The flat mission array grouped by h3 into chapters (SPEC §6.2, G3): the blocks before the first
 * h3 are the intro; each h3 then owns the blocks up to the next one. On phones every chapter is a
 * heading-button disclosure, so the eight collapsed titles read as the section's contents. The
 * first two chapters ("Our mission", "How we think about scale") are the firm's thesis and start
 * open. At >= 1024 both new wrappers are display: contents, so .mission lays out exactly the
 * h2 / p / h3 / ul children it always had.
 */
const THESIS_CHAPTERS = 2;
const missionIntro: { block: MissionBlock; i: number }[] = [];
const chapters: { heading: string; i: number; body: { block: MissionBlock; i: number }[] }[] = [];
ABOUT_COPY.mission.forEach((block, i) => {
  if (block.tag === 'h3') chapters.push({ heading: block.text, i, body: [] });
  else if (chapters.length) chapters[chapters.length - 1].body.push({ block, i });
  else missionIntro.push({ block, i });
});

export default function AboutPage() {
  const { hero } = ABOUT_COPY;
  return (
    <>
      <JsonLd data={[personLd(ABOUT_COPY.partner.paragraphs[0]), breadcrumbLd('About', '/about')]} />
      <SiteHeader transparentOverHero />
      <main>
        <section data-screen-label="About hero" className={styles.hero}>
          <Picture
            name="hero-about"
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
          </div>
        </section>

        <SectionShell n={mission.n} title={mission.title}>
          <div className={styles.mission}>
            {missionIntro.map(({ block, i }) => renderBlock(block, i))}
            {chapters.map((ch, c) => (
              <Disclosure key={ch.i} className={styles.chapter} collapseQuery={MQ_PHONE} defaultOpen={c < THESIS_CHAPTERS} contentsOnDesktop>
                <DisclosureHeading as="h3" className={styles.h3}>
                  {ch.heading}
                </DisclosureHeading>
                {/* No role="region": eight chapter panels would flood the landmark list (APG
                    limits region panels to about six), and the button's aria-controls already
                    ties each panel to its heading. The landmarks match the desktop's. */}
                <DisclosurePanel className={styles.chapterBody} contentsOnDesktop region={false}>
                  {ch.body.map(({ block, i }) => renderBlock(block, i))}
                </DisclosurePanel>
              </Disclosure>
            ))}
          </div>
        </SectionShell>

        <SectionShell n={partner.n} title={partner.title} white>
          <div className={styles.partner}>
            <Picture
              name="aaron-sokol"
              src={ABOUT_COPY.partner.imgSrc}
              alt={ABOUT_COPY.partner.imgAlt}
              className={styles.headshot}
              width={486}
              height={450}
              loading="lazy"
              decoding="async"
              phoneSizes="112px"
              tabletSizes="128px"
            />
            <div className={styles.partnerText}>
              <h2 className={styles.h2}>{ABOUT_COPY.partner.h2}</h2>
              {ABOUT_COPY.partner.paragraphs.map((text, i) => (
                <p key={text} className={i === 0 ? styles.p : styles.partnerP}>
                  {keepTogether(text)}
                </p>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* The reference lays the stat cards out directly in the content row (no 72px offset cell). */}
        <SectionShell n={numbers.n} title={numbers.title} white offset={false} bodyClassName={styles.numbers}>
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
