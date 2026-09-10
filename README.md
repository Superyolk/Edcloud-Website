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
src/worker.js              Cloudflare Worker: apex→www redirect, POST /api/contact and /api/subscribe (Resend), else serve ./out
scripts/                   visual-diff + interaction tests, copy extractor, single-file-preview.py
assets/media/              trimmed client logos, site photos, headshot — not served; for self-hosting the Wix-hot-linked images later
EdCloud Website/           the design handoff (reference prototypes, tokens, content, brief)
```

## Run locally

```sh
npm install
npm run dev                          # http://localhost:3000
npm run build                        # static export → ./out
npx wrangler dev                     # the Worker serving ./out, with /api/* (needs .dev.vars for the form key)
python3 scripts/single-file-preview.py   # after a build: one self-contained HTML file to open from disk
npm run test:visual / test:interactions  # parity with the design reference; behaviour checks
```

## Forms

Both forms post to the Worker, which emails via [Resend](https://resend.com): the contact form to
`POST /api/contact` (first/last name, email, phone, message) and the footer newsletter to
`POST /api/subscribe` (email + consent). Messages go to `info@edcloud.org` (`CONTACT_TO` overrides).
Without `RESEND_API_KEY` the forms fail gracefully and tell the visitor to email directly.

## Deploy to Cloudflare (Workers Builds)

1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** → `Superyolk/Edcloud-Website`.
2. Build settings: production branch `main`; **build command** `npm run build`; **deploy command**
   `npx wrangler deploy`; root directory `/`.
3. **Settings → Variables and Secrets** → add secret `RESEND_API_KEY`. In Resend, add and verify the
   `edcloud.org` domain (it gives you a few DNS records) so mail can be sent from `website@edcloud.org`.
4. Every push to `main` builds and deploys. The Worker gets a `*.workers.dev` URL you can test before
   any DNS changes.

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
