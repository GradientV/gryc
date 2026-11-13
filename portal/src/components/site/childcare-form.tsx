'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { firstLast, pname, proster } from '@/lib/format';
import { CHILDCARE_AGE_RANGES, CHILDCARE_DOCS, CHILDCARE_NOTE } from '@/lib/forms';
import { childcareProblems } from '@/lib/rules';
import type { ChildcareForm, Participant, Site, Tri } from '@/lib/types';
import { saveChildcareForm, unmarkChildcare } from '@/server/actions/participants';
import { RatioTable } from '../assessment/sections';
import { useAction } from '../use-action';
import { Check, Field, Segmented, YES_NO } from '../ui/controls';
import { ConfirmDialog, Dialog } from '../ui/dialog';
import { SignaturePad } from '../ui/signature-pad';

interface Props {
  site: Site;
  participant: Participant;
  initial: ChildcareForm;
  done: boolean;
  completedAt: string;
  paperOnly: boolean;
  next: { id: string; name: string } | null;
}

export function ChildcareQuestionnaire({ site, participant: p, initial, done, completedAt, paperOnly, next }: Props) {
  const router = useRouter();
  const [f, setF] = useState<ChildcareForm>(initial);
  const uid = useId();
  const [missing, setMissing] = useState<string[] | null>(null);
  const [unmarking, setUnmarking] = useState(false);
  const { run, pending } = useAction();
  const set = <K extends keyof ChildcareForm>(k: K, v: ChildcareForm[K]) => setF((x) => ({ ...x, [k]: v }));
  const roster = `/sites/${site.id}/participants`;
  const cc = site.cc;

  async function submit() {
    const list = childcareProblems(f);
    if (list.length) {
      setMissing(list);
      void saveChildcareForm(p.id, f, false);
      return;
    }
    const r = await run(() => saveChildcareForm(p.id, f, true), {
      success: (res) => (res.data.problems.length ? '' : `${proster(p)}: questionnaire on file.`),
    });
    if (!r.ok) return;
    if (r.data.problems.length) {
      setMissing(r.data.problems);
      return;
    }
    router.push(r.data.nextId ? `/sites/${site.id}/participants/${r.data.nextId}/childcare` : roster);
  }

  return (
    <div>
      <div className="crumbs mb-3">
        <Link href="/">Sites</Link> <span aria-hidden="true">/</span> <Link href={`/sites/${site.id}`}>{site.name}</Link>{' '}
        <span aria-hidden="true">/</span> <Link href={roster}>Participants</Link> <span aria-hidden="true">/</span> Childcare
        questionnaire
      </div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1>Childcare questionnaire</h1>
          <p className="muted mt-1.5">
            {proster(p)} · <span className="num">{p.appId || 'No ID'}</span> · {site.name}
          </p>
        </div>
        {done ? <span className="tone-done text-sm">Completed {completedAt}</span> : null}
      </div>

      {paperOnly ? (
        <p className="callout callout-info mb-5">
          Already ticked on the roster from a paper copy. Completing it here replaces the paper copy.
        </p>
      ) : !done && f.prefilledFrom ? (
        <p className="callout callout-info mb-5">
          Started from {f.prefilledFrom === 'roster' ? 'the last questionnaire completed at this site' : 'the Worksite Application'}.
          Check every answer against what the supervisor says about {pname(p)}.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-w-0 content-start gap-6">
          <section className="panel">
            <div className="panel-h">
              <h2>Licence or permit on file</h2>
              <span className="kicker ml-auto">Packet page 3, question 1</span>
            </div>
            <div className="panel-b">
              <p className="label req">Which current licence or permit is on file and available for review?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHILDCARE_DOCS.map((d) => (
                  <label key={d.id} className="check">
                    <input type="radio" name={`${uid}-doc`} checked={f.ccDoc === d.id} onChange={() => set('ccDoc', d.id)} />
                    <span>
                      {d.text}
                      {d.em ? <span className="muted"> {d.em}</span> : null}
                    </span>
                  </label>
                ))}
              </div>
              <p className="hint">
                {cc?.licenseNumber
                  ? `The application lists ${cc.licenseType} ${cc.licenseNumber}.`
                  : 'No Attachment 1 on file for this site. Ask the supervisor which one they hold.'}
              </p>
              <Field label="Expiration date" className="mt-3 mb-0 max-w-xs">
                <input type="date" className="input" value={f.ccDocExp} onChange={(e) => set('ccDocExp', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <h2>Supervisor ratios</h2>
            </div>
            <div className="panel-b grid gap-3">
              <p className="text-[0.9375rem]">
                Review the childcare ratios of supervisors to participants with the site supervisor. Sites follow all DOH
                regulations for child supervision.
              </p>
              <RatioTable />
              <Check checked={f.ratioConfirmed} onChange={(v) => set('ratioConfirmed', v)}>
                Reviewed with the supervisor, who knows these ratios
              </Check>
              <Check checked={f.neverAlone} onChange={(v) => set('neverAlone', v)}>
                {CHILDCARE_NOTE}
              </Check>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <h2>This participant</h2>
              <span className="kicker ml-auto">Questions 2 to 4</span>
            </div>
            <div className="panel-b grid gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.9375rem]">
                  Have this participant&apos;s job duties been clearly outlined to them, and do they meet the Worksite
                  Application?
                </p>
                <Segmented label="Duties outlined" value={f.dutiesOutlined} options={YES_NO} onChange={(v) => set('dutiesOutlined', v as Tri)} />
              </div>
              <div>
                <p className="label req">Age range of this participant</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CHILDCARE_AGE_RANGES.map((r) => (
                    <label key={r.id} className="check">
                      <input type="radio" name={`${uid}-age`} checked={f.ageRange === r.id} onChange={() => set('ageRange', r.id)} />
                      <span>
                        {r.text}, {r.em}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="hint">Roster age: {p.age ?? 'not recorded'}.</p>
              </div>
              <Field
                label="Daily responsibilities of the participant, as described by the supervisor"
                required
                hint="What this youth actually does, not the job title on the application."
                className="mb-0"
              >
                <textarea className="textarea" rows={4} value={f.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <h2>Signatures</h2>
            </div>
            <div className="panel-b grid gap-6">
              <Field label="Worksite supervisor answering these questions" className="mb-0 max-w-md">
                <input className="input" list={`${uid}-sup`} value={f.supervisorName} onChange={(e) => set('supervisorName', e.target.value)} />
                <datalist id={`${uid}-sup`}>
                  {site.supervisors.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </Field>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <span className="label req">Supervisor signature</span>
                  <SignaturePad
                    value={f.supervisorSig}
                    onChange={(v) => set('supervisorSig', v)}
                    name={f.supervisorName ? firstLast(f.supervisorName) : ''}
                    label="Worksite supervisor"
                  />
                </div>
                <div>
                  <span className="label req">Participant signature</span>
                  <SignaturePad value={f.youthSig} onChange={(v) => set('youthSig', v)} name={pname(p)} label={pname(p)} />
                </div>
              </div>
              <p className="kicker">The participant signs to confirm the duties above were explained to them.</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="panel panel-b">
            <h2 className="mb-1 text-base">{proster(p)}</h2>
            <p className="muted mb-3 text-sm">
              Age {p.age ?? '—'} · {p.borough}
            </p>
            <dl className="grid gap-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="muted">Application ID</dt>
                <dd className="num">{p.appId || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="muted">Referral sheet</dt>
                <dd className={p.docs.referral ? '' : 'tone-warn'}>{p.docs.referral ? 'On file' : 'Missing'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="muted">Questionnaire</dt>
                <dd className={p.docs.childcare ? '' : 'tone-warn'}>{p.docs.childcare ? 'On file' : 'Outstanding'}</dd>
              </div>
            </dl>
          </section>

          <section className="panel panel-b hidden lg:block">
            <p className="kicker mb-3">Submitting ticks the childcare questionnaire off on the roster.</p>
            <button type="button" className="btn btn-primary btn-block" onClick={submit} disabled={pending}>
              Submit questionnaire
            </button>
            <button
              type="button"
              className="btn btn-block mt-2"
              disabled={pending}
              onClick={() => run(() => saveChildcareForm(p.id, f, false), { success: 'Draft saved.' })}
            >
              Save draft
            </button>
            {done ? (
              <button type="button" className="btn btn-quiet btn-block mt-2" onClick={() => setUnmarking(true)}>
                Mark as not received
              </button>
            ) : null}
          </section>

          {next ? (
            <Link href={`/sites/${site.id}/participants/${next.id}/childcare`} className="panel panel-b block no-underline hover:bg-[var(--color-hover)]">
              <span className="kicker block">Next one outstanding</span>
              <span className="font-semibold">{next.name} →</span>
            </Link>
          ) : (
            <p className="kicker">Nobody else on this roster owes a questionnaire.</p>
          )}
        </aside>
      </div>

      <div className="actionbar lg:hidden">
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() => run(() => saveChildcareForm(p.id, f, false), { success: 'Draft saved.' })}
        >
          Save draft
        </button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={pending}>
          Submit
        </button>
      </div>

      <Dialog
        open={!!missing}
        onClose={() => setMissing(null)}
        title="Not ready to submit"
        footer={
          <button type="button" className="btn" onClick={() => setMissing(null)}>
            Close
          </button>
        }
      >
        <p className="mb-3">Still missing:</p>
        <ul className="list-disc space-y-1 pl-5">
          {missing?.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="kicker mt-4">Your answers are saved as a draft.</p>
      </Dialog>

      <ConfirmDialog
        open={unmarking}
        title="Mark as not received?"
        message={`This unticks the childcare questionnaire for ${proster(p)}. The answers stay on file.`}
        confirmLabel="Untick it"
        pending={pending}
        onClose={() => setUnmarking(false)}
        onConfirm={async () => {
          const r = await run(() => unmarkChildcare(p.id), { success: 'Unticked.' });
          if (r.ok) router.push(roster);
        }}
      />
    </div>
  );
}
