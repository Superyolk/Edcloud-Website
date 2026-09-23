'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type SyntheticEvent } from 'react';
import { MQ_MOBILE, MQ_PHONE } from '@/app/breakpoints';
import { useHydrated, useMediaQuery } from '@/components/useMediaQuery';

type Props = { src: string; webmSrc?: string; className: string };

type Connection = EventTarget & { saveData?: boolean };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

/** The visitor's Save-Data preference (Chromium only; everywhere else it reads false). */
function useSaveData(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const c = connection();
      c?.addEventListener?.('change', notify);
      return () => c?.removeEventListener?.('change', notify);
    },
    () => connection()?.saveData === true,
    () => false,
  );
}

// Flips once per page view: after `load`, then the first idle moment (2s at most). Below 1024 the
// video waits for this so it never competes with the poster, the fonts or the LCP.
let settled = false;
function subscribeSettled(notify: () => void) {
  if (settled) return () => {};
  let idle = 0;
  let timer = 0;
  const done = () => {
    settled = true;
    notify();
  };
  const onLoad = () => {
    // Safari has no requestIdleCallback; a short timeout after load does the same job there.
    if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(done, { timeout: 2000 });
    else timer = window.setTimeout(done, 200);
  };
  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad, { once: true });
  return () => {
    window.removeEventListener('load', onLoad);
    if (idle) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}
const useSettled = () => useSyncExternalStore(subscribeSettled, () => settled, () => false);

/** Below 1024 the loop fades in over the poster once it can play (SPEC §8.4). */
const FADE_IN = 'opacity var(--m-dur-sheet) var(--m-ease)';

/**
 * Background loop for the home hero. The poster <picture> underneath is always there; this only
 * ever adds motion on top of it, on the client, and only when (SPEC §8.4, G12):
 * - the visitor has not asked for reduced motion or Save-Data;
 * - the screen is 600px or wider: phones never get a <video> element, so they fetch no video bytes;
 * - below 1024, the page has loaded and gone idle. At >= 1024 it mounts on hydration, as it always
 *   has (the desktop freeze).
 */
export default function HeroVideo({ src, webmSrc, className }: Props) {
  const [atSeam, setAtSeam] = useState(false);
  // Below 1024 only: 'hidden' until canplay, then 'fading' for the 240ms fade-in, then 'steady'
  // (where the stylesheet's slower seam transition takes over again).
  const [phase, setPhase] = useState<'hidden' | 'fading' | 'steady'>('hidden');
  const ref = useRef<HTMLVideoElement>(null);
  // Every one of these is false during SSR and the hydration pass, so the video only mounts on
  // the client, and a phone re-renders straight to "no video" without ever creating one.
  const hydrated = useHydrated();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const saveData = useSaveData();
  const phone = useMediaQuery(MQ_PHONE);
  const mobile = useMediaQuery(MQ_MOBILE);
  const settledNow = useSettled();
  const show = hydrated && !reduced && !saveData && !phone && (!mobile || settledNow);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = 0.85;
    el.play().catch(() => {});
  }, [show]);

  const onTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    const left = el.duration - el.currentTime;
    if (!Number.isFinite(left)) return;
    setAtSeam(left < 0.8);
  };

  if (!show) return null;

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      // Tablets start with the headers only; autoplay then streams what it needs.
      preload={mobile ? 'metadata' : 'auto'}
      aria-hidden="true"
      tabIndex={-1}
      onTimeUpdate={onTimeUpdate}
      onCanPlay={mobile && phase === 'hidden' ? () => setPhase('fading') : undefined}
      onTransitionEnd={mobile && phase === 'fading' ? () => setPhase('steady') : undefined}
      style={
        mobile
          ? { opacity: phase === 'hidden' || atSeam ? 0 : 1, transition: phase === 'steady' ? undefined : FADE_IN }
          : { opacity: atSeam ? 0 : 1 }
      }
    >
      {/* WebM first: Chrome, Edge and Firefox take it and it is the better encode. Safari, which
          does not decode VP9 here, falls through to the H.264 file. */}
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
