'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BOROUGHS, IMPLEMENTATION, SECTORS, WORKSITE_TYPES } from '@/lib/forms';
import { registerSite } from '@/server/actions/sites';
import { useAction } from '../use-action';
import { Check, Field } from '../ui/controls';
import { useToast } from '../ui/toast';
import { blankRow, readRows, RosterGrid, withBorough, type RosterRow } from './roster-grid';

const BLANK = {
  name: '',
  dycdId: '',
  address: '',
  room: '',
  borough: 'Queens',
  zip: '',
  worksiteType: 'Nonprofit',
  crossStreets: '',
  travel: '',
  implementation: 'In-Person',
  sector: 'Non-Profit',
  industry: '',
  doeBuilding: 'No',
  childcare: false,
  supName: '',
  supTitle: '',
  supPhone: '',
  supEmail: '',
  jobTitle: '',
  requested: '',
  duties: '',
};

export function RegisterSiteForm() {
  const router = useRouter();
  const toast = useToast();
  const { run, pending } = useAction();
  const [f, setF] = useState(BLANK);
  const [rows, setRows] = useState<RosterRow[]>([blankRow('Queens')]);
  const [showErrors, setShowErrors] = useState(false);
  const set = <K extends keyof typeof BLANK>(k: K, v: (typeof BLANK)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function submit() {
    setShowErrors(true);
    if (!f.name.trim() || !f.address.trim()) {
      toast('The worksite name and address are required.', 'bad');
      return;
    }
    const roster = readRows(rows);
    if (roster.incomplete) {
      toast(`Every roster row needs a last name. ${roster.incomplete} ${roster.incomplete === 1 ? 'row is' : 'rows are'} missing one.`, 'bad');
      return;
    }
    const r = await run(
      () =>
        registerSite({
          name: f.name,
          dycdId: f.dycdId,
          address: f.address,
          room: f.room,
          borough: f.borough,
          zip: f.zip,
          worksiteType: f.worksiteType,
          crossStreets: f.crossStreets,
          travel: f.travel,
          implementation: f.implementation,
          sector: f.sector,
          industry: f.industry,
          childcare: f.childcare,
          doeBuilding: f.doeBuilding,
          supervisor: { name: f.supName, title: f.supTitle, phone: f.supPhone, email: f.supEmail },
          jobTitle: f.jobTitle,
          requested: f.requested ? Number(f.requested) : null,
          duties: f.duties,
          roster: roster.rows,
        }),
      { success: 'Worksite registered.' },
    );
    if (r.ok) router.push(`/sites/${r.data.id}`);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="grid gap-6"
    >
      <section className="panel">
        <div className="panel-h">
          <h2>General information</h2>
        </div>
        <div className="panel-b">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Worksite name" required hint="As it appears on the Worksite Application">
              <input className="input" aria-invalid={(showErrors && !f.name.trim()) || undefined} value={f.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Site code / DYCD ID">
              <input className="input" value={f.dycdId} onChange={(e) => set('dycdId', e.target.value)} />
            </Field>
            <Field label="Address" required>
              <input className="input" aria-invalid={(showErrors && !f.address.trim()) || undefined} value={f.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <Field label="Room, floor or suite">
              <input className="input" value={f.room} onChange={(e) => set('room', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-x-4 sm:grid-cols-3">
            <Field label="Borough">
              <select
                className="select"
                value={f.borough}
                onChange={(e) => {
                  set('borough', e.target.value);
                  setRows((rs) => withBorough(rs, e.target.value));
                }}
              >
                {BOROUGHS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="ZIP">
              <input className="input" inputMode="numeric" value={f.zip} onChange={(e) => set('zip', e.target.value)} />
            </Field>
            <Field label="Worksite type">
              <select className="select" value={f.worksiteType} onChange={(e) => set('worksiteType', e.target.value)}>
                {WORKSITE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Between / cross streets">
              <input className="input" value={f.crossStreets} onChange={(e) => set('crossStreets', e.target.value)} />
            </Field>
            <Field label="Industry">
              <input className="input" value={f.industry} onChange={(e) => set('industry', e.target.value)} />
            </Field>
          </div>
          <Field label="Travel directions" hint="Train and bus information">
            <textarea className="textarea" rows={2} value={f.travel} onChange={(e) => set('travel', e.target.value)} />
          </Field>
          <div className="grid gap-x-4 sm:grid-cols-3">
            <Field label="Sector">
              <select className="select" value={f.sector} onChange={(e) => set('sector', e.target.value)}>
                {SECTORS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Site implementation">
              <select className="select" value={f.implementation} onChange={(e) => set('implementation', e.target.value)}>
                {IMPLEMENTATION.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="In a DOE building">
              <select className="select" value={f.doeBuilding} onChange={(e) => set('doeBuilding', e.target.value)}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
          </div>
          <Check checked={f.childcare} onChange={(v) => set('childcare', v)}>
            <span className="font-semibold">Childcare site.</span>{' '}
            <span className="muted">Adds the Childcare Site Questions and a childcare questionnaire for every participant.</span>
          </Check>
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <h2>Supervision and management</h2>
        </div>
        <div className="panel-b grid gap-x-4 sm:grid-cols-2">
          <Field label="Supervisor name" hint="Last name, first name">
            <input className="input" value={f.supName} onChange={(e) => set('supName', e.target.value)} />
          </Field>
          <Field label="Title">
            <input className="input" value={f.supTitle} onChange={(e) => set('supTitle', e.target.value)} />
          </Field>
          <Field label="Phone" className="sm:mb-0">
            <input type="tel" className="input" value={f.supPhone} onChange={(e) => set('supPhone', e.target.value)} />
          </Field>
          <Field label="Email" className="mb-0">
            <input type="email" className="input" value={f.supEmail} onChange={(e) => set('supEmail', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <h2>Job duties</h2>
        </div>
        <div className="panel-b">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Job title">
              <input className="input" value={f.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
            </Field>
            <Field label="Participants requested">
              <input type="number" min={0} inputMode="numeric" className="input" value={f.requested} onChange={(e) => set('requested', e.target.value)} />
            </Field>
          </div>
          <Field label="Duties" hint="What the participants actually do at this site." className="mb-0">
            <textarea className="textarea" rows={3} value={f.duties} onChange={(e) => set('duties', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="panel">
        <div className="panel-h">
          <h2>Site assignment roster</h2>
        </div>
        <div className="panel-b">
          <p className="muted mb-4 text-sm">
            One row per youth. Leave it empty if the GRYC office loads the roster; you can add people later on the
            Participants tab.
          </p>
          <RosterGrid rows={rows} setRows={setRows} borough={f.borough} showErrors={showErrors} />
        </div>
      </section>

      <div className="actionbar md:static md:mx-0 md:mt-0 md:justify-end md:border-0 md:bg-transparent md:p-0">
        <button type="button" className="btn md:flex-none" onClick={() => router.push('/')}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary md:flex-none" disabled={pending}>
          {pending ? 'Registering…' : 'Register the worksite'}
        </button>
      </div>
    </form>
  );
}
