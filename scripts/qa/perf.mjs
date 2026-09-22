/**
 * qa:perf — Lighthouse mobile (default simulated throttling, Moto G Power emulation) against every
 * page, QA_LH_RUNS runs each (default 3), cold profile per run. Medians of the four category scores
 * plus LCP, CLS, TBT, FCP, SI, total transfer bytes and JS transfer bytes go to
 * scripts/qa/output/perf.json; the raw per-run numbers are kept alongside.
 *
 * Uses the system Chrome (CHROME_PATH, default C:/Program Files/Google/Chrome/Application/chrome.exe).
 * Budget: Perf >= 95, A11y/BP/SEO = 100, LCP <= 2000ms, CLS <= 0.02, TBT <= 100ms. Exit 1 on a
 * miss unless QA_REPORT_ONLY=1.
 *
 * Note: locally `serve` gzips; production (Cloudflare) serves brotli, so live byte counts differ a little.
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR, PAGES, main, median, pageUrl, startTarget, writeJson } from './lib.mjs';

const RUNS = Number(process.env.QA_LH_RUNS || 3);
const DEFAULT_CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CHROME = process.env.CHROME_PATH || (fs.existsSync(DEFAULT_CHROME) ? DEFAULT_CHROME : undefined);

const BUDGET = { performance: 95, accessibility: 100, 'best-practices': 100, seo: 100, lcp: 2000, cls: 0.02, tbt: 100 };

let runSeq = 0;

/** Lighthouse 13 reports the LCP element inside the lcp-breakdown insight as a `node` item. */
function lcpNode(lhr) {
  const items = lhr.audits['lcp-breakdown-insight']?.details?.items ?? [];
  const node = items.find((i) => i.type === 'node');
  return node ? { selector: node.selector, label: node.nodeLabel, snippet: node.snippet } : null;
}

async function runOnce(url) {
  // Our own fresh profile dir per run: when chrome-launcher creates the temp profile itself, its
  // cleanup throws an uncatchable EPERM on Windows from a process 'exit' handler.
  const userDataDir = path.join(OUT_DIR, 'lh-profiles', `${process.pid}-${runSeq++}`);
  fs.mkdirSync(userDataDir, { recursive: true });
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'], chromePath: CHROME, userDataDir });
  try {
    const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' });
    const lhr = result.lhr;
    const score = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
    const num = (id) => lhr.audits[id]?.numericValue ?? null;
    const items = lhr.audits['resource-summary']?.details?.items ?? [];
    const summary = (type) => items.find((i) => i.resourceType === type)?.transferSize ?? null;
    const failing = Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 1 && !['informative', 'notApplicable', 'manual'].includes(a.scoreDisplayMode))
      .map((a) => a.id);
    return {
      performance: score('performance'),
      accessibility: score('accessibility'),
      'best-practices': score('best-practices'),
      seo: score('seo'),
      lcp: num('largest-contentful-paint'),
      cls: num('cumulative-layout-shift'),
      tbt: num('total-blocking-time'),
      fcp: num('first-contentful-paint'),
      si: num('speed-index'),
      totalBytes: num('total-byte-weight'),
      jsBytes: summary('script'),
      lcpElement: lcpNode(lhr),
      failingAudits: failing,
    };
  } finally {
    // chrome-launcher's temp-profile cleanup throws EPERM on Windows; the result is already in hand.
    try {
      await chrome.kill();
    } catch {
      /* ignore */
    }
  }
}

main(async () => {
  const target = await startTarget();
  const out = { generated: new Date().toISOString(), base: target.base, runs: RUNS, budget: BUDGET, pages: {} };
  try {
    for (const p of PAGES) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) runs.push(await runOnce(pageUrl(target.base, p)));
      const keys = ['performance', 'accessibility', 'best-practices', 'seo', 'lcp', 'cls', 'tbt', 'fcp', 'si', 'totalBytes', 'jsBytes'];
      const med = Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
      const misses = [];
      for (const k of ['performance', 'accessibility', 'best-practices', 'seo']) if (med[k] < BUDGET[k]) misses.push(`${k} ${med[k]} < ${BUDGET[k]}`);
      for (const k of ['lcp', 'cls', 'tbt']) if (med[k] > BUDGET[k]) misses.push(`${k} ${med[k]} > ${BUDGET[k]}`);
      out.pages[p.slug] = {
        median: med,
        misses,
        lcpElement: runs[0].lcpElement,
        failingAudits: [...new Set(runs.flatMap((r) => r.failingAudits))],
        runs,
      };
      console.log(
        `[qa] perf ${p.slug}: P${med.performance} A${med.accessibility} BP${med['best-practices']} SEO${med.seo} ` +
          `LCP ${Math.round(med.lcp)}ms CLS ${med.cls?.toFixed(3)} TBT ${Math.round(med.tbt)}ms ` +
          `bytes ${med.totalBytes} js ${med.jsBytes}${misses.length ? ' — MISS: ' + misses.join('; ') : ''}`,
      );
    }
  } finally {
    await target.close();
  }
  writeJson(path.join(OUT_DIR, 'perf.json'), out);
  try {
    fs.rmSync(path.join(OUT_DIR, 'lh-profiles'), { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    /* Chrome may still hold a file for a moment; the folder is gitignored output */
  }
  const missed = Object.values(out.pages).some((pg) => pg.misses.length);
  return missed && process.env.QA_REPORT_ONLY !== '1' ? 1 : 0;
});
