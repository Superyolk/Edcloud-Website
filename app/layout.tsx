import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Instrument_Sans } from 'next/font/google';
import { SHARED } from '@/content/copy';
import { OG_IMAGE, ORG, SITE_URL } from '@/content/seo';
import './tokens.css';
import './globals.css';

// One family. 400 and 600 carry the design; 500 is used by the Services proof strip and results
// table header in the reference, so it is loaded too rather than being synthesised.
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-instrument',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  // Makes every relative URL below (canonicals, OG images) absolute in the rendered HTML.
  metadataBase: new URL(SITE_URL),
  title: { default: 'EdCloud Venture Partners | Growth Consulting', template: '%s' },
  description: ORG.description,
  applicationName: ORG.name,
  authors: [{ name: ORG.name, url: `${SITE_URL}/` }],
  creator: ORG.name,
  publisher: ORG.legalName,
  category: 'Business',
  keywords: [
    'education technology consulting',
    'edtech go-to-market',
    'K-12 sales strategy',
    'higher education sales',
    'edtech pricing and packaging',
    'school district procurement',
    'edtech revenue operations',
    'growth consulting',
  ],
  icons: { icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: SHARED.markSrc, type: 'image/png' }] },
  openGraph: {
    type: 'website',
    siteName: ORG.name,
    locale: 'en_US',
    url: `${SITE_URL}/`,
    images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
