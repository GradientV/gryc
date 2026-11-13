'use client';

import { useId, useState } from 'react';
import type { Note } from '@/lib/types';
import { NoteDialog } from '../notes/note-dialog';
import { NoteItem, useNoteToggles, type SiteOption } from '../notes/note-item';

/** The notes about one worksite, in its sidebar. A note started here is
    about this worksite. */
export function SiteNotes({ notes, siteId, sites }: { notes: Note[]; siteId: string; sites: SiteOption[] }) {
  const { shown, toggle } = useNoteToggles(notes);
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  /* two worksite pages can be mounted at once (Next keeps recent pages), so
     no fixed ids */
  const headingId = useId();

  return (
    <section className="panel" aria-labelledby={headingId}>
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
        <h2 id={headingId} className="text-base">
          Notes
        </h2>
        <button type="button" className="btn btn-quiet btn-sm -mr-2" onClick={() => setEditing('new')}>
          New note
        </button>
      </div>
      {shown.length ? (
        <ul className="pb-1">
          {shown.map((n) => (
            <li key={n.id} className="border-b border-[var(--color-line-2)] px-4 py-3 last:border-0">
              <NoteItem note={n} compact onToggle={toggle} onEdit={setEditing} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted px-4 pt-1 pb-4 text-sm">Nothing noted about this site.</p>
      )}

      {editing ? (
        <NoteDialog
          note={editing === 'new' ? null : editing}
          sites={sites}
          defaultSiteId={siteId}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
