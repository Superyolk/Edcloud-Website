'use client';

import { useState } from 'react';
import { HOME } from '@/content/content';
import { HOME_COPY } from '@/content/copy';
import LinkButton from '@/components/LinkButton';
import styles from '@/app/home.module.css';

/** Lead = up to and including the first ". "; rest = everything after it. */
function split(body: string) {
  const i = body.indexOf('. ') + 2;
  return { lead: body.slice(0, i - 1), rest: body.slice(i) };
}

export default function ServicesTabs() {
  const [active, setActive] = useState(0);
  const current = split(HOME.services[active].body);

  return (
    <div className={styles.services}>
      <ol className={styles.tabs}>
        {HOME.services.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.n}>
              <button
                type="button"
                className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={isActive}
              >
                <span className={styles.tabTitle}>{s.title}</span>
                <span aria-hidden="true" className={styles.tabDot} />
              </button>
            </li>
          );
        })}
      </ol>
      <div className={styles.panel}>
        <p className={styles.panelLead}>{current.lead}</p>
        <p className={styles.body}>{current.rest}</p>
        <div className={styles.panelFoot}>
          <LinkButton href="/services-and-results">{HOME_COPY.servicesLink}</LinkButton>
        </div>
      </div>
    </div>
  );
}
