'use client';

import { useEffect, useRef } from 'react';
import { MQ_MOBILE } from '@/app/breakpoints';
import { SHARED } from '@/content/copy';
import { useMediaQuery } from '@/components/useMediaQuery';
import styles from '@/app/home.module.css';

// The header's own Contact link: same label, same in-page target. Nothing is typed here.
const CONTACT = SHARED.navLinks.find((l) => l.href === '#contact');

const FIELD = 'input, textarea, select';

/**
 * Home only (SPEC §5.6): a floating "Contact" pill in the thumb zone, below 1024. It shows once the
 * hero has scrolled away and hides again while the Contact section or the footer is on screen, and
 * while a form field has focus so it never rides the on-screen keyboard.
 *
 * It mounts only once hydrated on a phone or tablet, so desktop and no-JS pages never carry it (the
 * header menu reaches Contact there). Visibility is a data attribute set straight from the
 * observers: CSS does the fade, and React never re-renders on scroll.
 */
export default function ContactPill() {
  const mobile = useMediaQuery(MQ_MOBILE);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const pill = ref.current;
    if (!pill) return;
    const hero = document.querySelector('main > section:first-of-type');
    const ends = [document.getElementById('contact'), document.querySelector('body > footer')].filter((el): el is Element => !!el);
    let heroGone = false;
    const endsOnScreen = new Set<Element>();
    let typing = false;
    const update = () => pill.toggleAttribute('data-shown', heroGone && endsOnScreen.size === 0 && !typing);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroGone = !e.isIntersecting;
        else if (e.isIntersecting) endsOnScreen.add(e.target);
        else endsOnScreen.delete(e.target);
      }
      update();
    });
    if (hero) io.observe(hero);
    for (const el of ends) io.observe(el);

    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof Element) || !e.target.matches(FIELD)) return;
      typing = true;
      update();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!(e.target instanceof Element) || !e.target.matches(FIELD)) return;
      typing = false;
      update();
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      io.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [mobile]);

  if (!mobile || !CONTACT) return null;
  return (
    <a ref={ref} href={CONTACT.href} className={styles.contactPill}>
      {CONTACT.label}
    </a>
  );
}
