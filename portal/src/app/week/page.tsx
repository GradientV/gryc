import Link from 'next/link';
import { PageHeader, SectionTitle, Status } from '@/components/ui/bits';
import { PrintButton } from '@/components/ui/print-button';
import { fmtDate, fmtShort, fmtSlash } from '@/lib/format';
import { inWeek, WEEKS } from '@/lib/program';
import { activeParticipants, dueText, mileageTotal, weekCell, worklist, type Tone } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getMileage, getMySites } from '@/server/data';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'This week' };

/* Only late (red) and needs-a-look (amber) work gets a colored edge; work
   that is simply not done yet stays plain. */
const RULE: Record<Tone, string> = {
  due: 'border-l-[var(--color-due)]',
  warn: 'border-l-[#d99a2b]',
  todo: 'border-l-transparent',
  done: 'border-l-transparent',
  muted: 'border-l-transparent',
  ok: 'border-l-transparent',
};

async function WeekPage() {
  const [clock, sites, mileage] = await Promise.all([getClock(), getMySites(), getMileage()]);
  const n = clock.week;
  const w = clock.weekInfo;
  const groups = sites.map((d) => ({ d, items: worklist(d, n, clock.today) })).filter((g) => g.items.length);
  const open = groups.reduce((t, g) => t + g.items.length, 0);
  const youth = sites.reduce((t, d) => t + activeParticipants(d.participants).length, 0);
  const trips = mileage.trips.filter((t) => inWeek(t.date, n));
  const due = dueText(n, clock.today); // "Due Friday, Aug 7"
  const dueLower = due.charAt(0).toLowerCase() + due.slice(1);

  return (
    <>
      <PageHeader
        title={`Week ${n} worklist`}
        sub={`${fmtDate(w.start)} – ${fmtDate(w.end)} · week ending ${fmtSlash(w.ending)} · ${sites.length} sites · ${youth} participants`}
        actions={<PrintButton label="Print worklist" />}
      />

      <SectionTitle
        aside={<span className="kicker">{open ? `${open} open · this week’s work ${dueLower}` : 'All done'}</span>}
      >
        Still to do
      </SectionTitle>
      {groups.length ? (
        <div className="grid gap-6">
          {groups.map(({ d, items }) => (
            <section key={d.site.id} className="panel">
              <div className="panel-h">
                <h3 className="text-base">
                  <Link href={`/sites/${d.site.id}`} className="text-[var(--color-ink)]">
                    {d.site.name}
                  </Link>
                </h3>
                <span className="kicker ml-auto">
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>
              <ul>
                {items.map((it) => (
                  <li key={it.task} className="border-b border-[var(--color-line-2)] last:border-0">
                    <Link
                      href={it.href}
                      className={`rowlink flex items-start justify-between gap-4 border-l-[3px] px-4 py-3 ${RULE[it.tone]}`}
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold">{it.task}</span>
                        <span className="muted block text-sm">{it.detail}</span>
                      </span>
                      <span className="no-print shrink-0 text-sm font-semibold text-[var(--color-brand)]">Open</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="panel px-4 py-12 text-center">
          <p className="font-semibold">Week {n} is closed out</p>
          <p className="muted mt-1 text-sm">Every site visited, every timesheet in, every assessment filed.</p>
        </div>
      )}

      <div className="mt-10">
        <SectionTitle>Week by site</SectionTitle>
        <div className="panel">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="sticky left-0 z-[1] min-w-48">Worksite</th>
                  {WEEKS.map((x) => (
                    <th key={x.n} className="c">
                      Week {x.n}
                      <span className="block font-normal">{fmtShort(x.start)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sites.map((d) => (
                  <tr key={d.site.id}>
                    <td className="sticky left-0 z-[1] bg-[var(--color-panel)] font-semibold">
                      <Link href={`/sites/${d.site.id}`} className="text-[var(--color-ink)]">
                        {d.site.name}
                      </Link>
                    </td>
                    {WEEKS.map((x) => {
                      const cell = weekCell(d, x.n, n, clock.today);
                      return (
                        <td key={x.n} className="c whitespace-nowrap">
                          {cell.label === '—' ? (
                            <span className="muted">—</span>
                          ) : (
                            <Link href={`/sites/${d.site.id}/weeks/${x.n}`} className="no-underline">
                              <Status tone={cell.tone}>{cell.label}</Status>
                            </Link>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel-f">
            Done: assessment filed and every timesheet in. Sheets out: filed, timesheets still out. Draft: started, not
            filed. Each week is due by its Friday; work still open after that shows as late or overdue.
          </div>
        </div>
      </div>

      <div className="mt-10">
        <SectionTitle aside={<Link href="/mileage" className="no-print text-sm font-semibold">Open the mileage form</Link>}>
          Mileage this week
        </SectionTitle>
        <div className="panel">
          {trips.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th className="r">Miles</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id}>
                      <td className="num whitespace-nowrap">{fmtSlash(t.date)}</td>
                      <td>{t.from}</td>
                      <td>{t.to}</td>
                      <td className="r num">{t.total ?? '—'}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="r font-semibold">
                      Total
                    </td>
                    <td className="r num font-semibold">{mileageTotal(trips)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted px-4 py-8 text-center text-sm">No trips logged this week. The mileage form goes in with your timesheet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton rows={6} />}>
      <WeekPage />
    </Suspense>
  );
}
