'use client';

import { useState } from 'react';
import type { Note } from '@/lib/types';
import { addNote, deleteNote, updateNote } from '@/server/actions/notes';
import { useAction } from '../use-action';
import { Field } from '../ui/controls';
import { Dialog } from '../ui/dialog';
import type { SiteOption } from './note-item';

/* New note, or edit one. Deleting lives in here, behind a second click, so
   it never sits next to every note in the list. Mount it only while it is
   open: each opening starts from the note as saved. */
export function NoteDialog({
  note,
  sites,
  defaultSiteId = '',
  onClose,
}: {
  /** null for a new note */
  note: Note | null;
  sites: SiteOption[];
  /** a new note started from a worksite page is about that worksite */
  defaultSiteId?: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(note?.subject ?? '');
  const [siteId, setSiteId] = useState(note ? (note.siteId ?? '') : defaultSiteId);
  const [text, setText] = useState(note?.text ?? '');
  const [missing, setMissing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { run, pending } = useAction();

  async function save() {
    if (!text.trim()) {
      setMissing(true);
      return;
    }
    const input = { subject: subject.trim(), siteId, text: text.trim() };
    const r = await run(() => (note ? updateNote(note.id, input) : addNote(input)), {
      success: note ? 'Note saved.' : 'Note added.',
    });
    if (r.ok) onClose();
  }

  async function remove() {
    if (!note) return;
    const r = await run(() => deleteNote(note.id), { success: 'Note deleted.' });
    if (r.ok) onClose();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={note ? 'Edit note' : 'New note'}
      onSubmit={save}
      footer={
        confirming ? (
          <>
            <p className="w-full self-center text-sm sm:mr-auto sm:w-auto">Delete this note? This can’t be undone.</p>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              Keep it
            </button>
            <button type="button" className="btn btn-primary btn-destructive" disabled={pending} onClick={remove}>
              Delete
            </button>
          </>
        ) : (
          <>
            {note ? (
              <button type="button" className="btn btn-quiet btn-danger sm:mr-auto" onClick={() => setConfirming(true)}>
                Delete note
              </button>
            ) : null}
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {note ? 'Save' : 'Add note'}
            </button>
          </>
        )
      }
    >
      <Field label="Subject" hint="Optional. A few words you will recognize at a glance.">
        <input
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={120}
          placeholder="Glendale Bakery address correction"
          autoComplete="off"
        />
      </Field>
      <Field label="Worksite">
        <select className="select" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">Not about one worksite</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Note"
        required
        className="mb-0"
        hint={missing ? <span className="tone-due">Write the note first.</span> : undefined}
      >
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMissing(false);
          }}
          aria-invalid={missing || undefined}
          maxLength={2000}
          rows={4}
          placeholder="Something to remember, or to raise at the office"
        />
      </Field>
    </Dialog>
  );
}
