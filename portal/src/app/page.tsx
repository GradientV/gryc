import Link from 'next/link';
import { Suspense } from 'react';
import { NotesPanel } from '@/components/dashboard/notes';
import { PinnedNotes } from '@/components/dashboard/pinned-notes';
import { SiteListEmpty, type FocusCell, type SiteFilter, type SiteRow } from '@/components/dashboard/site-list';
import { WeekBoard, type SummaryCell } from '@/components/dashboard/week-board';
import { PageHeader } from '@/components/ui/bits';
import { PageSkeleton } from '@/components/ui/skeletons';
import { directionsHref, fmtDate, fmtDay, fmtTime, fullAddress, plural } from '@/lib/format';
import { isWeekNumber, week, WEEK_COUNT } from '@/lib/program';
import {
  activeParticipants,
  assessmentStatus,
  dueState,
  dueText,
  names,
  openTone,
  siteWeekStatus,
  sortVisits,
  timesheetStatus,
  visitStatus,
  type SiteWeekData,
  type SiteWeekStatus,
} from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getMySites, getNotes } from '@/server/data';

const LONG_DAY = { weekday: 'long', month: 'long', day: 'numeric' } as const;
const SHORT_DAY = { month: 'short', day: 'numeric' } as const;

/** The detail and next step behind each of a site's three statuses in week n. */
function focusFor(
  d: SiteWeekData,
  s: SiteWeekStatus,
  n: number,
  today: string,
  past: boolean,
): Record<SiteFilter, FocusCell> {
  const base = `/sites/${d.site.id}`;
  const weekHref = `${base}/weeks/${n}`;

  const v = s.lastVisit;
  const before = sortVisits(d.visits.filter((x) => x.date < week(n).start))[0];
  const visit: FocusCell = {
    status: visitStatus(s, n, today),
    detail: v
      ? `${fmtDay(v.date)}, ${fmtTime(v.timeIn)}${v.timeOut ? ` – ${fmtTime(v.timeOut)}` : ''}`
      : before
        ? `Last visited ${fmtDay(before.date)}`
        : 'No visits logged yet',
    action: v
      ? { label: 'Monitoring log', href: `${base}/log` }
      : past
        ? { label: 'Add to the log', href: `${base}/log` }
        : { label: 'Directions', href: directionsHref(d.site), external: true },
  };

  const ts = d.timesheets.find((t) => t.week === n);
  const got = new Set(ts?.collected ?? []);
  const missing = activeParticipants(d.participants).filter((p) => !got.has(p.id));
  const sheetNote = ts?.note ? ` · ${ts.note}` : '';
  const timesheets: FocusCell = {
    status: timesheetStatus(s, n, today),
    detail: !s.timesheets.expected
      ? 'No one active on the roster'
      : missing.length === s.timesheets.expected
        ? `None in yet${sheetNote}`
        : missing.length
          ? `Missing: ${names(missing, 4)}${sheetNote}`
        : `Picked up ${fmtDay(ts?.collectedOn)}${sheetNote}`,
    action: { label: missing.length ? 'Collect timesheets' : 'Review timesheets', href: weekHref },
  };

  const a = s.assessment;
  const assessment: FocusCell = {
    status: assessmentStatus(s, n, today),
    detail:
      a?.status === 'submitted'
        ? `Filed ${fmtDay(a.submittedAt)}${s.findingsCount ? ` · ${plural(s.findingsCount, 'finding')} to follow up` : ''}`
        : a
          ? `Draft saved · ${dueText(n, today)}`
          : dueText(n, today),
    action:
      a?.status === 'submitted'
        ? { label: 'View the packet', href: `${weekHref}/assessment/packet` }
        : { label: a ? 'Continue' : 'Start the assessment', href: `${weekHref}/assessment` },
  };

  return { visit, timesheets, assessment };
}

async function SitesPage({ searchParams }: PageProps<'/'>) {
  const [clock, sites, notes, sp] = await Promise.all([getClock(), getMySites(), getNotes(), searchParams]);
  const { today, week: current } = clock;
  /* ?week=3 looks back at an earlier week; later weeks have not started */
  const asked = Number(sp.week);
  const n = isWeekNumber(asked) && asked <= current ? asked : current;
  const past = n < current;
  const w = week(n);
  const due = dueState(n, today);
  const statuses = sites.map((d) => ({ d, s: siteWeekStatus(d, n, current) }));

  const rows: SiteRow[] = statuses.map(({ d, s }) => ({
    id: d.site.id,
    name: d.site.name,
    /* street, borough and zip only: the floor or room is on the site page */
    meta: [fullAddress({ ...d.site, room: '' }), d.site.childcare ? 'Childcare' : '', plural(s.active, 'participant')]
      .filter(Boolean)
      .join(' · '),
    href: past ? `/sites/${d.site.id}/weeks/${n}` : `/sites/${d.site.id}`,
    open: {
      visit: !s.lastVisit,
      timesheets: s.timesheets.received < s.timesheets.expected,
      assessment: s.assessment?.status !== 'submitted',
    },
    focus: focusFor(d, s, n, today, past),
  }));

  const count = (k: SiteFilter) => rows.filter((r) => r.open[k]).length;
  const sum = (f: (s: (typeof statuses)[number]['s']) => number) => statuses.reduce((t, { s }) => t + f(s), 0);
  const toVisit = count('visit');
  const toFile = count('assessment');
  const sheetsAll = sum((s) => s.timesheets.expected);
  const sheetsIn = sum((s) => Math.min(s.timesheets.received, s.timesheets.expected));
  const youth = sum((s) => s.active);
  const when = past ? 'that week' : 'this week';

  const cells: SummaryCell[] = [
    {
      key: 'visit',
      n: toVisit,
      label: past
        ? toVisit === 1
          ? 'site not visited'
          : 'sites not visited'
        : toVisit === 1
          ? 'site to visit'
          : 'sites to visit',
      sub: `${sites.length - toVisit} of ${sites.length} visited ${when}`,
    },
    {
      key: 'timesheets',
      n: sheetsAll - sheetsIn,
      label: sheetsAll - sheetsIn === 1 ? 'timesheet to collect' : 'timesheets to collect',
      sub: `${sheetsIn} of ${sheetsAll} in ${when}`,
    },
    {
      key: 'assessment',
      n: toFile,
      label: toFile === 1 ? 'assessment to file' : 'assessments to file',
      sub: toFile ? dueText(n, today) : 'All filed',
      subTone: toFile && due !== 'early' ? openTone(due) : undefined,
    },
  ];

  const day = fmtDate(today, LONG_DAY);
  const end = fmtDate(w.end, LONG_DAY);
  const sub = past ? (
    <>
      {fmtDate(w.start, SHORT_DAY)} – {fmtDate(w.end, SHORT_DAY)} ·{' '}
      <Link href="/" className="font-semibold text-[var(--color-brand)] hover:underline">
        Back to this week
      </Link>
    </>
  ) : due === 'early' ? (
    `${day} · The week ends ${end}`
  ) : due === 'today' ? (
    `${day} · The week ends today`
  ) : (
    `${day} · The week ended ${end}`
  );

  /* Earlier weeks only: later ones have not started */
  const weekLink = (to: number, label: string) =>
    to >= 1 && to <= current ? (
      <Link href={to === current ? '/' : `/?week=${to}`} className="btn btn-sm" aria-label={`${label}, week ${to}`}>
        {label}
      </Link>
    ) : (
      <span className="btn btn-sm" aria-disabled="true">
        {label}
      </span>
    );

  const register = (
    <Link href="/sites/new" className="btn btn-outline">
      Register a worksite
    </Link>
  );
  const siteNames = Object.fromEntries(sites.map((d) => [d.site.id, d.site.name]));

  return (
    <>
      <PageHeader
        title={`Week ${n} of ${WEEK_COUNT}`}
        sub={sub}
        actions={
          <>
            <nav className="flex gap-2" aria-label="Program weeks">
              {weekLink(n - 1, 'Previous week')}
              {weekLink(n + 1, 'Next week')}
            </nav>
            {register}
          </>
        }
      />

      {rows.length ? (
        <WeekBoard
          key={n}
          past={past}
          cells={cells}
          rows={rows}
          totals={`${plural(sites.length, 'worksite')} · ${plural(youth, 'active participant')}`}
          pinned={<PinnedNotes notes={notes} siteNames={siteNames} />}
        />
      ) : (
        <SiteListEmpty action={register} />
      )}

      <NotesPanel notes={notes} sites={sites.map((d) => ({ id: d.site.id, name: d.site.name }))} />
    </>
  );
}

export default function Page(props: PageProps<'/'>) {
  return (
    <Suspense fallback={<PageSkeleton rows={7} />}>
      <SitesPage {...props} />
    </Suspense>
  );
}
