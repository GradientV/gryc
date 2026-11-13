import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Packet } from '@/components/assessment/packet';
import { MissingVisitNotice } from '@/components/site/visit-log';
import { PrintButton } from '@/components/ui/print-button';
import { fmtDate } from '@/lib/format';
import { isWeekNumber } from '@/lib/program';
import { findings } from '@/lib/rules';
import { getSiteBundle } from '@/server/data';
import { Suspense } from 'react';
import { PacketSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Assessment packet' };

async function PacketPage({ params }: PageProps<'/sites/[siteId]/weeks/[week]/assessment/packet'>) {
  const { siteId, week } = await params;
  const n = Number(week);
  if (!isWeekNumber(n)) notFound();
  const bundle = await getSiteBundle(siteId);
  if (!bundle) notFound();
  const { site, assessments, visits } = bundle;
  const a = assessments.find((x) => x.week === n);
  if (!a) redirect(`/sites/${site.id}/weeks/${n}/assessment`);
  const flags = findings(a.form, site);
  const base = `/sites/${site.id}/weeks/${n}`;
  const visitDate = a.form.visitDate;
  const unlogged = !!visitDate && !visits.some((v) => v.date === visitDate);

  return (
    <div>
      <div className="no-print">
        <div className="crumbs mb-3">
          <Link href="/">Sites</Link> <span aria-hidden="true">/</span> <Link href={`/sites/${site.id}`}>{site.name}</Link>{' '}
          <span aria-hidden="true">/</span> <Link href={base}>Week {n}</Link> <span aria-hidden="true">/</span> Packet
        </div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1>Worksite assessment, week {n}</h1>
            <p className="muted mt-1.5">
              {site.name} · visit {fmtDate(a.form.visitDate)}
              {a.status === 'submitted' ? ` · filed ${fmtDate(a.submittedAt)}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={base} className="btn">
              Done
            </Link>
            <Link href={`${base}/assessment`} className="btn">
              Edit
            </Link>
            <PrintButton primary />
          </div>
        </div>

        {a.status !== 'submitted' ? (
          <p className="callout mb-5">This is a draft. It has not been filed yet.</p>
        ) : null}
        {unlogged ? <MissingVisitNotice siteId={site.id} date={visitDate} label={fmtDate(visitDate)} /> : null}
        {flags.length ? (
          <div className="callout callout-due mb-6">
            <p className="font-semibold">
              {flags.length} finding{flags.length === 1 ? '' : 's'} to follow up
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {flags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Packet a={a.form} site={site} />
    </div>
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/weeks/[week]/assessment/packet'>) {
  return (
    <Suspense fallback={<PacketSkeleton />}>
      <PacketPage {...props} />
    </Suspense>
  );
}
