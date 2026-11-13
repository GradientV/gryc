import Link from 'next/link';
import { notFound } from 'next/navigation';
import { directionsHref, fullAddress } from '@/lib/format';
import { openVisit, sortVisits } from '@/lib/rules';
import { Skeleton } from '@/components/ui/bits';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { CheckInControl } from './check-in';
import { SiteTabs } from './site-tabs';

export async function SiteHeader({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const [bundle, clock] = await Promise.all([getSiteBundle(siteId), getClock()]);
  if (!bundle) notFound();
  const { site, visits } = bundle;
  const open = openVisit(visits, clock.today);
  /* the latest finished visit today, so the header can say it happened */
  const doneToday = open ? null : (sortVisits(visits.filter((v) => v.date === clock.today && v.timeOut))[0] ?? null);

  const meta = [site.dycdId ? `Site ${site.dycdId}` : '', site.worksiteType, site.childcare ? 'Childcare site' : ''].filter(
    Boolean,
  );

  return (
    <>
      <div className="crumbs mb-3">
        <Link href="/">Sites</Link> <span aria-hidden="true">/</span> {site.name}
      </div>
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1>{site.name}</h1>
          <p className="muted mt-1 text-[0.9375rem]">
            <a
              href={directionsHref(site)}
              target="_blank"
              rel="noreferrer"
              title="Directions in Google Maps"
              className="text-[var(--color-ink-2)] underline decoration-[var(--color-line)] hover:text-[var(--color-brand)] hover:decoration-current"
            >
              {fullAddress(site)}
            </a>
            {meta.map((m) => ` · ${m}`).join('')}
            {!site.applicationOnFile ? (
              <>
                {' · '}
                <span className="tone-due">No application on file</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="no-print shrink-0">
          <CheckInControl siteId={site.id} siteName={site.name} open={open} doneToday={doneToday} today={clock.today} />
        </div>
      </div>
      <SiteTabs siteId={site.id} week={clock.week} />
    </>
  );
}

export function SiteHeaderSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-3 h-7 w-96 max-w-full" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full" />
      <Skeleton className="mb-6 h-9 w-full" />
    </div>
  );
}
