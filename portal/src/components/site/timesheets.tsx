'use client';

import { useId, useOptimistic, useState, useTransition } from 'react';
import { fmtDate, fmtSlash, proster } from '@/lib/format';
import { PROGRAM } from '@/lib/program';
import { sheetsLabel, type DueState } from '@/lib/rules';
import type { Participant } from '@/lib/types';
import { saveTimesheetPickup, setAllTimesheets, setTimesheet } from '@/server/actions/weeks';
import { Meter } from '../ui/bits';
import { useToast } from '../ui/toast';

/* One tick box per active participant, so the count is always the sheets
   actually in hand. The first tick of the week stamps the pickup date (click
   it to change it); unticking every sheet clears it. */
export function TimesheetCheckoff({
  siteId,
  week,
  ending,
  active,
  collected,
  collectedOn,
  note,
  signer,
  today,
  due,
}: {
  siteId: string;
  week: number;
  ending: string;
  active: Participant[];
  collected: string[];
  collectedOn: string;
  note: string;
  signer: string;
  today: string;
  /** whether this week's Friday deadline is ahead, today or past */
  due: DueState;
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [ids, setIds] = useOptimistic(collected, (cur: string[], change: { id?: string; on: boolean; all?: boolean }) => {
    if (change.all) return change.on ? active.map((p) => p.id) : [];
    if (!change.id) return cur;
    return change.on ? [...new Set([...cur, change.id])] : cur.filter((x) => x !== change.id);
  });
  const [editingDate, setEditingDate] = useState(false);
  const [date, setDate] = useState(collectedOn || today);
  const [text, setText] = useState(note);
  const noteId = useId();

  async function savePickup(patch: { collectedOn?: string; note?: string }, done: string) {
    const r = await saveTimesheetPickup(siteId, week, patch);
    if (!r.ok) toast(r.error, 'bad');
    else toast(done);
    return r.ok;
  }

  const received = active.filter((p) => ids.includes(p.id)).length;
  const expected = active.length;
  const status = sheetsLabel(received, expected, due);

  function tick(p: Participant, on: boolean) {
    startTransition(async () => {
      setIds({ id: p.id, on });
      const r = await setTimesheet(siteId, week, p.id, on);
      if (!r.ok) toast(r.error, 'bad');
    });
  }
  function all(on: boolean) {
    startTransition(async () => {
      setIds({ on, all: true });
      const r = await setAllTimesheets(siteId, week, on);
      if (!r.ok) toast(r.error, 'bad');
      else toast(on ? `All ${expected} sheets marked in.` : 'Cleared.');
    });
  }

  return (
    <section className="panel">
      <div className="panel-h">
        <h2>Weekly timesheets</h2>
        <span className="kicker">Week ending {fmtSlash(ending)}</span>
        <span className={`ml-auto text-sm tone-${status.tone}`}>{status.label}</span>
      </div>
      <div className="panel-b grid gap-3">
        <Meter done={received} total={expected} label="Timesheets received" />
        <div className="flex min-h-8 flex-wrap items-center gap-2 text-sm">
          {editingDate ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (date && (await savePickup({ collectedOn: date }, 'Pickup date changed.'))) setEditingDate(false);
              }}
            >
              <label className="muted" htmlFor={`${noteId}-date`}>
                Picked up
              </label>
              <input
                id={`${noteId}-date`}
                type="date"
                className="input w-auto"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-sm btn-primary" disabled={!date}>
                Save
              </button>
              <button type="button" className="btn btn-sm btn-quiet" onClick={() => setEditingDate(false)}>
                Cancel
              </button>
            </form>
          ) : collectedOn ? (
            <button
              type="button"
              className="muted underline decoration-[var(--color-line)] underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-current"
              aria-label={`Picked up ${fmtDate(collectedOn)}. Change the pickup date`}
              onClick={() => {
                setDate(collectedOn);
                setEditingDate(true);
              }}
            >
              Picked up {fmtDate(collectedOn)}
            </button>
          ) : (
            <span className="muted">Not picked up yet. Ticking the first sheet records today as the pickup date.</span>
          )}
        </div>
      </div>

      {expected ? (
        <>
          <div className="flex flex-wrap items-center gap-2 border-y border-[var(--color-line-2)] px-4 py-2.5">
            <span className="kicker mr-auto">Tick each sheet as it comes in, signed by the supervisor.</span>
            <button type="button" className="btn btn-sm" onClick={() => all(true)} disabled={received === expected}>
              Mark all in
            </button>
            <button type="button" className="btn btn-sm btn-quiet" onClick={() => all(false)} disabled={!received}>
              Clear
            </button>
          </div>
          <ul className={expected > 12 ? 'max-h-[520px] overflow-y-auto' : ''}>
            {active.map((p) => {
              const on = ids.includes(p.id);
              return (
                <li key={p.id} className="border-b border-[var(--color-line-2)] last:border-0">
                  <label className={`flex min-h-[52px] cursor-pointer items-center gap-3 px-4 py-2.5 ${on ? 'bg-[var(--color-brand-50)]' : ''}`}>
                    <input type="checkbox" className="box" checked={on} onChange={(e) => tick(p, e.target.checked)} />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{proster(p)}</span>
                      {p.note ? <span className="muted block text-[0.8125rem]">{p.note}</span> : null}
                    </span>
                    <span className="num muted hidden text-[0.8125rem] sm:inline">{p.appId}</span>
                    <span className={`w-14 text-right text-[0.8125rem] ${on ? 'tone-done' : 'muted'}`}>{on ? 'In' : 'Not in'}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--color-line-2)] px-4 py-3">
            <label className="block text-sm font-medium" htmlFor={noteId}>
              Note <span className="muted font-normal">(optional)</span>
            </label>
            <textarea
              id={noteId}
              className="textarea mt-1.5 min-h-[64px]"
              placeholder="Missing or unsigned sheets, when the rest will come in"
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => {
                if (text.trim() !== note) void savePickup({ note: text }, 'Note saved.');
              }}
            />
          </div>
          <div className="panel-f">
            {PROGRAM.serviceOption}, up to {PROGRAM.maxWeeklyHours} hours a week each. {signer ? `${signer} verifies hours and signs.` : ''}
          </div>
        </>
      ) : null}

    </section>
  );
}
