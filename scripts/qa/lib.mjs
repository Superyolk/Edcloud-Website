/**
 * Shared plumbing for the mobile-redesign QA harness (scripts/qa/*.mjs).
 *
 * - Pages, viewport matrix and output paths live here so every check agrees on them.
 * - `startTarget()` either uses QA_BASE_URL (e.g. https://www.edcloud.org for live verification)
 *   or builds out/ if needed and serves it with the `serve` devDependency on QA_PORT (default 4180).
 * - `settlePage()` makes a page deterministic for screenshots: reduced motion (HeroVideo does not
 *   mount, so the hero shows its poster), no animations/transitions/caret, lazy images forced
 *   eager and decoded, fonts loaded.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(QA_DIR, '..', '..');
export const OUT_DIR = path.join(QA_DIR, 'output');
export const GOLDEN_DIR = path.join(QA_DIR, 'golden');
export const CONTENT_DIR = path.join(QA_DIR, 'content-snapshot');

export const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'about', path: '/about' },
  { slug: 'services-and-results', path: '/services-and-results' },
  { slug: 'privacy-policy', path: '/privacy-policy' },
  { slug: 'accessibility-statement', path: '/accessibility-statement' },
];

/** kind: phone | landscape | tablet | desktop. Desktop heights are the viewport; screenshots are full page. */
export const MATRIX = [
  { w: 320, h: 568, kind: 'phone' },
  { w: 360, h: 780, kind: 'phone' },
  { w: 375, h: 667, kind: 'phone' },
  { w: 390, h: 844, kind: 'phone' },
  { w: 393, h: 852, kind: 'phone' },
  { w: 414, h: 896, kind: 'phone' },
  { w: 430, h: 932, kind: 'phone' },
  { w: 844, h: 390, kind: 'landscape' },
  { w: 768, h: 1024, kind: 'tablet' },
  { w: 820, h: 1180, kind: 'tablet' },
  { w: 1024, h: 900, kind: 'desktop' },
  { w: 1280, h: 900, kind: 'desktop' },
  { w: 1440, h: 900, kind: 'desktop' },
];

export const DESKTOP_PARITY = MATRIX.filter((v) => v.kind === 'desktop');

export const vpName = (v) => `${v.w}x${v.h}`;

export const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Browser-context options for a viewport. DPR is 1 everywhere so screenshots stay small and stable. */
export function contextOptions(v, extra = {}) {
  const mobile = v.kind !== 'desktop';
  return {
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'reduce',
    ...(mobile ? { userAgent: IPHONE_UA } : {}),
    ...extra,
  };
}

export function isLive(base) {
  try {
    const { hostname } = new URL(base);
    return !['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

async function waitForUrl(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

/** Runs `npm run build` when out/ is missing or QA_BUILD=1. */
export function buildIfNeeded() {
  const marker = path.join(ROOT, 'out', 'index.html');
  if (fs.existsSync(marker) && process.env.QA_BUILD !== '1') return;
  console.log('[qa] building out/ (npm run build)...');
  const r = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: true });
  if (r.status !== 0) throw new Error('npm run build failed');
}

/**
 * Returns { base, live, close }. With QA_BASE_URL set nothing is started; otherwise out/ is served
 * on QA_PORT (default 4180). An already-running server on that port is reused.
 */
export async function startTarget() {
  if (process.env.QA_BASE_URL) {
    const base = process.env.QA_BASE_URL.replace(/\/$/, '');
    return { base, live: isLive(base), close: async () => {} };
  }
  buildIfNeeded();
  const port = Number(process.env.QA_PORT || 4180);
  const base = `http://localhost:${port}`;
  try {
    const res = await fetch(`${base}/`);
    if (res.ok) return { base, live: false, close: async () => {} };
  } catch {
    /* start our own */
  }
  const serveBin = path.join(ROOT, 'node_modules', 'serve', 'build', 'main.js');
  const child = spawn(process.execPath, [serveBin, 'out', '-l', String(port), '--no-clipboard', '--no-request-logging'], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  await waitForUrl(`${base}/`, 30_000);
  return {
    base,
    live: false,
    close: async () => {
      child.kill();
    },
  };
}

/** CSS that removes every source of frame-to-frame nondeterminism the pages have. */
export const FREEZE_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
  scroll-behavior: auto !important;
}
::-webkit-scrollbar { display: none !important; }
video { visibility: hidden !important; }
`;

/**
 * Loads a URL and waits until it is visually stable: fonts loaded, every image eager + decoded,
 * animations frozen, scrolled back to the top. `freeze` adds FREEZE_CSS.
 */
export async function settlePage(page, url, { freeze = true } = {}) {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  if (freeze) await page.addStyleTag({ content: FREEZE_CSS });
  await settleContent(page);
}

/** Re-runs the image/font wait on an already-loaded page (e.g. after a viewport resize). */
export async function settleContent(page) {
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) {
      if (img.loading === 'lazy') img.loading = 'eager';
    }
    const step = Math.max(400, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? img.decode().catch(() => {})
          : new Promise((resolve) => {
              img.addEventListener('load', () => img.decode().catch(() => {}).then(resolve), { once: true });
              img.addEventListener('error', () => resolve(undefined), { once: true });
            }),
      ),
    );
    for (const v of Array.from(document.querySelectorAll('video'))) {
      v.pause();
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

export function pageUrl(base, p) {
  return `${base}${p.path}`;
}

/** Runs `fn` and turns thrown errors into a nonzero exit with a readable message. */
export async function main(fn) {
  try {
    const code = await fn();
    process.exitCode = typeof code === 'number' ? code : 0;
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

export function median(values) {
  const v = values.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}
