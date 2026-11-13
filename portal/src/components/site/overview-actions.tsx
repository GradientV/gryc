'use client';

import { useState } from 'react';
import { BOROUGHS, IMPLEMENTATION, SECTORS, WORKSITE_TYPES } from '@/lib/forms';
import { firstLast } from '@/lib/format';
import type { Job, Site, Supervisor } from '@/lib/types';
import { addSupervisor, removeSupervisor, saveSiteJob, updateSiteInfo } from '@/server/actions/sites';
import { useAction } from '../use-action';
import { Check, Field } from '../ui/controls';
import { ConfirmDialog, Dialog } from '../ui/dialog';

function Footer({ onCancel, pending, label }: { onCancel: () => void; pending: boolean; label: string }) {
  return (
    <>
      <button type="button" className="btn" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Saving…' : label}
      </button>
    </>
  );
}

type Info = Pick<
  Site,
  | 'name'
  | 'dycdId'
  | 'address'
  | 'room'
  | 'borough'
  | 'zip'
  | 'worksiteType'
  | 'crossStreets'
  | 'travel'
  | 'implementation'
  | 'sector'
  | 'industry'
  | 'childcare'
>;

function pickInfo(s: Site): Info {
  const { name, dycdId, address, room, borough, zip, worksiteType, crossStreets, travel, implementation, sector, industry, childcare } = s;
  return { name, dycdId, address, room, borough, zip, worksiteType, crossStreets, travel, implementation, sector, industry, childcare };
}

export function EditSiteInfo({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Info>(() => pickInfo(site));
  const { run, pending } = useAction();
  const set = <K extends keyof Info>(k: K, v: Info[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          setF(pickInfo(site));
          setOpen(true);
        }}
      >
        Edit
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit worksite information"
        wide
        onSubmit={async () => {
          const r = await run(() => updateSiteInfo(site.id, f), { success: 'Saved.' });
          if (r.ok) setOpen(false);
        }}
        footer={<Footer onCancel={() => setOpen(false)} pending={pending} label="Save" />}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Worksite name" required>
            <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Site code / DYCD ID">
            <input className="input" value={f.dycdId} onChange={(e) => set('dycdId', e.target.value)} />
          </Field>
          <Field label="Address" required>
            <input className="input" value={f.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label="Room, floor or suite">
            <input className="input" value={f.room} onChange={(e) => set('room', e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label="Borough">
            <select className="select" value={f.borough} onChange={(e) => set('borough', e.target.value)}>
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
        <Field label="Between / cross streets">
          <input className="input" value={f.crossStreets} onChange={(e) => set('crossStreets', e.target.value)} />
        </Field>
        <Field label="Travel directions" hint="Train and bus information">
          <textarea className="textarea" rows={2} value={f.travel} onChange={(e) => set('travel', e.target.value)} />
        </Field>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label="Site implementation">
            <select className="select" value={f.implementation} onChange={(e) => set('implementation', e.target.value)}>
              {IMPLEMENTATION.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Sector">
            <select className="select" value={f.sector} onChange={(e) => set('sector', e.target.value)}>
              {SECTORS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Industry">
            <input className="input" value={f.industry} onChange={(e) => set('industry', e.target.value)} />
          </Field>
        </div>
        <Check checked={f.childcare} onChange={(v) => set('childcare', v)}>
          <span className="font-semibold">Childcare site.</span>{' '}
          <span className="muted">Adds the Childcare Site Questions to every assessment and a childcare questionnaire for every participant.</span>
        </Check>
      </Dialog>
    </>
  );
}

type JobForm = { category: string; title: string; assigned: string; duties: string; restrictions: string; special: string };

function jobForm(j: Job | undefined): JobForm {
  return {
    category: j?.category ?? 'Other',
    title: j?.title ?? '',
    assigned: j?.assigned === null || j?.assigned === undefined ? '' : String(j.assigned),
    duties: j?.duties ?? '',
    restrictions: j?.restrictions ?? '',
    special: j?.special ?? '',
  };
}

export function EditDuties({ siteId, job }: { siteId: string; job: Job | undefined }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<JobForm>(() => jobForm(job));
  const { run, pending } = useAction();
  const set = (k: keyof JobForm, v: string) => setF((x) => ({ ...x, [k]: v }));

  return (
    <>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          setF(jobForm(job));
          setOpen(true);
        }}
      >
        Edit
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Job title and duties"
        wide
        onSubmit={async () => {
          const r = await run(
            () => saveSiteJob(siteId, { ...f, assigned: f.assigned === '' ? null : Number(f.assigned) }),
            { success: 'Saved.' },
          );
          if (r.ok) setOpen(false);
        }}
        footer={<Footer onCancel={() => setOpen(false)} pending={pending} label="Save" />}
      >
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label="Category">
            <input className="input" value={f.category} onChange={(e) => set('category', e.target.value)} />
          </Field>
          <Field label="Job title">
            <input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Participants on these duties">
            <input className="input" type="number" min={0} inputMode="numeric" value={f.assigned} onChange={(e) => set('assigned', e.target.value)} />
          </Field>
        </div>
        <Field
          label="Duties"
          required
          hint="Program Activities question 4 is checked against this, and it fills in the childcare daily responsibilities box."
        >
          <textarea className="textarea" rows={4} value={f.duties} onChange={(e) => set('duties', e.target.value)} />
        </Field>
        <Field label="Restrictions">
          <textarea className="textarea" rows={2} value={f.restrictions} onChange={(e) => set('restrictions', e.target.value)} />
        </Field>
        <Field label="Special requirements" className="mb-0">
          <textarea className="textarea" rows={2} value={f.special} onChange={(e) => set('special', e.target.value)} />
        </Field>
      </Dialog>
    </>
  );
}

const BLANK_SUP = { name: '', title: '', email: '', phone: '', area: '', siteRep: false, keyMgmt: false, signAttendance: true };

export function AddSupervisor({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(BLANK_SUP);
  const { run, pending } = useAction();
  const set = <K extends keyof typeof BLANK_SUP>(k: K, v: (typeof BLANK_SUP)[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => {
          setF(BLANK_SUP);
          setOpen(true);
        }}
      >
        Add supervisor
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add a supervisor"
        wide
        onSubmit={async () => {
          const r = await run(() => addSupervisor(siteId, f), { success: 'Supervisor added.' });
          if (r.ok) setOpen(false);
        }}
        footer={<Footer onCancel={() => setOpen(false)} pending={pending} label="Add supervisor" />}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label="Name" required hint="Last name, first name, as on the application">
            <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Title">
            <input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label="Email">
            <input className="input" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Area of supervision">
            <input className="input" value={f.area} onChange={(e) => set('area', e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-2">
          <Check checked={f.siteRep} onChange={(v) => set('siteRep', v)}>
            Site representative
          </Check>
          <Check checked={f.keyMgmt} onChange={(v) => set('keyMgmt', v)}>
            Key management personnel
          </Check>
          <Check checked={f.signAttendance} onChange={(v) => set('signAttendance', v)}>
            Authorized to sign attendance sheets
          </Check>
        </div>
      </Dialog>
    </>
  );
}

export function RemoveSupervisor({ siteId, supervisor }: { siteId: string; supervisor: Supervisor }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction();
  return (
    <>
      <button type="button" className="btn btn-quiet btn-sm btn-danger" onClick={() => setOpen(true)}>
        Remove
      </button>
      <ConfirmDialog
        open={open}
        title="Remove this supervisor?"
        message={`${firstLast(supervisor.name)} will be taken off this worksite. Filed assessments keep the name they were filed with.`}
        confirmLabel="Remove"
        danger
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          const r = await run(() => removeSupervisor(siteId, supervisor.id), { success: 'Supervisor removed.' });
          if (r.ok) setOpen(false);
        }}
      />
    </>
  );
}
