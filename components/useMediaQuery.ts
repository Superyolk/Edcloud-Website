import { useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

/**
 * Subscribes to a media query. Server snapshot is `false` so SSR markup never depends on it.
 * Pass one of the app/breakpoints.ts constants (or a feature query such as
 * '(prefers-reduced-motion: reduce)'); never type a width here, qa:breakpoints rejects it.
 */
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

/** true once the component has hydrated on the client; false during SSR and the hydration pass. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
