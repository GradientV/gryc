import { notFound } from 'next/navigation';
import { VisitLog } from '@/components/site/visit-log';
import { firstLast, fullAddress } from '@/lib/format';
import { PROGRAM } from '@/lib/program';
import { primarySupervisor, sortVisits } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { Suspense } from 'react';
import { TabSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Monitoring log' };

async function LogPage({ params }: PageProps<'/sites/[siteId]/log'>) {
  const { siteId } = await params;
  const [bundle, clock] = await Promise.all([getSiteBundle(siteId), getClock()]);
  if (!bundle) notFound();
  const { site, visits } = bundle;
  const rep = primarySupervisor(site);

  return (
    <section className="panel">
      <div className="panel-h">
        <h2>Monitoring log</h2>
        <span className="kicker">
          {visits.length} visit{visits.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="panel-b grid gap-3 border-b border-[var(--color-line-2)]">
        <dl className="dl">
          <div>
            <dt>Provider name</dt>
            <dd>{PROGRAM.provider}</dd>
          </div>
          <div>
            <dt>Worksite name</dt>
            <dd>{site.name}</dd>
          </div>
          <div>
            <dt>Worksite address</dt>
            <dd>{fullAddress(site)}</dd>
          </div>
          {rep ? (
            <div>
              <dt>Worksite supervisor</dt>
              <dd>
                {firstLast(rep.name)}
                {rep.title ? `, ${rep.title}` : ''}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="kicker">
          Signed by everyone conducting SYEP/WLG business at the site. Every visit is also documented in YEPS.
        </p>
      </div>
      <div className="p-3 md:p-4">
        <VisitLog siteId={site.id} visits={sortVisits(visits)} today={clock.today} />
      </div>
    </section>
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/log'>) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <LogPage {...props} />
    </Suspense>
  );
}
