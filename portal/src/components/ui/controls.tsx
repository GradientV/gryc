'use client';

import { useId, type ReactNode } from 'react';
import { fmtTime, snap15 } from '@/lib/format';
import { TIME_SLOTS } from '@/lib/forms';

/* Small form controls shared by every form. All controlled: the parent owns
   the value. */

/* The label wraps its control rather than pointing at it by id. Next.js
   keeps recently visited pages mounted (hidden), so two copies of a form can
   be in the document at once; an id-based label could focus the hidden one. */
export function Field({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`field ${className}`}>
      <label className="block">
        <span className={`label ${required ? 'req' : ''}`}>{label}</span>
        {children}
      </label>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

/** A tick box whose whole row is the target. */
export function Check({
  checked,
  onChange,
  children,
  disabled,
  plain,
  className = '',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  plain?: boolean;
  className?: string;
}) {
  return (
    <label className={`check ${plain ? 'check-plain' : ''} ${className}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

export interface SegOption {
  value: string;
  label: string;
}

export const YES_NO: SegOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
export const YES_NO_NA: SegOption[] = [...YES_NO, { value: 'na', label: 'N/A' }];

/** Yes / No (/ N/A) as one joined control, matching the columns on the form. */
export function Segmented({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SegOption[];
  label: string;
}) {
  const name = useId();
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/** Quarter-hour times only: the paper log is always written in :00/:15/:30/:45. */
export function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const v = snap15(value);
  return (
    <select className="select" value={v} onChange={(e) => onChange(e.target.value)}>
      {TIME_SLOTS.map((t) => (
        <option key={t} value={t}>
          {fmtTime(t)}
        </option>
      ))}
    </select>
  );
}

/** The current time snapped to the quarter hour, as "HH:MM". */
export function nowSlot(): string {
  const d = new Date();
  const slot = snap15(`${d.getHours()}:${d.getMinutes()}`);
  if (slot < TIME_SLOTS[0]) return TIME_SLOTS[0];
  if (slot > TIME_SLOTS[TIME_SLOTS.length - 1]) return TIME_SLOTS[TIME_SLOTS.length - 1];
  return slot;
}
