/**
 * qa:early — what a phone can do BEFORE hydration (Phase 4 R1-a11y-05, R1-a11y-06).
 *
 * Phones run the Next.js chunks only after the first paint (scripts/defer-hydration.mjs), so for
 * a second or more the page is drawn but React is not attached. On a throttled iPhone-like
 * context (CPU 4x, 150ms RTT, 1.6 Mbps) this checks that nothing in that gap is lost:
 *
 *   fragment  a #:~:text= link into a collapsed Show-all item (Home Press) and into a collapsed
 *             About chapter scrolls to it, and it is still open once the page has hydrated
 *   tap       a tap on Menu, and on a collapsed About chapter heading, 300ms after first paint
 *             (before React has attached its listeners) takes effect once the page hydrates
 *
 * Serves out/ like every qa script (QA_PORT / QA_BASE_URL). Exit 1 on any failure.
 * Report: scripts/qa/output/early.json.
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { OUT_DIR, contextOptions, main, startTarget, writeJson } from './lib.mjs';

const PHONE = { w: 390, h: 844, kind: 'phone' };
const FRAGMENTS = [
  { path: '/', phrase: 'Austin ISD implements new yoga program' }, // Press, 5th story: behind "Show all press"
  { path: '/about', phrase: 'EdCloud started informally' }, // "A brief history", collapsed on phones
];

async function throttledPage(browser) {
  const ctx = await browser.newContext(contextOptions(PHONE, { deviceScaleFactor: 3 }));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  return { ctx, page };
}

/** true once React owns the Menu button (its props are attached to the element). */
const hydrated = () => {
  const b = document.querySelector('button[aria-controls="mobile-menu"]');
  return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps'));
};

main(async () => {
  const target = await startTarget();
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const f of FRAGMENTS) {
      const { ctx, page } = await throttledPage(browser);
      await page.goto(`${target.base}${f.path}#:~:text=${encodeURIComponent(f.phrase)}`, { waitUntil: 'commit' });
      await page.waitForFunction(hydrated, null, { timeout: 60_000 });
      await page.waitForTimeout(1000);
      const r = await page.evaluate((phrase) => {
        const el = [...document.querySelectorAll('main p, main li, main h3')].find((e) => e.textContent.replace(/\s+/g, ' ').includes(phrase));
        const q = el?.getBoundingClientRect();
        return { found: !!el, hidden: !!el?.closest('[hidden]'), top: q ? Math.round(q.top) : null, height: q ? Math.round(q.height) : null, scrollY: Math.round(scrollY) };
      }, f.phrase);
      const pass = r.found && !r.hidden && r.height > 0 && r.top >= 0 && r.top < PHONE.h && r.scrollY > 0;
      results.push({ check: 'fragment', path: f.path, phrase: f.phrase, ...r, pass });
      await ctx.close();
    }

    for (const t of [
      { path: '/', what: 'Menu', selector: 'button[aria-controls="mobile-menu"]' },
      { path: '/about', what: 'collapsed chapter', selector: null },
    ]) {
      const { ctx, page } = await throttledPage(browser);
      await page.goto(`${target.base}${t.path}`, { waitUntil: 'commit' });
      await page.waitForFunction(() => performance.getEntriesByName('first-contentful-paint').length > 0, null, { timeout: 60_000 });
      await page.waitForTimeout(300);
      const early = !(await page.evaluate(() => Object.keys(document).some((k) => k.startsWith('_reactListening'))));
      let selector = t.selector;
      if (!selector) {
        // The third chapter ("Our approach"): collapsed by default on phones.
        const id = await page.evaluate(() => document.querySelectorAll('main h3 [data-trigger], main h3 button')[2]?.id);
        selector = `[id="${id}"]`;
        await page.evaluate((s) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 300), selector);
      }
      const box = await page.locator(selector).boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForFunction(hydrated, null, { timeout: 60_000 });
      await page.waitForTimeout(1500);
      const done = t.selector
        ? await page.evaluate(() => !!document.getElementById('mobile-menu'))
        : await page.evaluate((s) => document.querySelector(s)?.getAttribute('aria-expanded') === 'true', selector);
      // Only meaningful if the tap really landed before React attached; otherwise it proves nothing.
      results.push({ check: 'tap', path: t.path, what: t.what, tappedBeforeHydration: early, took: done, pass: early && done });
      await ctx.close();
    }
  } finally {
    await browser.close();
    await target.close();
  }
  for (const r of results) console.log(`[qa] early ${r.pass ? 'PASS' : 'FAIL'} ${r.check} ${r.path} ${JSON.stringify(r)}`);
  writeJson(path.join(OUT_DIR, 'early.json'), results);
  const failures = results.filter((r) => !r.pass).length;
  console.log(`[qa] early: ${failures} failure(s)`);
  return failures ? 1 : 0;
});
