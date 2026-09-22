import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SHARED } from '@/content/copy';
import { OG_IMAGE, ORG, SITE_URL } from '@/content/seo';
import './fonts.css';
import './tokens.css';
import './globals.css';

/**
 * Tints the browser chrome on mobile to the site's ink, so the address bar stops being a bright
 * strip above a dark hero.
 */
export const viewport: Viewport = {
  themeColor: '#1B2431',
};

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
  icons: {
    icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: SHARED.markSrc, type: 'image/png', sizes: '100x100' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
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
    <html lang="en">
      <head>
        {/* next/font used to inject this. The latin face is needed for the first paint, so it is
            fetched alongside the stylesheet rather than after it. The extended-Latin face is left
            to the unicode-range rule, which only pulls it if a page needs those glyphs. */}
        <link
          rel="preload"
          href="/fonts/instrument-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
