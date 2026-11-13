'use client';

import { useId, type ReactNode } from 'react';
import { firstLast, fmtSlash, fullAddress, proster } from '@/lib/format';
import {
  ABSENCE_REASONS,
  CHILDCARE_DOCS,
  CHILDCARE_NOTE,
  CHILDCARE_RATIOS,
  CHILDCARE_TRIP_RATIO,
  DAY_LABELS,
  DAYS,
  FACILITY_ITEMS,
  IMPLEMENTATION,
  INTERNSHIP_MODES,
  INTERVIEW_FLAGS,
  INTERVIEW_MODES,
  INTERVIEW_Q,
  OPERATIONS_Q,
  PROGRAM_ACTIVITY_Q,
  RECORDKEEPING_ITEMS,
  type Question,
} from '@/lib/forms';
import { findings, interviewComplete } from '@/lib/rules';
import type { AssessmentForm, Interview, Participant, Site, SupervisorRow, Tri } from '@/lib/types';
import { Dl } from '../ui/bits';
import { Check, Field, Segmented, YES_NO, YES_NO_NA, type SegOption } from '../ui/controls';
import { SignaturePad } from '../ui/signature-pad';

export type Patch = Partial<AssessmentForm> | ((f: AssessmentForm) => Partial<AssessmentForm>);

export interface SectionProps {
  form: AssessmentForm;
  patch: (p: Patch) => void;
  site: Site;
  active: Participant[];
}

export function Card({ title, aside, children, footer }: { title: string; aside?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-h">
        <h2>{title}</h2>
        {aside ? <div className="ml-auto flex items-center gap-2">{aside}</div> : null}
      </div>
      {children}
      {footer ? <div className="panel-f">{footer}</div> : null}
    </section>
  );
}

/** A question with its answer control: side by side on a laptop, stacked on a phone. */
function QuestionRow({ n, children, control }: { n?: number; children: ReactNode; control: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-line-2)] px-4 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3 text-[0.9375rem]">
        {n !== undefined ? <span className="muted num w-5 shrink-0 text-right">{n}</span> : null}
        <div className="min-w-0">{children}</div>
      </div>
      <div className="shrink-0 sm:pl-4">{control}</div>
    </div>
  );
}

const WORK_MODES: SegOption[] = IMPLEMENTATION.map((m) => ({
  value: m,
  label: m === 'A Hybrid Model (Both)' ? 'Hybrid' : m,
}));

/* ---- page 1: site and facility --------------------------------------------- */

export function SiteSection({ form, patch, site, active }: SectionProps) {
  const supList = useId();
  const names = site.supervisors.map((s) => s.name);
  if (form.supervisorName && !names.includes(form.supervisorName)) names.push(form.supervisorName);

  function pickSupervisor(name: string) {
    const s = site.supervisors.find((x) => x.name === name);
    patch({ supervisorName: name, ...(s ? { supervisorTitle: s.title, supervisorPhone: s.phone } : {}) });
  }
  function pickInterviewed(name: string) {
    const s = site.supervisors.find((x) => x.name === name);
    patch((f) => ({
      interviewName: name,
      ...(s && !f.interviewTitle ? { interviewTitle: s.title } : {}),
      ...(s && !f.interviewPhone ? { interviewPhone: s.phone } : {}),
    }));
  }

  return (
    <div className="grid gap-6">
      <Card title="Worksite information">
        <div className="panel-b">
          <Dl
            items={[
              ['Worksite name', site.name],
              ['Address', fullAddress(site)],
              ['Between streets', site.crossStreets],
              ['Travel directions', site.travel],
            ]}
          />
          <p className="kicker mt-4">From the Worksite Application. Fix anything wrong on the site&apos;s Overview tab.</p>
        </div>
      </Card>

      <Card title="This visit">
        <div className="panel-b">
          <Field
            label="Date of visit"
            required
            hint="Printed beside your name on page 1 and against both signatures on page 5."
            className="max-w-xs"
          >
            <input type="date" className="input" value={form.visitDate} onChange={(e) => patch({ visitDate: e.target.value })} />
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-3">
            <Field label="Worksite supervisor" required>
              <select className="select" value={form.supervisorName} onChange={(e) => pickSupervisor(e.target.value)}>
                <option value="">Pick a supervisor</option>
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input className="input" value={form.supervisorTitle} onChange={(e) => patch({ supervisorTitle: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" type="tel" value={form.supervisorPhone} onChange={(e) => patch({ supervisorPhone: e.target.value })} />
            </Field>
            <Field label="Person interviewed" required>
              <input className="input" list={supList} value={form.interviewName} onChange={(e) => pickInterviewed(e.target.value)} />
              <datalist id={supList}>
                {site.supervisors.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Title">
              <input className="input" value={form.interviewTitle} onChange={(e) => patch({ interviewTitle: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" type="tel" value={form.interviewPhone} onChange={(e) => patch({ interviewPhone: e.target.value })} />
            </Field>
          </div>
          <div className="field">
            <span className="label">Participants are expected to work</span>
            <Segmented label="Expected work mode" value={form.expectedWork} onChange={(v) => patch({ expectedWork: v })} options={WORK_MODES} />
          </div>
          <div className="grid max-w-md grid-cols-2 gap-x-4">
            <Field label="Participants assigned" required>
              <input
                className="input"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.assigned}
                onChange={(e) => patch({ assigned: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Present at the visit" required>
              <input
                className="input"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.present}
                onChange={(e) => patch({ present: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
          <p className="kicker mb-4">
            Assigned starts at the {active.length} active participant{active.length === 1 ? '' : 's'} on the roster.
            Present updates when you mark absences under Attendance.
          </p>
          <Check checked={form.otherProvidersNA} onChange={(v) => patch({ otherProvidersNA: v })}>
            Not applicable: this worksite has not applied to other DYCD providers this program year
          </Check>
        </div>
      </Card>

      <Card
        title="Facility"
        aside={
          <button
            type="button"
            className="btn btn-sm"
            disabled={form.isRemote}
            onClick={() => patch({ facility: Object.fromEntries(FACILITY_ITEMS.map((i) => [i.id, true])) as AssessmentForm['facility'] })}
          >
            Check all
          </button>
        }
      >
        <div className="panel-b">
          <Check checked={form.isRemote} onChange={(v) => patch({ isRemote: v })}>
            This site is remote, so there is no facility to check
          </Check>
          <p className="label mt-5">Condition of the worksite: check every item that applies</p>
          <div className={`grid gap-2 sm:grid-cols-2 ${form.isRemote ? 'opacity-50' : ''}`}>
            {FACILITY_ITEMS.map((i) => (
              <Check
                key={i.id}
                checked={!!form.facility[i.id]}
                disabled={form.isRemote}
                onChange={(v) => patch((f) => ({ facility: { ...f.facility, [i.id]: v } }))}
              >
                {i.text}
              </Check>
            ))}
          </div>
          <Field
            label="Hazardous conditions"
            hint="Leave blank if none. Anything written here becomes a finding the summary has to address."
            className="mt-5 mb-0"
          >
            <textarea className="textarea" rows={2} value={form.hazard} onChange={(e) => patch({ hazard: e.target.value })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

/* ---- page 2: recordkeeping and supervisors ------------------------------------- */

export function RecordsSection({ form, patch, site }: SectionProps) {
  const supList = useId();
  const rows = form.supervisorRows;
  const setRow = (i: number, p: Partial<SupervisorRow>) =>
    patch((f) => ({ supervisorRows: f.supervisorRows.map((r, j) => (j === i ? { ...r, ...p } : r)) }));

  return (
    <div className="grid gap-6">
      <Card
        title="Recordkeeping"
        aside={
          <button
            type="button"
            className="btn btn-sm"
            onClick={() =>
              patch((f) => ({
                records: Object.fromEntries(
                  RECORDKEEPING_ITEMS.map((i) => [i.id, i.id === 'ccletter' && !site.childcare ? !!f.records.ccletter : true]),
                ) as AssessmentForm['records'],
              }))
            }
          >
            Check all
          </button>
        }
        footer="Leave a box unchecked if the form is not available, help the supervisor, and say so in the summary."
      >
        <div className="panel-b grid gap-2 sm:grid-cols-2">
          {RECORDKEEPING_ITEMS.map((i) => {
            const na = i.id === 'ccletter' && !site.childcare;
            return (
              <Check key={i.id} checked={!!form.records[i.id]} onChange={(v) => patch((f) => ({ records: { ...f.records, [i.id]: v } }))}>
                {i.text.replace(/:$/, '')}
                {i.em ? <span className="muted italic"> {i.em}</span> : null}
                {na ? <span className="muted block text-[0.8125rem]">Not a childcare site</span> : null}
              </Check>
            );
          })}
        </div>
      </Card>

      <Card
        title="Supervisors"
        aside={
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => patch((f) => ({ supervisorRows: [...f.supervisorRows, { name: '', title: '', area: '', room: '', trained: 'Y' }] }))}
          >
            Add a row
          </button>
        }
      >
        <p className="kicker px-4 pt-3">
          Every supervisor, their title, area and room, and whether they were trained on the program policies.
        </p>
        <datalist id={supList}>
          {site.supervisors.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>
        <ul className="grid gap-0">
          {rows.map((r, i) => (
            <li
              key={i}
              className="grid gap-2 border-b border-[var(--color-line-2)] px-4 py-3 last:border-0 sm:grid-cols-[1.4fr_1.2fr_1fr_0.7fr_0.7fr_auto] sm:items-end"
            >
              <Field label="Name" className="mb-0">
                <input className="input" list={supList} value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} />
              </Field>
              <Field label="Title" className="mb-0">
                <input className="input" value={r.title} onChange={(e) => setRow(i, { title: e.target.value })} />
              </Field>
              <Field label="Area" className="mb-0">
                <input className="input" value={r.area} onChange={(e) => setRow(i, { area: e.target.value })} />
              </Field>
              <Field label="Room" className="mb-0">
                <input className="input" value={r.room} onChange={(e) => setRow(i, { room: e.target.value })} />
              </Field>
              <Field label="Trained" className="mb-0">
                <select
                  className="select"
                  value={r.trained}
                  onChange={(e) => setRow(i, { trained: e.target.value as SupervisorRow['trained'] })}
                >
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                  <option value="">—</option>
                </select>
              </Field>
              <button
                type="button"
                className="btn btn-quiet btn-sm btn-danger justify-self-start"
                onClick={() => patch((f) => ({ supervisorRows: f.supervisorRows.filter((_, j) => j !== i) }))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {!rows.length ? <p className="muted px-4 py-4 text-sm">No supervisors listed.</p> : null}
      </Card>
    </div>
  );
}

/* ---- page 2: attendance and schedule ------------------------------------------------ */

export function AttendanceSection({ form, patch, site, active }: SectionProps) {
  function setAbsent(p: Participant, on: boolean) {
    patch((f) => {
      const absent = on
        ? [...f.absent, { participantId: p.id, name: proster(p), age: p.age, appId: p.appId, reason: ABSENCE_REASONS[0] as string, initial: '' }]
        : f.absent.filter((a) => a.participantId !== p.id);
      return { absent, allAccounted: absent.length ? 'no' : 'yes', assigned: active.length, present: active.length - absent.length };
    });
  }
  function setAbs(id: string, p: Partial<AssessmentForm['absent'][number]>) {
    patch((f) => ({ absent: f.absent.map((a) => (a.participantId === id ? { ...a, ...p } : a)) }));
  }
  const presentCount = active.length - form.absent.length;

  return (
    <div className="grid gap-6">
      <Card title="Participant attendance" aside={<span className="num text-sm font-semibold">{presentCount} of {active.length} present</span>}>
        <p className="kicker px-4 pt-3">
          Tick anyone who was not at the worksite during your visit and record why. The supervisor initials each absence.
        </p>
        {active.length ? (
          <ul>
            {active.map((p) => {
              const rec = form.absent.find((a) => a.participantId === p.id);
              return (
                <li key={p.id} className="border-b border-[var(--color-line-2)] px-4 py-2.5 last:border-0">
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <input type="checkbox" className="box" checked={!!rec} onChange={(e) => setAbsent(p, e.target.checked)} />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{proster(p)}</span>
                      <span className="muted text-[0.8125rem]">
                        {' '}
                        · Age {p.age ?? '—'} · <span className="num">{p.appId || 'No ID'}</span>
                      </span>
                    </span>
                    <span className={`text-[0.8125rem] ${rec ? 'tone-warn' : 'muted'}`}>{rec ? 'Absent' : 'Present'}</span>
                  </label>
                  {rec ? (
                    <div className="mt-2 grid gap-2 pl-7 sm:grid-cols-[1fr_120px]">
                      <select
                        className="select"
                        aria-label={`Reason ${proster(p)} was absent`}
                        value={rec.reason}
                        onChange={(e) => setAbs(p.id, { reason: e.target.value })}
                      >
                        {ABSENCE_REASONS.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      <input
                        className="input"
                        maxLength={4}
                        placeholder="Initials"
                        aria-label="Supervisor initials"
                        value={rec.initial}
                        onChange={(e) => setAbs(p.id, { initial: e.target.value.toUpperCase() })}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted px-4 py-6 text-sm">No active participants on the roster. Add them on the Participants tab first.</p>
        )}
      </Card>

      <Card title="Participant work schedule">
        <div className="panel-b">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Days">
              <input className="input" value={form.scheduleDays} onChange={(e) => patch({ scheduleDays: e.target.value })} />
            </Field>
            <Field label="Hours">
              <input className="input" value={form.scheduleHours} onChange={(e) => patch({ scheduleHours: e.target.value })} />
            </Field>
          </div>
          {site.staggered === 'Yes' ? (
            <p className="kicker">The application marks this site as staggered: note (*) beside the hours if participants alternate shifts.</p>
          ) : null}
        </div>
        {site.schedules.length ? (
          <div className="table-wrap border-t border-[var(--color-line-2)]">
            <table className="table">
              <thead>
                <tr>
                  <th>Shift on the application</th>
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
      </Card>
    </div>
  );
}

/* ---- page 2: operations ---------------------------------------------------------- */

function allYes(list: Question[]) {
  return Object.fromEntries(list.map((q) => [q.id, 'yes'])) as Record<string, Tri>;
}

export function OpsSection({ form, patch }: SectionProps) {
  return (
    <Card
      title="Operations"
      aside={
        <button type="button" className="btn btn-sm" onClick={() => patch({ ops: allYes(OPERATIONS_Q) })}>
          Mark all Yes
        </button>
      }
      footer="Use N/A if a question does not apply at this point in the program. Every No has to be explained in the summary."
    >
      {OPERATIONS_Q.map((q) => (
        <QuestionRow
          key={q.id}
          n={q.n}
          control={
            <Segmented
              label={q.text}
              value={form.ops[q.id] ?? ''}
              options={YES_NO_NA}
              onChange={(v) => patch((f) => ({ ops: { ...f.ops, [q.id]: v as Tri } }))}
            />
          }
        >
          {q.text}
        </QuestionRow>
      ))}
    </Card>
  );
}

/* ---- page 3: safe environment and program activities ------------------------------------ */

export function ProgramSection({ form, patch, site }: SectionProps) {
  return (
    <div className="grid gap-6">
      <Card title="Safe environment">
        <QuestionRow
          control={<Segmented label="Safe environment" value={form.safeEnv} options={YES_NO} onChange={(v) => patch({ safeEnv: v as Tri })} />}
        >
          Would you classify this site as a safe environment for the program?
        </QuestionRow>
        {form.safeEnv === 'no' ? (
          <div className="px-4 pb-4">
            <Field label="Explain" className="mb-0">
              <textarea className="textarea" rows={2} value={form.safeEnvExplain} onChange={(e) => patch({ safeEnvExplain: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </Card>

      <Card
        title="Program activities"
        aside={
          <button type="button" className="btn btn-sm" onClick={() => patch({ activities: allYes(PROGRAM_ACTIVITY_Q) })}>
            Mark all Yes
          </button>
        }
        footer={
          site.jobs[0]?.duties ? (
            <>
              <span className="font-semibold text-[var(--color-ink-2)]">Question 4 reference, the work on the application: </span>
              {site.jobs[0].duties}
            </>
          ) : undefined
        }
      >
        {PROGRAM_ACTIVITY_Q.map((q) => (
          <QuestionRow
            key={q.id}
            n={q.n}
            control={
              <Segmented
                label={q.text}
                value={form.activities[q.id] ?? ''}
                options={YES_NO}
                onChange={(v) => patch((f) => ({ activities: { ...f.activities, [q.id]: v as Tri } }))}
              />
            }
          >
            {q.text}
          </QuestionRow>
        ))}
      </Card>
    </div>
  );
}

/* ---- page 3: childcare site questions ----------------------------------------------------- */

export function RatioTable() {
  return (
    <div className="table-wrap rounded-[var(--radius-ui)] border border-[var(--color-line)]">
      <table className="table">
        <thead>
          <tr>
            <th>Age group</th>
            <th className="c">Normal activities</th>
            <th className="c">Off-site trips</th>
          </tr>
        </thead>
        <tbody>
          {CHILDCARE_RATIOS.map((r, i) => (
            <tr key={r.age}>
              <td>{r.age}</td>
              <td className="c num font-semibold">{r.normal}</td>
              {i === 0 ? (
                <td className="c num font-semibold" rowSpan={CHILDCARE_RATIOS.length}>
                  {CHILDCARE_TRIP_RATIO}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChildcareSection({ form, patch, site }: SectionProps) {
  const docGroup = useId();
  const cc = site.cc;
  return (
    <Card title="Childcare site questions">
      <div className="panel-b grid gap-6">
        <div>
          <p className="label req">1. Which current licence or permit is on file and available for review?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CHILDCARE_DOCS.map((d) => (
              <label key={d.id} className="check">
                <input type="radio" name={docGroup} checked={form.ccDoc === d.id} onChange={() => patch({ ccDoc: d.id })} />
                <span>
                  {d.text}
                  {d.em ? <span className="muted"> {d.em}</span> : null}
                </span>
              </label>
            ))}
          </div>
          <p className="hint">
            {cc?.licenseNumber
              ? `The application lists ${cc.licenseType} ${cc.licenseNumber}${cc.licenseExp ? `, expiring ${fmtSlash(cc.licenseExp)}` : ''}.`
              : 'No Attachment 1 on file for this site. Ask the supervisor which one they hold.'}
          </p>
          <Field label="Expiration date" className="mt-3 mb-0 max-w-xs">
            <input type="date" className="input" value={form.ccDocExp} onChange={(e) => patch({ ccDocExp: e.target.value })} />
          </Field>
        </div>

        <div>
          <p className="label">The supervisor knows the childcare ratios of supervisors to participants</p>
          <RatioTable />
          <p className="mt-2 text-sm font-semibold">{CHILDCARE_NOTE}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.9375rem]">
            2. Have participant job duties been clearly outlined to youth, and do they meet the Worksite Application?
          </p>
          <Segmented label="Job duties outlined" value={form.ccDuties} options={YES_NO} onChange={(v) => patch({ ccDuties: v as Tri })} />
        </div>

        <div>
          <p className="label">3. Age ranges of the youth assigned to this site</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Check checked={form.ccAgeYounger} onChange={(v) => patch({ ccAgeYounger: v })}>
              Younger Youth, 14 to 15 years old
            </Check>
            <Check checked={form.ccAgeOlder} onChange={(v) => patch({ ccAgeOlder: v })}>
              Older Youth, 16 and older
            </Check>
          </div>
        </div>

        <Field
          label="4. Daily responsibilities of the participants, as described by the supervisor"
          required
          className="mb-0"
        >
          <textarea className="textarea" rows={3} value={form.ccResponsibilities} onChange={(e) => patch({ ccResponsibilities: e.target.value })} />
        </Field>
      </div>
    </Card>
  );
}

/* ---- page 6: participant interviews -------------------------------------------------------- */

const opts = (pair: [string, string]): SegOption[] => pair.map((v) => ({ value: v, label: v }));

export function InterviewsSection({ form, patch, site, active }: SectionProps) {
  const setIv = (idx: number, p: Partial<Interview>) =>
    patch((f) => ({ interviews: f.interviews.map((iv, j) => (j === idx ? { ...iv, ...p } : iv)) }));

  function pick(idx: number, id: string) {
    const p = active.find((x) => x.id === id);
    const iv = form.interviews[idx];
    if (!p) {
      setIv(idx, { participantId: '' });
      return;
    }
    setIv(idx, {
      participantId: p.id,
      lastName: p.last,
      dob: p.dob || iv.dob,
      workType: iv.workType || (site.jobs[0]?.title ?? '').replace(/^Other:\s*/, ''),
    });
  }

  return (
    <div className="grid gap-6">
      <Card title="Interview setup">
        <div className="panel-b grid gap-5 sm:grid-cols-2">
          <div>
            <span className="label">Completed</span>
            <Segmented
              label="Interview mode"
              value={form.interviewMode}
              options={INTERVIEW_MODES.map((m) => ({ value: m, label: m === 'Phone Interview' ? 'By phone' : m }))}
              onChange={(v) => patch({ interviewMode: v })}
            />
          </div>
          <div>
            <span className="label">Internship experience</span>
            <Segmented
              label="Internship experience"
              value={form.internshipExperience}
              options={INTERNSHIP_MODES.map((m) => ({ value: m, label: m === 'A Hybrid Model (Both)' ? 'Hybrid' : m }))}
              onChange={(v) => patch({ internshipExperience: v })}
            />
          </div>
        </div>
        <p className="kicker px-4 pb-4">Interview two participants in private, so they can ask questions and raise concerns freely.</p>
      </Card>

      {form.interviews.map((iv, idx) => {
        const done = interviewComplete(iv);
        const left = INTERVIEW_Q.filter((q) => !iv.answers?.[q.id]).length;
        const flags = INTERVIEW_Q.filter((q) => INTERVIEW_FLAGS[q.id] && iv.answers?.[q.id] === INTERVIEW_FLAGS[q.id]).length;
        return (
          <Card
            key={idx}
            title={`Interview ${idx + 1}`}
            aside={
              <span className={`text-sm ${done ? (flags ? 'tone-warn' : 'tone-done') : 'muted'}`}>
                {done ? (flags ? `Complete, ${flags} to follow up` : 'Complete') : `${left} question${left === 1 ? '' : 's'} left`}
              </span>
            }
          >
            <div className="panel-b pb-2">
              <div className="grid gap-x-4 sm:grid-cols-3">
                <Field label="Participant">
                  <select className="select" value={iv.participantId} onChange={(e) => pick(idx, e.target.value)}>
                    <option value="">Pick from the roster</option>
                    {active.map((p) => (
                      <option key={p.id} value={p.id}>
                        {proster(p)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="1. Date of birth">
                  <input type="date" className="input" value={iv.dob} onChange={(e) => setIv(idx, { dob: e.target.value })} />
                </Field>
                <Field label="Last name" required>
                  <input className="input" value={iv.lastName} onChange={(e) => setIv(idx, { lastName: e.target.value })} />
                </Field>
              </div>
              <Field label="2. What type of work do you do?" className="mb-2">
                <input className="input" value={iv.workType} onChange={(e) => setIv(idx, { workType: e.target.value })} />
              </Field>
            </div>
            <div className="border-t border-[var(--color-line-2)]">
              {INTERVIEW_Q.map((q) => {
                const v = iv.answers?.[q.id] ?? '';
                const flagged = INTERVIEW_FLAGS[q.id] && v === INTERVIEW_FLAGS[q.id];
                return (
                  <QuestionRow
                    key={q.id}
                    n={q.n}
                    control={
                      <Segmented
                        label={q.text}
                        value={v}
                        options={opts(q.opts)}
                        onChange={(val) => setIv(idx, { answers: { ...iv.answers, [q.id]: val } })}
                      />
                    }
                  >
                    {q.pre ? <span className="font-semibold">{q.pre} </span> : null}
                    {q.text}
                    {flagged ? <span className="tone-warn block text-[0.8125rem]">Follow up on this answer</span> : null}
                  </QuestionRow>
                );
              })}
            </div>
            <div className="border-t border-[var(--color-line-2)] p-4">
              <Field label="Additional questions or comments" className="mb-0">
                <textarea className="textarea" rows={2} value={iv.notes} onChange={(e) => setIv(idx, { notes: e.target.value })} />
              </Field>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---- page 5: summary and signatures ----------------------------------------------------------- */

export function SignSection({ form, patch, site }: SectionProps) {
  const flags = findings(form, site);

  return (
    <div className="grid gap-6">
      {flags.length ? (
        <div className="callout callout-due">
          <p className="font-semibold">
            {flags.length} finding{flags.length === 1 ? '' : 's'} to address in the summary
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="callout callout-info">No findings. Nothing on this packet is flagged.</p>
      )}

      <Card
        title="Overall report summary"
        aside={
          flags.length ? (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() =>
                patch((f) => ({
                  summary: `${f.summary ? `${f.summary.trimEnd()}\n\n` : ''}Findings:\n${flags.map((x) => `• ${x}`).join('\n')}\n\nCorrective action: `,
                }))
              }
            >
              Insert findings
            </button>
          ) : undefined
        }
      >
        <div className="panel-b">
          <label className="block">
            <span className="label req">
              What you saw this week, how the participants are doing, and the corrective action for anything flagged
            </span>
            <textarea className="textarea" rows={7} value={form.summary} onChange={(e) => patch({ summary: e.target.value })} />
          </label>
        </div>
      </Card>

      <Card title="Signatures">
        <div className="panel-b grid gap-8">
          <div>
            <p className="mb-3 text-sm italic">
              I hereby certify that all information contained in this report is accurate and complete to the best of my
              knowledge.
            </p>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div>
                <span className="label req">Signature of provider monitor</span>
                <SignaturePad
                  value={form.monitorSig}
                  onChange={(v) => patch({ monitorSig: v })}
                  name={form.monitorName}
                  label={form.monitorName || 'Provider monitor'}
                />
              </div>
              <div>
                <Field label="Monitor">
                  <input className="input" value={form.monitorName} onChange={(e) => patch({ monitorName: e.target.value })} />
                </Field>
                <p className="label">Date</p>
                <p className="num">{fmtSlash(form.visitDate) || '—'}</p>
                <p className="hint">The date of visit.</p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm italic">
              I have reviewed the information contained in this report and agree to assume responsibility that corrective
              action will be taken to resolve any problem areas or violations identified during this monitoring visit.
            </p>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div>
                <span className="label req">Signature of worksite supervisor</span>
                <SignaturePad
                  value={form.supervisorSig}
                  onChange={(v) => patch({ supervisorSig: v })}
                  name={form.supervisorName ? firstLast(form.supervisorName) : ''}
                  label={form.supervisorName ? firstLast(form.supervisorName) : 'Worksite supervisor'}
                />
              </div>
              <div>
                <Field label="Title">
                  <input className="input" value={form.supervisorSigTitle} onChange={(e) => patch({ supervisorSigTitle: e.target.value })} />
                </Field>
                <p className="label">Date</p>
                <p className="num">{fmtSlash(form.visitDate) || '—'}</p>
              </div>
            </div>
          </div>
          <p className="kicker">Hand the phone or laptop to the supervisor to sign, or use Type instead for a typed signature.</p>
        </div>
      </Card>

      <Card title="Provider supervisor staff use only" aside={<span className="kicker">Filled in at the office</span>}>
        <QuestionRow
          control={
            <Segmented label="Follow up needed" value={form.followUpNeeded} options={YES_NO} onChange={(v) => patch({ followUpNeeded: v as Tri })} />
          }
        >
          Is there need for follow up?
        </QuestionRow>
        {form.followUpNeeded === 'yes' ? (
          <div className="px-4 pb-4">
            <Field label="Details" className="mb-0">
              <textarea className="textarea" rows={2} value={form.followUpDetail} onChange={(e) => patch({ followUpDetail: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
