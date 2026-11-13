import { notFound } from 'next/navigation';
import { Roster } from '@/components/site/roster';
import { PROGRAM } from '@/lib/program';
import { docProgress, docsFor } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { Suspense } from 'react';
import { TabSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Participants' };

async function ParticipantsPage({ params }: PageProps<'/sites/[siteId]/participants'>) {
  const { siteId } = await params;
  const [bundle, clock] = await Promise.all([getSiteBundle(siteId), getClock()]);
  if (!bundle) notFound();
  const { site, participants } = bundle;

  return (
    <Roster
      siteId={site.id}
      siteBorough={site.borough}
      childcare={site.childcare}
      participants={participants.map((p) => ({ ...p, childcareForm: null }))}
      docs={docsFor(site)}
      currentWeek={clock.week}
      outstanding={docProgress(site, participants, clock.week).outstanding}
      cohort={PROGRAM.cohort}
    />
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/participants'>) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <ParticipantsPage {...props} />
    </Suspense>
  );
}
