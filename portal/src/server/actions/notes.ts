'use server';

import { isValidObjectId } from 'mongoose';
import { attempt, refreshAll, requireSite, UserError } from '../access';
import { NoteModel } from '../models';
import { NoteInput, NotePatch } from '../schemas';
import { getCurrentMonitor } from '../session';

export async function addNote(raw: unknown) {
  return attempt(async () => {
    const input = NoteInput.parse(raw);
    const me = await getCurrentMonitor();
    if (input.siteId) await requireSite(input.siteId);
    await NoteModel.create({
      monitorId: me.id,
      subject: input.subject,
      siteId: input.siteId || null,
      text: input.text,
    });
    refreshAll();
  });
}

export async function updateNote(id: string, raw: unknown) {
  return attempt(async () => {
    if (!isValidObjectId(id)) throw new UserError('That note was not found.');
    const patch = NotePatch.parse(raw);
    const me = await getCurrentMonitor();
    if (patch.siteId) await requireSite(patch.siteId);

    const set: Record<string, unknown> = {};
    if (patch.subject !== undefined) set.subject = patch.subject;
    if (patch.siteId !== undefined) set.siteId = patch.siteId || null;
    if (patch.text !== undefined) set.text = patch.text;
    if (patch.done !== undefined) set.done = patch.done;
    if (patch.pinned !== undefined) set.pinned = patch.pinned;

    const r = await NoteModel.updateOne({ _id: id, monitorId: me.id }, { $set: set });
    if (!r.matchedCount) throw new UserError('That note was not found.');
    refreshAll();
  });
}

export async function deleteNote(id: string) {
  return attempt(async () => {
    if (!isValidObjectId(id)) throw new UserError('That note was not found.');
    const me = await getCurrentMonitor();
    await NoteModel.deleteOne({ _id: id, monitorId: me.id });
    refreshAll();
  });
}

export async function clearDoneNotes() {
  return attempt(async () => {
    const me = await getCurrentMonitor();
    await NoteModel.deleteMany({ monitorId: me.id, done: true });
    refreshAll();
  });
}
