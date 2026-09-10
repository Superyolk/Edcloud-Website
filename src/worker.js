/* ============================================================
   EdCloud Venture Partners — Cloudflare Worker
   - Serves the static site from the repo root (assets binding).
   - Redirects the apex domain to the canonical www host.
   - Handles POST /api/contact: emails the submission via Resend
     with the visitor's address as Reply-To.
   ============================================================ */

const DEFAULT_TO = 'info@edcloud.org';
const DEFAULT_FROM = 'EdCloud Website <website@edcloud.org>';
const DEFAULT_BACK = '/#contact';
const DEFAULT_HOST = 'www.edcloud.org';

const str = (v) => (v == null ? '' : String(v)).trim();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Canonical host: apex → www (only when a canonical host is configured and we're on the apex).
    const canonical = env.CANONICAL_HOST || DEFAULT_HOST;
    const apex = canonical.replace(/^www\./, '');
    if (url.hostname === apex && canonical !== apex) {
      url.hostname = canonical;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/contact' || url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);
      return url.pathname === '/api/contact' ? handleContact(request, env) : handleSubscribe(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');

  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return respond(wantsJson, false, 400, "We couldn't read that submission. Please try again.");
  }

  const first = str(data.firstName || data['c-first']).slice(0, 100);
  const last = str(data.lastName || data['c-last']).slice(0, 100);
  const name = (first + ' ' + last).trim() || str(data.name).slice(0, 200);
  const email = str(data.email || data['c-email']).slice(0, 200);
  const phone = str(data.phone || data['c-phone']).slice(0, 60);
  const subject = str(data.subject).slice(0, 200);
  const message = str(data.message || data['c-message']).slice(0, 5000);
  const trap = str(data.company); // honeypot — real visitors never see this field

  if (trap) return respond(wantsJson, true, 200, 'Thanks!'); // accept silently so bots don't retry

  if (!name || !email) {
    return respond(wantsJson, false, 400, 'Please add your name and email address.');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return respond(wantsJson, false, 400, "That email address doesn't look right.");
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return respond(wantsJson, false, 503, `Our contact form isn't connected yet. Please email ${env.CONTACT_TO || DEFAULT_TO} directly.`);
  }

  const to = env.CONTACT_TO || DEFAULT_TO;
  const from = env.CONTACT_FROM || DEFAULT_FROM;
  const subj = `Website contact: ${subject || name}`;
  const phoneLine = phone ? `Phone:   ${phone}\n` : '';

  const text =
    'New message from the edcloud.org contact form\n\n' +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` + phoneLine +
    `Subject: ${subject || '—'}\n\n` +
    `${message || '(no message)'}\n`;

  const html =
    `<p><strong>New message from the edcloud.org contact form</strong></p>` +
    `<table style="border-collapse:collapse;font:14px system-ui">` +
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${esc(name)}</td></tr>` +
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>` +
    (phone ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${esc(phone)}</td></tr>` : '') +
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td>${esc(subject || '—')}</td></tr>` +
    `</table><hr style="border:0;border-top:1px solid #eee;margin:16px 0">` +
    `<p style="white-space:pre-wrap;font:15px/1.5 system-ui">${esc(message)}</p>`;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: subj, text, html }),
    });
  } catch {
    return respond(wantsJson, false, 502, `We couldn't send your message right now. Please email ${to} directly.`);
  }
  if (!res.ok) {
    return respond(wantsJson, false, 502, `We couldn't send your message right now. Please email ${to} directly.`);
  }
  return respond(wantsJson, true, 200, "Thanks — we got your message and will be in touch shortly.");
}

async function handleSubscribe(request, env) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    data = ct.includes('application/json') ? await request.json() : Object.fromEntries((await request.formData()).entries());
  } catch {
    return respond(wantsJson, false, 400, "We couldn't read that. Please try again.", '/#subscribe');
  }
  const email = str(data.email || data['n-email']).slice(0, 200);
  if (data['n-consent'] && !data.consent) data.consent = 'yes';
  if (str(data.company)) return respond(wantsJson, true, 200, 'Thanks!', '/#subscribe');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return respond(wantsJson, false, 400, "That email address doesn't look right.", '/#subscribe');
  if (!data.consent) return respond(wantsJson, false, 400, 'Please tick the box to confirm you want the newsletter.', '/#subscribe');
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return respond(wantsJson, false, 503, `Subscriptions aren't connected yet. Please email ${env.CONTACT_TO || DEFAULT_TO}.`, '/#subscribe');
  const to = env.CONTACT_TO || DEFAULT_TO;
  const from = env.CONTACT_FROM || DEFAULT_FROM;
  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Newsletter signup: ${email}`, text: `New newsletter subscriber from edcloud.org\n\nEmail: ${email}\nConsent: yes\n` }),
    });
  } catch {
    return respond(wantsJson, false, 502, "We couldn't save that right now. Please try again later.", '/#subscribe');
  }
  if (!res.ok) return respond(wantsJson, false, 502, "We couldn't save that right now. Please try again later.", '/#subscribe');
  return respond(wantsJson, true, 200, "Thanks — you're on the list.", '/#subscribe');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// JSON for the fetch() path; a redirect back to the contact page for the no-JS form post.
function respond(wantsJson, ok, status, message, back = '/#contact') {
  if (wantsJson) return json({ ok, message }, status);
  const [path, hash] = back.split('#');
  const to = (ok ? `${path}?sent=1` : `${path}?error=${encodeURIComponent(message)}`) + (hash ? '#' + hash : '');
  return new Response(null, { status: 303, headers: { Location: to } });
}
