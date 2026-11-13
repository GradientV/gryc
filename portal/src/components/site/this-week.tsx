import Link from 'next/link';
import type { ReactNode } from 'react';
import { fmtDay, fmtShort, fmtTime, plural } from '@/lib/format';
import { week as weekInfo } from '@/lib/program';
import {
  assessmentStatus,
  dueText,
  siteWeekStatus,
  timesheetStatus,
  visitsInWeek,
  visitStatus,
  type SiteWeekData,
  type StatusText,
} from '@/lib/rules';
import { Status } from '../ui/bits';

function Part({
  label,
  status,
  detail,
  action,
}: {
  label: string;
  status: StatusText;
  detail?: ReactNode;
  action: ReactNode;
}) {
  return (
    <div className="min-w-0 px-4 py-3.5">
      <div className="text-[0.78rem] font-semibold text-[var(--color-ink-3)]">{label}</div>
      <Status tone={status.tone} className="mt-0.5 block text-[0.9375rem]">
        {status.label}
      </Status>
      {detail ? <div className="muted text-[0.8125rem]">{detail}</div> : null}
      <div className="mt-1.5">{action}</div>
    </div>
  );
}

/** The top of a worksite's Overview: this week's visit, timesheets and
    assessment, each with its next step. Check in and out stay in the page
    header, which every tab shares. */
export function ThisWeek({ data, n, today }: { data: SiteWeekData; n: number; today: string }) {
  const s = siteWeekStatus(data, n, n);
  const base = `/sites/${data.site.id}`;
  const w = weekInfo(n);
  const due = dueText(n, today);
  const v = s.lastVisit;
  const visitCount = visitsInWeek(data.visits, n).length;
  const a = s.assessment;
  const t = s.timesheets;
  const sheetsIn = t.received >= t.expected;

  const visitDetail = v
    ? v.timeOut
      ? `${fmtTime(v.timeIn)} – ${fmtTime(v.timeOut)}${visitCount > 1 ? ` · ${plural(visitCount, 'visit')} this week` : ''}`
      : `Checked in at ${fmtTime(v.timeIn)}`
    : due;
  const sheetsDetail = !t.expected
    ? undefined
    : sheetsIn
      ? t.collectedOn
        ? `Picked up ${fmtDay(t.collectedOn)}`
        : undefined
      : due;
  const assessmentDetail = a?.status === 'submitted' ? `Filed ${fmtDay(a.submittedAt)}` : due;

  return (
    <section className="panel">
      <div className="panel-h">
        <h2>This week</h2>
        <span className="kicker">
          Week {n} · {fmtShort(w.start)} – {fmtShort(w.end)}
        </span>
      </div>
      <div className="grid divide-y divide-[var(--color-line-2)] md:grid-cols-3 md:divide-x md:divide-y-0">
        <Part
          label="Visit"
          status={visitStatus(s, n, today)}
          detail={visitDetail}
          action={
            <Link href={`${base}/log`} className="link-action">
              Monitoring log
            </Link>
          }
        />
        <Part
          label="Timesheets"
          status={timesheetStatus(s, n, today)}
          detail={sheetsDetail}
          action={
            <Link href={`${base}/weeks/${n}`} className="link-action">
              {sheetsIn ? 'Review timesheets' : 'Collect timesheets'}
            </Link>
          }
        />
        <Part
          label="Assessment"
          status={assessmentStatus(s, n, today)}
          detail={assessmentDetail}
          action={
            a?.status === 'submitted' ? (
              <Link href={`${base}/weeks/${n}/assessment/packet`} className="link-action">
                View the packet
              </Link>
            ) : (
              <Link href={`${base}/weeks/${n}/assessment`} className="link-action">
                {a ? 'Continue the assessment' : 'Start the assessment'}
              </Link>
            )
          }
        />
      </div>
    </section>
  );
}
