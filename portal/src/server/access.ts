import 'server-only';
import { isValidObjectId } from 'mongoose';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types';
import { ParticipantModel, SiteModel } from './models';
import { getCurrentMonitor } from './session';

/* Shared by every Server Action. Server Actions can be called with a plain
   POST request, so each one re-checks on the server that the record belongs
   to the current monitor; the UI hiding a button is never the only guard. */

export class UserError extends Error {}

export async function requireSite(siteId: string) {
  if (!isValidObjectId(siteId)) throw new UserError('That worksite was not found.');
  const me = await getCurrentMonitor();
  const site = await SiteModel.findOne({ _id: siteId, monitorId: me.id });
  if (!site) throw new UserError('That worksite was not found.');
  return { me, site };
}

export async function requireParticipant(participantId: string) {
  if (!isValidObjectId(participantId)) throw new UserError('That participant was not found.');
  await getCurrentMonitor(); // connects first
  const participant = await ParticipantModel.findById(participantId);
  if (!participant) throw new UserError('That participant was not found.');
  const { me, site } = await requireSite(participant.siteId.toHexString());
  return { me, site, participant };
}

/** Pages read straight from the database, so after a change every route is
    marked stale and the one on screen re-renders with the new data. */
export function refreshAll(): void {
  revalidatePath('/', 'layout');
}

/** Runs an action body and turns failures into a message the UI can show.
    Validation and access errors carry their own wording; anything else is
    logged and reported generically. */
export async function attempt<T = void>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return (data === undefined ? { ok: true } : { ok: true, data }) as ActionResult<T>;
  } catch (err) {
    if (err instanceof UserError) return { ok: false, error: err.message };
    if (err && typeof err === 'object' && 'issues' in err && Array.isArray((err as { issues: unknown[] }).issues)) {
      const issues = (err as { issues: { message: string; path: (string | number)[] }[] }).issues;
      return {
        ok: false,
        error: 'Some fields need another look.',
        problems: issues.slice(0, 6).map((i) => `${i.path.join('.') || 'value'}: ${i.message}`),
      };
    }
    console.error('[gryc] action failed', err);
    return { ok: false, error: 'Something went wrong while saving. Try again.' };
  }
}
