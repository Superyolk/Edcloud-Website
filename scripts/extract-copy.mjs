// Pulls every piece of page copy that is NOT in content.js straight out of the rendered reference
// DOM and writes content/copy.ts, so no string is ever retyped by hand.
// Usage: `npm run serve:reference` (port 4174) in one terminal, then `node scripts/extract-copy.mjs`.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:4174/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: 'reduce' });

async function open(file) {
  await page.goto(BASE + file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

// Helpers injected into every page.evaluate call (plain JS source, evaluated in the browser).
const helpers = `
  const norm = s => s.replace(/[ \\t\\r\\n]+/g, ' ').trim();
  const t = el => (el ? norm(el.textContent) : null);
  const q = (root, sel) => root.querySelector(sel);
  const qa = (root, sel) => [...root.querySelectorAll(sel)];
  const sec = label => document.querySelector('section[data-screen-label="' + label + '"]');
  const lines = el => el.innerHTML.split(/<br[^>]*>/).map(s => norm(s.replace(/<[^>]+>/g, '')));
  const blocks = root => qa(root, ':scope > *').map(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'ul') return { tag, items: qa(el, 'li').map(li => {
      const s = q(li, 'strong');
      if (!s) return { text: t(li) };
      const rest = [...li.childNodes].filter(n => n !== s).map(n => n.textContent).join('');
      return { lead: t(s), text: norm(rest) };
    }) };
    return { tag, text: t(el) };
  });
`;

await open('EdCloud%20Home.dc.html');
const shared = await page.evaluate(`(() => { ${helpers}
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const mobileMenu = [
    ['Home', 'EdCloud Home.dc.html'], ['About', 'EdCloud About.dc.html'], ['Services & Results', 'EdCloud Services.dc.html'],
    ['Privacy Policy', 'https://www.edcloud.org/privacy-policy'], ['Accessibility Statement', 'https://www.edcloud.org/accessibility-statement'],
  ].map(([label, href]) => ({ label, href }));
  return {
    wordmark: t(q(header, 'nav > a')),
    markSrc: q(header, 'nav > a img').getAttribute('src'),
    markAlt: q(header, 'nav > a img').getAttribute('alt'),
    navLinks: qa(header, 'nav ul li a').map(a => ({ label: t(a), href: a.getAttribute('href') })),
    mobileMenu,
    footer: {
      col1: qa(footer, ':scope > div:first-child > div:first-child > *').map(el => ({ tag: el.tagName.toLowerCase(), text: t(el), href: el.getAttribute('href'), ariaLabel: el.getAttribute('aria-label'), svgPath: el.querySelector('path') ? el.querySelector('path').getAttribute('d') : null })),
      col2: qa(footer, ':scope > div:first-child > div:last-child > *').map(el => ({ tag: el.tagName.toLowerCase(), text: t(el), href: el.getAttribute('href') })),
      brand: t(q(footer, ':scope > div:last-child a')),
      copyright: t(q(footer, ':scope > div:last-child span')),
    },
  }; })()`);

const home = await page.evaluate(`(() => { ${helpers}
  const hero = sec('Hero');
  const s1 = sec('01 Our Promise'); const s2 = sec('02 Services & Results'); const s4 = sec('04 Deliverables'); const s5 = sec('05 Press'); const s7 = sec('07 Contact Us');
  const titles = qa(document, 'main section[data-screen-label] > div > div:first-child').filter(h => q(h, 'span') && q(h, 'h1,h2')).map(h => ({ n: t(q(h, 'span')), title: t(q(h, 'h1,h2')), tag: q(h, 'h1,h2').tagName.toLowerCase() }));
  // The source template has required="" on the starred fields; the prototype's React runtime drops the empty
  // string attribute from the live DOM, so fall back to the asterisk convention.
  const field = l => { const c = q(l, 'input,textarea'); return { label: norm(l.childNodes[0].textContent), id: c.id, name: c.getAttribute('name'), type: c.tagName === 'TEXTAREA' ? 'textarea' : c.getAttribute('type'), required: c.hasAttribute('required') || /\\*$/.test(norm(l.childNodes[0].textContent)) }; };
  return {
    meta: { title: document.title, description: q(document, 'meta[name=description]').getAttribute('content') },
    hero: { posterSrc: q(hero, 'img').getAttribute('src'), posterAlt: q(hero, 'img').getAttribute('alt'), videoSrc: 'https://video.wixstatic.com/video/11062b_aa9be95a5d7c43ca974ea1c773b8803d/1080p/mp4/file.mp4', h1Lines: lines(q(hero, 'h1')), p: q(hero, 'p').textContent.trim() },
    titles,
    promise: { lead: t(qa(s1, 'p')[0]), p2: t(qa(s1, 'p')[1]), p3: t(qa(s1, 'p')[2]), readMore: t(q(s1, 'a')) },
    servicesLink: t(q(s2, 'a[href*="Services"]')),
    deliverables: { lead: t(q(s4, 'p')), imgSrc: '/images/conference-room.jpg', imgAlt: q(s4, 'img').getAttribute('alt') },
    press: { linkLabel: t(q(s5, 'li a')), figureSrc: q(s5, 'figure img').getAttribute('src'), figureAlt: q(s5, 'figure img').getAttribute('alt') },
    contact: { imgSrc: q(s7, 'img').getAttribute('src'), imgAlt: q(s7, 'img').getAttribute('alt'), h2Lines: lines(qa(s7, 'h2')[1]), fields: qa(s7, 'form label').map(field), submit: t(q(s7, 'form button')) },
  }; })()`);

await open('EdCloud%20About.dc.html');
const about = await page.evaluate(`(() => { ${helpers}
  const hero = sec('About hero'); const s1 = sec('01 Mission & History'); const s2 = sec('02 Managing Partner'); const s3 = sec('03 By The Numbers');
  const titles = qa(document, 'main section[data-screen-label] > div > div:first-child').filter(h => q(h, 'span') && q(h, 'h1,h2')).map(h => ({ n: t(q(h, 'span')), title: t(q(h, 'h1,h2')), tag: q(h, 'h1,h2').tagName.toLowerCase() }));
  return {
    meta: { title: document.title, description: q(document, 'meta[name=description]').getAttribute('content') },
    hero: { imgSrc: q(hero, 'img').getAttribute('src'), imgAlt: q(hero, 'img').getAttribute('alt'), h1: t(q(hero, 'h1')) },
    titles,
    mission: blocks(q(s1, ':scope > div > div:last-child > div')),
    partner: { imgSrc: q(s2, 'img').getAttribute('src'), imgAlt: q(s2, 'img').getAttribute('alt'), h2: t(qa(s2, 'h2')[1]), paragraphs: qa(s2, 'p').map(t) },
    numbers: qa(s3, ':scope > div > div:last-child > div').map(c => ({ stat: t(q(c, 'span')), title: t(q(c, 'h3')), body: t(q(c, 'p')) })),
  }; })()`);

await open('EdCloud%20Services.dc.html');
const services = await page.evaluate(`(() => { ${helpers}
  const hero = sec('Services hero'); const s1 = sec('01 How an engagement works'); const s2 = sec('02 What we do'); const s3 = sec('03 Results'); const s4 = sec('04 Is this a fit'); const s5 = sec('05 Start');
  const titles = qa(document, 'main section[data-screen-label] > div > div:first-child').filter(h => q(h, 'span') && q(h, 'h2')).map(h => ({ n: t(q(h, 'span')), title: t(q(h, 'h2')), tag: 'h2' }));
  return {
    meta: { title: document.title, description: q(document, 'meta[name=description]').getAttribute('content') },
    hero: { imgSrc: q(hero, 'img').getAttribute('src'), imgAlt: q(hero, 'img').getAttribute('alt'), h1: t(q(hero, 'h1')), p: t(q(hero, 'p')) },
    titles,
    engagementLead: t(q(s1, 'p')),
    whatWeDoLead: t(q(s2, ':scope > div > div:nth-child(2) p')),
    dlLabels: qa(s2, 'li:first-child dt').map(t),
    resultsLead: t(q(s3, 'p')),
    tableHead: qa(s3, 'th').map(t),
    fit: qa(s4, ':scope > div > div:last-child > div > div').map(col => ({ title: t(q(col, 'h3')), items: qa(col, 'li').map(t) })),
    start: { n: t(q(s5, ':scope > div > span')), h2: t(q(s5, 'h2')), cta: { label: t(qa(s5, 'a')[0]), href: qa(s5, 'a')[0].getAttribute('href') }, email: { label: t(qa(s5, 'a')[1]), href: qa(s5, 'a')[1].getAttribute('href') } },
  }; })()`);

await browser.close();

const out = `// GENERATED by scripts/extract-copy.mjs from the reference prototypes in
// "EdCloud Website/design_handoff_edcloud_site/reference". Do not hand-edit; re-run the script instead.
// Copy that lives in content.js (logos, press, capabilities, services, cases, proof, phases, results)
// is NOT duplicated here. Reference hrefs like "EdCloud About.dc.html" are mapped to routes in content/site.ts.
export const SHARED = ${JSON.stringify(shared, null, 2)} as const;

export const HOME_COPY = ${JSON.stringify(home, null, 2)} as const;

export const ABOUT_COPY = ${JSON.stringify(about, null, 2)} as const;

export const SERVICES_COPY = ${JSON.stringify(services, null, 2)} as const;
`;
writeFileSync('content/copy.ts', out);
console.log('wrote content/copy.ts', out.length, 'bytes');
