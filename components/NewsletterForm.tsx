'use client';

import { SHARED } from '@/content/copy';
import ui from './ui.module.css';
import styles from './SiteFooter.module.css';

// Native validation runs; the submit itself is a placeholder to wire to a newsletter backend.
export default function NewsletterForm() {
  const { newsletter } = SHARED;
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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
        <button className={ui.primary}>{newsletter.submit}</button>
      </div>
    </form>
  );
}
