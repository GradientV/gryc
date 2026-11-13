import 'server-only';
import { Types } from 'mongoose';
import { addDays, firstLast, initials, pad, proster } from '@/lib/format';
import {
  FACILITY_ITEMS,
  INTERVIEW_Q,
  INTERVIEWS_REQUIRED,
  OPERATIONS_Q,
  PROGRAM_ACTIVITY_Q,
  RECORDKEEPING_ITEMS,
  type VisitReason,
} from '@/lib/forms';
import { PROGRAM, week } from '@/lib/program';
import { assessmentSections } from '@/lib/rules';
import type { AssessmentForm, Interview, ParticipantStatus } from '@/lib/types';
import {
  ALL_MODELS,
  AssessmentModel,
  LocationModel,
  MonitorModel,
  NoteModel,
  ParticipantModel,
  SiteModel,
  TimesheetModel,
  TripModel,
  VisitModel,
} from '../models';
import { SITES, type SiteSeed } from './sites';

export const DEMO_MONITOR_EMAIL = 'ashtonreyes@gryc.org';
const MONITOR_NAME = 'Ashton Reyes';

/* Seeded random numbers, so every reset produces the same IDs and birthdays. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AREA_CODES = ['347', '718', '917', '929', '646'];
const VISIT_TIMES: [string, string][] = [
  ['11:45', '12:00'],
  ['08:30', '08:45'],
  ['13:00', '13:15'],
  ['11:00', '11:15'],
  ['12:15', '12:30'],
  ['10:00', '10:15'],
];

const SUMMARIES = [
  'Site is running smoothly. Supervisor was easy to locate and the participants could all describe their ' +
    'assigned duties. Timesheets were signed and up to date.',
  'Participants engaged and on task during the visit. Reviewed sign-in procedure with the supervisor again; ' +
    'hard copies are being kept in the binder as required.',
  'Good week. Supervisor reports attendance has been consistent. Week 3 evaluations completed and collected ' +
    'during this visit.',
  'No issues observed. Work activity matches what is listed on the Worksite Application. Participants are ' +
    'being offered their full scheduled hours.',
];

interface SeededParticipant {
  _id: Types.ObjectId;
  siteId: Types.ObjectId;
  order: number;
  appId: string;
  last: string;
  first: string;
  program: string;
  borough: string;
  phone: string;
  age: number;
  dob: string;
  cohort: string;
  serviceOption: string;
  status: ParticipantStatus;
  note: string;
  docs: { referral: boolean; week3: boolean; week6: boolean; childcare: boolean };
  childcareForm: null;
}

interface SeededSupervisor {
  _id: Types.ObjectId;
  name: string;
  title: string;
  email: string;
  phone: string;
  fax: string;
  area: string;
  room: string;
  trained: boolean;
  siteRep: boolean;
  keyMgmt: boolean;
  signAttendance: boolean;
}

/** Wipes the database and loads the demo: seven worksites, weeks 1-4 filed,
    week 5 under way, a summer of mileage and two reminders. */
export async function seedDatabase(): Promise<void> {
  await Promise.all(ALL_MODELS.map((m) => m.deleteMany({})));
  await Promise.all(ALL_MODELS.map((m) => m.syncIndexes()));

  const rand = mulberry32(20260706);
  let phoneSeq = 101;
  const phone = () => {
    const n = phoneSeq++;
    return `${AREA_CODES[n % AREA_CODES.length]}-555-${pad(Math.floor(n / 100))}${pad(n % 100)}`;
  };
  const usedIds = new Set<string>();
  const appId = () => {
    let id = '';
    do id = String(2000000 + Math.floor(rand() * 7999999));
    while (usedIds.has(id));
    usedIds.add(id);
    return id;
  };
  /* A birthday that makes them `age` on the first day of the program. */
  const dob = (age: number) => {
    const m = 1 + Math.floor(rand() * 12);
    const d = 1 + Math.floor(rand() * 28);
    const hadBirthday = m < 7 || (m === 7 && d <= 6);
    return `${2026 - age - (hadBirthday ? 0 : 1)}-${pad(m)}-${pad(d)}`;
  };

  /* ---- staff ---- */
  const [monitor] = await MonitorModel.insertMany([
    { name: MONITOR_NAME, email: DEMO_MONITOR_EMAIL, phone: '718-555-0100', title: 'SYEP Site Monitor', role: 'monitor' },
    { name: 'Alicia Rivera', email: 'arivera@gryc.org', phone: '929-555-0100', title: 'SYEP Site Monitor', role: 'monitor' },
    { name: 'Program Office', email: 'office@gryc.org', phone: '646-555-0100', title: 'SYEP Program Office', role: 'admin' },
  ]);
  const monitorId = monitor._id;

  /* ---- worksites and rosters ---- */
  const sites: { seed: SiteSeed; id: Types.ObjectId; supervisors: SeededSupervisor[] }[] = [];
  const allParticipants: SeededParticipant[][] = [];

  for (const s of SITES) {
    const id = new Types.ObjectId();
    const participants: SeededParticipant[] = s.roster.map(([last, first, borough, age, paper, status, note], i) => ({
      _id: new Types.ObjectId(),
      siteId: id,
      order: i,
      appId: appId(),
      last,
      first,
      program: 'Lottery',
      borough,
      phone: phone(),
      age,
      dob: dob(age),
      cohort: PROGRAM.cohort,
      serviceOption: PROGRAM.serviceOption,
      status: status ?? 'Active',
      note: note ?? '',
      docs: {
        referral: paper.includes('R'),
        week3: paper.includes('3'),
        week6: false,
        /* Sites that filed Attachment 1 collected the questionnaires at intake,
           on paper. PS 106 was identified as a childcare site mid-program, so
           its questionnaires are still owed. */
        childcare: s.childcare && !!s.cc,
      },
      childcareForm: null,
    }));
    sites.push({ seed: s, id, supervisors: [] });
    allParticipants.push(participants);
  }

  /* Supervisors get their phone numbers after the rosters, so participant
     numbers come first in the 555-01xx range. */
  for (const entry of sites) {
    entry.supervisors = entry.seed.supervisors.map((v) => {
      const [last, first] = v.name.split(',').map((x) => x.trim());
      return {
        _id: new Types.ObjectId(),
        name: v.name,
        title: v.title,
        email: `${first[0]}${last}`.toLowerCase().replace(/[^a-z]/g, '') + '@example.org',
        phone: phone(),
        fax: '',
        area: v.area,
        room: '',
        trained: true,
        siteRep: !!v.rep,
        keyMgmt: !!v.key,
        signAttendance: v.sign !== false,
      };
    });
  }
  const storeFax = phone();
  for (const entry of sites) {
    entry.seed.supervisors.forEach((v, i) => {
      if (v.fax) entry.supervisors[i].fax = storeFax;
    });
  }

  await SiteModel.insertMany(
    sites.map(({ seed: s, id, supervisors }, order) => ({
      _id: id,
      monitorId,
      order,
      name: s.name,
      applicationName: s.applicationName ?? '',
      dycdId: s.dycdId ?? '',
      worksiteType: s.worksiteType,
      address: s.address,
      room: s.room ?? '',
      borough: s.borough,
      zip: s.zip,
      crossStreets: s.crossStreets,
      travel: s.travel,
      addressNote: s.addressNote ?? '',
      cityAgency: s.cityAgency,
      agency: s.agency ?? '',
      doeBuilding: s.doeBuilding,
      summerRising: s.summerRising,
      sector: s.sector,
      industry: s.industry,
      cityAffiliate: s.cityAffiliate ?? '',
      implementation: s.implementation,
      description: s.description,
      website: s.website,
      childcare: s.childcare,
      natureEnv: 'No',
      ftEmployees: s.ftEmployees,
      supervisingStaff: s.supervisingStaff,
      supervisors,
      requested: s.requested,
      ratioSup: s.ratioSup,
      ratioPart: s.ratioPart,
      fullHours: s.fullHours,
      schedules: s.schedules,
      staggered: s.staggered,
      jobs: s.jobs,
      cc: s.cc,
      certs: s.certs,
      assessmentDefaults: null,
      applicationOnFile: true,
    })),
  );
  await ParticipantModel.insertMany(allParticipants.flat());

  /* ---- weeks 1-4: visited, timesheets in, assessments filed ---- */
  const visits: Record<string, unknown>[] = [];
  const timesheets: Record<string, unknown>[] = [];
  const assessments: Record<string, unknown>[] = [];

  sites.forEach((entry, si) => {
    const people = allParticipants[si];
    const active = people.filter((p) => p.status === 'Active');
    const [timeIn, timeOut] = VISIT_TIMES[si % VISIT_TIMES.length];

    for (const wn of [1, 2, 3, 4]) {
      const visitDate = addDays(week(wn).start, si % 5);
      const reasons: VisitReason[] = wn % 2 === 0 ? ['monitoring', 'timesheet'] : ['timesheet'];
      visits.push({
        siteId: entry.id,
        monitorId,
        monitorName: MONITOR_NAME,
        date: visitDate,
        timeIn,
        timeOut,
        reasons,
        otherText: '',
        notes: '',
      });
      timesheets.push({
        siteId: entry.id,
        week: wn,
        collectedOn: visitDate,
        note: '',
        collected: active.map((p) => p._id.toHexString()),
      });
      assessments.push({
        siteId: entry.id,
        week: wn,
        status: 'submitted',
        submittedAt: visitDate,
        form: sampleAssessment(entry.seed, entry.supervisors, people, wn, visitDate),
      });
    }
  });

  /* Week 5: IS 73 already handed over all but one of this week's sheets. */
  const is73 = sites.findIndex((s) => s.seed.key === 'is73');
  if (is73 >= 0) {
    const active = allParticipants[is73].filter((p) => p.status === 'Active');
    timesheets.push({
      siteId: sites[is73].id,
      week: 5,
      collectedOn: '2026-08-03',
      note: 'Dropped at the front desk Monday. One still outstanding.',
      collected: active.slice(0, -1).map((p) => p._id.toHexString()),
    });
    visits.push({
      siteId: sites[is73].id,
      monitorId,
      monitorName: MONITOR_NAME,
      date: '2026-08-03',
      timeIn: '12:45',
      timeOut: '13:00',
      reasons: ['other'],
      otherText: 'Timesheet drop off',
      notes: '',
    });
  }

  await VisitModel.insertMany(visits);
  await TimesheetModel.insertMany(timesheets);
  await AssessmentModel.insertMany(assessments);

  /* ---- mileage: one driving day a week, out from home, site to site, and
     back to the office with the timesheets. The odometer runs straight
     through, so each Start Mileage is the End Mileage above it. ---- */
  await LocationModel.insertMany([
    { monitorId, label: 'Home', address: '', kind: 'home' },
    { monitorId, label: PROGRAM.office.label, address: PROGRAM.office.address, kind: 'office' },
  ]);

  const HOME = 'Home';
  const OFFICE = PROGRAM.office.address;
  const PS229 = '67-25 51st Rd';
  const WALGREENS = '80-11 Eliot Ave';
  const IS73 = '70-02 54th Ave';
  const PS106 = '242 Cooper St';
  const BAGEL = '71-02 Grand Avenue';
  const GLENDALE = '69-25 Grand Ave';
  const trips: [string, string, string, number][] = [
    ['2026-07-07', HOME, PS229, 2.1],
    ['2026-07-07', PS229, WALGREENS, 2.4],
    ['2026-07-07', WALGREENS, OFFICE, 1.9],
    ['2026-07-14', HOME, BAGEL, 2.6],
    ['2026-07-14', BAGEL, GLENDALE, 0.4],
    ['2026-07-14', GLENDALE, PS229, 2.2],
    ['2026-07-14', PS229, OFFICE, 1.6],
    ['2026-07-21', HOME, PS106, 5.2],
    ['2026-07-21', PS106, IS73, 4.1],
    ['2026-07-21', IS73, OFFICE, 2.3],
    ['2026-07-28', HOME, PS229, 2.1],
    ['2026-07-28', PS229, WALGREENS, 2.4],
    ['2026-07-28', WALGREENS, BAGEL, 1.5],
    ['2026-07-28', BAGEL, OFFICE, 1.4],
    ['2026-08-03', HOME, PS106, 5.2],
    ['2026-08-03', PS106, IS73, 4.1],
    ['2026-08-03', IS73, OFFICE, 2.3],
  ];
  let odometer = 41940;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  await TripModel.insertMany(
    trips.map(([date, from, to, miles]) => {
      const start = odometer;
      odometer = round1(odometer + miles);
      return { monitorId, date, startMileage: start, endMileage: odometer, from, to, total: miles };
    }),
  );

  /* ---- reminders ---- */
  const glendale = sites.find((s) => s.seed.key === 'glendale');
  const notes = await NoteModel.insertMany([
    {
      monitorId,
      subject: 'Glendale Bakery address correction',
      siteId: glendale?.id ?? null,
      text:
        'The application still shows 65-50 Grand Ave. The real address is 69-25 Grand Ave. ' +
        'Ask the office to correct it in YEPS.',
      pinned: true,
    },
    {
      monitorId,
      subject: 'Two names crossed off the rosters',
      text:
        'Romano (IS 73) and Petrov (Walgreens) are crossed off the printed rosters. Confirm with the office ' +
        'whether they transferred or were terminated.',
    },
  ]);
  const stamps = ['2026-08-03T13:15:00Z', '2026-08-03T13:20:00Z'];
  await Promise.all(
    notes.map((n, i) => NoteModel.collection.updateOne({ _id: n._id }, { $set: { createdAt: new Date(stamps[i]) } })),
  );
}

/* A filed assessment for weeks 1-4, with a few real findings sprinkled in so
   the follow-up path has something to show. */
function sampleAssessment(
  site: SiteSeed,
  supervisors: SeededSupervisor[],
  people: SeededParticipant[],
  wn: number,
  date: string,
): AssessmentForm {
  const active = people.filter((p) => p.status === 'Active');
  const facility: Record<string, boolean> = {};
  const records: Record<string, boolean> = {};
  const ops: AssessmentForm['ops'] = {};
  const activities: AssessmentForm['activities'] = {};
  for (const i of FACILITY_ITEMS) facility[i.id] = true;
  for (const i of RECORDKEEPING_ITEMS) records[i.id] = true;
  if (!site.childcare) records.ccletter = false;
  for (const q of OPERATIONS_Q) ops[q.id] = 'yes';
  for (const q of PROGRAM_ACTIVITY_Q) activities[q.id] = 'yes';

  let hazard = '';
  let extra = '';
  if (site.key === 'walgreens' && wn === 2) {
    facility.exits = false;
    hazard = 'Stock cart blocking the rear emergency exit. Cleared with the manager before leaving.';
  }
  if (site.key === 'ps229' && wn === 3) {
    activities.pa1 = 'no';
    extra =
      ' The supervisor ratio was short during the visit; the director is adding a group leader to the ' +
      'afternoon shift.';
  }

  const supA = supervisors.find((v) => v.siteRep) ?? supervisors[0];
  const supB = supervisors.find((v) => v !== supA) ?? supA;

  const absent: AssessmentForm['absent'] = [];
  if (wn === 3 && site.key === 'ps106' && people[4]) {
    const p = people[4];
    absent.push({
      participantId: p._id.toHexString(),
      name: proster(p),
      age: p.age,
      appId: p.appId,
      reason: 'Called out sick',
      initial: initials(firstLast(supA.name)),
    });
  }

  const interviews: Interview[] = [];
  for (let i = 0; i < INTERVIEWS_REQUIRED; i++) {
    const p = active[(wn + i) % active.length];
    const answers: Record<string, string> = {};
    for (const q of INTERVIEW_Q) answers[q.id] = q.id === 'q6' ? 'Paper' : q.id === 'q12' ? 'No' : 'Yes';
    if (i === 0 && wn === 4) answers.q10 = 'No';
    interviews.push({
      participantId: p._id.toHexString(),
      dob: p.dob,
      lastName: p.last,
      workType: (site.jobs[0]?.title ?? '').replace(/^Other:\s*/, ''),
      answers,
      notes: i === 0 && wn === 4 ? 'Debit card arrived but the PIN letter has not. Told them to call the hotline.' : '',
    });
  }

  return {
    supervisorRules: 'YES',
    visitDate: date,
    worksiteType: site.worksiteType,
    supervisorName: supA.name,
    supervisorTitle: supA.title,
    supervisorPhone: supA.phone,
    interviewName: supB.name,
    interviewTitle: supB.title,
    interviewPhone: supB.phone,
    expectedWork: site.implementation,
    assigned: active.length,
    present: active.length - absent.length,
    otherProvidersNA: true,
    otherProviders: [],
    isRemote: false,
    facility,
    hazard,
    monitorName: MONITOR_NAME,

    records,
    supervisorRows: supervisors.map((v) => ({ name: v.name, title: v.title, area: v.area, room: v.room, trained: 'Y' })),
    allAccounted: absent.length ? 'no' : 'yes',
    absent,
    scheduleDays: 'Mon - Fri',
    scheduleHours: site.schedules[0]?.mon ?? '',
    ops,

    safeEnv: 'yes',
    safeEnvExplain: '',
    activities,
    ccNotApplicable: !site.childcare,
    ccDoc: site.childcare ? (site.cc ? 'license' : 'camp') : '',
    ccDocExp: site.cc?.licenseExp ?? '',
    ccDuties: site.childcare ? 'yes' : '',
    ccAgeYounger: false,
    ccAgeOlder: site.childcare,
    ccResponsibilities: site.childcare ? (site.jobs[0]?.duties ?? '') : '',

    summary: SUMMARIES[(wn - 1) % SUMMARIES.length] + extra + (hazard ? ` ${hazard}` : ''),
    monitorSig: `typed:${MONITOR_NAME}`,
    supervisorSig: `typed:${firstLast(supA.name)}`,
    supervisorSigTitle: supA.title,
    followUpNeeded: hazard ? 'yes' : 'no',
    followUpDetail: hazard ? 'Verify the exit stays clear at the next visit.' : '',
    directorSig: '',
    directorDate: '',

    interviewMode: 'In-Person',
    internshipExperience: 'In-Person',
    interviews,
    sectionsSeen: assessmentSections(site).map((s) => s.key),
  };
}
