'use client';

import { useState } from 'react';
import type { Note } from '@/lib/types';
import { clearDoneNotes } from '@/server/actions/notes';
import { NoteDialog } from '../notes/note-dialog';
import { NoteItem, useNoteToggles, type SiteOption } from '../notes/note-item';
import { useAction } from '../use-action';

/* A scratchpad for anything without a box on a DYCD form: a roster
   discrepancy, something to raise at the office, something to check next
   visit. Each note can carry a subject and the worksite it is about. */
export function NotesPanel({ notes, sites }: { notes: Note[]; sites: SiteOption[] }) {
  const { run } = useAction();
  const { shown, toggle } = useNoteToggles(notes);
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const names = Object.fromEntries(sites.map((s) => [s.id, s.name]));
  const open = shown.filter((n) => !n.done).length;

  return (
    <section id="notes" className="mt-10" aria-labelledby="notes-h">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <h2 id="notes-h">Notes and reminders</h2>
        <div className="flex items-center gap-3">
          <span className="kicker">{open ? `${open} open` : 'Nothing open'}</span>
          <button type="button" className="btn btn-sm" onClick={() => setEditing('new')}>
            New note
          </button>
        </div>
      </div>
      <div className="panel">
        {shown.length ? (
          <ul>
            {shown.map((n) => (
              <li key={n.id} className="border-b border-[var(--color-line-2)] px-4 py-3 last:border-0">
                <NoteItem
                  note={n}
                  siteName={n.siteId ? names[n.siteId] : undefined}
                  onToggle={toggle}
                  onEdit={setEditing}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted px-4 py-8 text-center text-sm">
            Nothing noted yet. Jot down anything that has no box on a DYCD form.
          </p>
        )}
        {shown.some((n) => n.done) ? (
          <div className="panel-f flex justify-end">
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => run(() => clearDoneNotes())}>
              Clear finished notes
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <NoteDialog note={editing === 'new' ? null : editing} sites={sites} onClose={() => setEditing(null)} />
      ) : null}
    </section>
  );
}
