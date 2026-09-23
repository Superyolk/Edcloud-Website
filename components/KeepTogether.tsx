import { Fragment, type ReactNode } from 'react';

/**
 * Phrases that must never break across a line below 1024 (SPEC §18.2 rule 3): a hard hyphen is
 * always a break opportunity, and `hyphens: manual` cannot stop "K-12" splitting into "K-" / "12".
 * Dates and the conformance level are kept whole for the same reason: "September" / "3, 2025"
 * reads as a typesetting accident on a compliance page.
 */
const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
const KEEP = new RegExp(`(K-12|long-term|Level AA|${MONTH} \\d{1,2}, \\d{4})`, 'g');

/**
 * Returns `text` with each protected phrase wrapped in `<span data-nowrap>`. The characters are
 * untouched, so the DOM text is identical (qa:content unwraps data-nowrap before comparing text
 * nodes). The span is only styled below 1024 (app/globals.css: an inline-block that moves to the
 * next line whole), so desktop line breaks are unchanged; qa:desktop-parity proves the pixels.
 * Text without a protected phrase comes back as the same string.
 */
export function keepTogether(text: string): ReactNode {
  const parts = text.split(KEEP);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} data-nowrap="">
        {part}
      </span>
    ) : (
      part && <Fragment key={i}>{part}</Fragment>
    ),
  );
}
