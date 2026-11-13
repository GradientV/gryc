import 'server-only';
import { Schema, deleteModel, model, models, type Model } from 'mongoose';
import { BOROUGHS, PARTICIPANT_STATUSES, VISIT_REASONS } from '@/lib/forms';

/* The database models. Every collection the app uses is defined here, in
   code; Atlas needs no schema setup. Indexes are declared on the schemas and
   created by `npm run seed` (see scripts/seed.ts). */

const str = { type: String, default: '', trim: true } as const;
const bool = (d = false) => ({ type: Boolean, default: d }) as const;
const ref = (to: string) => ({ type: Schema.Types.ObjectId, ref: to, required: true, index: true }) as const;
const opts = { timestamps: true, versionKey: false, minimize: false } as const;
const sub = { _id: false, minimize: false } as const;
const tri = { type: String, enum: ['', 'yes', 'no', 'na'], default: '' } as const;

function register<T>(name: string, schema: Schema<T>): Model<T> {
  /* In development an edit re-runs this file while the old model is still
     registered, and Mongoose would quietly drop any new field on save. Swap
     in the new schema instead of reusing the stale model. */
  if (process.env.NODE_ENV !== 'production' && models[name]) deleteModel(name);
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}

/* ---- monitors (staff accounts) ------------------------------------------- */

const MonitorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: str,
    title: str,
    role: { type: String, enum: ['monitor', 'admin'], default: 'monitor' },
  },
  opts,
);

/* ---- worksites (the DYCD Worksite Application) ---------------------------- */

const SupervisorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    title: str,
    email: str,
    phone: str,
    fax: str,
    area: str,
    room: str,
    trained: bool(true),
    siteRep: bool(),
    keyMgmt: bool(),
    signAttendance: bool(true),
  },
  { minimize: false },
);

const ScheduleSchema = new Schema(
  { name: str, sun: str, mon: str, tue: str, wed: str, thu: str, fri: str, sat: str },
  sub,
);

const JobSchema = new Schema(
  {
    category: str,
    title: str,
    duties: str,
    restrictions: str,
    assigned: { type: Number, default: null },
    must18: str,
    special: str,
  },
  sub,
);

const ChildcareAttachmentSchema = new Schema(
  {
    facilityType: str,
    startDate: str,
    endDate: str,
    childrenServed: str,
    trips: str,
    outdoor: str,
    screening: str,
    fingerprinted: str,
    licenseType: str,
    licenseNumber: str,
    licenseExp: str,
    outOfCity: str,
  },
  sub,
);

const CertificationsSchema = new Schema(
  { investigation: str, detail: str, licenseCopy: bool(), assurances: str },
  sub,
);

const SiteSchema = new Schema(
  {
    monitorId: ref('Monitor'),
    order: { type: Number, default: 0 },
    name: { type: String, required: true, trim: true },
    applicationName: str,
    dycdId: str,
    siteStatus: { type: String, default: 'Approved-Active' },
    worksiteType: str,

    address: { type: String, required: true, trim: true },
    room: str,
    borough: { type: String, enum: BOROUGHS, default: 'Queens' },
    zip: str,
    crossStreets: str,
    travel: str,
    addressNote: str,
    cityAgency: { type: String, default: 'No' },
    agency: str,
    doeBuilding: { type: String, default: 'No' },
    summerRising: { type: String, default: 'No' },
    sector: str,
    industry: str,
    cityAffiliate: str,
    implementation: { type: String, default: 'In-Person' },
    description: str,
    website: str,
    childcare: bool(),
    natureEnv: { type: String, default: 'No' },

    ftEmployees: str,
    supervisingStaff: str,
    supervisors: { type: [SupervisorSchema], default: [] },

    requested: { type: Number, default: 0 },
    ratioSup: str,
    ratioPart: str,
    fullHours: str,
    schedules: { type: [ScheduleSchema], default: [] },
    staggered: { type: String, default: 'No' },
    jobs: { type: [JobSchema], default: [] },

    cc: { type: ChildcareAttachmentSchema, default: null },
    certs: { type: CertificationsSchema, default: () => ({}) },

    /* A partial copy of an assessment form; which keys carry is decided by
       ASSESSMENT_CARRY_GROUPS in src/lib/rules.ts. */
    assessmentDefaults: { type: Schema.Types.Mixed, default: null },
    applicationOnFile: bool(true),
  },
  opts,
);
SiteSchema.index({ monitorId: 1, order: 1 });

/* ---- participants (the YEPS roster) -------------------------------------- */

const ChildcareFormSchema = new Schema(
  {
    date: str,
    ccDoc: { type: String, enum: ['', 'license', 'camp'], default: '' },
    ccDocExp: str,
    ratioConfirmed: bool(),
    neverAlone: bool(),
    dutiesOutlined: tri,
    ageRange: { type: String, enum: ['', 'younger', 'older'], default: '' },
    responsibilities: str,
    supervisorName: str,
    supervisorSig: { type: String, default: '' },
    youthSig: { type: String, default: '' },
    monitorName: str,
    completedAt: str,
    prefilledFrom: { type: String, enum: ['', 'roster', 'application'], default: '' },
  },
  sub,
);

const ParticipantSchema = new Schema(
  {
    siteId: ref('Site'),
    order: { type: Number, default: 0 },
    appId: str,
    last: { type: String, required: true, trim: true },
    first: str,
    program: { type: String, default: 'Lottery' },
    borough: { type: String, enum: BOROUGHS, default: 'Queens' },
    phone: str,
    age: { type: Number, default: null, min: 13, max: 30 },
    dob: str,
    cohort: str,
    serviceOption: str,
    status: { type: String, enum: PARTICIPANT_STATUSES, default: 'Active' },
    note: str,
    docs: {
      referral: bool(),
      week3: bool(),
      week6: bool(),
      childcare: bool(),
    },
    childcareForm: { type: ChildcareFormSchema, default: null },
  },
  opts,
);
ParticipantSchema.index({ siteId: 1, last: 1, first: 1 });

/* ---- monitoring log -------------------------------------------------------- */

const VisitSchema = new Schema(
  {
    siteId: ref('Site'),
    monitorId: ref('Monitor'),
    monitorName: str,
    date: { type: String, required: true },
    timeIn: { type: String, required: true },
    timeOut: str,
    reasons: { type: [{ type: String, enum: VISIT_REASONS.map((r) => r.id) }], default: [] },
    otherText: str,
    notes: str,
  },
  opts,
);
VisitSchema.index({ siteId: 1, date: -1 });

/* ---- weekly timesheet pickup --------------------------------------------- */

const TimesheetSchema = new Schema(
  {
    siteId: ref('Site'),
    week: { type: Number, required: true, min: 1, max: 6 },
    collectedOn: str,
    note: str,
    collected: { type: [String], default: [] },
  },
  opts,
);
TimesheetSchema.index({ siteId: 1, week: 1 }, { unique: true });

/* ---- worksite assessment report ------------------------------------------ */

const SupervisorRowSchema = new Schema(
  { name: str, title: str, area: str, room: str, trained: { type: String, enum: ['', 'Y', 'N'], default: '' } },
  sub,
);

const AbsenceSchema = new Schema(
  { participantId: str, name: str, age: { type: Number, default: null }, appId: str, reason: str, initial: str },
  sub,
);

const InterviewSchema = new Schema(
  {
    participantId: str,
    dob: str,
    lastName: str,
    workType: str,
    answers: { type: Map, of: String, default: {} },
    notes: str,
  },
  sub,
);

const AssessmentFormSchema = new Schema(
  {
    supervisorRules: { type: String, enum: ['', 'YES', 'NO'], default: '' },
    visitDate: str,
    worksiteType: str,
    supervisorName: str,
    supervisorTitle: str,
    supervisorPhone: str,
    interviewName: str,
    interviewTitle: str,
    interviewPhone: str,
    expectedWork: str,
    assigned: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    otherProvidersNA: bool(true),
    otherProviders: { type: [new Schema({ name: str, requested: str }, sub)], default: [] },
    isRemote: bool(),
    facility: { type: Map, of: Boolean, default: {} },
    hazard: str,
    monitorName: str,

    records: { type: Map, of: Boolean, default: {} },
    supervisorRows: { type: [SupervisorRowSchema], default: [] },
    allAccounted: { type: String, enum: ['yes', 'no'], default: 'yes' },
    absent: { type: [AbsenceSchema], default: [] },
    scheduleDays: str,
    scheduleHours: str,
    ops: { type: Map, of: String, default: {} },

    safeEnv: tri,
    safeEnvExplain: str,
    activities: { type: Map, of: String, default: {} },
    ccNotApplicable: bool(),
    ccDoc: { type: String, enum: ['', 'license', 'camp'], default: '' },
    ccDocExp: str,
    ccDuties: tri,
    ccAgeYounger: bool(),
    ccAgeOlder: bool(),
    ccResponsibilities: str,

    summary: str,
    /* signatures are "typed:Full Name" or a PNG data URL */
    monitorSig: { type: String, default: '' },
    supervisorSig: { type: String, default: '' },
    supervisorSigTitle: str,
    followUpNeeded: tri,
    followUpDetail: str,
    directorSig: { type: String, default: '' },
    directorDate: str,

    interviewMode: str,
    internshipExperience: str,
    interviews: { type: [InterviewSchema], default: [] },
    sectionsSeen: { type: [String], default: [] },
  },
  sub,
);

const AssessmentSchema = new Schema(
  {
    siteId: ref('Site'),
    week: { type: Number, required: true, min: 1, max: 6 },
    status: { type: String, enum: ['draft', 'submitted'], required: true },
    submittedAt: str,
    form: { type: AssessmentFormSchema, required: true },
  },
  opts,
);
AssessmentSchema.index({ siteId: 1, week: 1 }, { unique: true });

/* ---- mileage ----------------------------------------------------------------- */

const TripSchema = new Schema(
  {
    monitorId: ref('Monitor'),
    date: { type: String, required: true },
    startMileage: { type: Number, default: null },
    endMileage: { type: Number, default: null },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    total: { type: Number, default: null },
  },
  opts,
);
TripSchema.index({ monitorId: 1, date: 1 });

const LocationSchema = new Schema(
  {
    monitorId: ref('Monitor'),
    label: { type: String, required: true, trim: true },
    address: str,
    kind: { type: String, enum: ['home', 'office', 'other'], default: 'other' },
  },
  opts,
);

/* ---- notes and reminders --------------------------------------------------- */

const NoteSchema = new Schema(
  {
    monitorId: ref('Monitor'),
    subject: { type: String, default: '', trim: true, maxlength: 120 },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', default: null, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    pinned: bool(),
    done: bool(),
  },
  opts,
);

export const MonitorModel = register('Monitor', MonitorSchema);
export const SiteModel = register('Site', SiteSchema);
export const ParticipantModel = register('Participant', ParticipantSchema);
export const VisitModel = register('Visit', VisitSchema);
export const TimesheetModel = register('Timesheet', TimesheetSchema);
export const AssessmentModel = register('Assessment', AssessmentSchema);
export const TripModel = register('Trip', TripSchema);
export const LocationModel = register('Location', LocationSchema);
export const NoteModel = register('Note', NoteSchema);

export const ALL_MODELS = [
  MonitorModel,
  SiteModel,
  ParticipantModel,
  VisitModel,
  TimesheetModel,
  AssessmentModel,
  TripModel,
  LocationModel,
  NoteModel,
] as const;
