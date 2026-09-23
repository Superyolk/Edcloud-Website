import type { ImgHTMLAttributes } from 'react';
import { MQ_PHONE, MQ_TABLET } from '@/app/breakpoints';
import { CROPS, type Crop, type CropName } from './crops.generated';
import ui from './ui.module.css';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'sizes' | 'children'> & {
  /** A crop set from components/crops.generated.ts (scripts/images/crops.json). */
  name: CropName;
  /** The existing desktop image, unchanged: >= 1024 matches no <source> and decodes exactly this. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * `sizes` for the phone crop (< 600), e.g. '100vw' for a full-bleed band or
   * 'calc(100vw - 40px)' inside the gutters. Any media condition in it must be an
   * app/breakpoints.ts literal.
   */
  phoneSizes: string;
  /** `sizes` for the tablet crop (600-1023), e.g. '100vw' or `${MQ_TABLET_WIDE} 240px, 128px`. */
  tabletSizes: string;
};

const srcSet = (c: Crop) => c.files.map((f) => `${f.url} ${f.w}w`).join(', ');
const largest = (c: Crop) => c.files[c.files.length - 1];

/**
 * An existing <img> with art-directed mobile crops in front of it (SPEC §5.7, §8.2).
 *
 * Phones and tablets pick a <source>; at >= 1024 neither media query matches, so the browser
 * falls through to the <img> with exactly today's src, size and class, and desktop decodes the
 * same bytes into the same box. The <picture> is display: contents at every width, so it adds no
 * box around the image either. Each <source> carries its crop's width and height, so the phone
 * and tablet boxes are reserved before the file arrives (no layout shift).
 *
 * Everything except name/phoneSizes/tabletSizes passes straight to the <img>: alt, className,
 * loading="lazy", decoding="async", fetchPriority="high" (the LCP hero only), style, etc.
 */
export default function Picture({ name, phoneSizes, tabletSizes, alt, ...img }: Props) {
  const { phone, tablet } = CROPS[name];
  const p = largest(phone);
  const t = largest(tablet);
  return (
    <picture className={ui.contents}>
      <source media={MQ_PHONE} srcSet={srcSet(phone)} sizes={phoneSizes} width={p.w} height={p.h} />
      <source media={MQ_TABLET} srcSet={srcSet(tablet)} sizes={tabletSizes} width={t.w} height={t.h} />
      {/* The fallback: today's <img>, byte for byte. */}
      <img alt={alt} {...img} />
    </picture>
  );
}
