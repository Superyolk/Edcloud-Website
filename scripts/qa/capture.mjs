/**
 * Deterministic full-page capture, shared by qa:matrix, qa:golden and qa:desktop-parity.
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { contextOptions, ensureDir, pageUrl, settlePage } from './lib.mjs';

/**
 * Captures every (page, viewport) pair into `outFor(page, viewport)` and returns
 * [{ page, viewport, file, height, width }]. One browser context per viewport, fresh page per URL.
 */
export async function captureAll({ base, pages, viewports, outFor, log = true }) {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const v of viewports) {
      const context = await browser.newContext(contextOptions(v));
      for (const p of pages) {
        const page = await context.newPage();
        await settlePage(page, pageUrl(base, p));
        const dims = await page.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
        }));
        const file = outFor(p, v);
        ensureDir(path.dirname(file));
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide', scale: 'css' });
        results.push({ page: p.slug, viewport: `${v.w}x${v.h}`, w: v.w, h: v.h, kind: v.kind, file, ...dims });
        if (log) console.log(`[qa] ${p.slug} @ ${v.w}x${v.h} -> ${path.relative(process.cwd(), file)} (${dims.height}px tall)`);
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return results;
}

