import 'server-only';
import { z } from 'zod';
import { BOROUGHS, IMPLEMENTATION, PARTICIPANT_STATUSES, SECTORS, WORKSITE_TYPES } from '@/lib/forms';

/* Input validation for every Server Action. Anything a browser sends is
   checked here before it reaches the database. */

const text = (max = 300) => z.string().trim().max(max);
const required = (max = 300) => text(max).min(1, 'Required');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a full date');
const optionalDate = z.union([date, z.literal('')]);
const time = z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time');
const tri = z.enum(['', 'yes', 'no', 'na']);
/** Map keys become MongoDB field names, so only plain ids are accepted. */
const key = z.string().regex(/^[a-z0-9]{1,20}$/i);
/** "typed:Full Name" or a PNG drawn on the signature pad */
const signature = z
  .string()
  .max(400_000, 'That signature is too large')
  .refine((v) => v === '' || /^typed:.{1,120}$/.test(v) || v.startsWith('data:image/png;base64,'), 'Not a signature');

export const SiteInfoInput = z.object({
  name: required(160),
  dycdId: text(40),
  address: required(160),
  room: text(80),
  borough: z.enum(BOROUGHS),
  zip: text(10),
  worksiteType: z.enum(WORKSITE_TYPES),
  crossStreets: text(160),
  travel: text(800),
  implementation: z.enum(IMPLEMENTATION),
  sector: z.enum(SECTORS),
  industry: text(120),
  childcare: z.boolean(),
});

export const JobInput = z.object({
  category: text(80),
  title: text(120),
  assigned: z.number().int().min(0).max(999).nullable(),
  duties: required(3000),
  restrictions: text(3000),
  special: text(1500),
});

export const SupervisorInput = z.object({
  name: required(120),
  title: text(120),
  email: z.union([z.literal(''), z.email('Check the email address')]),
  phone: text(40),
  area: text(120),
  siteRep: z.boolean(),
  keyMgmt: z.boolean(),
  signAttendance: z.boolean(),
});

export const RosterRowInput = z.object({
  appId: text(20),
  last: required(80),
  first: text(80),
  program: text(40),
  borough: z.enum(BOROUGHS),
  phone: text(30),
  age: z.number().int().min(13).max(30).nullable(),
});

export const ParticipantInput = RosterRowInput.extend({
  dob: optionalDate,
  cohort: text(80),
  status: z.enum(PARTICIPANT_STATUSES),
  note: text(500),
});

export const RegisterSiteInput = SiteInfoInput.extend({
  sector: z.enum(SECTORS),
  doeBuilding: z.enum(['Yes', 'No']),
  supervisor: z.object({
    name: text(120),
    title: text(120),
    phone: text(40),
    email: z.union([z.literal(''), z.email('Check the supervisor email')]),
  }),
  jobTitle: text(120),
  requested: z.number().int().min(0).max(999).nullable(),
  duties: text(3000),
  roster: z.array(RosterRowInput).max(250),
});

export const VisitReasons = z
  .array(z.enum(['monitoring', 'timesheet', 'other']))
  .min(1, 'Pick at least one reason for the visit');

export const CheckInInput = z.object({
  date,
  timeIn: time,
  reasons: VisitReasons,
  otherText: text(200),
});

export const CheckOutInput = z.object({ timeOut: time, notes: text(1000) });

export const ManualVisitInput = CheckInInput.extend({ timeOut: time, notes: text(1000) });

export const PickupInput = z.object({ collectedOn: optionalDate, note: text(1000) });

export const AssessmentFormInput = z.object({
  supervisorRules: z.enum(['', 'YES', 'NO']),
  visitDate: optionalDate,
  worksiteType: text(60),
  supervisorName: text(120),
  supervisorTitle: text(120),
  supervisorPhone: text(40),
  interviewName: text(120),
  interviewTitle: text(120),
  interviewPhone: text(40),
  expectedWork: text(60),
  assigned: z.number().int().min(0).max(999),
  present: z.number().int().min(0).max(999),
  otherProvidersNA: z.boolean(),
  otherProviders: z.array(z.object({ name: text(160), requested: text(20) })).max(10),
  isRemote: z.boolean(),
  facility: z.record(key, z.boolean()),
  hazard: text(2000),
  monitorName: text(120),

  records: z.record(key, z.boolean()),
  supervisorRows: z
    .array(
      z.object({
        name: text(120),
        title: text(120),
        area: text(120),
        room: text(60),
        trained: z.enum(['', 'Y', 'N']),
      }),
    )
    .max(30),
  allAccounted: z.enum(['yes', 'no']),
  absent: z
    .array(
      z.object({
        participantId: text(40),
        name: text(160),
        age: z.number().int().nullable(),
        appId: text(20),
        reason: text(80),
        initial: text(6),
      }),
    )
    .max(250),
  scheduleDays: text(80),
  scheduleHours: text(120),
  ops: z.record(key, tri),

  safeEnv: tri,
  safeEnvExplain: text(2000),
  activities: z.record(key, tri),
  ccNotApplicable: z.boolean(),
  ccDoc: z.enum(['', 'license', 'camp']),
  ccDocExp: optionalDate,
  ccDuties: tri,
  ccAgeYounger: z.boolean(),
  ccAgeOlder: z.boolean(),
  ccResponsibilities: text(3000),

  summary: text(8000),
  monitorSig: signature,
  supervisorSig: signature,
  supervisorSigTitle: text(120),
  followUpNeeded: tri,
  followUpDetail: text(2000),
  directorSig: signature,
  directorDate: optionalDate,

  interviewMode: text(40),
  internshipExperience: text(40),
  interviews: z
    .array(
      z.object({
        participantId: text(40),
        dob: optionalDate,
        lastName: text(80),
        workType: text(200),
        answers: z.record(key, z.string().max(20)),
        notes: text(2000),
      }),
    )
    .max(4),
  sectionsSeen: z.array(text(20)).max(20).optional(),
});

export const ChildcareFormInput = z.object({
  date: optionalDate,
  ccDoc: z.enum(['', 'license', 'camp']),
  ccDocExp: optionalDate,
  ratioConfirmed: z.boolean(),
  neverAlone: z.boolean(),
  dutiesOutlined: tri,
  ageRange: z.enum(['', 'younger', 'older']),
  responsibilities: text(3000),
  supervisorName: text(120),
  supervisorSig: signature,
  youthSig: signature,
  monitorName: text(120),
  completedAt: text(60),
  prefilledFrom: z.enum(['', 'roster', 'application']),
});

const miles = z.number().min(0).max(9_999_999).nullable();

export const TripInput = z.object({
  id: z.string().optional(),
  date,
  startMileage: miles,
  endMileage: miles,
  from: required(200),
  to: required(200),
  total: z.number().min(0).max(2000).nullable(),
});

export const LocationsInput = z
  .array(z.object({ id: z.string().optional(), label: text(80), address: text(200) }))
  .max(50);

const siteRef = z.union([z.literal(''), z.string().regex(/^[a-f0-9]{24}$/i, 'Not a worksite')]);

export const NoteInput = z.object({
  subject: text(120),
  siteId: siteRef,
  text: required(2000),
});

export const NotePatch = z.object({
  subject: text(120).optional(),
  siteId: siteRef.optional(),
  text: required(2000).optional(),
  done: z.boolean().optional(),
  pinned: z.boolean().optional(),
});
