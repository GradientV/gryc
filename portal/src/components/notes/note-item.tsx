'use client';

import Link from 'next/link';
import { Fragment, useOptimistic, useTransition, type ReactNode } from 'react';
import { fmtShort } from '@/lib/format';
import type { Note } from '@/lib/types';
import { updateNote } from '@/server/actions/notes';
import { useToast } from '../ui/toast';

export interface SiteOption {
  id: string;
  name: string;
}

/** Ticking a note done or pinning it changes the list at once; the server
    catches up. */
export function useNoteToggles(notes: Note[]) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [shown, patch] = useOptimistic(notes, (list: Note[], p: { id: string } & Partial<Note>) =>
    list.map((n) => (n.id === p.id ? { ...n, ...p } : n)),
  );

  function toggle(n: Note, change: Partial<Pick<Note, 'done' | 'pinned'>>) {
    startTransition(async () => {
      patch({ id: n.id, ...change });
      const r = await updateNote(n.id, change);
      if (!r.ok) toast(r.error, 'bad');
    });
  }

  return { shown, toggle };
}

/** One note: subject, the full text, then where it is from and when.
    `compact` puts Pin and Edit under the text, for the narrow worksite
    sidebar. */
export function NoteItem({
  note: n,
  siteName,
  compact = false,
  onToggle,
  onEdit,
}: {
  note: Note;
  /** shown, and linked, when the note is about a worksite */
  siteName?: string;
  compact?: boolean;
  onToggle: (n: Note, change: Partial<Pick<Note, 'done' | 'pinned'>>) => void;
  onEdit: (n: Note) => void;
}) {
  const struck = n.done ? 'muted line-through' : '';
  const meta: ReactNode[] = [];
  if (n.pinned && !n.done) {
    meta.push(
      <span key="pin" className="font-semibold text-[var(--color-brand)]">
        Pinned
      </span>,
    );
  }
  if (siteName && n.siteId) {
    meta.push(
      <Link key="site" href={`/sites/${n.siteId}`} className="text-[var(--color-ink-3)] hover:text-[var(--color-brand)]">
        {siteName}
      </Link>,
    );
  }
  meta.push(<span key="date">{fmtShort(n.createdAt.slice(0, 10))}</span>);

  const actions = (
    <>
      {!n.done ? (
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => onToggle(n, { pinned: !n.pinned })}>
          {n.pinned ? 'Unpin' : 'Pin'}
        </button>
      ) : null}
      <button type="button" className="btn btn-quiet btn-sm" onClick={() => onEdit(n)}>
        Edit
      </button>
    </>
  );

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        className="box mt-0.5"
        checked={n.done}
        onChange={(e) => onToggle(n, { done: e.target.checked })}
        aria-label={`${n.done ? 'Mark as not done' : 'Mark as done'}: ${n.subject || n.text.slice(0, 60)}`}
      />
      <div className="min-w-0 flex-1">
        {n.subject ? <p className={`font-semibold leading-snug ${struck}`}>{n.subject}</p> : null}
        <p className={`whitespace-pre-line ${n.subject ? 'mt-0.5 text-sm text-[var(--color-ink-2)]' : ''} ${struck}`}>
          {n.text}
        </p>
        <p className="kicker mt-1">
          {meta.map((m, i) => (
            <Fragment key={i}>
              {i ? ' · ' : ''}
              {m}
            </Fragment>
          ))}
        </p>
        {compact ? <div className="-ml-2 mt-1 flex">{actions}</div> : null}
      </div>
      {compact ? null : <div className="flex shrink-0 items-center">{actions}</div>}
    </div>
  );
}
