import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TimesheetCheckoff } from '@/components/site/timesheets';
import { Dl, Status } from '@/components/ui/bits';
import { firstLast, fmtDate, fmtDay, fmtShort } from '@/lib/format';
import { INTERVIEWS_REQUIRED } from '@/lib/forms';
import { isWeekNumber, WEEKS, week as weekInfo } from '@/lib/program';
import {
  activeParticipants,
  assessmentStatus,
  dueState,
  findings,
  interviewsDone,
  primarySupervisor,
  siteWeekStatus,
  sortVisits,
  timesheetSummary,
  visitsInWeek,
  weekCell,
} from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { Suspense } from 'react';
import { WeekSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Weekly' };

async function WeekPage({ params }: PageProps<'/sites/[siteId]/weeks/[week]'>) {
  const { siteId, week } = await params;
  const n = Number(week);
  if (!isWeekNumber(n)) notFound();
  const [bundle, clock] = await Promise.all([getSiteBundle(siteId), getClock()]);
  if (!bundle) notFound();

  const { site, participants, visits, timesheets, assessments } = bundle;
  const w = weekInfo(n);
  const active = activeParticipants(participants);
  const ts = timesheets.find((t) => t.week === n);
  const summary = timesheetSummary(ts, active);
  const a = assessments.find((x) => x.week === n) ?? null;
  const flags = a ? findings(a.form, site) : [];
  const weekVisits = sortVisits(visitsInWeek(visits, n));
  const base = `/sites/${site.id}`;
  const evalKey = n === 3 ? 'week3' : n === 6 ? 'week6' : null;
  const evalBack = evalKey ? active.filter((p) => p.docs[evalKey]).length : 0;
  const upcoming = n > clock.week;
  const status = assessmentStatus(siteWeekStatus(bundle, n, clock.week), n, clock.today);

  return (
    <div className="grid gap-6">
      <nav
        aria-label="Program weeks"
        className="grid grid-cols-3 gap-px border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-6"
      >
        {WEEKS.map((x) => {
          const cell = weekCell(bundle, x.n, clock.week, clock.today);
          const on = x.n === n;
          return (
            <Link
              key={x.n}
              href={`${base}/weeks/${x.n}`}
              aria-current={on ? 'page' : undefined}
              className={`px-3 py-2.5 text-[var(--color-ink)] no-underline ${
                on
                  ? 'bg-[var(--color-brand-50)] shadow-[inset_0_-2px_0_var(--color-brand)]'
                  : 'bg-[var(--color-panel)] hover:bg-[var(--color-hover)]'
              }`}
            >
              <span className="block text-sm font-semibold">
                Week {x.n}
                {x.n === clock.week ? <span className="muted font-normal"> · now</span> : null}
              </span>
              <span className="muted block text-[0.8125rem]">{fmtShort(x.start)}</span>
              <Status tone={cell.tone} className="text-[0.8125rem]">
                {cell.label === '—' ? 'Upcoming' : cell.label}
              </Status>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl">
          Week {n} <span className="muted font-normal">· {fmtShort(w.start)} – {fmtDate(w.end)}</span>
        </h2>
        <span className="kicker">
          {weekVisits.length
            ? `Visited ${weekVisits.map((v) => fmtDay(v.date)).join(', ')}`
            : upcoming
              ? 'Upcoming'
              : 'No visit logged this week'}
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="panel">
          <div className="panel-h">
            <h2>Worksite assessment</h2>
            <span className="ml-auto text-sm">
              {a?.status === 'submitted' ? (
                <Status tone="done">Filed {fmtShort(a.submittedAt)}</Status>
              ) : upcoming && !a ? (
                <Status tone="muted">Not open yet</Status>
              ) : (
                <Status tone={status.tone}>{status.label}</Status>
              )}
            </span>
          </div>
          <div className="panel-b">
            {a?.status === 'submitted' ? (
              <>
                <Dl
                  items={[
                    ['Date of visit', fmtDate(a.form.visitDate)],
                    ['Present', `${a.form.present} of ${a.form.assigned}`],
                    ['Interviews', `${interviewsDone(a.form)} of ${INTERVIEWS_REQUIRED}`],
                    [
                      'Findings',
                      flags.length ? <Status tone="warn">{flags.length} flagged</Status> : 'None',
                    ],
                  ]}
                />
                {flags.length ? (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
                    {flags.slice(0, 3).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {flags.length > 3 ? <li className="muted">and {flags.length - 3} more</li> : null}
                  </ul>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`${base}/weeks/${n}/assessment/packet`} className="btn btn-primary">
                    View and print
                  </Link>
                  <Link href={`${base}/weeks/${n}/assessment`} className="btn">
                    Edit
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="muted text-[0.9375rem]">
                  {a
                    ? 'A draft is saved. Pick up where you left off.'
                    : `Site and facility, recordkeeping, attendance, operations, program activities${
                        site.childcare ? ', childcare questions' : ''
                      }, ${INTERVIEWS_REQUIRED} private participant interviews, then the summary and both signatures.`}
                </p>
                {site.assessmentDefaults && !a ? (
                  <p className="kicker mt-2">Opens with your saved answers from week {site.assessmentDefaults.savedFromWeek}.</p>
                ) : null}
                <Link href={`${base}/weeks/${n}/assessment`} className="btn btn-primary mt-5">
                  {a ? 'Continue the draft' : 'Start the assessment'}
                </Link>
              </>
            )}
          </div>
        </section>

        <TimesheetCheckoff
          key={n}
          siteId={site.id}
          week={n}
          ending={w.ending}
          active={active}
          collected={[...summary.collected]}
          collectedOn={summary.collectedOn}
          note={summary.note}
          signer={primarySupervisor(site) ? firstLast(primarySupervisor(site)!.name) : ''}
          today={clock.today}
          due={dueState(n, clock.today)}
        />
      </div>

      {evalKey ? (
        <section className="panel">
          <div className="panel-h">
            <h2>Week {n} participant evaluations</h2>
            <Status tone={evalBack === active.length ? 'done' : 'warn'} className="ml-auto text-sm">
              {evalBack} of {active.length} back
            </Status>
          </div>
          <div className="panel-b">
            <p className="muted text-[0.9375rem]">
              Paper forms, handed to the supervisor ahead of week {n}. Tick each one on the roster when the signed copy
              comes back.
            </p>
            <Link href={`${base}/participants`} className="btn mt-4">
              Open the roster
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/weeks/[week]'>) {
  return (
    <Suspense fallback={<WeekSkeleton />}>
      <WeekPage {...props} />
    </Suspense>
  );
}
