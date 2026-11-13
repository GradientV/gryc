import { notFound } from 'next/navigation';
import { ChildcareQuestionnaire } from '@/components/site/childcare-form';
import { proster } from '@/lib/format';
import { blankChildcareForm, lastChildcareForm } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { getCurrentMonitor } from '@/server/session';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Childcare questionnaire' };

async function ChildcarePage({
  params,
}: PageProps<'/sites/[siteId]/participants/[participantId]/childcare'>) {
  const { siteId, participantId } = await params;
  const [bundle, clock, me] = await Promise.all([getSiteBundle(siteId), getClock(), getCurrentMonitor()]);
  if (!bundle) notFound();
  const { site, participants } = bundle;
  const participant = participants.find((p) => p.id === participantId);
  if (!participant || !site.childcare || participant.status !== 'Active') notFound();

  const saved = participant.childcareForm;
  const prev = lastChildcareForm(participants, participant.id);
  const blank = blankChildcareForm({ site, participant, prev, monitorName: me.name, today: clock.today });
  const next = participants.find((p) => p.id !== participant.id && p.status === 'Active' && !p.docs.childcare);

  return (
    <ChildcareQuestionnaire
      key={participant.id}
      site={site}
      participant={{ ...participant, childcareForm: null }}
      initial={saved ? { ...blank, ...saved } : blank}
      done={!!saved?.completedAt}
      completedAt={saved?.completedAt ?? ''}
      paperOnly={participant.docs.childcare && !saved?.completedAt}
      next={next ? { id: next.id, name: proster(next) } : null}
    />
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/participants/[participantId]/childcare'>) {
  return (
    <Suspense fallback={<FormSkeleton rail />}>
      <ChildcarePage {...props} />
    </Suspense>
  );
}
