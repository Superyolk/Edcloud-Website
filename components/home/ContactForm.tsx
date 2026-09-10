'use client';

import { HOME_COPY } from '@/content/copy';
import styles from '@/app/home.module.css';

// Native `required` validation runs in the browser; the submit itself is a placeholder to wire to
// the contact backend (the repo's Cloudflare Worker exposes POST /api/contact).
export default function ContactForm() {
  const { contact } = HOME_COPY;
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      {contact.fields.map((f) => {
        const isTextarea = f.type === 'textarea';
        return (
          <label key={f.id} className={isTextarea ? `${styles.label} ${styles.labelWide}` : styles.label}>
            {f.label}
            {isTextarea ? (
              <textarea id={f.id} name={f.name} rows={2} className={`${styles.input} ${styles.textarea}`} required={f.required || undefined} />
            ) : (
              <input id={f.id} name={f.name} type={f.type} className={styles.input} required={f.required || undefined} />
            )}
          </label>
        );
      })}
      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit}>
          {contact.submit}
        </button>
      </div>
    </form>
  );
}
