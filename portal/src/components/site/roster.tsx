'use client';

import Link from 'next/link';
import { useMemo, useOptimistic, useState, useTransition } from 'react';
import { proster, telHref } from '@/lib/format';
import { BOROUGHS, PARTICIPANT_STATUSES } from '@/lib/forms';
import type { DocDef } from '@/lib/rules';
import type { Participant, ParticipantStatus } from '@/lib/types';
import { addParticipants, setParticipantDoc, updateParticipant } from '@/server/actions/participants';
import { useAction } from '../use-action';
import { Field } from '../ui/controls';
import { Dialog } from '../ui/dialog';
import { useToast } from '../ui/toast';
import { blankRow, readRows, RosterGrid, type RosterRow } from './roster-grid';

interface Props {
  siteId: string;
  siteBorough: string;
  childcare: boolean;
  participants: Participant[];
  docs: DocDef[];
  currentWeek: number;
  outstanding: number;
  cohort: string;
}

type DocPatch = { id: string; key: string; value: boolean };

export function Roster({ siteId, siteBorough, childcare, participants, docs, currentWeek, outstanding, cohort }: Props) {
  const [q, setQ] = useState('');
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [people, patchPeople] = useOptimistic(participants, (list: Participant[], p: DocPatch) =>
    list.map((x) => (x.id === p.id ? { ...x, docs: { ...x.docs, [p.key]: p.value } } : x)),
  );
  const [editing, setEditing] = useState<Participant | null>(null);
  const [adding, setAdding] = useState(false);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((p) =>
      `${proster(p)} ${p.first} ${p.last} ${p.appId} ${p.phone} ${p.borough}`.toLowerCase().includes(needle),
    );
  }, [people, q]);
  const active = people.filter((p) => p.status === 'Active').length;

  function tick(p: Participant, key: string, value: boolean) {
    startTransition(async () => {
      patchPeople({ id: p.id, key, value });
      const r = await setParticipantDoc(p.id, key, value);
      if (!r.ok) toast(r.error, 'bad');
    });
  }

  function docControl(p: Participant, d: DocDef) {
    const inactive = p.status !== 'Active';
    const on = !!p.docs[d.key];
    if (d.form) {
      if (inactive) return <span className="muted">—</span>;
      return (
        <Link
          href={`/sites/${siteId}/participants/${p.id}/childcare`}
          className={`text-sm font-semibold ${on ? 'text-[var(--color-ink-3)]' : ''}`}
        >
          {on ? 'On file' : 'Fill out'}
        </Link>
      );
    }
    return (
      <input
        type="checkbox"
        className="box"
        checked={on}
        disabled={inactive}
        onChange={(e) => tick(p, d.key, e.target.checked)}
        aria-label={`${d.label} for ${proster(p)}`}
      />
    );
  }

  return (
    <section className="panel">
      <div className="panel-h">
        <h2>Site assignment roster</h2>
        <span className={`text-sm ${outstanding ? 'tone-warn' : 'tone-done'}`}>
          {outstanding ? `${outstanding} document${outstanding === 1 ? '' : 's'} outstanding` : 'Paperwork up to date'}
        </span>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          <input
            aria-label="Search the roster"
            type="search"
            className="input min-w-0 flex-1 sm:w-56"
            placeholder="Search name, ID or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="btn" onClick={() => setAdding(true)}>
            Add participants
          </button>
        </div>
      </div>

      {people.length === 0 ? (
        <p className="muted px-4 py-10 text-center text-sm">
          No participants yet. Add them from the YEPS Worksite Assignments roster, or wait for the GRYC office to load it.
        </p>
      ) : shown.length === 0 ? (
        <p className="muted px-4 py-10 text-center text-sm">Nobody matches “{q}”.</p>
      ) : (
        <>
          {/* laptop: a table with a column per document */}
          <div className="table-wrap hidden md:block">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Application ID</th>
                  <th className="c">Age</th>
                  <th>Borough</th>
                  <th>Phone</th>
                  {docs.map((d) => (
                    <th key={d.key} className="c">
                      {d.short}
                      {d.dueWeek > currentWeek ? (
                        <span className="block text-[0.72rem] font-normal">Due week {d.dueWeek}</span>
                      ) : null}
                    </th>
                  ))}
                  <th>
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className={p.status !== 'Active' ? 'row-off' : ''}>
                    <td>
                      <span className="font-semibold">{proster(p)}</span>
                      {p.status !== 'Active' ? <span className="muted"> · {p.status}</span> : null}
                      {p.note ? <span className="muted block text-[0.8125rem]">{p.note}</span> : null}
                    </td>
                    <td className="num">{p.appId || '—'}</td>
                    <td className="c num">{p.age ?? '—'}</td>
                    <td>{p.borough}</td>
                    <td className="num whitespace-nowrap">{p.phone || '—'}</td>
                    {docs.map((d) => (
                      <td key={d.key} className="c">
                        {docControl(p, d)}
                      </td>
                    ))}
                    <td className="r">
                      <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* phone: one block per person, each document a full-width tick row */}
          <ul className="md:hidden">
            {shown.map((p) => (
              <li key={p.id} className="border-b border-[var(--color-line-2)] px-4 py-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-semibold ${p.status !== 'Active' ? 'muted' : ''}`}>
                      {proster(p)}
                      {p.status !== 'Active' ? <span className="font-normal"> · {p.status}</span> : null}
                    </p>
                    <p className="muted text-[0.8125rem]">
                      <span className="num">{p.appId || 'No ID'}</span> · Age {p.age ?? '—'} · {p.borough}
                    </p>
                    {p.phone ? (
                      <a href={telHref(p.phone)} className="num text-[0.8125rem]">
                        {p.phone}
                      </a>
                    ) : null}
                    {p.note ? <p className="muted text-[0.8125rem]">{p.note}</p> : null}
                  </div>
                  <button type="button" className="btn btn-quiet btn-sm -mr-2" onClick={() => setEditing(p)}>
                    Edit
                  </button>
                </div>
                {p.status === 'Active' ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {docs.map((d) =>
                      d.form ? (
                        <Link
                          key={d.key}
                          href={`/sites/${siteId}/participants/${p.id}/childcare`}
                          className="check text-sm no-underline"
                        >
                          <span className="min-w-0 flex-1 text-[var(--color-ink)]">
                            {d.short}
                            <span className={`block text-[0.8125rem] font-semibold ${p.docs[d.key] ? 'tone-done' : ''}`}>
                              {p.docs[d.key] ? 'On file' : 'Fill out'}
                            </span>
                          </span>
                        </Link>
                      ) : (
                        <label key={d.key} className="check text-sm">
                          <input type="checkbox" checked={!!p.docs[d.key]} onChange={(e) => tick(p, d.key, e.target.checked)} />
                          <span className="min-w-0 flex-1">
                            {d.short}
                            {d.dueWeek > currentWeek ? <span className="muted block text-[0.75rem]">Due week {d.dueWeek}</span> : null}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="panel-f">
        {shown.length} of {people.length} shown · {active} active · {cohort}. Tick a box when the signed paper is in hand.
        {childcare ? ' Childcare questionnaires are filled in here and tick themselves off.' : ''}
      </div>

      <EditParticipantDialog participant={editing} onClose={() => setEditing(null)} />
      <AddParticipantsDialog open={adding} onClose={() => setAdding(false)} siteId={siteId} borough={siteBorough} />
    </section>
  );
}

function EditParticipantDialog({ participant, onClose }: { participant: Participant | null; onClose: () => void }) {
  const { run, pending } = useAction();
  const [f, setF] = useState<Record<string, string>>({});
  const [forId, setForId] = useState<string | null>(null);

  if (participant && forId !== participant.id) {
    setForId(participant.id);
    setF({
      appId: participant.appId,
      last: participant.last,
      first: participant.first,
      program: participant.program,
      borough: participant.borough,
      phone: participant.phone,
      age: participant.age === null ? '' : String(participant.age),
      dob: participant.dob,
      cohort: participant.cohort,
      status: participant.status,
      note: participant.note,
    });
  }
  if (!participant && forId) setForId(null);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));

  return (
    <Dialog
      open={!!participant}
      onClose={onClose}
      title={participant ? proster(participant) : ''}
      wide
      onSubmit={async () => {
        if (!participant) return;
        const r = await run(
          () =>
            updateParticipant(participant.id, {
              ...f,
              age: f.age ? Number(f.age) : null,
              status: f.status as ParticipantStatus,
            }),
          { success: 'Saved.' },
        );
        if (r.ok) onClose();
      }}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-x-4 sm:grid-cols-3">
        <Field label="Last name" required>
          <input className="input" value={f.last ?? ''} onChange={(e) => set('last', e.target.value)} />
        </Field>
        <Field label="First name">
          <input className="input" value={f.first ?? ''} onChange={(e) => set('first', e.target.value)} />
        </Field>
        <Field label="Application ID">
          <input className="input" value={f.appId ?? ''} onChange={(e) => set('appId', e.target.value)} />
        </Field>
        <Field label="Borough">
          <select className="select" value={f.borough ?? 'Queens'} onChange={(e) => set('borough', e.target.value)}>
            {BOROUGHS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Phone">
          <input className="input" type="tel" value={f.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Age">
          <input className="input" type="number" min={14} max={30} value={f.age ?? ''} onChange={(e) => set('age', e.target.value)} />
        </Field>
        <Field label="Date of birth" hint="Fills in the interview page of the assessment.">
          <input className="input" type="date" value={f.dob ?? ''} onChange={(e) => set('dob', e.target.value)} />
        </Field>
        <Field label="Program">
          <input className="input" value={f.program ?? ''} onChange={(e) => set('program', e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="select" value={f.status ?? 'Active'} onChange={(e) => set('status', e.target.value)}>
            {PARTICIPANT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Cohort">
        <input className="input" value={f.cohort ?? ''} onChange={(e) => set('cohort', e.target.value)} />
      </Field>
      <Field label="Note" hint="Anything marked on the printed roster." className="mb-0">
        <input className="input" value={f.note ?? ''} onChange={(e) => set('note', e.target.value)} />
      </Field>
    </Dialog>
  );
}

function AddParticipantsDialog({
  open,
  onClose,
  siteId,
  borough,
}: {
  open: boolean;
  onClose: () => void;
  siteId: string;
  borough: string;
}) {
  const [rows, setRows] = useState<RosterRow[]>([blankRow(borough)]);
  const [showErrors, setShowErrors] = useState(false);
  const { run, pending } = useAction();
  const toast = useToast();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add participants"
      wide
      onSubmit={async () => {
        const got = readRows(rows);
        if (got.incomplete) {
          setShowErrors(true);
          toast(`Every row needs a last name. ${got.incomplete} row${got.incomplete === 1 ? ' is' : 's are'} missing one.`, 'bad');
          return;
        }
        if (!got.rows.length) {
          toast('Fill in at least one row first.', 'bad');
          return;
        }
        const r = await run(() => addParticipants(siteId, got.rows), {
          success: (res) => `${res.data.added} added to the roster.`,
        });
        if (r.ok) {
          setRows([blankRow(borough)]);
          setShowErrors(false);
          onClose();
        }
      }}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            Add to roster
          </button>
        </>
      }
    >
      <p className="muted mb-4 text-sm">
        One row per youth, straight off the YEPS Worksite Assignments roster. Empty rows are skipped, and anything left out
        can be filled in later with Edit.
      </p>
      <RosterGrid rows={rows} setRows={setRows} borough={borough} showErrors={showErrors} />
    </Dialog>
  );
}
