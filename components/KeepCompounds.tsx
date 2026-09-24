'use client';

import type { ReactNode } from 'react';
import { MQ_MOBILE } from '@/app/breakpoints';
import { useHydrated, useMediaQuery } from './useMediaQuery';

/**
 * Hyphenated compounds ("non-text", "go-to-market", "sole-source") and a state + ZIP ("CA 94108")
 * glued in `<span data-nowrap>` below 1024, so a line never ends on "non-" or "sole-" (reads as
 * automatic hyphenation, SPEC §18.2 rule 3; Phase 4 R2-client-02, R2-designer-03) and the footer
 * never strands the ZIP (R2-client-03). Slashes stay free: a break after "/" reads as intended.
 * The site's dash is a spaced hyphen, so the word before it is glued to it ("GiveCampus -"): the
 * dash always ends a line and never starts one, where it read as a stray bullet (R3-client-02).
 * With `clauses`, the first two words after a semicolon are glued too, so a balanced outcome line
 * breaks at its semicolon, not inside "last / valued" (R3-client-03).
 *
 * Why a client component, when keepTogether() wraps "K-12" and dates on the server: any new
 * element inside desktop text moves the glyphs after it by a subpixel (a separate text fragment),
 * and desktop is pixel-frozen (qa:desktop-parity measured 21-199px per page with these spans in
 * the server markup). So the server and the hydration pass render the plain string, exactly the
 * old DOM, and only a hydrated page below 1024 swaps in the spans; the DOM text is identical
 * either way (qa:content unwraps data-nowrap). Before hydration a compound can still break at its
 * hyphen, as it always could.
 */
const DASH = String.raw`\S+ -(?= )`;
const COMPOUND = String.raw`(?:[A-Za-z0-9]+-)+[A-Za-z0-9]+|\b[A-Z]{2} \d{5}\b`;
const CLAUSE = String.raw`(?<=; )[^\s;]+ [^\s;]+`;
const GLUE = new RegExp(`(${DASH}|${COMPOUND})`);
const GLUE_CLAUSES = new RegExp(`(${DASH}|${CLAUSE}|${COMPOUND})`);

export default function KeepCompounds({ text, clauses = false }: { text: string; clauses?: boolean }): ReactNode {
  const hydrated = useHydrated();
  const mobile = useMediaQuery(MQ_MOBILE);
  if (!hydrated || !mobile) return text;
  const parts = text.split(clauses ? GLUE_CLAUSES : GLUE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} data-nowrap="">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
