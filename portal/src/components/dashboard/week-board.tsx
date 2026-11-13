'use client';

import { useState, type ReactNode } from 'react';
import type { Tone } from '@/lib/rules';
import { Status } from '../ui/bits';
import { FocusTable, SiteTable, type SiteFilter, type SiteRow } from './site-list';

export interface SummaryCell {
  key: SiteFilter;
  n: number;
  /** "sites to visit" */
  label: string;
  /** "2 of 7 visited this week" */
  sub: string;
  subTone?: Tone;
}

const TITLES: Record<SiteFilter, string> = {
  visit: 'Sites to visit',
  timesheets: 'Sites with timesheets out',
  assessment: 'Assessments to file',
};

/* The three counts of what is left in the week and the worksite table under
   them. Picking a count narrows the table to the worksites it counts and to
   that one subject, with the detail behind it; picking it again (or "Show
   all") brings everything back. */
export function WeekBoard({
  cells,
  rows,
  totals,
  pinned,
  past,
}: {
  cells: SummaryCell[];
  rows: SiteRow[];
  /** "7 worksites · 78 active participants" */
  totals: string;
  /** shown between the counts and the table */
  pinned?: ReactNode;
  /** viewing a week that is over: "Sites to visit" reads "Sites not visited" */
  past?: boolean;
}) {
  const [filter, setFilter] = useState<SiteFilter | null>(null);
  const shown = filter ? rows.filter((r) => r.open[filter]) : rows;

  return (
    <>
      <div className="summary" role="group" aria-label="Still to do in the week. Pick one to list only those worksites.">
        {cells.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={filter === c.key}
            onClick={() => setFilter(filter === c.key ? null : c.key)}
          >
            <span className="n">{c.n}</span>
            <span className="l">{c.label}</span>
            <span className="s">{c.subTone ? <Status tone={c.subTone}>{c.sub}</Status> : c.sub}</span>
          </button>
        ))}
      </div>

      {pinned}

      <div className="mt-6 mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sites-h">{filter ? (past && filter === 'visit' ? 'Sites not visited' : TITLES[filter]) : 'Your worksites'}</h2>
        <span className="kicker" aria-live="polite">
          {filter ? (
            <>
              Showing {shown.length} of {rows.length}
              {' · '}
              <button
                type="button"
                className="font-semibold text-[var(--color-brand)] hover:underline"
                onClick={() => setFilter(null)}
              >
                Show all
              </button>
            </>
          ) : (
            totals
          )}
        </span>
      </div>

      {shown.length ? (
        filter ? (
          <FocusTable rows={shown} filter={filter} labelledBy="sites-h" />
        ) : (
          <SiteTable rows={shown} labelledBy="sites-h" />
        )
      ) : (
        <div className="panel px-4 py-10 text-center">
          <p className="font-semibold">{filter ? noneLeft(filter, past) : 'No worksites'}</p>
          <button type="button" className="btn btn-sm mt-4" onClick={() => setFilter(null)}>
            Show all worksites
          </button>
        </div>
      )}
    </>
  );
}

function noneLeft(filter: SiteFilter, past?: boolean): string {
  if (filter === 'visit') return past ? 'Every site was visited that week.' : 'Every site has been visited this week.';
  if (filter === 'timesheets') return 'Every timesheet is in.';
  return 'Every assessment is filed.';
}
