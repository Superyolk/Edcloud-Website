import type { ReactNode } from 'react';
import KeepCompounds from './KeepCompounds';

/**
 * Phrases that must never break across a line below 1024 (SPEC §18.2 rule 3): a hard hyphen is
 * always a break opportunity, and `hyphens: manual` cannot stop "K-12" splitting into "K-" / "12".
 * Dates and the conformance level are kept whole for the same reason: "September" / "3, 2025"
 * reads as a typesetting accident on a compliance page. These spans are in the server markup, so
 * they hold from the first paint; qa:desktop-parity has proven each one leaves desktop unchanged.
 * Every other hyphenated compound is glued after hydration, below 1024 only (KeepCompounds.tsx
 * says why), in the text between these phrases.
 */
const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
const KEEP = new RegExp(`(K-12|long-term|Level AA|${MONTH} \\d{1,2}, \\d{4})`, 'g');

/**
 * Returns `text` with each protected phrase wrapped in `<span data-nowrap>`, and the rest in
 * <KeepCompounds>. The characters are untouched, so the DOM text is identical (qa:content unwraps
 * data-nowrap before comparing text nodes). The span is only styled below 1024 (app/globals.css:
 * white-space: nowrap on the inline span, so it moves to the next line whole and find-in-page still
 * matches across it), so desktop line breaks are unchanged; qa:desktop-parity proves the pixels.
 * The server markup is the same text nodes as before. `clauses` is passed on to KeepCompounds.
 */
export function keepTogether(text: string, { clauses = false }: { clauses?: boolean } = {}): ReactNode {
  const parts = text.split(KEEP);
  if (parts.length === 1) return <KeepCompounds text={text} clauses={clauses} />;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} data-nowrap="">
        {part}
      </span>
    ) : (
      part && <KeepCompounds key={i} text={part} clauses={clauses} />
    ),
  );
}
