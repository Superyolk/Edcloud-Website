/**
 * qa:breakpoints — one breakpoint scale (docs/mobile/SPEC.md §3). No browser, no dependencies.
 *
 * Scans every app/**\/*.css and components/**\/*.css @media prelude, and every useMediaQuery(…) /
 * matchMedia(…) call and JSX `media="…"` attribute in app/ and components/ .ts/.tsx files. A
 * query may use width/height media features only as one of the literals below, copied exactly;
 * feature queries (hover, pointer, prefers-*, scripting, orientation, …) combine freely.
 *
 * JS callers are expected to pass the app/breakpoints.ts constants: an MQ_* identifier passes, a
 * string literal must satisfy the same rule as CSS, and anything else is reported as unverifiable.
 *
 * One exemption: the pre-existing `@media (max-width: 1087px)` in app/home.module.css, which
 * paints at 1024-1087 (frozen desktop territory) and is kept byte-for-byte.
 *
 * Output: scripts/qa/output/breakpoints.json. Exit 1 on any violation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR, ROOT, writeJson } from './lib.mjs';

/** SPEC §3 literals, plus MQ_DESKTOP for the §10.3(b) display:contents neutralisers only. */
const LITERALS = {
  MQ_MOBILE: '(max-width: 1023.98px)',
  MQ_PHONE: '(max-width: 599.98px)',
  MQ_XS: '(max-width: 359.98px)',
  MQ_TABLET: '(min-width: 600px) and (max-width: 1023.98px)',
  MQ_TABLET_WIDE: '(min-width: 820px) and (max-width: 1023.98px)',
  MQ_SHORT: '(max-width: 1023.98px) and (orientation: landscape) and (max-height: 500px)',
  MQ_DESKTOP: '(min-width: 1024px)',
};
const EXEMPT = [{ file: 'app/home.module.css', query: '(max-width: 1087px)' }];

// width, height, device-*, aspect-ratio and the range forms all count as size features.
const SIZE_FEATURE = /(^|[\s(-])(min-|max-)?(device-)?(width|height|aspect-ratio)\b|[<>=]/;

const norm = (s) => s.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*:\s*/g, ': ').trim();
const features = (q) => (q.match(/\([^()]*\)/g) ?? []).map(norm);
const isSize = (f) => SIZE_FEATURE.test(f.slice(1, -1));

const LITERAL_FEATURES = Object.entries(LITERALS).map(([name, q]) => ({ name, all: features(q) }));

/** Checks one query (no top-level commas). Returns null when fine, else a reason. */
function checkQuery(query) {
  const fs_ = features(query);
  const size = fs_.filter(isSize);
  if (!size.length) {
    // A bare size comparison outside parentheses cannot happen in valid CSS, but range syntax can
    // hide inside one: "(width < 1024px)" is caught by isSize via the [<>=] test.
    return null;
  }
  for (const lit of LITERAL_FEATURES) {
    const litSize = lit.all.filter(isSize);
    const sameSize = litSize.length === size.length && litSize.every((f) => size.includes(f));
    const hasRest = lit.all.every((f) => fs_.includes(f));
    if (sameSize && hasRest) return null;
  }
  return `size features ${size.join(' and ')} are not one of the SPEC §3 literals`;
}

/** Splits a media query list on top-level commas. */
function splitList(prelude) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of prelude) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function walk(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, acc);
    else if (exts.some((x) => e.name.endsWith(x))) acc.push(p);
  }
  return acc;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

const violations = [];
let scanned = 0;
let queries = 0;

// CSS
for (const file of [...walk(path.join(ROOT, 'app'), ['.css']), ...walk(path.join(ROOT, 'components'), ['.css'])]) {
  scanned++;
  const raw = fs.readFileSync(file, 'utf8');
  // Blank out comments but keep offsets, so line numbers stay right.
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  for (const m of src.matchAll(/@media\s+([^{;]+)[{;]/g)) {
    const prelude = norm(m[1]);
    for (const q of splitList(prelude)) {
      queries++;
      if (EXEMPT.some((x) => x.file === rel(file) && norm(x.query) === q)) continue;
      const reason = checkQuery(q);
      if (reason) violations.push({ file: rel(file), line: lineOf(src, m.index), query: q, reason });
    }
  }
}

// JS/TS: useMediaQuery(…), matchMedia(…) and media="…" / media={'…'}
for (const file of [...walk(path.join(ROOT, 'app'), ['.ts', '.tsx']), ...walk(path.join(ROOT, 'components'), ['.ts', '.tsx'])]) {
  scanned++;
  const src = fs.readFileSync(file, 'utf8');
  const calls = [
    // A string literal is captured whole (it contains parentheses); anything else up to , or ).
    // `function useMediaQuery(` is the hook's own declaration, not a call.
    ...[...src.matchAll(/(?<!function )\b(useMediaQuery|matchMedia)\(\s*('[^']*'|"[^"]*"|`[^`]*`|[^,)]+)/g)].map((m) => ({
      index: m.index,
      what: m[1],
      arg: m[2].trim(),
    })),
    ...[...src.matchAll(/\bmedia=\{?\s*(['"`][^'"`]*['"`]|[A-Za-z_$][\w$]*)\s*\}?/g)].map((m) => ({ index: m.index, what: 'media', arg: m[1].trim() })),
  ];
  for (const c of calls) {
    // The hook's own definition and matchMedia(query) inside it pass a parameter through.
    if (rel(file) === 'components/useMediaQuery.ts' && c.arg === 'query') continue;
    queries++;
    const line = lineOf(src, c.index);
    if (/^MQ_[A-Z_]+$/.test(c.arg)) {
      if (!(c.arg in LITERALS)) violations.push({ file: rel(file), line, query: c.arg, reason: `${c.arg} is not exported by app/breakpoints.ts` });
      continue;
    }
    const lit = c.arg.match(/^(['"`])(.*)\1$/);
    if (!lit) {
      violations.push({ file: rel(file), line, query: c.arg, reason: `${c.what} argument is not an MQ_* constant or a string literal, so it cannot be checked` });
      continue;
    }
    for (const q of splitList(norm(lit[2]))) {
      const reason = checkQuery(q);
      if (reason) violations.push({ file: rel(file), line, query: q, reason });
    }
  }
}

writeJson(path.join(OUT_DIR, 'breakpoints.json'), { scanned, queries, violations });
for (const v of violations) console.log(`[qa] breakpoints FAIL ${v.file}:${v.line}  ${v.query}  — ${v.reason}`);
console.log(`[qa] breakpoints: ${scanned} files, ${queries} queries, ${violations.length} violation(s)`);
process.exitCode = violations.length ? 1 : 0;
