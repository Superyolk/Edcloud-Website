# EdCloud Venture Partners — Website

The edcloud.org site: a Next.js 16 static export (`app/`, `components/`, `content/`) built from the
Claude Design handoff in `EdCloud Website/design_handoff_edcloud_site/`, served by a Cloudflare Worker
with static assets (`wrangler.jsonc`, `src/worker.js`) — the same hosting model as the EBO and
License Ladder sites.

## Pages

| Route | Source |
|---|---|
| `/` — Home (hero, Our Promise, Services & Results, Featured Projects, Deliverables, Press, Select Clients, Contact) | `app/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/services-and-results` | `app/services-and-results/page.tsx` |
| `/privacy-policy`, `/accessibility-statement` | `app/privacy-policy`, `app/accessibility-statement` (copy in `content/legal.ts`) |

Old URLs keep working via `public/_redirects`: `/research-and-technology` and `/services` →
`/services-and-results`, `/contact` → `/#contact`.

## Structure

```
app/                       pages, tokens.css (verbatim from the handoff), globals.css, CSS Modules
components/                header, footer, section shell, forms, home widgets, LegalPage
content/                   content.js + copy.ts (from the handoff/reference), legal.ts, site.ts (link → route map)
public/                    copied into the export as-is: images/, _redirects, _headers, robots.txt, sitemap.xml, favicons
src/worker.js              Cloudflare Worker: apex→www redirect, POST /api/contact (Resend), else serve ./out
scripts/                   visual-diff + interaction tests, copy extractor, single-file-preview.py
assets/media/              trimmed client logos, site photos, headshot — not served; for self-hosting the Wix-hot-linked images later
EdCloud Website/           the design handoff (reference prototypes, tokens, content, brief)
```

## Run locally

```sh
npm install
npm run dev                          # http://localhost:3000
npm run build                        # static export → ./out, then scripts/defer-hydration.mjs (phones run the JS after first paint)
npx wrangler dev                     # the Worker serving ./out, with /api/* (needs .dev.vars for the form key)
python3 scripts/single-file-preview.py   # after a build: one self-contained HTML file to open from disk
npm run test:visual / test:interactions  # parity with the design reference; behaviour checks
```

## The contact form

The home page's contact form posts to the Worker at `POST /api/contact` (first/last name, email,
phone, message), which emails the message via [Resend](https://resend.com) to `info@edcloud.org`
(`CONTACT_TO` overrides). Without `RESEND_API_KEY` it fails gracefully and tells the visitor to
email directly. There is no newsletter.

## The icons

The brand mark, the favicon and the Apple touch icon are all generated from one source photograph,
`scripts/icon/source.jpg`, so they can never drift apart:

```
cd scripts/icon && python3 build-icons.py ../..   # writes the three assets
python3 scripts/icon/validate-icons.py .          # run from the repo root
```

The generator lifts the "e" silhouette out of the photograph and redraws the mark on a flat plate.
The photograph's own lighting gradient and drop shadow made the glyph read as off-centre and the
corners as uneven, so masking the photograph directly does not work. Each output size is reduced
once from a 1600px master with its corner radius rendered at the same reduction, which is what keeps
the anti-aliasing identical on all four corners at 16px as well as 256px.

The validator fails if any corner inset differs from the other three, if a corner is elliptical
rather than circular, or if the glyph sits more than half a pixel off centre at any size. The Apple
touch icon stays square and opaque on purpose: iOS applies its own, larger mask and renders
transparency poorly.

## SEO

Everything is rendered into the static HTML, so search engines and AI answer engines get it without
running JavaScript.

- **Per-page metadata** — `content/seo.ts` holds the site constants and a `pageMeta()` helper that
  every page calls. It produces the title, a search-length description (under ~160 characters; the
  longer reference descriptions stay untouched in `content/copy.ts`), the canonical URL, and a full
  Open Graph + Twitter card. Next *replaces* rather than merges a page's `openGraph` block, which is
  why the helper repeats the image, type and site name — do not hand-roll a page's block.
- **Structured data** — schema.org JSON-LD via `components/JsonLd.tsx`: `ProfessionalService` and
  `WebSite` on Home, `ItemList` of the six `Service` entries on Services & Results, `Person` for the
  Managing Partner on About, and a `BreadcrumbList` on every sub-page. The nodes are linked by
  `@id`, and every fact restates something already visible on the page.
- **Share card** — `public/images/og-edcloud.jpg` (1200×630). Regenerate it if the headline changes.
- **Sitemap** — generated at build time by `app/sitemap.ts`, so `lastmod` is the deploy date rather
  than a stale hand-written value.
- **robots.txt** — `public/robots.txt` allows search crawlers *and* names the AI crawlers explicitly
  (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and the rest). Several of
  those only read their own user-agent block, so being listed is what makes the site quotable in AI
  answers. Remove a block to opt out of that engine.
- **llms.txt** — `public/llms.txt` is a plain-text brief for AI agents: what EdCloud is, the six
  services with timelines, the four client results, and contact details. Keep it in step with the
  site when the services or results change.
- **Semantics** — one `<h1>` per page, headings in order, alt text on every image, and the
  Worker's apex→www redirect keeps one canonical host.

## Deploy to Cloudflare

Every merge to `main` deploys automatically through `.github/workflows/deploy.yml`, which lints,
builds, checks the icons and then runs `wrangler deploy`. It needs two repository secrets, under
**Settings → Secrets and variables → Actions**:

| secret | where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages → Overview, in the right-hand column |

Until both exist the job stops on its first step and says which one is missing, rather than failing
later inside wrangler. Add them, then re-run the job from the Actions tab, or push anything to
`main`.

One more secret lives on the Worker itself, not in GitHub: **Workers & Pages → edcloud-website →
Settings → Variables and Secrets** → add `RESEND_API_KEY`. In Resend, add and verify the
`edcloud.org` domain (it gives you a few DNS records) so mail can be sent from
`website@edcloud.org`. Without it the contact form fails gracefully and tells the visitor to email
directly.

The Worker gets a `*.workers.dev` URL, so you can check a deploy before any DNS changes.

### Workers Builds instead

Cloudflare can also build from the repo itself, configured in the dashboard rather than here:
**Workers & Pages → Create → Import a repository** → `Superyolk/Edcloud-Website`, production branch
`main`, build command `npm run build`, deploy command `npx wrangler deploy`, root directory `/`.

Run one or the other. If Workers Builds is connected *and* the workflow above is active, every merge
deploys twice. To use Workers Builds, delete `.github/workflows/deploy.yml`.

### Deploying by hand

```
npx wrangler login
npm run build
npx wrangler deploy
```

## Moving from Wix to Spaceship + Cloudflare

The end state: the **domain is registered at Spaceship**, **DNS is hosted at Cloudflare**, and
**Cloudflare serves the site** from this repo. Google Workspace mail for `@edcloud.org` must keep working
throughout, so the DNS records come first.

### Before you touch anything

1. **Write down every DNS record** the domain has today. In Wix: Domains → edcloud.org → Advanced →
   Edit DNS (or wherever the domain is registered, if not Wix). You need in particular the Google
   Workspace records: the **MX** records, the **SPF** `TXT` (`v=spf1 include:_spf.google.com ~all`),
   the **DKIM** `TXT` on `google._domainkey`, any `DMARC` `TXT` on `_dmarc`, and any verification
   `TXT` records. Screenshot the page too.
2. Deploy the site to Cloudflare first (section above) and check it on the `workers.dev` URL. Nothing
   below should start until the site works there.
3. Note when the Wix Premium plan renews so you don't get charged for another year.

### Step 1 — Get the domain to Spaceship

*If `edcloud.org` is registered at Wix* (most likely if you bought it there):

1. Wix → Domains → edcloud.org → **Transfer away from Wix**. Wix unlocks the domain and emails the
   **EPP / authorization code**. (ICANN rules block transfers within 60 days of registration or a
   previous transfer, and Wix keeps the domain locked while any WHOIS contact change is pending.)
2. Make sure the domain's registrant email is one you can read; the transfer approval goes there.
3. Spaceship → **Domains → Transfer** → enter `edcloud.org` and the authorization code, pay the
   transfer fee (it adds a year of registration).
4. Approve the transfer from the email Spaceship sends. Transfers complete in up to 5 days, often
   within a day. **The site and email keep working during the transfer** because DNS doesn't change
   yet.

*If the domain is already at Spaceship or another registrar*, skip to Step 2.

### Step 2 — Put DNS on Cloudflare

1. Cloudflare dashboard → **Add a domain** → `edcloud.org` → Free plan.
2. Cloudflare scans and imports the existing records. **Compare the list to what you wrote down** and add
   anything missing, especially all Google MX records, the SPF, DKIM, and DMARC TXT records. Delete
   Wix-specific records (Wix `A` records pointing to `185.230.63.x` and the `www` CNAME to Wix).
3. Don't add A/CNAME records for the site yourself; the Worker custom domain in Step 3 creates them.
4. Cloudflare shows two nameservers (for example `ada.ns.cloudflare.com` and `rob.ns.cloudflare.com`).
   In Spaceship → the domain → **Nameservers** → Custom → enter those two. Propagation takes minutes
   to a few hours; Cloudflare emails when the zone is active.
5. In Cloudflare → SSL/TLS, set the mode to **Full (strict)**.

### Step 3 — Point the domain at the site

1. Cloudflare → Workers & Pages → `edcloud-website` → **Settings → Domains & Routes → Add →
   Custom domain**. Add `www.edcloud.org`, then add `edcloud.org` the same way. Cloudflare creates the
   DNS records and certificates. The Worker 301-redirects the apex to `www`.
2. Check: `https://www.edcloud.org/`, `/about`, `/services-and-results`, `/privacy-policy`,
   `/research-and-technology` (should redirect), send yourself a contact-form message, and send an
   email to `aaron@edcloud.org` from another account to confirm mail still arrives.
3. Optional: Cloudflare → Rules → **Redirect Rules** is where any future URL redirects go; the
   `public/_redirects` file already handles the old Wix paths.

### Step 4 — Shut Wix down

1. Wix → Subscriptions → cancel the Premium plan (after confirming the new site is live and mail works).
2. Leave the Wix site itself unpublished rather than deleted for a month, in case you need to check
   something on it.

### If something goes wrong

- **Site not loading after the nameserver change**: DNS is still propagating. Check
  `https://dnschecker.org` for `edcloud.org` NS; when it shows Cloudflare, the custom domain will work.
- **Email stops**: an MX/TXT record was missed in Step 2. Re-add it at Cloudflare from your notes.
  Google's own list is at Admin console → Apps → Google Workspace → Gmail → Setup → MX records.
- **Contact form says it isn't connected**: `RESEND_API_KEY` is missing on the Worker, or the
  edcloud.org domain isn't verified in Resend.
