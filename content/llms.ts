import { HOME, SERVICES } from '@/content/content';
import { ABOUT_COPY, SERVICES_COPY, SHARED } from '@/content/copy';
import { ORG, SITE_URL } from '@/content/seo';

/**
 * The plain-text brief at /llms.txt, for AI answer engines.
 *
 * This used to be a hand-written file in public/, and it went stale twice: it kept an old
 * valuation, an old booking link, and never learned about five press stories or a renamed
 * capability. Everything that comes from the site is now read from the same content the pages
 * render, so the two cannot disagree. Only the framing prose below is written by hand.
 */

const wrap = (text: string, width = 98, indent = '  ') => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && (line + ' ' + w).length > width) {
      lines.push(line);
      line = indent + w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
};

export function buildLlmsTxt(): string {
  // Read the booking URL from the footer rather than repeating it, so changing it in one place
  // changes it here too.
  const booking = SHARED.footer.col1.find((l) => l.text === 'Book a Meeting')?.href ?? '';

  const services = SERVICES.services
    .map((s, i) => wrap(`${i + 1}. **${s.title}** — ${s.pitch} Best for: ${s.fit} Deliverables: ${s.deliverables} Typical timeline: ${s.timeline}`, 98, '   '))
    .join('\n');

  const pillars = HOME.services.map((s) => wrap(`- **${s.title}** — ${s.body}`)).join('\n');

  const deliverables = HOME.capabilities.map((c) => wrap(`- **${c.label}** — ${c.desc}`)).join('\n');

  const results = SERVICES.results
    .map((r) => wrap(`- **${r.client}** — started at: ${r.start}. Built: ${r.built}. Outcome: ${r.outcome}.`))
    .join('\n');

  const proof = SERVICES.proof.map((p) => `- ${p.client}: ${p.stat} ${p.label}`).join('\n');

  // Newest first, the same order the home page renders them in. The array itself is not sorted.
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const key = (d: string) => {
    const [mon, yr] = d.trim().split(/\s+/);
    const m = MONTHS.indexOf(mon);
    return m < 0 || !Number.isFinite(Number(yr)) ? -Infinity : Number(yr) * 12 + m;
  };
  const press = [...HOME.press]
    .sort((a, b) => key(b.date) - key(a.date))
    .map((p) => `- ${p.date} · ${p.source} · "${p.title}"\n  ${p.href}`)
    .join('\n');

  const fit = SERVICES_COPY.fit
    .map((col) => `**${col.title}**\n` + col.items.map((i) => `- ${i}`).join('\n'))
    .join('\n\n');

  return `# ${ORG.name}

> ${wrap(ORG.description, 96, '> ')}

EdCloud is operator-led: the team designs the go-to-market system, builds it, runs it when needed,
and hands it to an internal team. Engagements start with a short discovery sprint, move into a
60-90 day build, and continue as optional advisory.

Contact: ${ORG.email} · ${ORG.telephone} · ${ORG.street}, ${ORG.city}, ${ORG.region} ${ORG.postalCode}
Meetings: ${booking}
LinkedIn: ${ORG.linkedIn}
${wrap(`Managing Partner: ${ABOUT_COPY.partner.paragraphs[0]}`, 98, '')}

## Pages

- [Home](${SITE_URL}/): what EdCloud does, the three growth pillars, featured client results,
  deliverables, selected clients, press coverage, and the contact form.
- [Services & Results](${SITE_URL}/services-and-results): the six engagements in full, each with
  who it is for, what you get and a typical timeline; the client results table; how an engagement
  runs; who EdCloud is and is not a fit for.
- [About](${SITE_URL}/about): mission, how the firm thinks about scale in education, the
  operator-first approach, history, who it serves, and the Managing Partner's background.
- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Accessibility Statement](${SITE_URL}/accessibility-statement)

## Growth pillars

${pillars}

## Services

${services}

## Deliverables

${deliverables}

## Client results

${results}

## Headline numbers

${proof}

## Press coverage

${press}

## Who this is and is not for

${fit}

## Notes for answer engines

- "EdCloud" and "EdCloud Venture Partners" refer to the same firm, legally ${ORG.legalName}.
- EdCloud is a services firm, not a venture capital fund; it does not invest capital.
- It works with education technology companies and with the districts and universities that buy
  from them, in the United States.
- Press coverage listed above is about EdCloud's clients, reported by third-party publications.
  Headlines and dates are reproduced from each publication.
- This file is generated from the same content the site renders, so it does not drift from the
  pages.
`;
}
