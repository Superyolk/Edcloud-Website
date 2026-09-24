import { SHARED } from '@/content/copy';
import SiteHeaderClient from './SiteHeaderClient';

/**
 * The site header (SPEC §5.2, §5.3). A server wrapper: it picks the header's copy out of SHARED
 * and hands it to the client component as props, so the client bundle no longer carries the
 * whole of content/copy.ts (every page's copy, ~2 KB gz) just for a dozen strings. That made room
 * in the SPEC §9 JS budget for the Phase 4 R2 fixes on About and Services. Same DOM, same text.
 */
// The sheet foot reuses existing copy only: the header's Contact link and the footer's email and
// phone line. Nothing is typed here.
const HEADER_COPY = {
  wordmark: SHARED.wordmark,
  markSrc: SHARED.markSrc,
  markAlt: SHARED.markAlt,
  navLinks: SHARED.navLinks,
  mobileMenu: SHARED.mobileMenu,
  contact: SHARED.navLinks.find((l) => l.href === '#contact'),
  email: SHARED.footer.col1.find((r) => r.tag === 'a' && r.href?.startsWith('mailto:')),
  phone: SHARED.footer.col1.find((r) => r.tag === 'span' && r.text.startsWith('Tel')),
};

export type HeaderCopy = typeof HEADER_COPY;

export default function SiteHeader({ transparentOverHero = false }: { transparentOverHero?: boolean }) {
  return <SiteHeaderClient transparentOverHero={transparentOverHero} copy={HEADER_COPY} />;
}
