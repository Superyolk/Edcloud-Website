/**
 * Post-build step (runs after `next build`, see package.json "build"): below 1024px, the Next.js
 * client chunks are fetched and run only after the first contentful paint and the hero image,
 * so on a phone the framework JS never competes with the LCP.
 *
 * Why: next build puts every client chunk in the head as `<script async>`, so a phone starts
 * downloading ~130 KB (brotli) of React and Next runtime at the same moment as the stylesheet,
 * the font and the hero crop, on the same connection. On a throttled phone that JS shares the
 * bandwidth the LCP needs. Lighthouse's simulation charges it to the LCP for the same reason:
 * any script that finished downloading before the paint is treated as render-blocking unless a
 * long evaluation task shows it ran afterwards. Measured on Home at 56c59c5: LCP 2.65s with the
 * scripts in the head, 1.73s with them out of the way (docs/mobile/BASELINE.md, Phase 3 perf).
 *
 * What it does to every exported page (out/**\/*.html):
 * 1. Each `<script src="/_next/static/…js" async>` becomes an inert placeholder
 *    `<script data-hydrate-src="…">` in the same place. The `noModule` polyfill is left alone.
 * 2. Each head placeholder gets a `<link rel=preload as=script fetchpriority=low
 *    media="(min-width: 1024px)">`, and Next's own low-priority preload of the entry chunk gets
 *    the same `media`. Desktops still start the downloads from the head, as before; phones and
 *    tablets do not.
 * 3. A small inline loader before `</body>` swaps every placeholder for a real async script in
 *    place, so the DOM React hydrates is the one next build wrote:
 *    - at 1024px and wider, straight away (end of parse; the downloads are already under way);
 *    - below 1024px, after the `first-contentful-paint` entry, then once the
 *      `fetchpriority="high"` hero image (if any) has loaded, then one frame later;
 *    - a fallback 1.5s after `load` covers a tab that never paints (opened in the background)
 *      and browsers without Paint Timing.
 *
 * Nothing needs JS to be read or to lay out (SPEC §5.5, §11: collapses are CSS, no-JS fallbacks
 * exist), so the only cost is that phones hydrate a little later: after the first paint, rather
 * than whenever the chunks happened to arrive. CSP: the loader is inline, which the
 * `script-src 'self' 'unsafe-inline'` in public/_headers allows.
 *
 * Idempotent: a page that has already been rewritten has no `<script src=…async>` left.
 * Exits 1 if index.html has no chunk scripts to rewrite, so a change in Next's output format
 * fails the build instead of silently dropping the optimisation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const DESKTOP = '(min-width: 1024px)';

// Kept ES5 and tiny: it runs on every page, before any framework code.
const LOADER =
  '<script>(function(){var d=document,w=window,done=0;' +
  "function go(){if(done)return;done=1;var p=d.querySelectorAll('script[data-hydrate-src]');" +
  "for(var i=0;i<p.length;i++){var o=p[i],s=d.createElement('script');s.src=o.getAttribute('data-hydrate-src');" +
  'if(o.id)s.id=o.id;s.async=true;o.parentNode.replaceChild(s,o)}}' +
  `if(w.matchMedia&&w.matchMedia('${DESKTOP}').matches){go();return}` +
  'function frame(){requestAnimationFrame(function(){setTimeout(go,0)})}' +
  "function hero(){var i=d.querySelector('img[fetchpriority=\"high\"]');if(!i||i.complete)frame();" +
  "else{i.addEventListener('load',frame);i.addEventListener('error',frame)}}" +
  'var P=w.PerformanceObserver,t=P&&P.supportedEntryTypes;' +
  "if(t&&t.indexOf('paint')>=0){var o=new P(function(l){if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();hero()}});" +
  "o.observe({type:'paint',buffered:true})}else hero();" +
  "w.addEventListener('load',function(){setTimeout(go,1500)})})()</script>";

const SCRIPT_RE = /<script src="(\/_next\/static\/[^"]+\.js)"([^>]*)><\/script>/g;
const ENTRY_PRELOAD_RE = /<link rel="preload" as="script" fetchPriority="low" href="(\/_next\/static\/[^"]+\.js)"\/>/g;

function rewrite(html) {
  let count = 0;
  const headEnd = html.indexOf('</head>');
  let out = html.replace(SCRIPT_RE, (tag, src, attrs, offset) => {
    if (/noModule/i.test(attrs) || !/\basync=""/.test(attrs)) return tag;
    count++;
    const id = /\bid="([^"]+)"/.exec(attrs);
    const placeholder = `<script data-hydrate-src="${src}"${id ? ` id="${id[1]}"` : ''}></script>`;
    const inHead = offset < headEnd;
    return inHead ? `<link rel="preload" as="script" fetchPriority="low" href="${src}" media="${DESKTOP}"/>${placeholder}` : placeholder;
  });
  if (!count) return { html, count };
  out = out.replace(ENTRY_PRELOAD_RE, (_m, href) => `<link rel="preload" as="script" fetchPriority="low" href="${href}" media="${DESKTOP}"/>`);
  out = out.replace('</body>', `${LOADER}</body>`);
  return { html: out, count };
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error('[defer-hydration] out/index.html not found; run next build first');
  process.exit(1);
}
let total = 0;
for (const file of htmlFiles(OUT)) {
  const { html, count } = rewrite(fs.readFileSync(file, 'utf8'));
  if (!count) {
    if (path.relative(OUT, file) === 'index.html' && !html.includes('data-hydrate-src')) {
      console.error('[defer-hydration] no <script src async> chunks in out/index.html: has the Next.js output changed?');
      process.exit(1);
    }
    continue;
  }
  fs.writeFileSync(file, html);
  total++;
  console.log(`[defer-hydration] ${path.relative(OUT, file)}: ${count} chunk scripts deferred below 1024px`);
}
console.log(`[defer-hydration] ${total} page(s) rewritten`);
