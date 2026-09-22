/**
 * qa:mobile-lint — sweeps every page through every width 320..430 (1px steps, height 844) and
 * 600/700/768/800/820/900/1000/1023 (height 1024) and reports:
 *
 *   overflow        document scrollWidth > clientWidth, plus the elements whose right edge passes
 *                   the viewport (skipping ones clipped by an overflow-hidden ancestor)
 *   tapSize         visible a/button/input/select/textarea/summary/[role=button]/[tabindex] < 44x44
 *                   (links inside running text are reported with inline:true — WCAG 2.5.8 exempts them)
 *   tapSpacing      two such targets closer than 8px (and not nested / overlapping)
 *   textSize        rendered text < 13px
 *   bodyText        p/li/dd/td copy < 16px
 *   inputFont       input/select/textarea font-size < 16px (iOS zooms on focus)
 *   mediaDims       img/video without both width and height attributes
 *   safeArea        fixed/sticky elements touching a viewport edge with no safe-area-inset rule
 *
 * Findings are deduped per page by (check, selector) and keep the list of widths they occur at.
 * Output: scripts/qa/output/mobile-lint.json and mobile-lint.md.
 * Exit 1 if anything is found, unless QA_REPORT_ONLY=1.
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { OUT_DIR, PAGES, contextOptions, main, pageUrl, settlePage, startTarget, writeJson } from './lib.mjs';

const PHONE_WIDTHS = Array.from({ length: 111 }, (_, i) => 320 + i);
const TABLET_WIDTHS = [600, 700, 768, 800, 820, 900, 1000, 1023];
const SWEEP = [...PHONE_WIDTHS.map((w) => ({ w, h: 844 })), ...TABLET_WIDTHS.map((w) => ({ w, h: 1024 }))];
const CHECKS = ['overflow', 'tapSize', 'tapSpacing', 'textSize', 'bodyText', 'inputFont', 'mediaDims', 'safeArea'];

/** Runs in the page. Returns [{ check, selector, detail }]. */
function audit() {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const out = [];

  const selectorOf = (el) => {
    const parts = [];
    let node = el;
    for (let depth = 0; node && node.nodeType === 1 && depth < 3; depth++) {
      let s = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(`${s}#${node.id}`);
        break;
      }
      const cls = Array.from(node.classList).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s);
      if (node === document.body) break;
      node = node.parentElement;
    }
    return parts.join(' > ');
  };
  const visible = (el) => {
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false; // sr-only / clipped helpers
    const cs = getComputedStyle(el);
    if (cs.clipPath === 'inset(50%)' || cs.clip === 'rect(0px, 0px, 0px, 0px)') return false;
    return true;
  };
  const px = (v) => parseFloat(v) || 0;
  const r1 = (n) => Math.round(n * 10) / 10;

  // overflow
  const docW = document.documentElement.scrollWidth;
  if (docW > vw) out.push({ check: 'overflow', selector: 'document', detail: `scrollWidth ${docW} > ${vw}` });
  const clippedByAncestor = (el) => {
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const ox = getComputedStyle(a).overflowX;
      if (ox !== 'visible') return a.getBoundingClientRect().right <= vw + 0.5;
    }
    return false;
  };
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const r = el.getBoundingClientRect();
    if (r.right <= vw + 0.5 || r.width === 0 || r.height === 0) continue;
    if (['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName)) continue;
    if (!visible(el) || clippedByAncestor(el)) continue;
    out.push({ check: 'overflow', selector: selectorOf(el), detail: `right ${r1(r.right)} > ${vw}` });
  }

  // tap targets
  const targets = Array.from(
    document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])'),
  ).filter(visible);
  const rects = targets.map((el) => el.getBoundingClientRect());
  targets.forEach((el, i) => {
    const r = rects[i];
    if (r.width < 44 || r.height < 44) {
      const parent = el.parentElement;
      const inline =
        el.tagName === 'A' &&
        getComputedStyle(el).display === 'inline' &&
        !!parent &&
        (parent.textContent || '').trim().length > (el.textContent || '').trim().length + 20;
      out.push({ check: 'tapSize', selector: selectorOf(el), detail: `${r1(r.width)}x${r1(r.height)}`, inline });
    }
  });
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const a = rects[i];
      const b = rects[j];
      if (targets[i].contains(targets[j]) || targets[j].contains(targets[i])) continue;
      const dx = Math.max(0, b.left - a.right, a.left - b.right);
      const dy = Math.max(0, b.top - a.bottom, a.top - b.bottom);
      if (dx === 0 && dy === 0) continue; // overlapping boxes: a layout choice, not a spacing gap
      const gap = Math.max(dx, dy);
      if (gap < 8) {
        out.push({
          check: 'tapSpacing',
          selector: `${selectorOf(targets[i])}  ~  ${selectorOf(targets[j])}`,
          detail: `${r1(gap)}px`,
        });
      }
    }
  }

  // text sizes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent || !n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el) || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
    seen.add(el);
    if (!visible(el)) continue;
    const size = px(getComputedStyle(el).fontSize);
    if (size < 13) out.push({ check: 'textSize', selector: selectorOf(el), detail: `${size}px "${n.textContent.trim().slice(0, 40)}"` });
  }
  for (const el of Array.from(document.querySelectorAll('p, li, dd, td'))) {
    if (!visible(el) || !(el.textContent || '').trim()) continue;
    const size = px(getComputedStyle(el).fontSize);
    if (size < 16) out.push({ check: 'bodyText', selector: selectorOf(el), detail: `${size}px` });
  }
  for (const el of Array.from(document.querySelectorAll('input, select, textarea'))) {
    const type = (el.getAttribute('type') || '').toLowerCase();
    if (['hidden', 'checkbox', 'radio', 'submit', 'button', 'reset', 'image'].includes(type)) continue;
    if (!visible(el)) continue;
    const size = px(getComputedStyle(el).fontSize);
    if (size < 16) out.push({ check: 'inputFont', selector: selectorOf(el), detail: `${size}px` });
  }

  // media dimensions
  for (const el of Array.from(document.querySelectorAll('img, video'))) {
    if (!el.hasAttribute('width') || !el.hasAttribute('height')) {
      out.push({ check: 'mediaDims', selector: selectorOf(el), detail: `width=${el.getAttribute('width')} height=${el.getAttribute('height')}` });
    }
  }

  // safe areas
  const safeSelectors = [];
  const collect = (rules) => {
    for (const rule of Array.from(rules)) {
      if (rule.cssRules) collect(rule.cssRules);
      if (rule.selectorText && rule.cssText.includes('safe-area-inset')) safeSelectors.push(rule.selectorText);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collect(sheet.cssRules);
    } catch {
      /* cross-origin sheet */
    }
  }
  const safeMatch = (el) =>
    safeSelectors.some((s) => {
      try {
        return el.matches(s) || !!el.querySelector(s);
      } catch {
        return false;
      }
    });
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const pos = getComputedStyle(el).position;
    if (pos !== 'fixed' && pos !== 'sticky') continue;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const edges = [r.top <= 0 && 'top', r.bottom >= vh && 'bottom', r.left <= 0 && 'left', r.right >= vw && 'right'].filter(Boolean);
    if (edges.length && !safeMatch(el)) out.push({ check: 'safeArea', selector: selectorOf(el), detail: `${pos} at ${edges.join('/')}` });
  }
  return out;
}

function ranges(widths) {
  const w = [...new Set(widths)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < w.length; i++) {
    let j = i;
    while (j + 1 < w.length && w[j + 1] === w[j] + 1) j++;
    parts.push(i === j ? `${w[i]}` : `${w[i]}-${w[j]}`);
    i = j;
  }
  return parts.join(', ');
}

main(async () => {
  const target = await startTarget();
  const browser = await chromium.launch();
  const report = { generated: new Date().toISOString(), base: target.base, widths: SWEEP.map((s) => s.w), pages: {} };
  try {
    for (const p of PAGES) {
      const context = await browser.newContext(contextOptions({ w: 320, h: 844, kind: 'phone' }));
      const page = await context.newPage();
      await settlePage(page, pageUrl(target.base, p));
      const found = new Map();
      for (const s of SWEEP) {
        await page.setViewportSize({ width: s.w, height: s.h });
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        const perWidth = new Map();
        for (const f of await page.evaluate(audit)) {
          const key = `${f.check}|${f.selector}`;
          const cur = found.get(key) ?? { ...f, widths: [], details: new Set(), maxInstances: 0, instancesAt390: 0 };
          if (!perWidth.has(key)) cur.widths.push(s.w);
          perWidth.set(key, (perWidth.get(key) ?? 0) + 1);
          if (cur.details.size < 5) cur.details.add(f.detail);
          found.set(key, cur);
        }
        for (const [key, n] of perWidth) {
          const cur = found.get(key);
          cur.maxInstances = Math.max(cur.maxInstances, n);
          if (s.w === 390) cur.instancesAt390 = n;
        }
      }
      const findings = [...found.values()].map(({ details, widths, ...f }) => ({
        ...f,
        widths: ranges(widths),
        widthCount: widths.length,
        details: [...details],
      }));
      const counts = Object.fromEntries(CHECKS.map((c) => [c, findings.filter((f) => f.check === c).length]));
      counts.tapSizeInline = findings.filter((f) => f.check === 'tapSize' && f.inline).length;
      const at390 = Object.fromEntries(CHECKS.map((c) => [c, findings.filter((f) => f.check === c).reduce((n, f) => n + f.instancesAt390, 0)]));
      report.pages[p.slug] = { counts, at390, findings };
      console.log(`[qa] mobile-lint ${p.slug}: ${JSON.stringify(counts)}`);
      await context.close();
    }
  } finally {
    await browser.close();
    await target.close();
  }

  writeJson(path.join(OUT_DIR, 'mobile-lint.json'), report);
  const lines = [
    '# Mobile lint',
    '',
    `Target: ${report.base} · widths 320–430 (1px) + ${TABLET_WIDTHS.join(', ')} · ${report.generated}`,
    '',
    'Counts are unique (check, selector) findings per page; each finding lists the widths it occurs at in mobile-lint.json.',
    '',
    `| Page | ${CHECKS.join(' | ')} | tapSize (inline links) |`,
    `|---|${CHECKS.map(() => '---:').join('|')}|---:|`,
    ...Object.entries(report.pages).map(([slug, { counts }]) => `| ${slug} | ${CHECKS.map((c) => counts[c]).join(' | ')} | ${counts.tapSizeInline} |`),
    '',
    'Element instances flagged at 390px (one selector can match several elements, e.g. footer links):',
    '',
    `| Page | ${CHECKS.join(' | ')} |`,
    `|---|${CHECKS.map(() => '---:').join('|')}|`,
    ...Object.entries(report.pages).map(([slug, { at390 }]) => `| ${slug} | ${CHECKS.map((c) => at390[c]).join(' | ')} |`),
    '',
  ];
  for (const [slug, { findings }] of Object.entries(report.pages)) {
    lines.push(`## ${slug}`, '');
    for (const c of CHECKS) {
      const fs_ = findings.filter((f) => f.check === c);
      if (!fs_.length) continue;
      lines.push(`### ${c} (${fs_.length})`, '');
      for (const f of fs_.slice(0, 40)) lines.push(`- \`${f.selector}\`${f.inline ? ' (inline)' : ''} ×${f.maxInstances} — ${f.details.join('; ')} — widths ${f.widths}`);
      if (fs_.length > 40) lines.push(`- … ${fs_.length - 40} more in mobile-lint.json`);
      lines.push('');
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'mobile-lint.md'), lines.join('\n'));
  const total = Object.values(report.pages).reduce((n, pg) => n + pg.findings.length, 0);
  console.log(`[qa] mobile-lint: ${total} findings -> ${path.join(OUT_DIR, 'mobile-lint.md')}`);
  if (total && process.env.QA_REPORT_ONLY !== '1') return 1;
  return 0;
});
