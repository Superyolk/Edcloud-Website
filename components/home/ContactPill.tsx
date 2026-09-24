'use client';

import { useEffect, useRef } from 'react';
import { MQ_MOBILE } from '@/app/breakpoints';
import { SHARED } from '@/content/copy';
import { useMediaQuery } from '@/components/useMediaQuery';
import styles from '@/app/home.module.css';

// The header's own Contact link: same label, same in-page target. Nothing is typed here.
const CONTACT = SHARED.navLinks.find((l) => l.href === '#contact');

const FIELD = 'input, textarea, select';
/** The band at the bottom of the screen the pill covers: 16px inset + 48px pill + 32px of air. */
const BAND = 96;

/**
 * Home only (SPEC §5.6): a floating "Contact" pill in the thumb zone, below 1024. It shows once the
 * hero has scrolled away and hides again while the Contact section or the footer is on screen,
 * while a Show-all button is in the bottom band the pill floats over (two pills of the same shape
 * overlapping read as a layout collision; Phase 4 R3-client-01), and while a form field has focus
 * so it never rides the on-screen keyboard.
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
    const buttonsInBand = new Set<Element>();
    const update = () =>
      pill.toggleAttribute('data-shown', heroGone && endsOnScreen.size === 0 && buttonsInBand.size === 0 && !typing);

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

    // Show-all buttons (components/ShowAllButton.tsx) against the bottom band only. rootMargin is
    // in px of the viewport, so the observer is rebuilt when the viewport height changes.
    const showAll = Array.from(document.querySelectorAll('button[data-showall-phone]'));
    let band: IntersectionObserver | null = null;
    let bandHeight = 0;
    const watchBand = () => {
      if (window.innerHeight === bandHeight) return;
      bandHeight = window.innerHeight;
      band?.disconnect();
      buttonsInBand.clear();
      band = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) buttonsInBand.add(e.target);
            else buttonsInBand.delete(e.target);
          }
          update();
        },
        { rootMargin: `-${Math.max(0, bandHeight - BAND)}px 0px 0px 0px` },
      );
      for (const el of showAll) band.observe(el);
    };
    if (showAll.length) {
      watchBand();
      window.addEventListener('resize', watchBand);
    }

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
      band?.disconnect();
      window.removeEventListener('resize', watchBand);
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
