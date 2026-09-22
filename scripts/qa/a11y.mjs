/**
 * qa:a11y — axe-core on every page at 390x844 (mobile emulation) and 1440x900. Fails on any
 * violation. Output: scripts/qa/output/a11y.json (full violations with nodes) and a console summary.
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import path from 'node:path';
import { OUT_DIR, PAGES, contextOptions, main, pageUrl, settlePage, startTarget, writeJson } from './lib.mjs';

const VIEWPORTS = [
  { w: 390, h: 844, kind: 'phone' },
  { w: 1440, h: 900, kind: 'desktop' },
];

main(async () => {
  const target = await startTarget();
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const v of VIEWPORTS) {
      // axe needs the real page, so no FREEZE_CSS here (it hides the video); reduced motion still applies.
      const context = await browser.newContext(contextOptions(v));
      for (const p of PAGES) {
        const page = await context.newPage();
        await settlePage(page, pageUrl(target.base, p), { freeze: false });
        const r = await new AxeBuilder({ page }).analyze();
        const violations = r.violations.map((x) => ({
          id: x.id,
          impact: x.impact,
          help: x.help,
          helpUrl: x.helpUrl,
          nodes: x.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        }));
        results.push({ page: p.slug, viewport: `${v.w}x${v.h}`, violations, passes: r.passes.length, incomplete: r.incomplete.length });
        console.log(
          `[qa] a11y ${p.slug} @ ${v.w}: ${violations.length} violations` +
            (violations.length ? ` (${violations.map((x) => `${x.id}×${x.nodes.length}`).join(', ')})` : ''),
        );
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await target.close();
  }
  writeJson(path.join(OUT_DIR, 'a11y.json'), results);
  const total = results.reduce((n, r) => n + r.violations.length, 0);
  console.log(`[qa] a11y: ${total} violations across ${results.length} page/viewport runs`);
  return total ? 1 : 0;
});
