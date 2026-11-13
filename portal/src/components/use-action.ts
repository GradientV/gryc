'use client';

import { useCallback, useTransition } from 'react';
import type { ActionResult } from '@/lib/types';
import { useToast } from './ui/toast';

/* Calls a Server Action inside a transition and reports the outcome in a
   toast. Returns the result so the caller can close a dialog, navigate, or
   show a list of problems. */
export function useAction() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const run = useCallback(
    <T,>(
      fn: () => Promise<ActionResult<T>>,
      opts: { success?: string | ((r: ActionResult<T> & { ok: true }) => string); quiet?: boolean } = {},
    ): Promise<ActionResult<T>> =>
      new Promise((resolve) => {
        startTransition(async () => {
          try {
            const r = await fn();
            if (r.ok) {
              const msg = typeof opts.success === 'function' ? opts.success(r) : opts.success;
              if (msg) toast(msg);
            } else if (!opts.quiet) {
              toast(r.problems?.length ? `${r.error} ${r.problems[0]}` : r.error, 'bad');
            }
            resolve(r);
          } catch {
            toast('Could not reach the server. Check the connection and try again.', 'bad');
            resolve({ ok: false, error: 'Could not reach the server.' });
          }
        });
      }),
    [toast],
  );

  return { run, pending };
}
