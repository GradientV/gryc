import { notFound } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { AddSupervisor, EditDuties, EditSiteInfo, RemoveSupervisor } from '@/components/site/overview-actions';
import { SiteNotes } from '@/components/site/site-notes';
import { ThisWeek } from '@/components/site/this-week';
import { Dl, Meter } from '@/components/ui/bits';
import { OverviewSkeleton } from '@/components/ui/skeletons';
import { directionsHref, firstLast, fullAddress, telHref } from '@/lib/format';
import { activeParticipants, docProgress, primarySupervisor } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getNotes, getSiteAddresses, getSiteBundle } from '@/server/data';
import { getCurrentMonitor } from '@/server/session';

export const metadata = { title: 'Worksite' };

function Fact({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line-2)] py-2 text-sm last:border-0">
      <span className="muted">{k}</span>
      <span className="num font-semibold">{v}</span>
    </div>
  );
}

async function SiteOverviewPage({ params }: PageProps<'/sites/[siteId]'>) {
  const { siteId } = await params;
  const [bundle, clock, me, notes, sites] = await Promise.all([
    getSiteBundle(siteId),
    getClock(),
    getCurrentMonitor(),
    getNotes(),
    getSiteAddresses(),
  ]);
  if (!bundle) notFound();
  const { site, participants, visits, assessments } = bundle;
  const progress = docProgress(site, participants, clock.week);
  const rep = primarySupervisor(site);
  const filed = assessments.filter((a) => a.status === 'submitted').length;

  return (
    <div className="grid gap-6">
      <ThisWeek data={bundle} n={clock.week} today={clock.today} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 content-start gap-6">
          {site.addressNote ? (
            <p className="callout">
              <b>Address correction.</b> {site.addressNote}
            </p>
          ) : null}

          <section className="panel">
            <div className="panel-h">
              <h2>Worksite information</h2>
              <div className="ml-auto">
                <EditSiteInfo site={site} />
              </div>
            </div>
            <div className="panel-b">
              <Dl
                items={[
                  [
                    'Address',
                    <a key="a" href={directionsHref(site)} target="_blank" rel="noreferrer">
                      {fullAddress(site)}
                    </a>,
                  ],
                  ['Between / cross streets', site.crossStreets],
                  ['Travel directions', site.travel.replace(/\n+/g, '\n')],
                  ['Worksite type', site.worksiteType],
                  ['Site implementation', site.implementation],
                  ['Industry', site.industry],
                ]}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <h2>Participant duties</h2>
              <div className="ml-auto">
                <EditDuties siteId={site.id} job={site.jobs[0]} />
              </div>
            </div>
            <div className="panel-b grid gap-6">
              {site.jobs.length ? (
                site.jobs.map((j, i) => (
                  <div key={i} className={i ? 'border-t border-[var(--color-line-2)] pt-5' : ''}>
                    <p className="font-semibold">{j.title.replace(/^Other:\s*/, '') || 'Untitled role'}</p>
                    <p className="muted mb-2 text-sm">
                      {[
                        j.category,
                        j.assigned !== null ? `${j.assigned} participants` : '',
                        j.must18 === 'Yes' ? 'Must be 18 or older' : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <p className="text-[0.9375rem]">{j.duties}</p>
                    {j.special ? (
                      <p className="mt-2 text-sm">
                        <span className="muted">Special requirements: </span>
                        {j.special}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="muted">
                  No job duties on file yet. They fill in Program Activities question 4 and, at childcare sites, the
                  daily responsibilities box.
                </p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <h2>Supervision and management</h2>
              <div className="ml-auto">
                <AddSupervisor siteId={site.id} />
              </div>
            </div>
            {site.supervisors.length ? (
              <ul>
                {site.supervisors.map((v) => (
                  <li
                    key={v.id}
                    className="grid gap-x-6 gap-y-1 border-b border-[var(--color-line-2)] px-4 py-3.5 last:border-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{firstLast(v.name)}</p>
                      <p className="muted text-sm">
                        {[
                          v.title,
                          v.siteRep ? 'Site representative' : '',
                          v.keyMgmt ? 'Key management' : '',
                          v.signAttendance ? 'Signs attendance' : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="min-w-0 text-sm">
                      {v.phone ? (
                        <a href={telHref(v.phone)} className="num block">
                          {v.phone}
                        </a>
                      ) : null}
                      {v.email ? (
                        <a href={`mailto:${v.email}`} className="block truncate">
                          {v.email}
                        </a>
                      ) : null}
                    </div>
                    <div className="-ml-2 sm:ml-0">
                      <RemoveSupervisor siteId={site.id} supervisor={v} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted px-4 py-6 text-sm">No supervisors listed.</p>
            )}
            {site.ftEmployees || site.supervisingStaff ? (
              <div className="panel-f">
                {[
                  site.ftEmployees ? `${site.ftEmployees} full-time employees` : '',
                  site.supervisingStaff ? `${site.supervisingStaff} responsible for supervising youth` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="grid content-start gap-6">
          {rep ? (
            <section className="panel panel-b">
              <h2 className="mb-2 text-base">Site representative</h2>
              <p className="font-semibold">{firstLast(rep.name)}</p>
              <p className="muted mb-2 text-sm">{rep.title}</p>
              {rep.phone ? (
                <a href={telHref(rep.phone)} className="num block text-sm">
                  {rep.phone}
                </a>
              ) : null}
              {rep.email ? (
                <a href={`mailto:${rep.email}`} className="block truncate text-sm">
                  {rep.email}
                </a>
              ) : null}
            </section>
          ) : null}

          <SiteNotes
            notes={notes.filter((n) => n.siteId === site.id)}
            siteId={site.id}
            sites={sites.map((s) => ({ id: s.id, name: s.name }))}
          />

          <section className="panel panel-b">
            <h2 className="mb-3 text-base">Documents to date</h2>
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="muted">Collected</span>
              <span className="num font-semibold">
                {progress.done} of {progress.total}
              </span>
            </div>
            <Meter done={progress.done} total={progress.total} label="Documents collected" />
            <p className="kicker mt-2">Counts documents due by week {clock.week}.</p>
          </section>

          <section className="panel panel-b">
            <h2 className="mb-2 text-base">At a glance</h2>
            <Fact k="Participants requested" v={site.requested || '—'} />
            <Fact k="Active on the roster" v={activeParticipants(participants).length} />
            <Fact k="Supervisors" v={site.supervisors.length} />
            <Fact k="Visits logged" v={visits.length} />
            <Fact k="Assessments filed" v={filed} />
          </section>

          <section className="panel panel-b">
            <h2 className="mb-2 text-base">Assigned monitor</h2>
            <p className="font-semibold">{me.name}</p>
            <p className="muted text-sm">{me.email}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function Page(props: PageProps<'/sites/[siteId]'>) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <SiteOverviewPage {...props} />
    </Suspense>
  );
}
