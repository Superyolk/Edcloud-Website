'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type SyntheticEvent } from 'react';
import { useMediaQuery } from '@/components/useMediaQuery';

type Props = { src: string; className: string };

const subscribeNoop = () => () => {};

/**
 * Background loop for the home hero. Rendered only on the client and only when the visitor has
 * not asked for reduced motion; the poster <img> underneath is always there as the fallback.
 */
export default function HeroVideo({ src, className }: Props) {
  const [atSeam, setAtSeam] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  // false during SSR and until hydration, so the video only ever mounts on the client.
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const show = hydrated && !reduced;

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
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onTimeUpdate={onTimeUpdate}
      style={{ opacity: atSeam ? 0 : 1 }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
