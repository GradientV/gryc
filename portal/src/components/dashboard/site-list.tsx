import Link from 'next/link';
import type { ReactNode } from 'react';
import type { StatusText } from '@/lib/rules';
import { Status } from '../ui/bits';

export type SiteFilter = 'visit' | 'timesheets' | 'assessment';

/** What a row shows when the table is focused on one count: the status, a
    line of detail and the one thing to do next. */
export interface FocusCell {
  status: StatusText;
  /** "Missing: Tran, Linh", "Last visited Mon, Jul 27" */
  detail: string;
  action: { label: string; href: string; external?: boolean };
}

/** One worksite row, worked out on the server so the browser only gets the
    words it shows. */
export interface SiteRow {
  id: string;
  name: string;
  /** address · Childcare · 9 participants */
  meta: string;
  /** where the name links: the site, or its page for a past week */
  href: string;
  /** what is still open that week, for the counts above the table */
  open: Record<SiteFilter, boolean>;
  focus: Record<SiteFilter, FocusCell>;
}

const COLS = 'md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]';
const FOCUS_COLS = 'md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.8fr)_10.5rem]';

export const COLUMN_LABEL: Record<SiteFilter, string> = {
  visit: 'Visit',
  timesheets: 'Timesheets',
  assessment: 'Assessment',
};

function Cell({ label, value }: { label: string; value: StatusText }) {
  return (
    <div className="min-w-0">
      <span className="kicker block md:sr-only">{label}</span>
      <Status tone={value.tone} className="text-sm">
        {value.label}
      </Status>
    </div>
  );
}

function SiteName({ r }: { r: SiteRow }) {
  return (
    <div className="min-w-0">
      <div className="font-semibold leading-snug underline-offset-2 group-hover:underline">{r.name}</div>
      <div className="muted text-[0.8125rem] leading-snug">{r.meta}</div>
    </div>
  );
}

/** Every worksite with the week's three statuses; the whole row opens it. */
export function SiteTable({ rows, labelledBy }: { rows: SiteRow[]; labelledBy?: string }) {
  return (
    <div className="panel">
      <div
        className={`hidden gap-4 border-b border-[var(--color-line)] px-4 py-2 text-[0.78rem] font-semibold text-[var(--color-ink-3)] md:grid ${COLS}`}
        aria-hidden="true"
      >
        <span>Worksite</span>
        <span>Visit</span>
        <span>Timesheets</span>
        <span>Assessment</span>
      </div>
      <ul aria-labelledby={labelledBy}>
        {rows.map((r) => (
          <li key={r.id} className="border-b border-[var(--color-line-2)] last:border-0">
            <Link href={r.href} className={`rowlink group grid gap-x-4 gap-y-2.5 px-4 py-2.5 md:items-center ${COLS}`}>
              <SiteName r={r} />
              <div className="grid grid-cols-3 gap-3 md:contents">
                <Cell label="Visit" value={r.focus.visit.status} />
                <Cell label="Timesheets" value={r.focus.timesheets.status} />
                <Cell label="Assessment" value={r.focus.assessment.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The table narrowed to one count: its status, the detail behind it and a
    link to deal with it. */
export function FocusTable({ rows, filter, labelledBy }: { rows: SiteRow[]; filter: SiteFilter; labelledBy?: string }) {
  return (
    <div className="panel">
      <div
        className={`hidden gap-4 border-b border-[var(--color-line)] px-4 py-2 text-[0.78rem] font-semibold text-[var(--color-ink-3)] md:grid ${FOCUS_COLS}`}
        aria-hidden="true"
      >
        <span>Worksite</span>
        <span>{COLUMN_LABEL[filter]}</span>
        <span>Details</span>
        <span />

      </div>
      <ul aria-labelledby={labelledBy}>
        {rows.map((r) => {
          const f = r.focus[filter];
          return (
            <li
              key={r.id}
              className={`grid gap-x-4 gap-y-1.5 border-b border-[var(--color-line-2)] px-4 py-2.5 last:border-0 md:items-center ${FOCUS_COLS}`}
            >
              <Link href={r.href} className="group min-w-0 text-[var(--color-ink)]">
                <SiteName r={r} />
              </Link>
              <Status tone={f.status.tone} className="text-sm">
                {f.status.label}
              </Status>
              <p className="muted min-w-0 text-sm">{f.detail}</p>
              {f.action.external ? (
                <a href={f.action.href} target="_blank" rel="noreferrer" className="link-action md:justify-self-end">
                  {f.action.label}
                </a>
              ) : (
                <Link href={f.action.href} className="link-action md:justify-self-end">
                  {f.action.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteListEmpty({ action }: { action: ReactNode }) {
  return (
    <div className="panel px-4 py-12 text-center">
      <p className="font-semibold">No worksites yet</p>
      <p className="muted mx-auto mt-1 max-w-sm text-sm">Register your first worksite to start monitoring it.</p>
      <div className="mt-4">{action}</div>
    </div>
  );
}
