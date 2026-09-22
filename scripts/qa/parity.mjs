/**
 * qa:golden / qa:desktop-parity — desktop (1024/1280/1440) must stay pixel-identical.
 *
 *   npm run qa:golden            refuses to overwrite existing goldens...
 *   QA_UPDATE_GOLDEN=1 npm run qa:golden   ...unless this is set (or: npm run qa:golden -- --update).
 *   npm run qa:desktop-parity    captures fresh screenshots, pixelmatch threshold 0.1, fails on ANY
 *                                differing pixel or size change. Diffs go to scripts/qa/output/parity/.
 *
 * Skipped when QA_BASE_URL points at a non-local host (goldens are of the local build).
 */
import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { captureAll } from './capture.mjs';
import { DESKTOP_PARITY, GOLDEN_DIR, OUT_DIR, PAGES, ensureDir, main, startTarget, writeJson } from './lib.mjs';

const mode = process.argv[2] === 'golden' ? 'golden' : 'parity';
const goldenFile = (p, v) => path.join(GOLDEN_DIR, `${p.slug}-${v.w}.png`);

main(async () => {
  const target = await startTarget();
  try {
    if (target.live) {
      console.log(`[qa] ${mode}: skipped for live target ${target.base}`);
      return 0;
    }
    if (mode === 'golden') {
      const existing = PAGES.flatMap((p) => DESKTOP_PARITY.map((v) => goldenFile(p, v))).filter((f) => fs.existsSync(f));
      if (existing.length && process.env.QA_UPDATE_GOLDEN !== '1' && !process.argv.includes('--update')) {
        console.error(`[qa] ${existing.length} goldens already exist in ${GOLDEN_DIR}. Set QA_UPDATE_GOLDEN=1 to overwrite.`);
        return 1;
      }
      await captureAll({ base: target.base, pages: PAGES, viewports: DESKTOP_PARITY, outFor: goldenFile });
      console.log(`[qa] goldens written to ${GOLDEN_DIR}`);
      return 0;
    }

    const outDir = ensureDir(path.join(OUT_DIR, 'parity'));
    const shots = await captureAll({
      base: target.base,
      pages: PAGES,
      viewports: DESKTOP_PARITY,
      outFor: (p, v) => path.join(outDir, `${p.slug}-${v.w}.actual.png`),
      log: false,
    });
    const rows = [];
    for (const s of shots) {
      const gf = path.join(GOLDEN_DIR, `${s.page}-${s.w}.png`);
      if (!fs.existsSync(gf)) {
        rows.push({ page: s.page, width: s.w, status: 'NO_GOLDEN', diffPixels: null });
        continue;
      }
      const a = PNG.sync.read(fs.readFileSync(gf));
      const b = PNG.sync.read(fs.readFileSync(s.file));
      if (a.width !== b.width || a.height !== b.height) {
        rows.push({ page: s.page, width: s.w, status: 'SIZE', golden: `${a.width}x${a.height}`, actual: `${b.width}x${b.height}`, diffPixels: null });
        continue;
      }
      const diff = new PNG({ width: a.width, height: a.height });
      const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
      if (n > 0) fs.writeFileSync(path.join(outDir, `${s.page}-${s.w}.diff.png`), PNG.sync.write(diff));
      else fs.rmSync(s.file);
      rows.push({ page: s.page, width: s.w, status: n === 0 ? 'PASS' : 'FAIL', diffPixels: n });
    }
    writeJson(path.join(OUT_DIR, 'parity.json'), rows);
    for (const r of rows) {
      console.log(`[qa] parity ${r.status.padEnd(9)} ${r.page} @ ${r.width}: ${r.diffPixels ?? `${r.golden ?? ''} vs ${r.actual ?? ''}`}`);
    }
    const bad = rows.filter((r) => r.status !== 'PASS');
    console.log(`[qa] desktop parity: ${rows.length - bad.length}/${rows.length} identical`);
    return bad.length ? 1 : 0;
  } finally {
    await target.close();
  }
});
