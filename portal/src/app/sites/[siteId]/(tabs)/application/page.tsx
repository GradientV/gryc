import { notFound } from 'next/navigation';
import { Dl } from '@/components/ui/bits';
import { firstLast, fmtSlash } from '@/lib/format';
import { DAY_LABELS, DAYS } from '@/lib/forms';
import { PROGRAM } from '@/lib/program';
import { getSiteBundle } from '@/server/data';
import { Suspense } from 'react';
import { TabSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Worksite application' };

async function ApplicationPage({ params }: PageProps<'/sites/[siteId]/application'>) {
  const { siteId } = await params;
  const bundle = await getSiteBundle(siteId);
  if (!bundle) notFound();
  const { site } = bundle;
  const cc = site.cc;

  if (!site.applicationOnFile) {
    return (
      <div className="panel px-4 py-12 text-center">
        <p className="font-semibold">No Worksite Application on file</p>
        <p className="muted mx-auto mt-1 max-w-md text-sm">
          Once the GRYC office loads it, the general information, supervisors, schedule and duties fill in every weekly
          assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="panel">
        <div className="panel-h">
          <h2>General information</h2>
          <span className="kicker ml-auto">{PROGRAM.cycle}</span>
        </div>
        <div className="panel-b grid gap-5">
          <Dl
            items={[
              ['Initiative', PROGRAM.initiative],
              ['Provider name', PROGRAM.provider],
              ['Worksite name', site.applicationName || site.name],
              ...(site.applicationName ? ([['Known on site as', site.name]] as [string, string][]) : []),
              ['Address', [site.address, site.room].filter(Boolean).join(', ')],
              ['Borough and ZIP', `${site.borough} ${site.zip}`],
              ['City agency', site.cityAgency + (site.agency ? ` (${site.agency})` : '')],
              ['In a DOE building', site.doeBuilding],
              ['Summer Rising worksite', site.summerRising],
              ['Sector', site.sector],
              ['Industry', site.industry],
              ['Site implementation', site.implementation],
              ['Childcare', site.childcare ? 'Yes' : 'No'],
              ['Nature or environment assignments', site.natureEnv],
            ]}
          />
          {site.travel ? <Dl items={[['Travel directions', site.travel]]} /> : null}
          {site.description ? <Dl items={[['Description', site.description]]} /> : null}
          {site.website ? (
            <Dl
              items={[
                [
                  'Website',
                  <a key="w" href={site.website} target="_blank" rel="noopener">
                    {site.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </a>,
                ],
              ]}
            />
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <h2>Supervision and schedule</h2>
        </div>
        <div className="panel-b">
          <Dl
            items={[
              ['Participants requested', String(site.requested || '—')],
              ['Supervisors to participants', `${site.ratioSup || '—'} : ${site.ratioPart || '—'}`],
              ['Able to provide 150 hours', site.fullHours === 'Y' ? 'Yes' : site.fullHours === 'N' ? 'No' : site.fullHours],
              ['Staggered schedules', site.staggered],
              ['Supervisors', site.supervisors.map((v) => firstLast(v.name)).join(', ')],
            ]}
          />
        </div>
        {site.schedules.length ? (
          <div className="table-wrap border-t border-[var(--color-line-2)]">
            <table className="table">
              <thead>
                <tr>
                  <th>Shift</th>
                  {DAY_LABELS.map((d) => (
                    <th key={d}>{d.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {site.schedules.map((sc) => (
                  <tr key={sc.name}>
                    <td className="font-semibold whitespace-nowrap">{sc.name}</td>
                    {DAYS.map((d) => (
                      <td key={d} className="text-[0.8125rem] whitespace-nowrap">
                        {sc[d] ? sc[d].replace(/ to /, ' – ') : <span className="muted">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {site.jobs.length ? (
        <section className="panel">
          <div className="panel-h">
            <h2>Job titles and duties</h2>
          </div>
          <div className="grid gap-6 p-4">
            {site.jobs.map((j, i) => (
              <div key={i} className={i ? 'border-t border-[var(--color-line-2)] pt-6' : ''}>
                <Dl
                  items={[
                    ['Category', j.category],
                    ['Job title', j.title],
                    ['Assigned to these duties', j.assigned === null ? '' : String(j.assigned)],
                    ['Must be 18 or older', j.must18 || 'No'],
                  ]}
                />
                <div className="mt-4 grid gap-4">
                  <Dl items={[['Duties', j.duties]]} />
                  {j.restrictions ? <Dl items={[['Restrictions', j.restrictions]]} /> : null}
                  {j.special ? <Dl items={[['Special requirements', j.special]]} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {cc ? (
        <section className="panel">
          <div className="panel-h">
            <h2>Attachment 1: childcare sites</h2>
          </div>
          <div className="panel-b">
            <Dl
              items={[
                ['Type of facility', cc.facilityType],
                ['Program dates', `${fmtSlash(cc.startDate) || '—'} to ${fmtSlash(cc.endDate) || '—'}`],
                ['Children expected', cc.childrenServed],
                ['Participants on trips', cc.trips],
                ['Outdoor activities', cc.outdoor],
                ['Screening requirements', cc.screening],
                ['Participants fingerprinted', cc.fingerprinted],
                [cc.licenseType || 'License', cc.licenseNumber],
                ['Expiration date', fmtSlash(cc.licenseExp)],
                ['Out of city worksite', cc.outOfCity],
              ]}
            />
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-h">
          <h2>Required attachments and certifications</h2>
        </div>
        <div className="panel-b">
          <Dl
            items={[
              ['Investigation in the last 5 years', site.certs.investigation],
              ['Current license or certificate on file', site.certs.licenseCopy ? 'Yes' : 'No'],
              ['Signed Site Assurances and Certifications', site.certs.assurances],
            ]}
          />
        </div>
      </section>
    </div>
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/application'>) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <ApplicationPage {...props} />
    </Suspense>
  );
}
