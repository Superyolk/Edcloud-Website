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
 * Assertions (docs/mobile/SPEC.md §8.3, §8.4, §9). Each failure is listed in bytes.json `failures`
 * and exits 1 unless QA_REPORT_ONLY=1; a third-party request always exits 1.
 * - budget: Home at 390 transfers <= 60% of the BASELINE.md figure, excluding video.
 * - budget: every page's JS (gzip from disk) grows by <= 5 KiB over BASELINE.md.
 * - prefetch: /about, /services-and-results and the legal pages request no /images file that only
 *   Home uses (the "/" prefetch used to pull Home's photos, C-cross-05).
 * - preload: the built <head> of each hero page carries at most one image preload (C-cross-04).
 * - picture: at 390 no <picture> fallback (the 1920px desktop file) is requested, and at 1440 no
 *   /images/m/ crop is (desktop decodes today's bytes).
 * - video: no video request at 390, under reduced motion or under Save-Data; at 768 the first video
 *   request comes after `load`; at 1440 the <video> still mounts (desktop behaviour unchanged).
 *
 * Output: scripts/qa/output/bytes.json (per page: totals + request list; plus the checks).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { OUT_DIR, PAGES, ROOT, contextOptions, main, pageUrl, startTarget, writeJson } from './lib.mjs';

const WAIT = Number(process.env.QA_BYTES_WAIT || 5000);
const KIB = 1024;

// docs/mobile/BASELINE.md, "First-load transfer at 390x844", untouched build at 95beb8d.
const BASELINE = {
  homeExcludingVideo: 621.0 * KIB,
  jsGzip: { home: 142.9 * KIB, other: 149.3 * KIB },
};
const BUDGET = {
  homeShare: 0.6, // SPEC §9: Home transfer at 390 <= 60% of today's, excluding deferred video
  jsGrowth: 5 * KIB, // SPEC §9: JS growth <= 5 KB gz
};
const HERO_PAGES = ['home', 'about', 'services-and-results'];
const PHONE = { w: 390, h: 844, kind: 'phone' };
const TABLET = { w: 768, h: 1024, kind: 'tablet' };
const DESKTOP = { w: 1440, h: 900, kind: 'desktop' };

// A stand-in for navigator.connection with Save-Data on (Chromium exposes no switch for it).
const SAVE_DATA_INIT = () => {
  const c = Object.assign(new EventTarget(), { saveData: true, effectiveType: '4g' });
  Object.defineProperty(Navigator.prototype, 'connection', { configurable: true, get: () => c });
};

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

/**
 * Loads `url` cold in its own context and returns every request (wire bytes, and whether it was
 * sent after the `load` event) plus the <picture> fallbacks and <video> count found in the DOM.
 */
async function load(browser, url, vp, { motion = true, initScript } = {}) {
  const context = await browser.newContext(contextOptions(vp, { reducedMotion: motion ? 'no-preference' : 'reduce' }));
  if (initScript) await context.addInitScript(initScript);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Page.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const reqs = new Map();
  let loadAt = Infinity;
  cdp.on('Page.loadEventFired', (e) => {
    loadAt = Math.min(loadAt, e.timestamp);
  });
  cdp.on('Network.requestWillBeSent', (e) => {
    if (!reqs.has(e.requestId)) reqs.set(e.requestId, { url: e.request.url, sentAt: e.timestamp, status: 0, mime: '', bytes: 0, done: false });
  });
  cdp.on('Network.responseReceived', (e) => {
    const r = reqs.get(e.requestId) ?? { url: e.response.url, sentAt: e.timestamp, bytes: 0, done: false };
    Object.assign(r, { url: e.response.url, status: e.response.status, mime: e.response.mimeType });
    reqs.set(e.requestId, r);
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
  const dom = await page.evaluate(() => ({
    pictureFallbacks: [...document.querySelectorAll('picture img')].map((i) => new URL(i.getAttribute('src'), location.href).pathname),
    videos: document.querySelectorAll('video').length,
  }));
  await context.close();
  const origin = new URL(url).origin;
  const list = [...reqs.values()]
    // requestWillBeSent also fires for requests that never got a response (e.g. cancelled); keep
    // them for the request checks, but only responses count as bytes.
    .filter((r) => !r.url.startsWith('data:'))
    .map((r) => ({
      ...r,
      kind: kindOf(r.url, r.mime || ''),
      path: r.url.startsWith(origin) ? new URL(r.url).pathname : r.url,
      afterLoad: r.sentAt > loadAt,
    }));
  return { list, dom, origin };
}

async function measure(browser, url) {
  const { list, origin } = await load(browser, url, PHONE);
  const responded = list.filter((r) => r.status);
  const byKind = {};
  for (const r of responded) byKind[r.kind] = (byKind[r.kind] ?? 0) + r.bytes;
  const total = responded.reduce((n, r) => n + r.bytes, 0);
  const jsFiles = [...new Set(responded.filter((r) => r.kind === 'js' && r.path.startsWith('/_next/')).map((r) => r.path))];
  const jsGzipFromDisk = jsFiles.reduce((n, p) => {
    const f = path.join(ROOT, 'out', decodeURIComponent(p));
    return fs.existsSync(f) ? n + zlib.gzipSync(fs.readFileSync(f), { level: 9 }).length : n;
  }, 0);
  const thirdParty = list.filter((r) => !r.url.startsWith(origin)).map((r) => r.url);
  return {
    total,
    totalExcludingVideo: total - (byKind.video ?? 0),
    byKind,
    requestCount: responded.length,
    jsFiles: jsFiles.length,
    jsGzipFromDisk,
    thirdParty,
    requests: responded.map(({ path: p, status, kind, bytes, done }) => ({ path: p, status, kind, bytes, complete: done })).sort((a, b) => b.bytes - a.bytes),
    requestedPaths: [...new Set(list.map((r) => r.path))],
  };
}

/** Every /images/* URL a built page (its HTML and every stylesheet in out/) references. */
function referencedImages(html) {
  const found = new Set();
  const add = (s) => {
    for (const m of s.matchAll(/\/images\/[^\s"'(),?#]+/g)) found.add(m[0]);
  };
  add(html);
  return found;
}
const CSS_IMAGES = (() => {
  const set = new Set();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith('.css')) for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/images\/[^\s"'(),?#]+/g)) set.add(m[0]);
    }
  };
  walk(path.join(ROOT, 'out', '_next', 'static'));
  return set;
})();

const imagePreloads = (html) => {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  return [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((l) => /rel="preload"/i.test(l) && /as="image"/i.test(l));
};

main(async () => {
  const target = await startTarget();
  const browser = await chromium.launch();
  const out = { generated: new Date().toISOString(), base: target.base, viewport: '390x844', waitAfterLoadMs: WAIT, baseline: BASELINE, budget: BUDGET, pages: {}, checks: {}, failures: [] };
  const fail = (msg) => {
    out.failures.push(msg);
    console.log(`[qa] bytes FAIL: ${msg}`);
  };
  const kb = (n) => `${(n / KIB).toFixed(1)} KiB`;
  try {
    const html = {};
    for (const p of PAGES) html[p.slug] = await (await fetch(pageUrl(target.base, p))).text();

    for (const p of PAGES) {
      const m = await measure(browser, pageUrl(target.base, p));
      out.pages[p.slug] = m;
      console.log(
        `[qa] bytes ${p.slug}: total ${kb(m.total)}, excl. video ${kb(m.totalExcludingVideo)}, JS gz(disk) ${kb(m.jsGzipFromDisk)} in ${m.jsFiles} files, ${m.requestCount} requests` +
          (m.thirdParty.length ? `, THIRD-PARTY: ${m.thirdParty.join(' ')}` : ''),
      );
    }

    // Budgets (SPEC §9).
    const home = out.pages.home;
    const homeLimit = BASELINE.homeExcludingVideo * BUDGET.homeShare;
    out.checks.homeBudget = { excludingVideo: home.totalExcludingVideo, limit: homeLimit, shareOfBaseline: +(home.totalExcludingVideo / BASELINE.homeExcludingVideo).toFixed(3) };
    if (home.totalExcludingVideo > homeLimit) fail(`home at 390 is ${kb(home.totalExcludingVideo)} excl. video, over ${kb(homeLimit)} (60% of ${kb(BASELINE.homeExcludingVideo)})`);
    out.checks.jsGrowth = {};
    for (const p of PAGES) {
      const base = p.slug === 'home' ? BASELINE.jsGzip.home : BASELINE.jsGzip.other;
      const growth = out.pages[p.slug].jsGzipFromDisk - base;
      out.checks.jsGrowth[p.slug] = Math.round(growth);
      if (growth > BUDGET.jsGrowth) fail(`${p.slug} JS grew ${kb(growth)} gz over the baseline (budget ${kb(BUDGET.jsGrowth)})`);
    }

    // The "/" prefetch must not pull Home's photos onto other pages (C-cross-05, B-pages-07).
    const homeImages = referencedImages(html.home);
    out.checks.homeOnlyImages = {};
    for (const p of PAGES.filter((pg) => pg.slug !== 'home')) {
      const own = new Set([...referencedImages(html[p.slug]), ...CSS_IMAGES]);
      const foreign = out.pages[p.slug].requestedPaths.filter((u) => u.startsWith('/images/') && homeImages.has(u) && !own.has(u));
      out.checks.homeOnlyImages[p.slug] = foreign;
      if (foreign.length) fail(`${p.slug} requests Home-only images: ${foreign.join(', ')}`);
    }

    // At most one image preload in each hero page's <head> (C-cross-04, SPEC §8.3).
    out.checks.headImagePreloads = {};
    for (const slug of HERO_PAGES) {
      const pre = imagePreloads(html[slug]);
      out.checks.headImagePreloads[slug] = pre;
      if (pre.length > 1) fail(`${slug} <head> has ${pre.length} image preloads (max 1): ${pre.join(' ')}`);
    }

    // Phones take the crops, desktop keeps today's files (SPEC §5.7, §8.3).
    out.checks.picture = {};
    for (const slug of HERO_PAGES) {
      const p = PAGES.find((pg) => pg.slug === slug);
      const phone = await load(browser, pageUrl(target.base, p), PHONE, { motion: false });
      const fallbacks = new Set(phone.dom.pictureFallbacks);
      const phoneFallbacks = [...new Set(phone.list.map((r) => r.path))].filter((u) => fallbacks.has(u));
      const desk = await load(browser, pageUrl(target.base, p), DESKTOP, { motion: false });
      const deskCrops = [...new Set(desk.list.map((r) => r.path))].filter((u) => u.startsWith('/images/m/'));
      out.checks.picture[slug] = { pictures: fallbacks.size, phoneFetchedFallbacks: phoneFallbacks, desktopFetchedCrops: deskCrops };
      if (phoneFallbacks.length) fail(`${slug} at 390 fetched the desktop fallback of a <picture>: ${phoneFallbacks.join(', ')}`);
      if (deskCrops.length) fail(`${slug} at 1440 fetched mobile crops: ${deskCrops.join(', ')}`);
    }

    // Hero video gating (SPEC §8.4, G12).
    const homeUrl = pageUrl(target.base, PAGES.find((pg) => pg.slug === 'home'));
    const videoReqs = (r) => r.list.filter((x) => x.kind === 'video' || /^\/video\//.test(x.path));
    const runs = {
      phone: await load(browser, homeUrl, PHONE),
      tablet: await load(browser, homeUrl, TABLET),
      tabletReduced: await load(browser, homeUrl, TABLET, { motion: false }),
      tabletSaveData: await load(browser, homeUrl, TABLET, { initScript: SAVE_DATA_INIT }),
      desktop: await load(browser, homeUrl, DESKTOP),
    };
    out.checks.video = Object.fromEntries(
      Object.entries(runs).map(([k, r]) => [k, { videoElements: r.dom.videos, requests: videoReqs(r).map((x) => ({ path: x.path, bytes: x.bytes, afterLoad: x.afterLoad })) }]),
    );
    for (const k of ['phone', 'tabletReduced', 'tabletSaveData']) {
      const v = out.checks.video[k];
      if (v.videoElements || v.requests.length) fail(`home ${k}: expected no <video> and no video bytes, got ${v.videoElements} element(s), ${v.requests.length} request(s)`);
    }
    const early = out.checks.video.tablet.requests.filter((x) => !x.afterLoad);
    if (early.length) fail(`home tablet: video requested before load: ${early.map((x) => x.path).join(', ')}`);
    if (!out.checks.video.desktop.videoElements) fail('home 1440: the hero <video> did not mount (desktop behaviour must be unchanged)');
    console.log(
      `[qa] bytes checks: home ${(out.checks.homeBudget.shareOfBaseline * 100).toFixed(1)}% of baseline; JS growth ${JSON.stringify(out.checks.jsGrowth)} B; ` +
        `video elements phone/tablet/reduced/save-data/desktop ${['phone', 'tablet', 'tabletReduced', 'tabletSaveData', 'desktop'].map((k) => out.checks.video[k].videoElements).join('/')}`,
    );
  } finally {
    await browser.close();
    await target.close();
  }
  writeJson(path.join(OUT_DIR, 'bytes.json'), out);
  const thirdParty = Object.values(out.pages).some((pg) => pg.thirdParty.length);
  if (thirdParty) return 1;
  return out.failures.length && process.env.QA_REPORT_ONLY !== '1' ? 1 : 0;
});
