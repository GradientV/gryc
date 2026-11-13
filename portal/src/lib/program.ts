/* The SYEP 2026 program calendar. Pure data and helpers: safe to import
   from server and client code alike. */

export const PROGRAM = {
  initiative: 'SYEP',
  cycle: 'SYEP 2026',
  provider: 'Greater Ridgewood Youth Council, Inc.',
  organization: 'Greater Ridgewood Youth Council, Inc. - SYEP',
  timesheetProvider: 'The Greater Ridgewood Youth Council Inc.-QNS-OY',
  cohort: 'Cohort A (7/6/2026)',
  serviceOption: 'Older Youth',
  startDate: '2026-07-06',
  endDate: '2026-08-14',
  maxWeeklyHours: 25,
  office: { label: 'GRYC Office', address: '59-03 Summerfield St', city: 'Ridgewood, NY 11385' },
} as const;

export interface ProgramWeek {
  n: number;
  /** Monday the work week starts */
  start: string;
  /** Friday the work week ends */
  end: string;
  /** Saturday the timesheet is dated to ("Week Ending 8/01/2026") */
  ending: string;
}

export const WEEKS: ProgramWeek[] = [
  { n: 1, start: '2026-07-06', end: '2026-07-10', ending: '2026-07-11' },
  { n: 2, start: '2026-07-13', end: '2026-07-17', ending: '2026-07-18' },
  { n: 3, start: '2026-07-20', end: '2026-07-24', ending: '2026-07-25' },
  { n: 4, start: '2026-07-27', end: '2026-07-31', ending: '2026-08-01' },
  { n: 5, start: '2026-08-03', end: '2026-08-07', ending: '2026-08-08' },
  { n: 6, start: '2026-08-10', end: '2026-08-14', ending: '2026-08-15' },
];

export const WEEK_COUNT = WEEKS.length;

/** The 2026 program ended in August, so the demo pins "today" to the middle
    of week 5. Set DEMO_TODAY in .env.local to move it (or to "real"). */
export const DEMO_TODAY_DEFAULT = '2026-08-05';

export function week(n: number): ProgramWeek {
  return WEEKS.find((w) => w.n === n) ?? WEEKS[0];
}

export function isWeekNumber(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= WEEK_COUNT;
}

/** The week `today` falls in, held to week 1 before the program and to the
    last week after it. */
export function currentWeek(today: string): number {
  let last = WEEKS[0];
  for (const w of WEEKS) if (today >= w.start) last = w;
  return last.n;
}

export function inWeek(iso: string, n: number): boolean {
  const w = week(n);
  return iso >= w.start && iso <= w.ending;
}
