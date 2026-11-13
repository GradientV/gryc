import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false while the prerendered HTML is being drawn (on the build machine, and during
 * the first pass in the browser), true after that.
 *
 * anything that depends on "right now" (open/closed, the Christmas season) waits for
 * this, so the browser's first pass matches the prerendered HTML exactly.
 */
export function useHydrated(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
}
