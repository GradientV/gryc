import { notFound } from 'next/navigation';
import { AssessmentWizard } from '@/components/assessment/wizard';
import { isWeekNumber, week as weekInfo } from '@/lib/program';
import { activeParticipants, blankAssessment, normalizeForm } from '@/lib/rules';
import { getClock } from '@/server/clock';
import { getSiteBundle } from '@/server/data';
import { getCurrentMonitor } from '@/server/session';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/ui/skeletons';

export const metadata = { title: 'Worksite assessment' };

async function AssessmentPage({ params }: PageProps<'/sites/[siteId]/weeks/[week]/assessment'>) {
  const { siteId, week } = await params;
  const n = Number(week);
  if (!isWeekNumber(n)) notFound();
  const [bundle, clock, me] = await Promise.all([getSiteBundle(siteId), getClock(), getCurrentMonitor()]);
  if (!bundle) notFound();

  const { site, participants, visits, assessments } = bundle;
  const active = activeParticipants(participants).map((p) => ({ ...p, childcareForm: null }));
  const existing = assessments.find((a) => a.week === n) ?? null;
  const blank = blankAssessment({ site, active, visits, week: n, monitorName: me.name, today: clock.today });
  const w = weekInfo(n);

  return (
    <AssessmentWizard
      site={site}
      active={active}
      week={n}
      weekStart={w.start}
      weekEnd={w.end}
      initial={existing ? normalizeForm(existing.form, blank) : blank}
      status={existing?.status ?? null}
      submittedAt={existing?.submittedAt ?? ''}
      startedFromDefaults={!existing && !!site.assessmentDefaults}
      defaults={site.assessmentDefaults}
    />
  );
}

export default function Page(props: PageProps<'/sites/[siteId]/weeks/[week]/assessment'>) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AssessmentPage {...props} />
    </Suspense>
  );
}
