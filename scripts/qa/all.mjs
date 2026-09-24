/**
 * qa:all — runs every check against one target and prints a pass/fail table.
 *
 *   npm run qa:all                              build out/ if missing (QA_BUILD=1 forces), serve it on :4180
 *   QA_BASE_URL=https://www.edcloud.org npm run qa:all    live verification (desktop parity skips itself)
 *   QA_SKIP=perf,matrix npm run qa:all          skip steps
 *
 * Steps run in sequence as child processes sharing the one server. Exit 1 if any step failed.
 * Summary: scripts/qa/output/summary.md.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { OUT_DIR, QA_DIR, ensureDir, main, startTarget } from './lib.mjs';

const STEPS = [
  { name: 'breakpoints', args: ['breakpoints-lint.mjs'] }, // static scan (SPEC §3); needs no server
  { name: 'content', args: ['content.mjs'] },
  { name: 'desktop-parity', args: ['parity.mjs'] },
  { name: 'a11y', args: ['a11y.mjs'] },
  { name: 'mobile-lint', args: ['mobile-lint.mjs'] },
  { name: 'matrix', args: ['matrix.mjs'] },
  { name: 'bytes', args: ['bytes.mjs'] },
  { name: 'early', args: ['early.mjs'] }, // throttled: text fragments and taps before hydration
  { name: 'perf', args: ['perf.mjs'] },
];

main(async () => {
  const skip = (process.env.QA_SKIP ?? '').split(',').map((s) => s.trim());
  const target = await startTarget();
  const rows = [];
  try {
    for (const step of STEPS) {
      if (skip.includes(step.name)) {
        rows.push({ step: step.name, status: 'SKIP', seconds: 0 });
        continue;
      }
      console.log(`\n=== qa:${step.name} ===`);
      const t0 = Date.now();
      const r = spawnSync(process.execPath, step.args.map((a, i) => (i === 0 ? path.join(QA_DIR, a) : a)), {
        stdio: 'inherit',
        env: { ...process.env, QA_BASE_URL: target.base },
      });
      rows.push({ step: step.name, status: r.status === 0 ? 'PASS' : 'FAIL', seconds: Math.round((Date.now() - t0) / 1000) });
    }
  } finally {
    await target.close();
  }
  const md = [
    `# QA summary — ${target.base}${target.live ? ' (live)' : ''}`,
    '',
    '| Step | Status | Seconds |',
    '|---|---|---:|',
    ...rows.map((r) => `| qa:${r.step} | ${r.status} | ${r.seconds} |`),
    '',
  ].join('\n');
  ensureDir(OUT_DIR);
  fs.writeFileSync(path.join(OUT_DIR, 'summary.md'), md);
  console.log('\n' + md);
  return rows.some((r) => r.status === 'FAIL') ? 1 : 0;
});
