/* The rules of the paperwork: what each participant owes, what counts as a
   finding, what an assessment needs before it can be filed, and which answers
   carry from week to week. Pure functions, used by the server to compute
   pages and by the client to give instant feedback while a form is open. */

import { fmtDate, fmtDay, fmtSlash, minutes, plural, proster } from './format';
import {
  FACILITY_ITEMS,
  INTERVIEW_FLAGS,
  INTERVIEW_Q,
  INTERVIEWS_REQUIRED,
  OPERATIONS_Q,
  PROGRAM_ACTIVITY_Q,
  RECORDKEEPING_ITEMS,
  TIME_SLOTS,
  VISIT_REASONS,
} from './forms';
import { inWeek, week } from './program';
import type {
  Assessment,
  AssessmentDefaults,
  AssessmentForm,
  ChildcareForm,
  DocKey,
  Interview,
  Participant,
  Site,
  Supervisor,
  TimesheetStatus,
  TimesheetWeek,
  Trip,
  Visit,
} from './types';

/* ---- people ---------------------------------------------------------------- */

export function activeParticipants<P extends Pick<Participant, 'status'>>(ps: P[]): P[] {
  return ps.filter((p) => p.status === 'Active');
}

export function primarySupervisor(site: Pick<Site, 'supervisors'>): Supervisor | null {
  return site.supervisors.find((v) => v.siteRep) ?? site.supervisors[0] ?? null;
}

/* ---- participant paperwork ------------------------------------------------- */

export interface DocDef {
  key: DocKey;
  label: string;
  short: string;
  dueWeek: number;
  /** a document the app fills in itself; submitting the form ticks it */
  form?: 'childcare';
}

/** Documents each participant owes, given the site type. Referral sheets and
    the week 3 / week 6 evaluations stay on paper, so they are tick boxes; the
    childcare questionnaire is filled in here. */
export function docsFor(site: Pick<Site, 'childcare'>): DocDef[] {
  const list: DocDef[] = [
    { key: 'referral', label: 'Referral Sheet', short: 'Referral', dueWeek: 1 },
    { key: 'week3', label: 'Week 3 Evaluation', short: 'Week 3 eval', dueWeek: 3 },
    { key: 'week6', label: 'Week 6 Evaluation', short: 'Week 6 eval', dueWeek: 6 },
  ];
  if (site.childcare) {
    list.push({ key: 'childcare', label: 'Childcare Questionnaire', short: 'Childcare', dueWeek: 1, form: 'childcare' });
  }
  return list;
}

export interface DocProgress {
  done: number;
  total: number;
  outstanding: number;
  pct: number;
}

/** Counts only documents due on or before `currentWeek`. */
export function docProgress(
  site: Pick<Site, 'childcare'>,
  participants: Pick<Participant, 'status' | 'docs'>[],
  currentWeek: number,
): DocProgress {
  const docs = docsFor(site).filter((d) => d.dueWeek <= currentWeek);
  let done = 0;
  let total = 0;
  for (const p of activeParticipants(participants)) {
    for (const d of docs) {
      total++;
      if (p.docs[d.key]) done++;
    }
  }
  return { done, total, outstanding: total - done, pct: total ? Math.round((done / total) * 100) : 100 };
}

/* ---- timesheets ------------------------------------------------------------- */

export interface TimesheetSummary {
  received: number;
  expected: number;
  status: TimesheetStatus;
  collectedOn: string;
  note: string;
  collected: Set<string>;
}

/** The count always comes from the per-participant tick boxes, so it matches
    the sheets actually in hand. */
export function timesheetSummary(
  ts: Pick<TimesheetWeek, 'collected' | 'collectedOn' | 'note'> | null | undefined,
  active: Pick<Participant, 'id'>[],
): TimesheetSummary {
  const collected = new Set(ts?.collected ?? []);
  const received = active.filter((p) => collected.has(p.id)).length;
  const expected = active.length;
  const status: TimesheetStatus = received === 0 ? 'pending' : received >= expected ? 'collected' : 'partial';
  return { received, expected, status, collectedOn: ts?.collectedOn ?? '', note: ts?.note ?? '', collected };
}

/* ---- monitoring log ----------------------------------------------------------- */

export function visitsInWeek(visits: Visit[], n: number): Visit[] {
  return visits.filter((v) => inWeek(v.date, n));
}

/** Latest visit first */
export function sortVisits(visits: Visit[]): Visit[] {
  return [...visits].sort((a, b) => `${b.date}${b.timeIn}`.localeCompare(`${a.date}${a.timeIn}`));
}

export function openVisit(visits: Visit[], today: string): Visit | null {
  return visits.find((v) => !v.timeOut && v.date === today) ?? null;
}

export function visitDuration(v: Pick<Visit, 'timeIn' | 'timeOut'>): string {
  if (!v.timeOut) return '';
  const d = minutes(v.timeOut) - minutes(v.timeIn);
  if (d < 0) return '';
  return `${d >= 60 ? `${Math.floor(d / 60)}h ` : ''}${d % 60}m`;
}

export function reasonLabel(v: Pick<Visit, 'reasons' | 'otherText'>): string {
  const out: string[] = VISIT_REASONS.filter((r) => r.id !== 'other' && v.reasons.includes(r.id)).map((r) => r.label);
  if (v.reasons.includes('other')) out.push(`Other: ${v.otherText || '—'}`);
  return out.join(' · ') || '—';
}

/** Time out opens at the next quarter hour after check-in, not at "now".
    Most visits are a two-minute timesheet pickup, and "now" would snap back
    onto the check-in slot, which the log refuses. */
export function checkoutSlot(timeIn: string): string {
  return TIME_SLOTS.find((t) => minutes(t) > minutes(timeIn)) ?? TIME_SLOTS[TIME_SLOTS.length - 1];
}

/* ---- assessment: findings ------------------------------------------------------- */

/** Everything on the packet that reads as a problem worth writing up. */
export function findings(a: AssessmentForm | null | undefined, site: Pick<Site, 'childcare'>): string[] {
  const out: string[] = [];
  if (!a) return out;

  for (const i of FACILITY_ITEMS) {
    if (!a.isRemote && a.facility?.[i.id] === false) out.push(`Facility — ${i.text} not met`);
  }
  if (a.hazard) out.push(`Facility — hazardous conditions noted: ${a.hazard}`);

  for (const i of RECORDKEEPING_ITEMS) {
    if (i.id === 'ccletter' && !site.childcare) continue;
    if (a.records?.[i.id] === false) out.push(`Recordkeeping — ${i.text.replace(/:$/, '')} not available`);
  }
  for (const q of OPERATIONS_Q) {
    if (a.ops?.[q.id] === 'no') out.push(`Operations Q${q.n} — ${q.text}`);
  }
  for (const q of PROGRAM_ACTIVITY_Q) {
    if (a.activities?.[q.id] === 'no') out.push(`Program activities Q${q.n} — ${q.text}`);
  }
  if (a.safeEnv === 'no') {
    out.push(`Site not classified as a safe environment${a.safeEnvExplain ? ` — ${a.safeEnvExplain}` : ''}`);
  }
  if (site.childcare && a.ccDuties === 'no') {
    out.push('Childcare — participant job duties not clearly outlined to youth');
  }
  a.interviews?.forEach((iv, idx) => {
    for (const q of INTERVIEW_Q) {
      const flag = INTERVIEW_FLAGS[q.id];
      if (flag && iv.answers?.[q.id] === flag) {
        out.push(`Interview ${idx + 1} Q${q.n} — "${iv.answers[q.id]}" to: ${q.text}`);
      }
    }
  });
  return out;
}

/* ---- assessment: sections and what each one still needs ------------------------- */

export type SectionKey = 'site' | 'records' | 'attend' | 'ops' | 'program' | 'childcare' | 'interviews' | 'sign';

export interface SectionDef {
  key: SectionKey;
  label: string;
  page: string;
}

export function assessmentSections(site: Pick<Site, 'childcare'>): SectionDef[] {
  const s: SectionDef[] = [
    { key: 'site', label: 'Site and facility', page: 'Page 1' },
    { key: 'records', label: 'Recordkeeping', page: 'Page 2' },
    { key: 'attend', label: 'Attendance', page: 'Page 2' },
    { key: 'ops', label: 'Operations', page: 'Page 2' },
    { key: 'program', label: 'Program activities', page: 'Page 3' },
  ];
  if (site.childcare) s.push({ key: 'childcare', label: 'Childcare questions', page: 'Page 3' });
  s.push({ key: 'interviews', label: 'Participant interviews', page: 'Page 6' });
  s.push({ key: 'sign', label: 'Summary and signatures', page: 'Page 5' });
  return s;
}

export function interviewComplete(iv: Interview): boolean {
  return !!iv.lastName && INTERVIEW_Q.every((q) => !!iv.answers?.[q.id]);
}

export function interviewsDone(form: Pick<AssessmentForm, 'interviews'>): number {
  return (form.interviews ?? []).filter(interviewComplete).length;
}

/** What each section still needs before the packet can be filed. Mirrors the
    paper rules: the packet will not go in with a blank required box, an
    unanswered Yes/No, a missing interview or signature, or findings the
    summary does not address. */
export function sectionProblems(form: AssessmentForm, site: Pick<Site, 'childcare'>): Record<SectionKey, string[]> {
  const p: Record<SectionKey, string[]> = {
    site: [],
    records: [],
    attend: [],
    ops: [],
    program: [],
    childcare: [],
    interviews: [],
    sign: [],
  };

  if (!form.visitDate) p.site.push('Date of visit');
  if (!form.supervisorName) p.site.push('Worksite Supervisor');
  if (!form.interviewName) p.site.push('Person Interviewed');
  if (!form.isRemote && !FACILITY_ITEMS.some((i) => form.facility?.[i.id])) {
    p.site.push('Facility condition (nothing checked)');
  }

  const opsLeft = OPERATIONS_Q.filter((q) => !form.ops?.[q.id]).length;
  if (opsLeft) p.ops.push(`${opsLeft} unanswered question${opsLeft === 1 ? '' : 's'}`);

  if (!form.safeEnv) p.program.push('Safe environment, Yes or No');
  const actLeft = PROGRAM_ACTIVITY_Q.filter((q) => !form.activities?.[q.id]).length;
  if (actLeft) p.program.push(`${actLeft} unanswered Program Activities question${actLeft === 1 ? '' : 's'}`);

  if (site.childcare) {
    if (!form.ccDoc) p.childcare.push('Which document is on file');
    if (!form.ccDuties) p.childcare.push('Job duties outlined, Yes or No');
    if (!form.ccResponsibilities) p.childcare.push('Daily responsibilities of the participant');
  }

  const done = interviewsDone(form);
  if (done < INTERVIEWS_REQUIRED) {
    const left = INTERVIEWS_REQUIRED - done;
    p.interviews.push(`${left} interview${left === 1 ? '' : 's'} not finished`);
  }

  if (!form.summary) p.sign.push('Overall Report Summary');
  const flags = findings(form, site);
  if (flags.length && form.summary && form.summary.length < 40) {
    p.sign.push(`Summary has to explain the ${flags.length} flagged item${flags.length === 1 ? '' : 's'}`);
  }
  if (!form.monitorSig) p.sign.push('Signature of Provider Monitor');
  if (!form.supervisorSig) p.sign.push('Signature of Worksite Supervisor');

  return p;
}

export function allProblems(form: AssessmentForm, site: Pick<Site, 'childcare'>): string[] {
  const per = sectionProblems(form, site);
  return assessmentSections(site).flatMap((s) => per[s.key]);
}

/* ---- assessment: a fresh week ----------------------------------------------------- */

export function blankInterview(): Interview {
  const answers: Record<string, string> = {};
  for (const q of INTERVIEW_Q) answers[q.id] = '';
  return { participantId: '', dob: '', lastName: '', workType: '', answers, notes: '' };
}

interface BlankInput {
  site: Site;
  active: Participant[];
  visits: Visit[];
  week: number;
  monitorName: string;
  today: string;
}

export function blankAssessment({ site, active, visits, week: n, monitorName, today }: BlankInput): AssessmentForm {
  const facility: Record<string, boolean> = {};
  const records: Record<string, boolean> = {};
  const ops: AssessmentForm['ops'] = {};
  const activities: AssessmentForm['activities'] = {};
  for (const i of FACILITY_ITEMS) facility[i.id] = false;
  for (const i of RECORDKEEPING_ITEMS) records[i.id] = false;
  for (const q of OPERATIONS_Q) ops[q.id] = '';
  for (const q of PROGRAM_ACTIVITY_Q) activities[q.id] = '';

  /* If a visit was already logged this week, the assessment is about it. */
  const visit = sortVisitsByDate(visitsInWeek(visits, n))[0];
  const w = week(n);
  const visitDate = visit ? visit.date : today >= w.start && today <= w.ending ? today : w.start;

  const supA = primarySupervisor(site);
  const supB = site.supervisors.find((v) => v.id !== supA?.id) ?? supA;

  const form: AssessmentForm = {
    supervisorRules: '',
    visitDate,
    worksiteType: site.worksiteType,
    supervisorName: supA?.name ?? '',
    supervisorTitle: supA?.title ?? '',
    supervisorPhone: supA?.phone ?? '',
    interviewName: supB?.name ?? '',
    interviewTitle: supB?.title ?? '',
    interviewPhone: supB?.phone ?? '',
    expectedWork: site.implementation || 'In-Person',
    assigned: active.length,
    present: active.length,
    otherProvidersNA: true,
    otherProviders: [],
    isRemote: false,
    facility,
    hazard: '',
    monitorName,

    records,
    supervisorRows: site.supervisors.map((v) => ({
      name: v.name,
      title: v.title,
      area: v.area,
      room: v.room,
      trained: v.trained ? 'Y' : '',
    })),
    allAccounted: 'yes',
    absent: [],
    scheduleDays: 'Mon - Fri',
    scheduleHours: site.schedules[0]?.mon ?? '',
    ops,

    safeEnv: '',
    safeEnvExplain: '',
    activities,
    ccNotApplicable: !site.childcare,
    ccDoc: '',
    ccDocExp: site.cc?.licenseExp ?? '',
    ccDuties: '',
    ccAgeYounger: false,
    ccAgeOlder: false,
    ccResponsibilities: site.jobs[0]?.duties ?? '',

    summary: '',
    monitorSig: '',
    supervisorSig: '',
    supervisorSigTitle: supA?.title ?? '',
    followUpNeeded: '',
    followUpDetail: '',
    directorSig: '',
    directorDate: '',

    interviewMode: 'In-Person',
    internshipExperience: 'In-Person',
    interviews: Array.from({ length: INTERVIEWS_REQUIRED }, blankInterview),
  };

  return site.assessmentDefaults ? applyCarry(site.assessmentDefaults, form) : form;
}

function sortVisitsByDate(visits: Visit[]): Visit[] {
  return [...visits].sort((a, b) => b.date.localeCompare(a.date));
}

/** Older drafts may predate a field: fill any gap from a fresh blank. */
export function normalizeForm(form: Partial<AssessmentForm>, blank: AssessmentForm): AssessmentForm {
  const out = { ...blank, ...form } as AssessmentForm;
  if (!out.interviews?.length) out.interviews = blank.interviews;
  return out;
}

/* ---- assessment: answers that do not change week to week ----------------------------
   Most of the packet describes the site, not the visit: the same supervisor,
   the same facility boxes, the same binder, the same shift hours. A monitor
   can save those once and every week not yet started opens with them filled
   in. Which side of the line a field is on is decided here, once.            */

export const ASSESSMENT_CARRY_GROUPS: { label: string; keys: (keyof AssessmentForm)[]; childcareOnly?: boolean }[] = [
  {
    label: 'Worksite Supervisor and Person Interviewed',
    keys: [
      'supervisorRules',
      'supervisorName',
      'supervisorTitle',
      'supervisorPhone',
      'interviewName',
      'interviewTitle',
      'interviewPhone',
    ],
  },
  {
    label: 'Expected work mode and other providers on site',
    keys: ['expectedWork', 'isRemote', 'otherProvidersNA', 'otherProviders'],
  },
  { label: 'Facility condition boxes', keys: ['facility'] },
  { label: 'Recordkeeping boxes', keys: ['records'] },
  { label: 'Supervisor table (name, title, area, room, trained)', keys: ['supervisorRows'] },
  { label: 'Work schedule, days and hours', keys: ['scheduleDays', 'scheduleHours'] },
  { label: 'Operations answers', keys: ['ops'] },
  { label: 'Safe environment and Program Activities answers', keys: ['safeEnv', 'activities'] },
  {
    label: 'Childcare Site Questions',
    childcareOnly: true,
    keys: ['ccNotApplicable', 'ccDoc', 'ccDocExp', 'ccDuties', 'ccAgeYounger', 'ccAgeOlder', 'ccResponsibilities'],
  },
  { label: 'Interview mode and internship experience', keys: ['interviewMode', 'internshipExperience'] },
];

export const ASSESSMENT_WEEKLY_LABELS = [
  'Date of visit',
  'Participants assigned and present, and the absence list',
  'Hazardous conditions and the safe-environment explanation',
  'Overall Report Summary and the follow-up block',
  'Both signatures',
  'The two participant interviews',
];

const CARRY_KEYS = ASSESSMENT_CARRY_GROUPS.flatMap((g) => g.keys);

export function pickCarry(form: AssessmentForm, fromWeek: number, today: string): AssessmentDefaults {
  const out: Record<string, unknown> = { savedFromWeek: fromWeek, savedOn: today };
  for (const k of CARRY_KEYS) {
    if (form[k] !== undefined) out[k] = structuredClone(form[k]);
  }
  return out as AssessmentDefaults;
}

export function applyCarry(defaults: AssessmentDefaults, form: AssessmentForm): AssessmentForm {
  const out: Record<string, unknown> = { ...form };
  for (const k of CARRY_KEYS) {
    const v = defaults[k];
    if (v !== undefined) out[k] = structuredClone(v);
  }
  return out as unknown as AssessmentForm;
}

/* ---- childcare questionnaire --------------------------------------------------------- */

export function ageBand(age: number | null): ChildcareForm['ageRange'] {
  if (!age) return '';
  return age <= 15 ? 'younger' : 'older';
}

/** The last completed questionnaire at this site. Q1, Q2 and Q5 are answered
    the same way for every youth there, so the next one starts from it. */
export function lastChildcareForm(participants: Participant[], exceptId: string): ChildcareForm | null {
  let best: ChildcareForm | null = null;
  for (const p of participants) {
    const f = p.childcareForm;
    if (!f || !f.completedAt || p.id === exceptId) continue;
    if (!best || f.date > best.date) best = f;
  }
  return best;
}

export function blankChildcareForm(input: {
  site: Site;
  participant: Participant;
  prev: ChildcareForm | null;
  monitorName: string;
  today: string;
}): ChildcareForm {
  const { site, participant, prev, monitorName, today } = input;
  const cc = site.cc;
  const duties = site.jobs[0]?.duties ?? '';
  return {
    date: today,
    ccDoc: prev ? prev.ccDoc : cc?.licenseType === 'Camp Permit' ? 'camp' : cc?.licenseNumber ? 'license' : '',
    ccDocExp: prev ? prev.ccDocExp : (cc?.licenseExp ?? ''),
    ratioConfirmed: false,
    neverAlone: false,
    dutiesOutlined: prev ? prev.dutiesOutlined : '',
    ageRange: ageBand(participant.age),
    responsibilities: prev ? prev.responsibilities : duties,
    supervisorName: prev ? prev.supervisorName : (primarySupervisor(site)?.name ?? ''),
    supervisorSig: '',
    youthSig: '',
    monitorName,
    completedAt: '',
    prefilledFrom: prev ? 'roster' : cc?.licenseNumber || duties ? 'application' : '',
  };
}

export function childcareProblems(f: ChildcareForm): string[] {
  const m: string[] = [];
  if (!f.ccDoc) m.push('Which licence or permit is on file');
  if (!f.ratioConfirmed) m.push('Confirmation that the supervisor knows the ratios');
  if (!f.neverAlone) m.push('Confirmation that participants are never left alone with children');
  if (!f.dutiesOutlined) m.push('Whether job duties were outlined to the youth, Yes or No');
  if (!f.ageRange) m.push('Age range of this participant');
  if (!f.responsibilities) m.push('Daily responsibilities of the participant');
  if (!f.supervisorSig) m.push('Supervisor signature');
  if (!f.youthSig) m.push('Participant signature');
  return m;
}

/* ---- mileage ---------------------------------------------------------------------- */

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Rounded on the way out: a column of one-decimal distances adds up to
    55.400000000000006 in floating point otherwise. */
export function mileageTotal(trips: Pick<Trip, 'total'>[]): number {
  return round1(trips.reduce((t, r) => t + (r.total ?? 0), 0));
}

export function tripTotal(start: number | null, end: number | null): number | null {
  if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return round1(end - start);
}

/* ---- the week at a glance ------------------------------------------------------------- */

export interface SiteWeekData {
  site: Site;
  participants: Participant[];
  visits: Visit[];
  timesheets: TimesheetWeek[];
  assessments: Assessment[];
}

export interface SiteWeekStatus {
  lastVisit: Visit | null;
  timesheets: TimesheetSummary;
  assessment: Assessment | null;
  findingsCount: number;
  docs: DocProgress;
  active: number;
}

export function siteWeekStatus(d: SiteWeekData, n: number, currentWeek: number): SiteWeekStatus {
  const active = activeParticipants(d.participants);
  const lastVisit = sortVisits(visitsInWeek(d.visits, n))[0] ?? null;
  const assessment = d.assessments.find((a) => a.week === n) ?? null;
  return {
    lastVisit,
    timesheets: timesheetSummary(
      d.timesheets.find((t) => t.week === n),
      active,
    ),
    assessment,
    findingsCount: assessment?.status === 'submitted' ? findings(assessment.form, d.site).length : 0,
    docs: docProgress(d.site, d.participants, currentWeek),
    active: active.length,
  };
}

/* ---- how urgent open work is ------------------------------------------------------- */

/** How a status word is colored. `todo` is plain dark text: open, nothing
    late. `warn` (amber) is due today or needs a look; `due` (red) is late;
    `done` is quiet gray; `ok` (green) is only "on site now". */
export type Tone = 'todo' | 'due' | 'warn' | 'done' | 'muted' | 'ok';

export interface StatusText {
  label: string;
  tone: Tone;
}

/** Where `today` falls against week n's deadline: the visit, the timesheets
    and the assessment are all due by the Friday the work week ends. */
export type DueState = 'early' | 'today' | 'late';

export function dueState(n: number, today: string): DueState {
  const end = week(n).end;
  return today < end ? 'early' : today === end ? 'today' : 'late';
}

/** Open work stays plain until the day it is due. */
export function openTone(due: DueState): Tone {
  return due === 'early' ? 'todo' : due === 'today' ? 'warn' : 'due';
}

/** "Due Friday, Aug 7", "Due today", "Was due Friday, Aug 7" */
export function dueText(n: number, today: string): string {
  const day = fmtDate(week(n).end, { weekday: 'long', month: 'short', day: 'numeric' });
  const due = dueState(n, today);
  return due === 'early' ? `Due ${day}` : due === 'today' ? 'Due today' : `Was due ${day}`;
}

/** The Visit column: who is on site now, the latest visit, or how late it is. */
export function visitStatus(s: SiteWeekStatus, n: number, today: string): StatusText {
  const v = s.lastVisit;
  if (v && v.date === today && !v.timeOut) return { label: 'On site now', tone: 'ok' };
  if (v) return { label: v.date === today ? 'Visited today' : `Visited ${fmtDay(v.date)}`, tone: 'done' };
  const due = dueState(n, today);
  return { label: due === 'early' ? 'Not visited' : due === 'today' ? 'Due today' : 'Overdue', tone: openTone(due) };
}

export function timesheetStatus(s: SiteWeekStatus, n: number, today: string): StatusText {
  return sheetsLabel(s.timesheets.received, s.timesheets.expected, dueState(n, today));
}

/** Shared with the tick list on the Weekly tab, which counts as you tick. */
export function sheetsLabel(received: number, expected: number, due: DueState): StatusText {
  if (!expected) return { label: 'No one active', tone: 'muted' };
  if (received >= expected) return { label: `All ${expected} collected`, tone: 'done' };
  const count = `${received} of ${expected}`;
  return {
    label: due === 'early' ? `${count} collected` : due === 'today' ? `${count}, due today` : `${count}, overdue`,
    tone: openTone(due),
  };
}

export function assessmentStatus(s: SiteWeekStatus, n: number, today: string): StatusText {
  const a = s.assessment;
  if (a?.status === 'submitted') {
    return s.findingsCount
      ? { label: `Filed, ${plural(s.findingsCount, 'finding')}`, tone: 'warn' }
      : { label: 'Filed', tone: 'done' };
  }
  const due = dueState(n, today);
  if (a) return { label: due === 'early' ? 'Draft' : due === 'today' ? 'Draft, due today' : 'Draft, overdue', tone: openTone(due) };
  return { label: due === 'early' ? 'Not started' : due === 'today' ? 'Due today' : 'Overdue', tone: openTone(due) };
}

/** One cell of the week-by-site grid */
export function weekCell(d: SiteWeekData, n: number, currentWeek: number, today: string): StatusText {
  if (n > currentWeek) return { label: '—', tone: 'muted' };
  const a = d.assessments.find((x) => x.week === n);
  const ts = timesheetSummary(
    d.timesheets.find((t) => t.week === n),
    activeParticipants(d.participants),
  );
  const sheetsIn = ts.status === 'collected' || ts.expected === 0;
  if (a?.status === 'submitted' && sheetsIn) return { label: 'Done', tone: 'done' };
  const due = dueState(n, today);
  const tone = openTone(due);
  const late = due === 'late';
  if (a?.status === 'submitted') return { label: late ? 'Sheets late' : 'Sheets out', tone };
  if (a) return { label: late ? 'Draft, late' : 'Draft', tone };
  return { label: due === 'early' ? 'Not started' : due === 'today' ? 'Due today' : 'Overdue', tone };
}

export interface WorkItem {
  task: string;
  detail: string;
  href: string;
  tone: Tone;
}

/** Names on a worklist line stop at `cap`, so a 51-person roster does not
    swamp the page. */
export function names(list: Pick<Participant, 'last' | 'first'>[], cap = 6): string {
  const shown = list.slice(0, cap).map(proster).join('; ');
  return list.length > cap ? `${shown} and ${list.length - cap} more` : shown;
}

/** Everything still open at one site for week `n`. The visit, timesheets and
    assessment stay plain until Friday; paperwork already past its due week
    is amber. */
export function worklist(d: SiteWeekData, n: number, today: string): WorkItem[] {
  const { site } = d;
  const base = `/sites/${site.id}`;
  const people = activeParticipants(d.participants);
  const w = week(n);
  const s = siteWeekStatus(d, n, n);
  const a = s.assessment;
  const weekly = openTone(dueState(n, today));
  const out: WorkItem[] = [];

  if (!s.lastVisit) {
    out.push({ task: 'Visit the site', detail: 'Check in when you arrive so the monitoring log is signed', href: base, tone: weekly });
  }
  if (s.timesheets.expected && s.timesheets.status !== 'collected') {
    out.push({
      task: 'Collect timesheets',
      detail:
        s.timesheets.status === 'partial'
          ? `${s.timesheets.received} of ${s.timesheets.expected} in for the week ending ${fmtSlash(w.ending)}`
          : `${s.timesheets.expected} signed sheet${s.timesheets.expected === 1 ? '' : 's'} for the week ending ${fmtSlash(w.ending)}`,
      href: `${base}/weeks/${n}`,
      tone: weekly,
    });
  }
  if (!a || a.status !== 'submitted') {
    const done = a ? interviewsDone(a.form) : 0;
    out.push({
      task: a ? 'Finish the assessment' : 'Do the worksite assessment',
      detail: a
        ? `Draft saved. ${INTERVIEWS_REQUIRED - done} of ${INTERVIEWS_REQUIRED} interviews still to do`
        : `Includes ${INTERVIEWS_REQUIRED} private participant interviews`,
      href: `${base}/weeks/${n}/assessment`,
      tone: weekly,
    });
  } else if (s.findingsCount) {
    const flags = findings(a.form, site);
    out.push({
      task: 'Follow up on findings',
      detail: flags.length > 1 ? `${flags[0]}, and ${flags.length - 1} more` : flags[0],
      href: `${base}/weeks/${n}/assessment/packet`,
      tone: 'warn',
    });
  }

  if (n === 3 || n === 6) {
    const key = n === 3 ? 'week3' : 'week6';
    const left = people.filter((p) => !p.docs[key]);
    if (left.length) {
      out.push({
        task: `Collect week ${n} evaluations`,
        detail: `${left.length} not back: ${names(left)}`,
        href: `${base}/participants`,
        tone: 'warn',
      });
    }
  }
  const noReferral = people.filter((p) => !p.docs.referral);
  if (noReferral.length) {
    out.push({
      task: 'Collect referral sheets',
      detail: `${noReferral.length} missing: ${names(noReferral)}`,
      href: `${base}/participants`,
      tone: 'warn',
    });
  }
  if (site.childcare) {
    const noCC = people.filter((p) => !p.docs.childcare);
    if (noCC.length) {
      out.push({
        task: 'Fill out childcare questionnaires',
        detail: `${noCC.length} to go: ${names(noCC)}`,
        href: `${base}/participants`,
        tone: 'warn',
      });
    }
  }
  if (!site.applicationOnFile) {
    out.push({
      task: 'Get the Worksite Application',
      detail: 'Nothing on file, so the assessment cannot fill itself in',
      href: `${base}/application`,
      tone: 'warn',
    });
  }
  return out;
}
