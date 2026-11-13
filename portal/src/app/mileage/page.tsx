import { MileageForm } from '@/components/mileage/mileage-form';
import { Figures, PageHeader } from '@/components/ui/bits';
import { fmtMiles } from '@/lib/format';
import { inWeek, PROGRAM } from '@/lib/program';
import { mileageTotal } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getMileage, getSiteAddresses } from '@/server/data';
import { getCurrentMonitor } from '@/server/session';
import { Suspense } from 'react';
import { PageSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Mileage' };

async function MileagePage() {
  const [clock, me, { trips, locations }, sites] = await Promise.all([
    getClock(),
    getCurrentMonitor(),
    getMileage(),
    getSiteAddresses(),
  ]);
  const thisWeek = trips.filter((t) => inWeek(t.date, clock.week));

  return (
    <>
      <PageHeader title="Mileage" sub={`${me.name} · ${PROGRAM.cycle}`} />
      <Figures
        items={[
          { n: trips.length, l: 'Trips logged' },
          { n: fmtMiles(mileageTotal(thisWeek)) || '0', l: `Miles in week ${clock.week}` },
          { n: fmtMiles(mileageTotal(trips)) || '0', l: 'Miles this summer' },
          { n: new Set(trips.map((t) => t.date)).size, l: 'Days driven' },
        ]}
      />
      <MileageForm trips={trips} locations={locations} sites={sites} today={clock.today} monitorName={me.name} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton rows={8} />}>
      <MileagePage />
    </Suspense>
  );
}
