/**
 * qa:content — copy freeze. For every page it extracts, from the hydrated DOM at 1440 and 390:
 *
 *   segments   every non-empty text node, whitespace-normalized (hidden-but-in-DOM text included;
 *              <script>/<style> excluded) — compared as a MULTISET, so reordering is fine
 *   words      the same text split into word tokens — multiset
 *   hrefs      every a[href] (raw attribute) — multiset
 *   alts       every img[alt] — multiset
 *   jsonLd     every application/ld+json body — exact
 *   meta       <title>, meta name/property/http-equiv, link rel=canonical/icon/etc. — exact
 *   text       full normalized body text — informational only (ordering may legitimately change)
 *
 * plus /llms.txt, /sitemap.xml, /robots.txt bodies — exact bytes.
 *
 * Snapshot: scripts/qa/content-snapshot/ (committed). QA_UPDATE_CONTENT=1 (or `-- --update`) rewrites it.
 * Rules: anything REMOVED from a multiset fails. Anything ADDED fails unless it is listed in
 * scripts/qa/content-allowlist.json under its category ("segments" | "hrefs" | "alts" | "words"),
 * which is where reviewed UI chrome (e.g. a "Show all press" button label) goes. Every added string
 * is printed either way so reviewers can see it. Any jsonLd/meta/file difference fails.
 *
 * The desktop (1440) and mobile (390) DOMs are both snapshotted, since markup may differ by width.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR, OUT_DIR, PAGES, QA_DIR, contextOptions, main, pageUrl, settlePage, startTarget, writeJson } from './lib.mjs';

const VIEWPORTS = [
  { w: 1440, h: 900, kind: 'desktop' },
  { w: 390, h: 844, kind: 'phone' },
];
const FILES = ['llms.txt', 'sitemap.xml', 'robots.txt'];
const MULTISETS = ['segments', 'words', 'hrefs', 'alts'];
const ALLOWLIST_FILE = path.join(QA_DIR, 'content-allowlist.json');

function extract() {
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const skip = new Set(['SCRIPT', 'STYLE', 'TEMPLATE']);
  const segments = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement && skip.has(n.parentElement.tagName)) continue;
    const t = norm(n.textContent || '');
    if (t) segments.push(t);
  }
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('script, style, template').forEach((e) => e.remove());
  const text = norm(clone.textContent || '');
  const meta = {
    lang: document.documentElement.getAttribute('lang'),
    title: document.title,
    meta: Array.from(document.head.querySelectorAll('meta'))
      .map((m) => {
        const key = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv') || (m.getAttribute('charset') ? 'charset' : '');
        return `${key}=${m.getAttribute('content') ?? m.getAttribute('charset') ?? ''}${m.getAttribute('media') ? ` [media=${m.getAttribute('media')}]` : ''}`;
      })
      .sort(),
    links: Array.from(document.head.querySelectorAll('link[rel]'))
      .filter((l) => !/stylesheet|preload|modulepreload|prefetch|dns-prefetch|preconnect/.test(l.getAttribute('rel') || ''))
      .map((l) => `${l.getAttribute('rel')} ${l.getAttribute('href')}${l.getAttribute('sizes') ? ` ${l.getAttribute('sizes')}` : ''}${l.getAttribute('type') ? ` ${l.getAttribute('type')}` : ''}`)
      .sort(),
  };
  return {
    segments: segments.slice().sort(),
    words: text.split(' ').filter(Boolean).sort(),
    hrefs: Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')).sort(),
    alts: Array.from(document.querySelectorAll('img[alt]')).map((i) => i.getAttribute('alt')).sort(),
    jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
    meta,
    text,
  };
}

/** a - b as multisets. */
function minus(a, b) {
  const counts = new Map();
  for (const x of b) counts.set(x, (counts.get(x) ?? 0) + 1);
  const out = [];
  for (const x of a) {
    const c = counts.get(x) ?? 0;
    if (c > 0) counts.set(x, c - 1);
    else out.push(x);
  }
  return out;
}

const snapFile = (slug, v) => path.join(CONTENT_DIR, `${slug}.${v.w}.json`);

main(async () => {
  const target = await startTarget();
  const update = process.env.QA_UPDATE_CONTENT === '1' || process.argv.includes('--update');
  const current = {};
  const files = {};
  const browser = await chromium.launch();
  try {
    for (const v of VIEWPORTS) {
      const context = await browser.newContext(contextOptions(v));
      for (const p of PAGES) {
        const page = await context.newPage();
        await settlePage(page, pageUrl(target.base, p), { freeze: false });
        current[`${p.slug}.${v.w}`] = { page: p.slug, viewport: v, data: await page.evaluate(extract) };
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  try {
    for (const f of FILES) {
      const res = await fetch(`${target.base}/${f}`);
      files[f] = res.ok ? await res.text() : `HTTP ${res.status}`;
    }
  } finally {
    await target.close();
  }

  if (update) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    for (const { page, viewport, data } of Object.values(current)) writeJson(snapFile(page, viewport), data);
    for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(CONTENT_DIR, f), body);
    console.log(`[qa] content snapshot rewritten in ${CONTENT_DIR}`);
    return 0;
  }

  const allow = fs.existsSync(ALLOWLIST_FILE) ? JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf8')) : {};
  const report = { base: target.base, pages: {}, files: {}, failures: 0 };
  for (const { page, viewport, data } of Object.values(current)) {
    const key = `${page}.${viewport.w}`;
    const sf = snapFile(page, viewport);
    if (!fs.existsSync(sf)) {
      report.pages[key] = { error: 'no snapshot (run with QA_UPDATE_CONTENT=1)' };
      report.failures++;
      continue;
    }
    const snap = JSON.parse(fs.readFileSync(sf, 'utf8'));
    const r = { removed: {}, added: {}, addedNotAllowed: {}, exact: {} };
    for (const k of MULTISETS) {
      const removed = minus(snap[k], data[k]);
      const added = minus(data[k], snap[k]);
      const allowed = allow[k] ?? [];
      const notAllowed = added.filter((x) => !allowed.includes(x));
      if (removed.length) r.removed[k] = removed;
      if (added.length) r.added[k] = added;
      if (notAllowed.length) r.addedNotAllowed[k] = notAllowed;
      // Words from allow-listed segments are allowed too.
      if (k === 'words' && notAllowed.length) {
        const allowedWords = (allow.segments ?? []).flatMap((s) => s.split(' '));
        const rest = notAllowed.filter((w) => !allowedWords.includes(w));
        if (rest.length) r.addedNotAllowed.words = rest;
        else delete r.addedNotAllowed.words;
      }
    }
    r.exact.jsonLd = JSON.stringify(snap.jsonLd) === JSON.stringify(data.jsonLd);
    r.exact.meta = JSON.stringify(snap.meta) === JSON.stringify(data.meta);
    r.exact.textByteIdentical = snap.text === data.text; // informational
    const fail = Object.keys(r.removed).length + Object.keys(r.addedNotAllowed).length + (r.exact.jsonLd ? 0 : 1) + (r.exact.meta ? 0 : 1);
    r.status = fail ? 'FAIL' : 'PASS';
    report.failures += fail ? 1 : 0;
    report.pages[key] = r;
    console.log(
      `[qa] content ${r.status} ${key}: removed ${JSON.stringify(Object.fromEntries(Object.entries(r.removed).map(([k, v]) => [k, v.length])))}, ` +
        `added ${JSON.stringify(Object.fromEntries(Object.entries(r.added).map(([k, v]) => [k, v.length])))}, jsonLd ${r.exact.jsonLd ? 'same' : 'CHANGED'}, ` +
        `meta ${r.exact.meta ? 'same' : 'CHANGED'}, body text ${r.exact.textByteIdentical ? 'byte-identical' : 'reordered/changed'}`,
    );
    for (const [k, v] of Object.entries(r.added)) for (const s of v) console.log(`      + ${k}: ${JSON.stringify(s)}${(allow[k] ?? []).includes(s) ? ' (allow-listed)' : ''}`);
    for (const [k, v] of Object.entries(r.removed)) for (const s of v) console.log(`      - ${k}: ${JSON.stringify(s)}`);
  }
  for (const [f, body] of Object.entries(files)) {
    const sf = path.join(CONTENT_DIR, f);
    const same = fs.existsSync(sf) && fs.readFileSync(sf, 'utf8') === body;
    report.files[f] = same ? 'PASS' : 'FAIL';
    if (!same) report.failures++;
    console.log(`[qa] content ${same ? 'PASS' : 'FAIL'} /${f}`);
  }
  writeJson(path.join(OUT_DIR, 'content.json'), report);
  console.log(`[qa] content: ${report.failures} failure(s)`);
  return report.failures ? 1 : 0;
});
