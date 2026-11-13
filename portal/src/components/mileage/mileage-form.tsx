'use client';

import { useState } from 'react';
import { fmtMiles, fmtSlash } from '@/lib/format';
import { mileageTotal, tripTotal } from '@/lib/rules';
import type { SavedLocation, Trip } from '@/lib/types';
import { deleteTrip, saveLocations, saveTrip } from '@/server/actions/mileage';
import { useAction } from '../use-action';
import { Field } from '../ui/controls';
import { Dialog } from '../ui/dialog';

interface Place {
  value: string;
  label: string;
}

/** From/To choices: saved stops plus every worksite address, and a write-in. */
function placesFrom(locations: SavedLocation[], sites: { name: string; address: string }[]): Place[] {
  const list: Place[] = [];
  for (const l of locations) {
    const value = l.address || l.label;
    list.push({ value, label: l.address ? `${l.label}, ${l.address}` : l.label });
  }
  for (const s of sites) {
    if (s.address && !list.some((p) => p.value === s.address)) list.push({ value: s.address, label: `${s.name}, ${s.address}` });
  }
  return list;
}

function PlacePicker({ label, value, onChange, places }: { label: string; value: string; onChange: (v: string) => void; places: Place[] }) {
  const known = places.some((p) => p.value === value);
  const [custom, setCustom] = useState(!!value && !known);
  return (
    <Field label={label} required>
      <select
        className="select"
        value={custom ? '__other' : value}
        onChange={(e) => {
          if (e.target.value === '__other') {
            setCustom(true);
            onChange('');
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Pick a place</option>
        {places.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
        <option value="__other">Another address</option>
      </select>
      {custom ? (
        <input className="input mt-2" placeholder="Street address" aria-label={`${label} address`} value={value} onChange={(e) => onChange(e.target.value)} autoFocus />
      ) : null}
    </Field>
  );
}

type Draft = { id?: string; date: string; startMileage: string; endMileage: string; from: string; to: string; total: string };

const num = (s: string) => (s.trim() === '' ? null : Number(s));

export function MileageForm({
  trips,
  locations,
  sites,
  today,
  monitorName,
}: {
  trips: Trip[];
  locations: SavedLocation[];
  sites: { name: string; address: string }[];
  today: string;
  monitorName: string;
}) {
  const places = placesFrom(locations, sites);
  const { run, pending } = useAction();
  const [draft, setDraft] = useState<Draft | null>(null);
  /* Deleting a trip lives inside its Edit dialog, behind a second click,
     instead of a red button on every row of the form. */
  const [confirming, setConfirming] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [locRows, setLocRows] = useState<{ id?: string; label: string; address: string }[]>([]);
  const last = trips[trips.length - 1];
  const total = mileageTotal(trips);

  function closeTrip() {
    setDraft(null);
    setConfirming(false);
  }
  async function removeTrip() {
    const id = draft?.id;
    if (!id) return;
    const r = await run(() => deleteTrip(id), { success: 'Trip deleted.' });
    if (r.ok) closeTrip();
  }

  function openNew() {
    setConfirming(false);
    setDraft({
      date: today,
      startMileage: last?.endMileage != null ? String(last.endMileage) : '',
      endMileage: '',
      from: last?.to ?? '',
      to: '',
      total: '',
    });
  }
  function openEdit(t: Trip) {
    setConfirming(false);
    setDraft({
      id: t.id,
      date: t.date,
      startMileage: t.startMileage == null ? '' : String(t.startMileage),
      endMileage: t.endMileage == null ? '' : String(t.endMileage),
      from: t.from,
      to: t.to,
      total: t.total == null ? '' : String(t.total),
    });
  }
  function setD(p: Partial<Draft>) {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, ...p };
      if ('startMileage' in p || 'endMileage' in p) {
        const t = tripTotal(num(next.startMileage), num(next.endMileage));
        if (t !== null) next.total = String(t);
      }
      return next;
    });
  }

  /* the paper form writes the date once and dittos it for the day's other trips */
  const firstOfDay = trips.map((t, i) => i === 0 || trips[i - 1].date !== t.date);

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Log a trip
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLocRows(locations.map((l) => ({ id: l.id, label: l.label, address: l.address })));
            setLocOpen(true);
          }}
        >
          Saved places
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>

      <section className="panel">
        <div className="panel-h">
          <h2>Mileage form, SYEP 2026</h2>
          <span className="kicker ml-auto">Rev. 6/25</span>
        </div>

        {trips.length ? (
          <>
            <div className="table-wrap hidden md:block print:block">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th className="r">Start mileage</th>
                    <th>From</th>
                    <th>To</th>
                    <th className="r">End mileage</th>
                    <th className="r">Total</th>
                    <th className="no-print">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t, i) => {
                    const newDay = firstOfDay[i];
                    return (
                      <tr key={t.id}>
                        <td className={`num whitespace-nowrap ${newDay ? 'font-semibold' : 'muted'}`}>{newDay ? fmtSlash(t.date) : '〃'}</td>
                        <td className="r num">{fmtMiles(t.startMileage)}</td>
                        <td>{t.from}</td>
                        <td>{t.to}</td>
                        <td className="r num">{fmtMiles(t.endMileage)}</td>
                        <td className="r num font-semibold">{fmtMiles(t.total)}</td>
                        <td className="r no-print whitespace-nowrap">
                          <button type="button" className="btn btn-quiet btn-sm" onClick={() => openEdit(t)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={5} className="r font-semibold">
                      Total
                    </td>
                    <td className="r num font-semibold">{fmtMiles(total)}</td>
                    <td className="no-print" />
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="md:hidden print:hidden">
              {trips.map((t, i) => {
                const newDay = firstOfDay[i];
                return (
                  <li key={t.id} className="border-b border-[var(--color-line-2)] last:border-0">
                    {newDay ? <p className="num bg-[var(--color-paper)] px-4 py-1.5 text-[0.8125rem] font-semibold">{fmtSlash(t.date)}</p> : null}
                    <div className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p>
                          {t.from} <span className="muted">to</span> {t.to}
                        </p>
                        <p className="num muted text-[0.8125rem]">
                          {fmtMiles(t.startMileage)} – {fmtMiles(t.endMileage)}
                        </p>
                      </div>
                      <span className="num shrink-0 font-semibold">{fmtMiles(t.total)} mi</span>
                    </div>
                    <div className="-mt-2 flex gap-1 px-2 pb-2">
                      <button type="button" className="btn btn-quiet btn-sm" onClick={() => openEdit(t)}>
                        Edit
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="muted px-4 py-10 text-center text-sm">
            No trips yet. Log one when you leave for a site: it starts where your last trip ended.
          </p>
        )}

        <div className="grid gap-6 border-t border-[var(--color-line-2)] px-4 py-5 text-sm sm:grid-cols-2">
          <div className="grid gap-4">
            <p className="flex gap-2 border-b border-[var(--color-ink-3)] pb-1">
              <span className="muted">Employee&apos;s name</span> <span className="font-medium">{monitorName}</span>
            </p>
            <p className="border-b border-[var(--color-ink-3)] pb-1 muted">Employee&apos;s signature</p>
          </div>
          <div className="grid gap-4">
            <p className="border-b border-[var(--color-ink-3)] pb-1 muted">Supervisor&apos;s name</p>
            <p className="border-b border-[var(--color-ink-3)] pb-1 muted">Supervisor&apos;s signature</p>
          </div>
        </div>
      </section>

      <Dialog
        open={!!draft}
        onClose={closeTrip}
        title={draft?.id ? 'Edit trip' : 'Log a trip'}
        wide
        onSubmit={async () => {
          if (!draft) return;
          const r = await run(
            () =>
              saveTrip({
                id: draft.id,
                date: draft.date,
                startMileage: num(draft.startMileage),
                endMileage: num(draft.endMileage),
                from: draft.from,
                to: draft.to,
                total: num(draft.total),
              }),
            { success: draft.id ? 'Trip updated.' : 'Trip logged.' },
          );
          if (r.ok) closeTrip();
        }}
        footer={
          confirming && draft?.id ? (
            <>
              <p className="w-full self-center text-sm sm:mr-auto sm:w-auto">Delete this trip? This can’t be undone.</p>
              <button type="button" className="btn" onClick={() => setConfirming(false)}>
                Keep it
              </button>
              <button type="button" className="btn btn-primary btn-destructive" disabled={pending} onClick={removeTrip}>
                Delete
              </button>
            </>
          ) : (
            <>
              {draft?.id ? (
                <button type="button" className="btn btn-quiet btn-danger sm:mr-auto" onClick={() => setConfirming(true)}>
                  Delete trip
                </button>
              ) : null}
              <button type="button" className="btn" onClick={closeTrip}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={pending || !draft?.from || !draft?.to}>
                {draft?.id ? 'Save' : 'Add trip'}
              </button>
            </>
          )
        }
      >
        {draft ? (
          <>
            <div className="grid gap-x-4 sm:grid-cols-3">
              <Field label="Date" required>
                <input type="date" className="input" value={draft.date} onChange={(e) => setD({ date: e.target.value })} />
              </Field>
              <Field label="Start mileage">
                <input type="number" step="0.1" inputMode="decimal" className="input" value={draft.startMileage} onChange={(e) => setD({ startMileage: e.target.value })} />
              </Field>
              <Field label="End mileage">
                <input type="number" step="0.1" inputMode="decimal" className="input" value={draft.endMileage} onChange={(e) => setD({ endMileage: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <PlacePicker label="From" value={draft.from} onChange={(v) => setD({ from: v })} places={places} />
              <PlacePicker label="To" value={draft.to} onChange={(v) => setD({ to: v })} places={places} />
            </div>
            <Field
              label="Total mileage"
              hint="Fills in from the odometer readings, or type the trip distance if that is all you tracked."
              className="mb-0 max-w-xs"
            >
              <input type="number" step="0.1" inputMode="decimal" className="input" value={draft.total} onChange={(e) => setD({ total: e.target.value })} />
            </Field>
            {!draft.id && last ? (
              <p className="kicker mt-4">
                Picks up from your last trip, which ended at {last.to}
                {last.endMileage != null ? ` with ${fmtMiles(last.endMileage)} on the odometer` : ''}.
              </p>
            ) : null}
          </>
        ) : null}
      </Dialog>

      <Dialog
        open={locOpen}
        onClose={() => setLocOpen(false)}
        title="Saved places"
        wide
        onSubmit={async () => {
          const r = await run(() => saveLocations(locRows), { success: 'Places saved.' });
          if (r.ok) setLocOpen(false);
        }}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setLocOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              Save
            </button>
          </>
        }
      >
        <p className="muted mb-4 text-sm">
          These appear in the From and To lists next to your worksites, which are added from their applications.
        </p>
        <div className="grid gap-3">
          {locRows.map((l, i) => (
            <div key={l.id ?? `new-${i}`} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
              <Field label="Name" className="mb-0">
                <input className="input" value={l.label} onChange={(e) => setLocRows(locRows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              </Field>
              <Field label="Address" className="mb-0">
                <input
                  className="input"
                  placeholder="Leave blank to show the name"
                  value={l.address}
                  onChange={(e) => setLocRows(locRows.map((x, j) => (j === i ? { ...x, address: e.target.value } : x)))}
                />
              </Field>
              <button type="button" className="btn btn-quiet btn-sm btn-danger justify-self-start" onClick={() => setLocRows(locRows.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-sm mt-4" onClick={() => setLocRows([...locRows, { label: '', address: '' }])}>
          Add a place
        </button>
      </Dialog>
    </>
  );
}
