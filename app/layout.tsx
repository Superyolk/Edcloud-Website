import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { OG_IMAGE, ORG, SITE_URL } from '@/content/seo';
import './fonts.css';
import './tokens.css';
import './globals.css';

/**
 * Tints the browser chrome on mobile to the site's ink, so the address bar stops being a bright
 * strip above a dark hero.
 *
 * viewport-fit=cover lets the full-bleed heroes run under a notch or home indicator; everything
 * fixed or edge-to-edge pads itself with env(safe-area-inset-*) (SPEC §4.3). Desktop browsers
 * ignore it.
 */
export const viewport: Viewport = {
  themeColor: '#1B2431',
  viewportFit: 'cover',
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
    // Google Search shows the largest square rel=icon it can crawl on the home page; 192px is a
    // multiple of 48 as it recommends. The .ico carries the small sizes browsers ask for.
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
    ],
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
  // next/font used to inject this. The latin face is needed for the first paint, so it is fetched
  // alongside the stylesheet rather than after it. The extended-Latin face is left to the
  // unicode-range rule, which only pulls it if a page needs those glyphs. Same-origin, so the CSP
  // stays 'self' (SPEC §8.5, G14). ReactDOM.preload rather than a literal <link> in <head>: React
  // hoisted the literal link and also kept it, so the head carried the preload twice.
  preload('/fonts/instrument-sans-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
