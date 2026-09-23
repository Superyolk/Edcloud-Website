'use client';

import { useState, type FormEvent, type HTMLAttributes } from 'react';
import { HOME_COPY } from '@/content/copy';
import ui from '@/components/ui.module.css';
import styles from '@/app/home.module.css';

type Status = { ok: boolean; message: string } | null;

type KeyboardHints = {
  autoComplete: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  enterKeyHint: HTMLAttributes<HTMLInputElement>['enterKeyHint'];
};

// On-screen keyboard and autofill hints per field, keyed by the field id in content/copy.ts (SPEC
// §7.5). Attributes only: the fields, names, validation and submit are exactly as before.
const HINTS: Record<string, KeyboardHints> = {
  'c-first': { autoComplete: 'given-name', enterKeyHint: 'next' },
  'c-last': { autoComplete: 'family-name', enterKeyHint: 'next' },
  'c-email': { autoComplete: 'email', inputMode: 'email', enterKeyHint: 'next' },
  'c-phone': { autoComplete: 'tel', inputMode: 'tel', enterKeyHint: 'next' },
  'c-message': { autoComplete: 'off', enterKeyHint: 'enter' },
};

// Native `required` validation runs in the browser; the submit posts to the Cloudflare Worker
// (POST /api/contact), which emails the message via Resend. A plain form post is the no-JS fallback.
export default function ContactForm() {
  const { contact } = HOME_COPY;
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The button stays enabled while a send is under way (aria-disabled, not disabled), so focus
    // does not fall back to <body>; a second press in that window is ignored here instead.
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      firstName: fd.get('c-first'),
      lastName: fd.get('c-last'),
      email: fd.get('c-email'),
      phone: fd.get('c-phone'),
      message: fd.get('c-message'),
    };
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      const ok = res.ok && !!data.ok;
      setStatus({ ok, message: data.message ?? (ok ? 'Thanks — we got your message and will be in touch shortly.' : 'We couldn’t send that. Please try again, or email info@edcloud.org.') });
      if (ok) form.reset();
    } catch {
      setStatus({ ok: false, message: 'We couldn’t send that. Please try again, or email info@edcloud.org.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} method="post" action="/api/contact" onSubmit={onSubmit}>
      {contact.fields.map((f) => {
        const isTextarea = f.type === 'textarea';
        const hints = HINTS[f.id];
        return (
          <label key={f.id} className={isTextarea ? `${styles.label} ${styles.labelWide}` : styles.label}>
            {f.label}
            {isTextarea ? (
              // rows stays 2: it sets the desktop box. Phones get their 120px floor from CSS.
              <textarea id={f.id} name={f.name} rows={2} className={`${styles.input} ${styles.textarea}`} required={f.required || undefined} {...hints} />
            ) : (
              <input id={f.id} name={f.name} type={f.type} className={styles.input} required={f.required || undefined} {...hints} />
            )}
          </label>
        );
      })}
      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} aria-disabled={busy || undefined}>
          {busy ? 'Sending…' : contact.submit}
        </button>
      </div>
      {/* The live region is mounted from the start and only its text changes: a region inserted
          together with its message is often not announced (VoiceOver on iOS). It is visually
          hidden and out of flow, so the form's grid is exactly as before; the visible line below
          carries the same words and is hidden from assistive tech so they are not read twice. */}
      <p role="status" aria-live="polite" className={ui.srOnly}>
        {status?.message ?? ''}
      </p>
      {status && (
        <p aria-hidden="true" className={status.ok ? styles.formStatusOk : styles.formStatusErr}>
          {status.message}
        </p>
      )}
    </form>
  );
}
