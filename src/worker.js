/* ============================================================
   EdCloud Venture Partners — Cloudflare Worker
   - Serves the static site from the repo root (assets binding).
   - Redirects the apex domain to the canonical www host.
   - Handles POST /api/contact: emails the submission via Resend
     with the visitor's address as Reply-To.
   ============================================================ */

const DEFAULT_TO = 'aaron@edcloud.org';
const DEFAULT_FROM = 'EdCloud Website <website@edcloud.org>';
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

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);
      return handleContact(request, env);
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

  const name = str(data.name).slice(0, 200);
  const email = str(data.email).slice(0, 200);
  const subject = str(data.subject).slice(0, 200);
  const message = str(data.message).slice(0, 5000);
  const trap = str(data.company); // honeypot — real visitors never see this field

  if (trap) return respond(wantsJson, true, 200, 'Thanks!'); // accept silently so bots don't retry

  if (!name || !email || !message) {
    return respond(wantsJson, false, 400, 'Please add your name, email, and a message.');
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

  const text =
    'New message from the edcloud.org contact form\n\n' +
    `Name:    ${name}\n` +
    `Email:   ${email}\n` +
    `Subject: ${subject || '—'}\n\n` +
    `${message}\n`;

  const html =
    `<p><strong>New message from the edcloud.org contact form</strong></p>` +
    `<table style="border-collapse:collapse;font:14px system-ui">` +
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${esc(name)}</td></tr>` +
    `<tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>` +
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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// JSON for the fetch() path; a redirect back to the contact page for the no-JS form post.
function respond(wantsJson, ok, status, message) {
  if (wantsJson) return json({ ok, message }, status);
  const to = ok ? '/contact?sent=1' : `/contact?error=${encodeURIComponent(message)}`;
  return new Response(null, { status: 303, headers: { Location: to } });
}
