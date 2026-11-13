/* Formatting helpers. Calendar dates are stored as "YYYY-MM-DD" strings and
   times as "HH:MM" so nothing shifts between time zones. */

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = parts(iso);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function fmtDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d).toLocaleDateString(
    'en-US',
    opts ?? { month: 'short', day: 'numeric', year: 'numeric' },
  );
}

/** Aug 5 */
export function fmtShort(iso: string | null | undefined): string {
  return fmtDate(iso, { month: 'short', day: 'numeric' });
}

/** Wed, Aug 5 */
export function fmtDay(iso: string | null | undefined): string {
  return fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** 2026-08-06 -> 08/06/26, the way dates are written on the forms. */
export function fmtSlash(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y.slice(2)}`;
}

/** "13:15" -> "1:15 PM" */
export function fmtTime(t: string | null | undefined): string {
  if (!t) return '—';
  const [hs, ms] = String(t).split(':');
  let h = Number(hs);
  const ap = h >= 12 ? 'PM' : 'AM';
  h %= 12;
  if (h === 0) h = 12;
  return `${h}:${ms} ${ap}`;
}

export function minutes(t: string): number {
  const [h, m] = String(t).split(':');
  return Number(h) * 60 + (Number(m) || 0);
}

/** Snap "HH:MM" to the nearest quarter hour, the way the log is filled in. */
export function snap15(t: string | null | undefined): string {
  if (!t) return '';
  const [hs, ms] = String(t).split(':');
  let h = Number(hs);
  let m = Math.round((Number(ms) || 0) / 15) * 15;
  if (m === 60) {
    m = 0;
    h += 1;
  }
  if (h > 23) h = 23;
  return `${pad(h)}:${pad(m)}`;
}

export function initials(name: string): string {
  return (
    (name || '?')
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || '?'
  );
}

/** "Last, First" -> "First Last" for supervisors stored the roster way. */
export function firstLast(name: string): string {
  const [last, first] = name.split(',').map((s) => s.trim());
  return first ? `${first} ${last}` : name;
}

interface Named {
  first?: string;
  last?: string;
}

/** Audrey Garcia */
export function pname(p: Named | null | undefined): string {
  if (!p) return '—';
  return `${p.first ?? ''} ${p.last ?? ''}`.trim() || p.last || '—';
}

/** Garcia, Audrey — the roster order */
export function proster(p: Named | null | undefined): string {
  if (!p) return '—';
  return `${p.last || '—'}${p.first ? `, ${p.first}` : ''}`;
}

export function fullAddress(s: { address?: string; room?: string; borough?: string; zip?: string }): string {
  const bits = [s.address, s.room].filter(Boolean).join(', ');
  const tail = [s.borough, s.zip].filter(Boolean).join(' ');
  return [bits, tail].filter(Boolean).join(', ') || '—';
}

/** One decimal and no trailing ".0", the way mileage is written by hand. */
export function fmtMiles(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  return String(Math.round(n * 10) / 10);
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Google Maps directions to a worksite; opens the Maps app on a phone. */
export function directionsHref(s: { address?: string; room?: string; borough?: string; zip?: string }): string {
  const where = [s.address, s.borough, 'NY', s.zip].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(where)}`;
}
