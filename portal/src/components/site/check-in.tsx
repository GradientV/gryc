'use client';

import { useState } from 'react';
import { fmtTime } from '@/lib/format';
import { VISIT_REASONS, type VisitReason } from '@/lib/forms';
import { checkoutSlot } from '@/lib/rules';
import type { Visit } from '@/lib/types';
import { checkIn, checkOut } from '@/server/actions/visits';
import { useAction } from '../use-action';
import { Check, Field, nowSlot, TimeSelect } from '../ui/controls';
import { Dialog } from '../ui/dialog';

/** Reason for visit: the same three boxes as the paper log. */
export function ReasonPicker({
  reasons,
  setReasons,
  otherText,
  setOtherText,
}: {
  reasons: VisitReason[];
  setReasons: (r: VisitReason[]) => void;
  otherText: string;
  setOtherText: (t: string) => void;
}) {
  return (
    <fieldset>
      <legend className="label req">Reason for visit</legend>
      <div className="grid gap-2">
        {VISIT_REASONS.map((r) => (
          <Check
            key={r.id}
            checked={reasons.includes(r.id)}
            onChange={(on) => setReasons(on ? [...reasons, r.id] : reasons.filter((x) => x !== r.id))}
          >
            {r.label}
          </Check>
        ))}
      </div>
      {reasons.includes('other') ? (
        <input
          className="input mt-2"
          placeholder="What was the visit for?"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          aria-label="Other reason"
          autoFocus
        />
      ) : null}
    </fieldset>
  );
}

/** Three states: on site now (Check out is the main action), already visited
    today (another visit can still be logged), or not yet (Check in). */
export function CheckInControl({
  siteId,
  siteName,
  open,
  doneToday,
  today,
}: {
  siteId: string;
  siteName: string;
  /** today's visit with no time out yet */
  open: Visit | null;
  /** today's latest finished visit, when there is no open one */
  doneToday: Visit | null;
  today: string;
}) {
  const [dialog, setDialog] = useState<'in' | 'out' | null>(null);
  const { run, pending } = useAction();

  const [date, setDate] = useState(today);
  const [timeIn, setTimeIn] = useState('');
  const [reasons, setReasons] = useState<VisitReason[]>(['monitoring']);
  const [otherText, setOtherText] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [notes, setNotes] = useState('');

  function openIn() {
    setDate(today);
    setTimeIn(nowSlot());
    setReasons(['monitoring']);
    setOtherText('');
    setDialog('in');
  }
  function openOut() {
    if (!open) return;
    setTimeOut(checkoutSlot(open.timeIn));
    setNotes('');
    setDialog('out');
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {open ? (
        <>
          <span className="text-sm">
            <span className="tone-ok">On site</span> since {fmtTime(open.timeIn)}
          </span>
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={openOut}>
            Check out
          </button>
        </>
      ) : doneToday ? (
        <>
          <span className="muted text-sm">
            Visited today, {fmtTime(doneToday.timeIn)} – {fmtTime(doneToday.timeOut)}
          </span>
          <button type="button" className="btn w-full sm:w-auto" onClick={openIn}>
            Check in again
          </button>
        </>
      ) : (
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={openIn}>
          Check in
        </button>
      )}

      <Dialog
        open={dialog === 'in'}
        onClose={() => setDialog(null)}
        title={`Check in to ${siteName}`}
        onSubmit={async () => {
          const r = await run(() => checkIn(siteId, { date, timeIn, reasons, otherText }), {
            success: 'Checked in. The monitoring log is updated.',
          });
          if (r.ok) setDialog(null);
        }}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending || !reasons.length}>
              Check in
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time in">
            <TimeSelect value={timeIn} onChange={setTimeIn} />
          </Field>
        </div>
        <ReasonPicker reasons={reasons} setReasons={setReasons} otherText={otherText} setOtherText={setOtherText} />
      </Dialog>

      <Dialog
        open={dialog === 'out'}
        onClose={() => setDialog(null)}
        title="Check out"
        onSubmit={async () => {
          if (!open) return;
          const r = await run(() => checkOut(open.id, { timeOut, notes }), { success: 'Checked out.' });
          if (r.ok) setDialog(null);
        }}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              Check out
            </button>
          </>
        }
      >
        <p className="muted mb-4 text-sm">Checked in at {open ? fmtTime(open.timeIn) : ''}.</p>
        <Field label="Time out">
          <TimeSelect value={timeOut} onChange={setTimeOut} />
        </Field>
        <Field label="Visit notes" hint="Optional. Anything worth recording about this visit.">
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </Dialog>
    </div>
  );
}
