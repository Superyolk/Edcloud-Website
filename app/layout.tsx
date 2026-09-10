import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Instrument_Sans } from 'next/font/google';
import { SHARED } from '@/content/copy';
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
  icons: { icon: SHARED.markSrc },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body>{children}</body>
    </html>
  );
}
