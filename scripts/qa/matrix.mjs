/**
 * qa:matrix — full-page screenshots of every page at every viewport in the matrix, plus contact
 * sheets and a page-height table.
 *
 * Output (gitignored):
 *   scripts/qa/output/matrix/<page>/<WxH>.png
 *   scripts/qa/output/matrix/heights.json            document height per page x viewport
 *   scripts/qa/output/matrix/index.json              every screenshot with its label
 *   scripts/qa/output/contact-sheets/page-<page>.png          one page, every viewport
 *   scripts/qa/output/contact-sheets/viewport-<WxH>.png       one viewport, every page
 *   (each sheet also has a .html twin that references the full-size screenshots)
 *
 * QA_PAGES=home,about and QA_VIEWPORTS=390x844,1440x900 narrow the run.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { captureAll } from './capture.mjs';
import { MATRIX, OUT_DIR, PAGES, ensureDir, main, startTarget, vpName, writeJson } from './lib.mjs';

const pickList = (env, all, key) => {
  const want = process.env[env]?.split(',').map((s) => s.trim()).filter(Boolean);
  return want?.length ? all.filter((x) => want.includes(key(x))) : all;
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** An HTML grid of labelled thumbnails, each scaled to `colWidth` css px wide. */
function sheetHtml(title, items, colWidth) {
  const cells = items
    .map(
      (it) => `<figure><figcaption>${esc(it.label)}<br><small>${esc(it.sub)}</small></figcaption>
      <img src="${pathToFileURL(it.file).href}" width="${colWidth}" height="${Math.round((it.height * colWidth) / it.w)}"></figure>`,
    )
    .join('');
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:16px;font:13px/1.3 system-ui,sans-serif;background:#e9ebee;color:#111}
    h1{font-size:18px;margin:0 0 12px}
    .grid{display:flex;gap:16px;align-items:flex-start}
    figure{margin:0;background:#fff;padding:6px;box-shadow:0 1px 2px rgba(0,0,0,.15)}
    figcaption{font-weight:600;margin-bottom:6px}
    small{font-weight:400;color:#555}
    img{display:block}
  </style><h1>${esc(title)}</h1><div class="grid">${cells}</div>`;
}

async function renderSheets(shots) {
  const dir = ensureDir(path.join(OUT_DIR, 'contact-sheets'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  const written = [];
  const render = async (name, title, items, colWidth) => {
    // Written to disk and opened over file:// so the file:// screenshot URLs are allowed to load.
    const html = path.join(dir, `${name}.html`);
    fs.writeFileSync(html, sheetHtml(title, items, colWidth));
    await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
    const file = path.join(dir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    written.push(file);
  };
  try {
    for (const slug of [...new Set(shots.map((s) => s.page))]) {
      const items = shots
        .filter((s) => s.page === slug)
        .map((s) => ({ ...s, label: s.viewport, sub: `${s.kind}, ${s.height}px tall` }));
      await render(`page-${slug}`, `${slug} — every viewport (each column scaled to 240px wide)`, items, 240);
    }
    for (const vp of [...new Set(shots.map((s) => s.viewport))]) {
      const items = shots.filter((s) => s.viewport === vp).map((s) => ({ ...s, label: s.page, sub: `${s.height}px tall` }));
      const w = items[0].w;
      await render(`viewport-${vp}`, `${vp} — every page (scaled to ${Math.min(w, 300)}px wide)`, items, Math.min(w, 300));
    }
  } finally {
    await browser.close();
  }
  return written;
}

main(async () => {
  const pages = pickList('QA_PAGES', PAGES, (p) => p.slug);
  const viewports = pickList('QA_VIEWPORTS', MATRIX, vpName);
  const target = await startTarget();
  let shots;
  try {
    shots = await captureAll({
      base: target.base,
      pages,
      viewports,
      outFor: (p, v) => path.join(OUT_DIR, 'matrix', p.slug, `${vpName(v)}.png`),
    });
  } finally {
    await target.close();
  }
  const heights = {};
  for (const s of shots) (heights[s.page] ??= {})[s.viewport] = s.height;
  writeJson(path.join(OUT_DIR, 'matrix', 'heights.json'), heights);
  writeJson(
    path.join(OUT_DIR, 'matrix', 'index.json'),
    shots.map((s) => ({ page: s.page, viewport: s.viewport, kind: s.kind, height: s.height, scrollWidth: s.width, file: path.relative(OUT_DIR, s.file) })),
  );
  const sheets = await renderSheets(shots);
  console.log(`[qa] matrix: ${shots.length} screenshots, ${sheets.length} contact sheets in ${path.join(OUT_DIR, 'contact-sheets')}`);
  return 0;
});
