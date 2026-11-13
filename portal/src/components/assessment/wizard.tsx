'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fmtDate, fmtShort } from '@/lib/format';
import {
  applyCarry,
  ASSESSMENT_CARRY_GROUPS,
  ASSESSMENT_WEEKLY_LABELS,
  assessmentSections,
  sectionProblems,
  type SectionKey,
} from '@/lib/rules';
import type { AssessmentDefaults, AssessmentForm, AssessmentStatus, Participant, Site } from '@/lib/types';
import { clearAssessmentDefaults, saveAssessment, saveAssessmentDefaults } from '@/server/actions/weeks';
import { useAction } from '../use-action';
import { Dialog } from '../ui/dialog';
import { useToast } from '../ui/toast';
import {
  AttendanceSection,
  ChildcareSection,
  InterviewsSection,
  OpsSection,
  ProgramSection,
  RecordsSection,
  SignSection,
  SiteSection,
  type Patch,
  type SectionProps,
} from './sections';

const SECTION_VIEWS: Record<SectionKey, (p: SectionProps) => React.ReactNode> = {
  site: SiteSection,
  records: RecordsSection,
  attend: AttendanceSection,
  ops: OpsSection,
  program: ProgramSection,
  childcare: ChildcareSection,
  interviews: InterviewsSection,
  sign: SignSection,
};

interface Props {
  site: Site;
  active: Participant[];
  week: number;
  weekStart: string;
  weekEnd: string;
  initial: AssessmentForm;
  status: AssessmentStatus | null;
  submittedAt: string;
  startedFromDefaults: boolean;
  defaults: AssessmentDefaults | null;
}

function clockTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* Opening a section marks it as looked at, so the list can tell "not looked
   at yet" from "nothing missing". The first visit to the childcare questions
   also ticks the age bands the roster implies. */
function markSeen(f: AssessmentForm, key: SectionKey, active: Participant[]): AssessmentForm {
  const next = { ...f };
  if (!(f.sectionsSeen ?? []).includes(key)) next.sectionsSeen = [...(f.sectionsSeen ?? []), key];
  if (key === 'childcare' && !f.ccAgeYounger && !f.ccAgeOlder && active.length) {
    next.ccAgeOlder = active.some((p) => (p.age ?? 0) >= 16);
    next.ccAgeYounger = active.some((p) => p.age !== null && p.age < 16);
  }
  return next;
}

export function AssessmentWizard({
  site,
  active,
  week,
  weekStart,
  weekEnd,
  initial,
  status: initialStatus,
  submittedAt,
  startedFromDefaults,
  defaults,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const sections = useMemo(() => assessmentSections(site), [site]);
  const [form, setForm] = useState<AssessmentForm>(() => markSeen(initial, sections[0].key, active));
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState('');
  const [problems, setProblems] = useState<{ key: SectionKey; label: string; items: string[] }[] | null>(null);
  const [carryOpen, setCarryOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [filing, setFiling] = useState(false);
  const carry = useAction();

  const latest = useRef(form);
  useEffect(() => {
    latest.current = form;
  }, [form]);

  const patch = useCallback((p: Patch) => {
    setForm((f) => ({ ...f, ...(typeof p === 'function' ? p(f) : p) }));
    setDirty(true);
  }, []);

  const per = useMemo(() => sectionProblems(form, site), [form, site]);
  const seen = useMemo(() => new Set(form.sectionsSeen ?? []), [form.sectionsSeen]);
  const current = sections[step];
  const base = `/sites/${site.id}/weeks/${week}`;

  const save = useCallback(
    async (intent: 'draft' | 'submit') => {
      setSaveState('saving');
      try {
        const r = await saveAssessment(site.id, week, latest.current, intent);
        if (!r.ok) {
          setSaveState('error');
          toast(r.problems?.length ? `${r.error} ${r.problems[0]}` : r.error, 'bad');
          return r;
        }
        setDirty(false);
        setSaveState('saved');
        setSavedAt(clockTime());
        setStatus(r.data.status);
        return r;
      } catch {
        setSaveState('error');
        toast('Could not reach the server. Your answers are still on this screen.', 'bad');
        return null;
      }
    },
    [site.id, week, toast],
  );

  function goTo(i: number) {
    if (dirty) void save('draft');
    setForm((f) => markSeen(f, sections[i].key, active));
    setStep(i);
    setSectionsOpen(false);
    window.scrollTo({ top: 0 });
  }

  async function saveAndClose() {
    if (dirty) {
      const r = await save('draft');
      if (!r || !r.ok) return;
      toast('Draft saved.');
    }
    router.push(base);
  }

  async function file() {
    const list = sections.map((s) => ({ key: s.key, label: s.label, items: per[s.key] })).filter((x) => x.items.length);
    if (list.length) {
      setProblems(list);
      if (dirty) void save('draft');
      return;
    }
    setFiling(true);
    const r = await save('submit');
    setFiling(false);
    if (!r || !r.ok) return;
    if (r.data.status === 'submitted') {
      // A missing monitoring log entry is flagged on the packet page itself.
      toast(`Week ${week} assessment filed.`, 'ok');
      router.push(`${base}/assessment/packet`);
    } else if (r.data.problems.length) {
      setProblems([{ key: 'sign', label: 'Not ready to file', items: r.data.problems }]);
    }
  }

  function statusOf(key: SectionKey): { text: string; cls: string } {
    const n = per[key].length;
    if (n) return { text: `${n} to do`, cls: seen.has(key) ? 'tone-warn' : 'muted' };
    if (seen.has(key)) return { text: 'Done', cls: 'tone-done' };
    return { text: 'Not started', cls: 'muted' };
  }

  const View = SECTION_VIEWS[current.key];
  const isLast = step === sections.length - 1;
  const saveNote =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'error'
        ? 'Not saved'
        : dirty
          ? 'Unsaved changes'
          : savedAt
            ? `Draft saved ${savedAt}`
            : status === 'submitted'
              ? `Filed ${fmtShort(submittedAt)}`
              : status === 'draft'
                ? 'Draft'
                : '';
  const carryGroups = ASSESSMENT_CARRY_GROUPS.filter((g) => site.childcare || !g.childcareOnly);

  return (
    <div>
      <div className="crumbs mb-3">
        <Link href="/">Sites</Link> <span aria-hidden="true">/</span> <Link href={`/sites/${site.id}`}>{site.name}</Link>{' '}
        <span aria-hidden="true">/</span> <Link href={base}>Week {week}</Link> <span aria-hidden="true">/</span> Assessment
      </div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1>Worksite assessment, week {week}</h1>
          <p className="muted mt-1.5">
            {site.name} · {fmtShort(weekStart)} – {fmtDate(weekEnd)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm ${saveState === 'error' ? 'tone-due' : 'muted'}`} aria-live="polite">
            {saveNote}
          </span>
          <button type="button" className="btn" onClick={() => setCarryOpen(true)}>
            {defaults ? `Saved answers from week ${defaults.savedFromWeek}` : 'Reuse answers'}
          </button>
          <button type="button" className="btn" onClick={saveAndClose}>
            Save and close
          </button>
        </div>
      </div>

      {initialStatus === 'submitted' ? (
        <p className="callout mb-5">
          {status === 'submitted'
            ? `Filed ${fmtDate(submittedAt)}. Changes you make are saved as a draft until you file the packet again.`
            : `Filed ${fmtDate(submittedAt)}, and now has changes that are not filed. File it again when you are done.`}
        </p>
      ) : startedFromDefaults && !dirty && defaults ? (
        <p className="callout callout-info mb-5">
          Started from the answers you saved in week {defaults.savedFromWeek}. The date, attendance, interviews, summary and
          signatures are blank.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        {/* section list: a sidebar on a laptop */}
        <nav aria-label="Assessment sections" className="hidden lg:block">
          <ol className="sticky top-24 border-l border-[var(--color-line)]">
            {sections.map((s, i) => {
              const st = statusOf(s.key);
              const on = i === step;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on ? 'step' : undefined}
                    className={`-ml-px block w-full border-l-2 py-2 pr-2 pl-4 text-left ${
                      on ? 'border-[var(--color-brand)] bg-[var(--color-panel)]' : 'border-transparent hover:bg-[var(--color-hover)]'
                    }`}
                  >
                    <span className={`block text-[0.9375rem] ${on ? 'font-semibold' : ''}`}>{s.label}</span>
                    <span className="flex justify-between gap-2 text-[0.8125rem]">
                      <span className="muted">{s.page}</span>
                      <span className={st.cls}>{st.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          {/* section list: a drop-down on a phone */}
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              className="panel flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              aria-expanded={sectionsOpen}
              onClick={() => setSectionsOpen((o) => !o)}
            >
              <span>
                <span className="kicker block">
                  Section {step + 1} of {sections.length}
                </span>
                <span className="font-semibold">{current.label}</span>
              </span>
              <span className="text-sm text-[var(--color-brand)]">{sectionsOpen ? 'Close' : 'All sections'}</span>
            </button>
            {sectionsOpen ? (
              <ol className="panel mt-1">
                {sections.map((s, i) => {
                  const st = statusOf(s.key);
                  return (
                    <li key={s.key} className="border-b border-[var(--color-line-2)] last:border-0">
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${i === step ? 'font-semibold' : ''}`}
                        onClick={() => goTo(i)}
                      >
                        <span>{s.label}</span>
                        <span className={`text-[0.8125rem] font-normal ${st.cls}`}>{st.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>

          <div className="mb-4 hidden items-baseline justify-between gap-2 lg:flex">
            <h2 className="text-xl">{current.label}</h2>
            <span className="kicker">
              Packet {current.page.toLowerCase()} · Section {step + 1} of {sections.length}
            </span>
          </div>

          <View form={form} patch={patch} site={site} active={active} />

          <div className="actionbar md:static md:mx-0 md:mt-6 md:border-0 md:bg-transparent md:p-0">
            <button type="button" className="btn" onClick={() => (step ? goTo(step - 1) : saveAndClose())}>
              {step ? 'Back' : 'Close'}
            </button>
            {isLast ? (
              <button type="button" className="btn btn-primary" onClick={file} disabled={filing}>
                {filing ? 'Filing…' : 'File the assessment'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => goTo(step + 1)}>
                Continue to {sections[step + 1].label.toLowerCase()}
              </button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!problems}
        onClose={() => setProblems(null)}
        title="Not ready to file yet"
        footer={
          <button type="button" className="btn" onClick={() => setProblems(null)}>
            Close
          </button>
        }
      >
        <p className="mb-4 text-[0.9375rem]">These still need an answer. Everything so far is saved as a draft.</p>
        <ul className="grid gap-4">
          {problems?.map((p) => (
            <li key={p.key}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{p.label}</p>
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setProblems(null);
                    goTo(Math.max(0, sections.findIndex((s) => s.key === p.key)));
                  }}
                >
                  Go there
                </button>
              </div>
              <ul className="muted list-disc pl-5 text-sm">
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Dialog>

      <Dialog
        open={carryOpen}
        onClose={() => setCarryOpen(false)}
        title="Reuse these answers in later weeks"
        wide
        footer={
          <>
            <button type="button" className="btn" onClick={() => setCarryOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={carry.pending}
              onClick={async () => {
                const r = await carry.run(() => saveAssessmentDefaults(site.id, week, latest.current), {
                  success: 'Saved. Later weeks will open with these answers.',
                });
                if (r.ok) setCarryOpen(false);
              }}
            >
              {defaults ? 'Replace the saved answers' : 'Save these answers'}
            </button>
          </>
        }
      >
        <p className="mb-4 text-[0.9375rem]">
          Saves what is on screen now as this site&apos;s standing answers. Any week you have not started yet opens with
          them filled in. Weeks already filed or saved as drafts are left as they are.
        </p>
        {defaults ? (
          <div className="callout callout-info mb-4">
            <p>
              <b>Saved from week {defaults.savedFromWeek}</b> on {fmtDate(defaults.savedOn)}.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  patch((f) => applyCarry(defaults, f));
                  setCarryOpen(false);
                  toast(`Week ${week} filled in from the saved answers.`);
                }}
              >
                Fill week {week} in from them
              </button>
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={async () => {
                  const r = await carry.run(() => clearAssessmentDefaults(site.id), {
                    success: 'Saved answers cleared. Later weeks start blank again.',
                  });
                  if (r.ok) setCarryOpen(false);
                }}
              >
                Forget them
              </button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label">Carried into later weeks</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {carryGroups.map((g) => (
                <li key={g.label}>{g.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Always filled in fresh each week</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {ASSESSMENT_WEEKLY_LABELS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
