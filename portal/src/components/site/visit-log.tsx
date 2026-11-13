'use client';

import { useState } from 'react';
import { fmtSlash, fmtTime } from '@/lib/format';
import type { VisitReason } from '@/lib/forms';
import { reasonLabel, visitDuration } from '@/lib/rules';
import type { Visit } from '@/lib/types';
import { addVisit, removeVisit } from '@/server/actions/visits';
import { useAction } from '../use-action';
import { Field, TimeSelect } from '../ui/controls';
import { ConfirmDialog, Dialog } from '../ui/dialog';
import { ReasonPicker } from './check-in';

export function VisitLog({ siteId, visits, today }: { siteId: string; visits: Visit[]; today: string }) {
  const { run, pending } = useAction();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Visit | null>(null);

  return (
    <>
      <div className="no-print flex flex-wrap justify-end gap-2">
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setAdding(true)}
        >
          Add an entry by hand
        </button>
      </div>

      {visits.length ? (
        <>
          <div className="table-wrap hidden md:block">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name of monitor</th>
                  <th>Reason for visit</th>
                  <th>Time in</th>
                  <th>Time out</th>
                  <th>Length</th>
                  <th>Notes</th>
                  <th className="no-print">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="num font-semibold whitespace-nowrap">{fmtSlash(v.date)}</td>
                    <td className="whitespace-nowrap">{v.monitorName}</td>
                    <td>{reasonLabel(v)}</td>
                    <td className="num whitespace-nowrap">{fmtTime(v.timeIn)}</td>
                    <td className="num whitespace-nowrap">{v.timeOut ? fmtTime(v.timeOut) : <span className="tone-ok">On site</span>}</td>
                    <td className="num muted whitespace-nowrap">{visitDuration(v) || '—'}</td>
                    <td className="muted">{v.notes || '—'}</td>
                    <td className="r no-print">
                      <button type="button" className="btn btn-quiet btn-sm btn-danger" onClick={() => setRemoving(v)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="md:hidden">
            {visits.map((v) => (
              <li key={v.id} className="border-b border-[var(--color-line-2)] px-4 py-3 last:border-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="num font-semibold">{fmtSlash(v.date)}</span>
                  <span className="num text-sm">
                    {fmtTime(v.timeIn)} – {v.timeOut ? fmtTime(v.timeOut) : <span className="tone-ok">on site</span>}
                  </span>
                </div>
                <p className="text-sm">{reasonLabel(v)}</p>
                <p className="muted text-[0.8125rem]">
                  {v.monitorName}
                  {v.notes ? ` · ${v.notes}` : ''}
                </p>
                <button type="button" className="btn btn-quiet btn-sm btn-danger -ml-2 mt-1" onClick={() => setRemoving(v)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted px-4 py-10 text-center text-sm">No visits logged yet. Use Check in at the top of the page when you arrive.</p>
      )}

      {adding ? <AddVisitDialog siteId={siteId} date={today} onClose={() => setAdding(false)} /> : null}

      <ConfirmDialog
        open={!!removing}
        title="Remove this log entry?"
        message={removing ? `The ${fmtSlash(removing.date)} visit will be deleted from the monitoring log.` : ''}
        confirmLabel="Remove"
        danger
        pending={pending}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          const r = await run(() => removeVisit(removing.id), { success: 'Entry removed.' });
          if (r.ok) setRemoving(null);
        }}
      />
    </>
  );
}

/** The by-hand log entry form. Mounted only while open, so each opening
    starts fresh from the given date. */
export function AddVisitDialog({ siteId, date: startDate, onClose }: { siteId: string; date: string; onClose: () => void }) {
  const { run, pending } = useAction();
  const [date, setDate] = useState(startDate);
  const [timeIn, setTimeIn] = useState('11:45');
  const [timeOut, setTimeOut] = useState('12:00');
  const [reasons, setReasons] = useState<VisitReason[]>(['monitoring']);
  const [otherText, setOtherText] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Dialog
      open
      onClose={onClose}
      title="Add a log entry"
      onSubmit={async () => {
        const r = await run(() => addVisit(siteId, { date, timeIn, timeOut, reasons, otherText, notes }), {
          success: 'Log entry added.',
        });
        if (r.ok) onClose();
      }}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending || !reasons.length}>
            Add entry
          </button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="Date">
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time in">
          <TimeSelect value={timeIn} onChange={setTimeIn} />
        </Field>
        <Field label="Time out">
          <TimeSelect value={timeOut} onChange={setTimeOut} />
        </Field>
      </div>
      <ReasonPicker reasons={reasons} setReasons={setReasons} otherText={otherText} setOtherText={setOtherText} />
      <Field label="Notes" className="mt-4 mb-0">
        <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </Dialog>
  );
}

/** Shown on a packet whose visit date has no monitoring log entry. */
export function MissingVisitNotice({ siteId, date, label }: { siteId: string; date: string; label: string }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="callout mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p>
        The monitoring log has no visit on {label}. Each assessment should match a visit in the log.
      </p>
      <button type="button" className="btn btn-sm" onClick={() => setAdding(true)}>
        Add the visit to the log
      </button>
      {adding ? <AddVisitDialog siteId={siteId} date={date} onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
