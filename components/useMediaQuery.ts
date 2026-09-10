import { useSyncExternalStore } from 'react';

/** Subscribes to a media query. Server snapshot is `false` so SSR markup never depends on it. */
export function useMediaQuery(query: string, onChange?: (matches: boolean) => void): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        onChange?.(e.matches);
        notify();
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
