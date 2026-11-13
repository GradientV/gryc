import 'server-only';
import { connection } from 'next/server';
import { currentWeek, DEMO_TODAY_DEFAULT, week, type ProgramWeek } from '@/lib/program';

/* "Today" for the app. The demo pins it to the middle of week 5 (the 2026
   program ended in August); DEMO_TODAY in .env.local moves it, and
   DEMO_TODAY=real uses the actual date in New York. */

function newYorkToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts; // en-CA formats as YYYY-MM-DD
}

/** Safe in Server Actions. Pages use getClock() instead. */
export function resolveToday(): string {
  const v = process.env.DEMO_TODAY?.trim();
  if (v === undefined) return DEMO_TODAY_DEFAULT;
  if (v === '' || v.toLowerCase() === 'real') return newYorkToday();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return DEMO_TODAY_DEFAULT;
}

export interface Clock {
  today: string;
  week: number;
  weekInfo: ProgramWeek;
}

/** For rendering: waits for the request so the date is never baked into a
    prerendered page. Call it inside a Suspense boundary (or a loading.tsx). */
export async function getClock(): Promise<Clock> {
  await connection();
  const today = resolveToday();
  const n = currentWeek(today);
  return { today, week: n, weekInfo: week(n) };
}
