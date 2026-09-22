/**
 * qa:bytes — first-load transfer per page at 390x844 (mobile emulation, cold cache, motion allowed so
 * the Home hero video loads the way it does for a real visitor).
 *
 * Every response's encoded (on-the-wire) size comes from CDP Network.loadingFinished. The page is
 * given QA_BYTES_WAIT ms (default 5000) after `load` to pick up late requests; the hero video keeps
 * streaming after that, so "video" bytes are what arrived inside that window.
 *
 * JS is also measured from disk: each /_next/static/**.js the page requested, gzipped (level 9) from
 * out/, which is what "JS bundle gzipped" in the baseline means and does not depend on the server.
 *
 * Output: scripts/qa/output/bytes.json (per page: totals + request list).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { OUT_DIR, PAGES, ROOT, contextOptions, main, pageUrl, startTarget, writeJson } from './lib.mjs';

const WAIT = Number(process.env.QA_BYTES_WAIT || 5000);

function kindOf(url, mime) {
  const p = new URL(url).pathname;
  if (/\.(mp4|webm)$/.test(p) || mime.startsWith('video/')) return 'video';
  if (/\.js$/.test(p) || mime.includes('javascript')) return 'js';
  if (/\.css$/.test(p) || mime.includes('css')) return 'css';
  if (/\.(woff2?|ttf|otf)$/.test(p) || mime.includes('font')) return 'font';
  if (mime.startsWith('image/')) return 'image';
  if (mime.includes('html')) return 'html';
  return 'other';
}

async function measure(browser, url) {
  const context = await browser.newContext(contextOptions({ w: 390, h: 844, kind: 'phone' }, { reducedMotion: 'no-preference' }));
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const reqs = new Map();
  cdp.on('Network.responseReceived', (e) => {
    reqs.set(e.requestId, { url: e.response.url, status: e.response.status, mime: e.response.mimeType, bytes: 0, done: false });
  });
  cdp.on('Network.dataReceived', (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.bytes += e.encodedDataLength;
  });
  cdp.on('Network.loadingFinished', (e) => {
    const r = reqs.get(e.requestId);
    if (r) {
      r.bytes = e.encodedDataLength;
      r.done = true;
    }
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForTimeout(WAIT);
  const origin = new URL(url).origin;
  const list = [...reqs.values()]
    .filter((r) => !r.url.startsWith('data:'))
    .map((r) => ({ ...r, kind: kindOf(r.url, r.mime || ''), path: r.url.startsWith(origin) ? new URL(r.url).pathname : r.url }));
  await context.close();

  const byKind = {};
  for (const r of list) byKind[r.kind] = (byKind[r.kind] ?? 0) + r.bytes;
  const total = list.reduce((n, r) => n + r.bytes, 0);
  const jsFiles = [...new Set(list.filter((r) => r.kind === 'js' && r.path.startsWith('/_next/')).map((r) => r.path))];
  const jsGzipFromDisk = jsFiles.reduce((n, p) => {
    const f = path.join(ROOT, 'out', decodeURIComponent(p));
    return fs.existsSync(f) ? n + zlib.gzipSync(fs.readFileSync(f), { level: 9 }).length : n;
  }, 0);
  const thirdParty = list.filter((r) => !r.url.startsWith(origin)).map((r) => r.url);
  return {
    total,
    totalExcludingVideo: total - (byKind.video ?? 0),
    byKind,
    requestCount: list.length,
    jsFiles: jsFiles.length,
    jsGzipFromDisk,
    thirdParty,
    requests: list.map(({ path: p, status, kind, bytes, done }) => ({ path: p, status, kind, bytes, complete: done })).sort((a, b) => b.bytes - a.bytes),
  };
}

main(async () => {
  const target = await startTarget();
  const browser = await chromium.launch();
  const out = { generated: new Date().toISOString(), base: target.base, viewport: '390x844', waitAfterLoadMs: WAIT, pages: {} };
  try {
    for (const p of PAGES) {
      const m = await measure(browser, pageUrl(target.base, p));
      out.pages[p.slug] = m;
      const kb = (n) => `${(n / 1024).toFixed(1)} KiB`;
      console.log(
        `[qa] bytes ${p.slug}: total ${kb(m.total)}, excl. video ${kb(m.totalExcludingVideo)}, JS gz(disk) ${kb(m.jsGzipFromDisk)} in ${m.jsFiles} files, ${m.requestCount} requests` +
          (m.thirdParty.length ? `, THIRD-PARTY: ${m.thirdParty.join(' ')}` : ''),
      );
    }
  } finally {
    await browser.close();
    await target.close();
  }
  writeJson(path.join(OUT_DIR, 'bytes.json'), out);
  const thirdParty = Object.values(out.pages).some((pg) => pg.thirdParty.length);
  return thirdParty ? 1 : 0;
});
