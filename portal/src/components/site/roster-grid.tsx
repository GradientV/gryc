'use client';

import type { ClipboardEvent } from 'react';
import { BOROUGHS } from '@/lib/forms';

/* One box per column of the YEPS "Worksite Assignments" roster. Pasting a
   tab- or comma-separated row (or several lines) into the Application ID box
   fans it out across the row and adds rows as needed, so copying straight
   out of YEPS works. Shared by "Add participants" and "Register a worksite". */

export interface RosterRow {
  appId: string;
  last: string;
  first: string;
  program: string;
  borough: string;
  phone: string;
  age: string;
  /** borough picked by hand, so it stops following the site's borough */
  boroughSet?: boolean;
}

export const blankRow = (borough = 'Queens'): RosterRow => ({
  appId: '',
  last: '',
  first: '',
  program: 'Lottery',
  borough,
  phone: '',
  age: '',
});

const FIELDS = ['appId', 'last', 'first', 'program', 'borough', 'phone', 'age'] as const;

export function touched(r: RosterRow): boolean {
  return !!(r.appId || r.last || r.first || r.phone || r.age);
}

/** Rows ready to send, or the number of rows that still need a last name. */
export function readRows(rows: RosterRow[]) {
  const used = rows.filter(touched);
  const incomplete = used.filter((r) => !r.last.trim()).length;
  return {
    incomplete,
    rows: used.map((r) => ({
      appId: r.appId.trim(),
      last: r.last.trim(),
      first: r.first.trim(),
      program: r.program.trim() || 'Lottery',
      borough: r.borough,
      phone: r.phone.trim(),
      age: r.age ? Number(r.age) : null,
    })),
  };
}

export function RosterGrid({
  rows,
  setRows,
  borough,
  showErrors,
}: {
  rows: RosterRow[];
  setRows: (r: RosterRow[]) => void;
  borough: string;
  showErrors: boolean;
}) {
  function update(i: number, patch: Partial<RosterRow>) {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function onPaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (!/[\t,\n]/.test(text)) return;
    e.preventDefault();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const made = lines.map((line) => {
      const parts = line.split(/\t|,/).map((p) => p.trim());
      const r = blankRow(borough);
      FIELDS.forEach((f, ix) => {
        const v = parts[ix];
        if (!v) return;
        if (f === 'borough') {
          const match = BOROUGHS.find((b) => b.toLowerCase() === v.toLowerCase());
          if (match) {
            r.borough = match;
            r.boroughSet = true;
          }
        } else {
          r[f] = v;
        }
      });
      return r;
    });
    setRows([...rows.slice(0, i), ...made, ...rows.slice(i + 1)]);
  }

  return (
    <div>
      <div className="table-wrap rounded-[var(--radius-ui)] border border-[var(--color-line)]">
        <table className="table min-w-[760px]">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Last name</th>
              <th>First name</th>
              <th>Program</th>
              <th>Borough</th>
              <th>Phone</th>
              <th>Age</th>
              <th>
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const missing = showErrors && touched(r) && !r.last.trim();
              return (
                <tr key={i}>
                  <td className="p-1.5">
                    <input
                      className="input"
                      aria-label={`Row ${i + 1} application ID`}
                      value={r.appId}
                      onChange={(e) => update(i, { appId: e.target.value })}
                      onPaste={(e) => onPaste(i, e)}
                      placeholder="Paste rows here"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      className="input"
                      aria-label={`Row ${i + 1} last name`}
                      aria-invalid={missing || undefined}
                      value={r.last}
                      onChange={(e) => update(i, { last: e.target.value })}
                    />
                  </td>
                  <td className="p-1.5">
                    <input className="input" aria-label={`Row ${i + 1} first name`} value={r.first} onChange={(e) => update(i, { first: e.target.value })} />
                  </td>
                  <td className="p-1.5">
                    <input className="input" aria-label={`Row ${i + 1} program`} value={r.program} onChange={(e) => update(i, { program: e.target.value })} />
                  </td>
                  <td className="p-1.5">
                    <select
                      className="select"
                      aria-label={`Row ${i + 1} borough`}
                      value={r.boroughSet ? r.borough : borough}
                      onChange={(e) => update(i, { borough: e.target.value, boroughSet: true })}
                    >
                      {BOROUGHS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5">
                    <input className="input" type="tel" aria-label={`Row ${i + 1} phone`} value={r.phone} onChange={(e) => update(i, { phone: e.target.value })} />
                  </td>
                  <td className="w-20 p-1.5">
                    <input
                      className="input"
                      type="number"
                      min={14}
                      max={30}
                      inputMode="numeric"
                      aria-label={`Row ${i + 1} age`}
                      value={r.age}
                      onChange={(e) => update(i, { age: e.target.value })}
                    />
                  </td>
                  <td className="w-12 p-1.5 text-right">
                    <button
                      type="button"
                      className="btn btn-quiet btn-sm btn-danger"
                      aria-label={`Clear row ${i + 1}`}
                      onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [blankRow(borough)])}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-sm" onClick={() => setRows([...rows, blankRow(borough)])}>
          Add another row
        </button>
        <span className="kicker">
          Paste a row (or several) copied from YEPS into the Application ID box and it fills in the columns.
        </span>
      </div>
    </div>
  );
}

/** Rows that followed the site's borough pick up its new value. */
export function withBorough(rows: RosterRow[], borough: string): RosterRow[] {
  return rows.map((r) => (r.boroughSet ? r : { ...r, borough }));
}
