'use client';

import { useState, type FormEvent } from 'react';
import { SHARED } from '@/content/copy';
import ui from './ui.module.css';
import styles from './SiteFooter.module.css';

type Status = { ok: boolean; message: string } | null;

// Native validation runs; the submit posts to the Cloudflare Worker (POST /api/subscribe), which
// emails the sign-up to the inbox. A plain form post is the no-JS fallback.
export default function NewsletterForm() {
  const { newsletter } = SHARED;
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = { email: fd.get('n-email'), consent: fd.get('n-consent') ? 'yes' : '' };
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      const ok = res.ok && !!data.ok;
      setStatus({ ok, message: data.message ?? (ok ? 'Thanks — you’re on the list.' : 'We couldn’t save that right now. Please try again later.') });
      if (ok) form.reset();
    } catch {
      setStatus({ ok: false, message: 'We couldn’t save that right now. Please try again later.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} method="post" action="/api/subscribe" onSubmit={onSubmit}>
      <div>
        <label htmlFor="n-email" className={styles.fieldLabel}>
          {newsletter.emailLabel}
        </label>
        <input type="email" id="n-email" name="n-email" required className={styles.field} />
      </div>
      <label htmlFor="n-consent" className={styles.check}>
        <input type="checkbox" id="n-consent" name="n-consent" className={styles.checkbox} />
        <span>{newsletter.consentLabel}</span>
      </label>
      <div>
        <button className={ui.primary} disabled={busy}>
          {busy ? 'Sending…' : newsletter.submit}
        </button>
      </div>
      {status && (
        <p role="status" className={status.ok ? styles.statusOk : styles.statusErr}>
          {status.message}
        </p>
      )}
    </form>
  );
}
