import type { ReactNode } from 'react';
import styles from './SectionShell.module.css';

type Props = {
  n: string;
  title: string;
  id?: string;
  /** The Select Clients header is an <h1> in the reference; everything else is an <h2>. */
  as?: 'h1' | 'h2';
  white?: boolean;
  className?: string;
  /** When false, the content row is rendered without the empty 72px cell (About "By The Numbers"). */
  offset?: boolean;
  bodyClassName?: string;
  children: ReactNode;
  /** Extra content inside the container, after the content row (Services "What we do" list). */
  containerExtra?: ReactNode;
  /** Extra content inside the section, after the container (Home "Press" full-bleed figure). */
  sectionExtra?: ReactNode;
};

export default function SectionShell({
  n,
  title,
  id,
  as: Tag = 'h2',
  white,
  className,
  offset = true,
  bodyClassName,
  children,
  containerExtra,
  sectionExtra,
}: Props) {
  const sectionClass = [white ? styles.white : '', className ?? ''].filter(Boolean).join(' ') || undefined;
  return (
    <section id={id} data-screen-label={`${n} ${title}`} className={sectionClass}>
      <div className={styles.container}>
        <div className={styles.head}>
          <span className={styles.counter}>{n}</span>
          <Tag className={styles.title}>{title}</Tag>
        </div>
        {offset ? (
          <div className={styles.body}>
            <span aria-hidden="true" />
            {children}
          </div>
        ) : (
          <div className={bodyClassName}>{children}</div>
        )}
        {containerExtra}
      </div>
      {sectionExtra}
    </section>
  );
}
