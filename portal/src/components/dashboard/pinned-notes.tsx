import type { Note } from '@/lib/types';

/* Pinned notes, one line each, above the worksite table so they are seen
   before scrolling. The full notes stay in the list at the bottom. */
export function PinnedNotes({ notes, siteNames }: { notes: Note[]; siteNames: Record<string, string> }) {
  const pinned = notes.filter((n) => n.pinned && !n.done).slice(0, 3);
  if (!pinned.length) return null;

  return (
    <section aria-label="Pinned notes" className="panel mt-3.5">
      <ul>
        {pinned.map((n, i) => {
          const title = n.subject || (n.siteId ? (siteNames[n.siteId] ?? '') : '');
          return (
            <li
              key={n.id}
              className="flex items-baseline gap-3 border-b border-[var(--color-line-2)] px-4 py-2.5 text-sm last:border-0"
            >
              <span className="kicker w-12 shrink-0">{i === 0 ? 'Pinned' : ''}</span>
              <div className="min-w-0 flex-1 md:flex md:items-baseline md:gap-3">
                {title ? <span className="block font-semibold md:shrink-0 md:whitespace-nowrap">{title}</span> : null}
                <span className={`line-clamp-2 md:block md:truncate ${title ? 'muted' : ''}`}>{n.text}</span>
              </div>
              {i === 0 ? (
                <a href="#notes" className="shrink-0 font-semibold no-underline hover:underline">
                  All notes
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
