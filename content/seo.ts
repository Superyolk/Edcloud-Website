// Site-wide SEO constants and the structured data (schema.org JSON-LD) the pages emit.
// Everything here restates facts that are already published on the site — name, address, phone,
// email, the six services, the four client results — so the markup and the page never disagree.

import { HOME, SERVICES } from '@/content/content';

export const SITE_URL = 'https://www.edcloud.org';

export const ORG = {
  name: 'EdCloud Venture Partners',
  legalName: 'EdCloud, LLC',
  alternateName: 'EdCloud',
  email: 'info@edcloud.org',
  telephone: '+1-510-306-2403',
  street: '28 Geary St. Ste 650',
  city: 'San Francisco',
  region: 'CA',
  postalCode: '94108',
  country: 'US',
  linkedIn: 'https://www.linkedin.com/company/edcloud-llc',
  founder: 'Aaron Sokol',
  founderTitle: 'Managing Partner',
  /** One sentence, matching the hero: what the firm does, for whom. */
  description:
    'EdCloud Venture Partners is a San Francisco growth consultancy that helps post-traction education technology companies scale from early traction to national adoption across K-12 and higher education.',
} as const;

/** 1200x630 card used by search results, social previews and chat-app unfurls. */
export const OG_IMAGE = {
  url: '/images/og-edcloud.jpg',
  width: 1200,
  height: 630,
  alt: 'EdCloud Venture Partners — growth consulting for education technology',
} as const;

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: ORG.street,
  addressLocality: ORG.city,
  addressRegion: ORG.region,
  postalCode: ORG.postalCode,
  addressCountry: ORG.country,
};

/** The firm itself. Referenced by @id from every other node so the graph stays connected. */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organization`,
  name: ORG.name,
  legalName: ORG.legalName,
  alternateName: ORG.alternateName,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/edcloud-mark.png`,
  image: `${SITE_URL}${OG_IMAGE.url}`,
  description: ORG.description,
  email: ORG.email,
  telephone: ORG.telephone,
  faxNumber: ORG.telephone,
  address: postalAddress,
  sameAs: [ORG.linkedIn],
  areaServed: { '@type': 'Country', name: 'United States' },
  founder: { '@type': 'Person', name: ORG.founder, jobTitle: ORG.founderTitle },
  knowsAbout: [
    'Education technology go-to-market strategy',
    'K-12 sales',
    'Higher education sales',
    'Edtech pricing and packaging',
    'Public sector procurement',
    'Channel partnerships',
    'Revenue operations',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: ORG.email,
    telephone: ORG.telephone,
    areaServed: 'US',
    availableLanguage: 'English',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 2026" -> "2026-09". Schema.org accepts a year-month Date; an unparseable one is omitted. */
function isoMonth(date: string): string | undefined {
  const [mon, yr] = date.trim().split(/\s+/);
  const m = MONTHS.indexOf(mon);
  return m < 0 || !/^\d{4}$/.test(yr) ? undefined : `${yr}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * The press list on the home page, made machine-readable.
 *
 * Deliberately an ItemList of NewsArticle rather than `subjectOf` on the organization: these
 * stories are about EdCloud's clients, reported by third parties, not about EdCloud itself.
 * Claiming otherwise would misstate what the page shows. Headline, publisher, date and URL are
 * taken from the same entries the page renders.
 */
export const pressLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Press coverage of EdCloud clients',
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  numberOfItems: HOME.press.length,
  itemListElement: [...HOME.press]
    .sort((a, b) => (isoMonth(b.date) ?? '').localeCompare(isoMonth(a.date) ?? ''))
    .map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'NewsArticle',
        headline: p.title,
        url: p.href,
        datePublished: isoMonth(p.date),
        publisher: { '@type': 'Organization', name: p.source },
      },
    })),
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: ORG.name,
  description: ORG.description,
  inLanguage: 'en-US',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

/** The six engagements, in the order the Services page lists them. */
export const servicesLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'EdCloud services',
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: SERVICES.services.length,
  itemListElement: SERVICES.services.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: s.title,
      description: s.pitch,
      serviceType: s.title,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'United States' },
      audience: { '@type': 'BusinessAudience', audienceType: s.fit },
    },
  })),
};

export function personLd(bio: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/about#aaron-sokol`,
    name: ORG.founder,
    jobTitle: ORG.founderTitle,
    description: bio,
    email: ORG.email,
    worksFor: { '@id': `${SITE_URL}/#organization` },
    address: { '@type': 'PostalAddress', addressLocality: ORG.city, addressRegion: ORG.region, addressCountry: ORG.country },
  };
}

/** Trail for a second-level page, e.g. breadcrumbLd('About', '/about'). */
export function breadcrumbLd(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}

/**
 * Meta descriptions written for search results: under ~160 characters so Google and Bing show them
 * whole. The longer descriptions in content/copy.ts came from the design reference and are kept
 * there untouched; these are what the pages actually publish.
 */
export const SEO_DESCRIPTION = {
  home: 'EdCloud helps post-traction edtech companies scale nationally across K-12 and higher education. Trusted by Handshake, Clever, Outschool and Wayfinder.',
  about: 'Operator-first growth consulting for education technology: our mission, how we think about scale in K-12 and higher ed, and Managing Partner Aaron Sokol.',
  services:
    'Six edtech growth engagements - GTM strategy, sales engine, pricing, partnerships, procurement and RevOps - each with what you get and a typical timeline.',
} as const;

/**
 * Complete per-page metadata. Next replaces (never merges) a page's `openGraph` block, so the
 * image, type and siteName have to be repeated here or social previews lose their card.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website' as const,
      siteName: ORG.name,
      locale: 'en_US',
      title,
      description,
      url: path,
      images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
    },
    twitter: { card: 'summary_large_image' as const, title, description, images: [OG_IMAGE.url] },
  };
}
