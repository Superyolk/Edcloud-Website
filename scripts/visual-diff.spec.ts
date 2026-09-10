/**
 * Pixel + layout parity between the Next.js app and the design reference.
 *
 * For every page pair and viewport it loads both sides under `prefers-reduced-motion: reduce`
 * (which also keeps the hero video out of the DOM on both sides), waits for fonts, network and
 * lazy images, takes full-page screenshots, compares them with pixelmatch (threshold 0.1) and
 * diffs a layout fingerprint of every h1/h2/h3/p/li/button/input/img/video/section.
 *
 * Output (gitignored): scripts/visual-diff-output/<page>-<width>.{app,ref,diff}.png,
 * <page>-<width>.fingerprint.json and summary.md.
 */
import { test, expect, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const APP = process.env.APP_URL ?? 'http://localhost:3000';
const REF = process.env.REF_URL ?? 'http://localhost:4174';

const PAGES = [
  { name: 'home', app: '/', ref: '/EdCloud%20Home.dc.html' },
  { name: 'about', app: '/about', ref: '/EdCloud%20About.dc.html' },
  { name: 'services', app: '/services-and-results', ref: '/EdCloud%20Services.dc.html' },
] as const;

const VIEWPORTS = [
  [375, 812],
  [820, 1180],
  [1024, 768],
  [1440, 900],
] as const;

const OUT = path.resolve(__dirname, 'visual-diff-output');
const MAX_MISMATCH_PCT = 0.5;
const TOLERANCE_PX = 1;
const FP_SELECTOR = 'h1,h2,h3,p,li,button,input,img,video,section';

type Fingerprint = {
  tag: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  color: string;
  backgroundColor: string;
};

type Row = { page: string; viewport: string; mismatchPct: number; diffPixels: number; app: string; ref: string; fpDefects: number };
const rows: Row[] = [];

async function settle(page: Page, url: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  // Walk the page so lazy-loaded logos are requested, then wait for every image to finish.
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map(
        (img) =>
          img.complete ||
          new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    ),
  );
  await page.evaluate(() =>
    document.querySelectorAll('video').forEach((v) => {
      v.pause();
      v.currentTime = 0;
    }),
  );
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500); // let the 180ms nav transition finish after the scroll walk
}

async function fingerprint(page: Page): Promise<Fingerprint[]> {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel))
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
          x: Math.round(r.x * 10) / 10,
          y: Math.round(r.y * 10) / 10,
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
        };
      });
  }, FP_SELECTOR);
}

function diffFingerprints(app: Fingerprint[], ref: Fingerprint[]): string[] {
  const defects: string[] = [];
  if (app.length !== ref.length) defects.push(`element count: app ${app.length} vs ref ${ref.length}`);
  const n = Math.min(app.length, ref.length);
  for (let i = 0; i < n; i++) {
    const a = app[i];
    const r = ref[i];
    const where = `#${i} <${r.tag}> "${r.text}"`;
    if (a.tag !== r.tag) {
      defects.push(`${where}: tag app <${a.tag}> "${a.text}"`);
      continue;
    }
    for (const k of ['x', 'y', 'w', 'h'] as const) {
      if (Math.abs(a[k] - r[k]) > TOLERANCE_PX) defects.push(`${where}: ${k} app ${a[k]} vs ref ${r[k]}`);
    }
    for (const k of ['fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor'] as const) {
      if (a[k] !== r[k]) defects.push(`${where}: ${k} app ${a[k]} vs ref ${r[k]}`);
    }
  }
  return defects;
}

function padTo(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png;
  const out = new PNG({ width, height });
  // Magenta fill so any size difference counts as mismatch instead of hiding.
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 0;
    out.data[i + 2] = 255;
    out.data[i + 3] = 255;
  }
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0);
  return out;
}

test.describe('visual parity with the design reference', () => {
  test.beforeAll(() => fs.mkdirSync(OUT, { recursive: true }));

  for (const p of PAGES) {
    for (const [w, h] of VIEWPORTS) {
      test(`${p.name} @ ${w}x${h}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
        const appPage = await context.newPage();
        const refPage = await context.newPage();
        await settle(appPage, APP + p.app);
        await settle(refPage, REF + p.ref);

        const shotOptions = { fullPage: true, animations: 'disabled', caret: 'hide' } as const;
        const appShot = PNG.sync.read(await appPage.screenshot(shotOptions));
        const refShot = PNG.sync.read(await refPage.screenshot(shotOptions));
        const width = Math.max(appShot.width, refShot.width);
        const height = Math.max(appShot.height, refShot.height);
        const a = padTo(appShot, width, height);
        const r = padTo(refShot, width, height);
        const diff = new PNG({ width, height });
        const diffPixels = pixelmatch(a.data, r.data, diff.data, width, height, { threshold: 0.1 });
        const mismatchPct = (diffPixels / (width * height)) * 100;

        const appFp = await fingerprint(appPage);
        const refFp = await fingerprint(refPage);
        const fpDefects = diffFingerprints(appFp, refFp);

        const base = path.join(OUT, `${p.name}-${w}`);
        fs.writeFileSync(`${base}.app.png`, PNG.sync.write(a));
        fs.writeFileSync(`${base}.ref.png`, PNG.sync.write(r));
        fs.writeFileSync(`${base}.diff.png`, PNG.sync.write(diff));
        fs.writeFileSync(`${base}.fingerprint.json`, JSON.stringify({ defects: fpDefects, app: appFp, ref: refFp }, null, 2));

        rows.push({
          page: p.name,
          viewport: `${w}×${h}`,
          mismatchPct,
          diffPixels,
          app: `${appShot.width}×${appShot.height}`,
          ref: `${refShot.width}×${refShot.height}`,
          fpDefects: fpDefects.length,
        });
        console.log(`${p.name} @ ${w}: mismatch ${mismatchPct.toFixed(3)}% (${diffPixels} px), app ${appShot.width}×${appShot.height}, ref ${refShot.width}×${refShot.height}, fingerprint defects ${fpDefects.length}`);
        for (const d of fpDefects.slice(0, 25)) console.log('   ' + d);

        await context.close();

        expect.soft(mismatchPct, `pixel mismatch for ${p.name} @ ${w}`).toBeLessThanOrEqual(MAX_MISMATCH_PCT);
        expect.soft(fpDefects, `layout fingerprint defects for ${p.name} @ ${w}`).toEqual([]);
      });
    }
  }

  test.afterAll(() => {
    const lines = [
      '| Page | Viewport | Pixel mismatch | Diff pixels | App size | Reference size | Fingerprint defects |',
      '|---|---|---|---|---|---|---|',
      ...rows.map((r) => `| ${r.page} | ${r.viewport} | ${r.mismatchPct.toFixed(3)}% | ${r.diffPixels} | ${r.app} | ${r.ref} | ${r.fpDefects} |`),
    ];
    fs.writeFileSync(path.join(OUT, 'summary.md'), lines.join('\n') + '\n');
    console.log('\n' + lines.join('\n'));
  });
});
