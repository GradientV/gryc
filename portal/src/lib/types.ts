/* Plain, serializable shapes shared by server and client code. The Mongoose
   models in src/server/models.ts store these; the data layer maps documents
   to these types before anything reaches a component. */

import type { VisitReason } from './forms';

export type Role = 'monitor' | 'admin';

export interface Monitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  role: Role;
}

/* ---- worksite (the DYCD Worksite Application) ---------------------------- */

export interface Supervisor {
  id: string;
  /** "Last, First", as written on the application */
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

export interface Schedule {
  name: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
}

export interface Job {
  category: string;
  title: string;
  duties: string;
  restrictions: string;
  assigned: number | null;
  must18: string;
  special: string;
}

/** Attachment 1, filed by licensed childcare sites */
export interface ChildcareAttachment {
  facilityType: string;
  startDate: string;
  endDate: string;
  childrenServed: string;
  trips: string;
  outdoor: string;
  screening: string;
  fingerprinted: string;
  licenseType: string;
  licenseNumber: string;
  licenseExp: string;
  outOfCity: string;
}

export interface Certifications {
  investigation: string;
  detail: string;
  licenseCopy: boolean;
  assurances: string;
}

export interface Site {
  id: string;
  monitorId: string;
  name: string;
  applicationName: string;
  dycdId: string;
  siteStatus: string;
  worksiteType: string;

  address: string;
  room: string;
  borough: string;
  zip: string;
  crossStreets: string;
  travel: string;
  addressNote: string;
  cityAgency: string;
  agency: string;
  doeBuilding: string;
  summerRising: string;
  sector: string;
  industry: string;
  cityAffiliate: string;
  implementation: string;
  description: string;
  website: string;
  childcare: boolean;
  natureEnv: string;

  ftEmployees: string;
  supervisingStaff: string;
  supervisors: Supervisor[];

  requested: number;
  ratioSup: string;
  ratioPart: string;
  fullHours: string;
  schedules: Schedule[];
  staggered: string;
  jobs: Job[];

  cc: ChildcareAttachment | null;
  certs: Certifications;

  /** Assessment answers the monitor marked as the same every week */
  assessmentDefaults: AssessmentDefaults | null;
  applicationOnFile: boolean;
}

/* ---- participants (the YEPS roster) ------------------------------------- */

export type DocKey = 'referral' | 'week3' | 'week6' | 'childcare';
export type ParticipantStatus = 'Active' | 'Transferred' | 'Terminated' | 'Never reported';

export interface Participant {
  id: string;
  siteId: string;
  appId: string;
  last: string;
  first: string;
  program: string;
  borough: string;
  phone: string;
  age: number | null;
  dob: string;
  cohort: string;
  serviceOption: string;
  status: ParticipantStatus;
  note: string;
  docs: Record<DocKey, boolean>;
  childcareForm: ChildcareForm | null;
}

/** One participant's childcare questionnaire */
export interface ChildcareForm {
  date: string;
  ccDoc: '' | 'license' | 'camp';
  ccDocExp: string;
  ratioConfirmed: boolean;
  neverAlone: boolean;
  dutiesOutlined: Tri;
  ageRange: '' | 'younger' | 'older';
  responsibilities: string;
  supervisorName: string;
  supervisorSig: string;
  youthSig: string;
  monitorName: string;
  /** "Aug 5, 2026 at 11:30 AM" once submitted; empty on a draft */
  completedAt: string;
  /** Where a new form's answers came from: "roster" (the last one done at
      this site), "application" or "" */
  prefilledFrom: '' | 'roster' | 'application';
}

/* ---- monitoring log ------------------------------------------------------- */

export interface Visit {
  id: string;
  siteId: string;
  monitorId: string;
  monitorName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  reasons: VisitReason[];
  otherText: string;
  notes: string;
}

/* ---- weekly timesheet pickup --------------------------------------------- */

export interface TimesheetWeek {
  siteId: string;
  week: number;
  collectedOn: string;
  note: string;
  /** participant ids whose signed sheet is in hand */
  collected: string[];
}

export type TimesheetStatus = 'pending' | 'partial' | 'collected';

/* ---- worksite assessment report ------------------------------------------ */

/** "" = not answered */
export type Tri = '' | 'yes' | 'no' | 'na';

export interface SupervisorRow {
  name: string;
  title: string;
  area: string;
  room: string;
  trained: '' | 'Y' | 'N';
}

export interface Absence {
  participantId: string;
  name: string;
  age: number | null;
  appId: string;
  reason: string;
  initial: string;
}

export interface Interview {
  participantId: string;
  dob: string;
  lastName: string;
  workType: string;
  answers: Record<string, string>;
  notes: string;
}

export interface AssessmentForm {
  /* page 1 */
  supervisorRules: '' | 'YES' | 'NO';
  visitDate: string;
  worksiteType: string;
  supervisorName: string;
  supervisorTitle: string;
  supervisorPhone: string;
  interviewName: string;
  interviewTitle: string;
  interviewPhone: string;
  expectedWork: string;
  assigned: number;
  present: number;
  otherProvidersNA: boolean;
  otherProviders: { name: string; requested: string }[];
  isRemote: boolean;
  facility: Record<string, boolean>;
  hazard: string;
  monitorName: string;

  /* page 2 */
  records: Record<string, boolean>;
  supervisorRows: SupervisorRow[];
  allAccounted: 'yes' | 'no';
  absent: Absence[];
  scheduleDays: string;
  scheduleHours: string;
  ops: Record<string, Tri>;

  /* page 3 */
  safeEnv: Tri;
  safeEnvExplain: string;
  activities: Record<string, Tri>;
  ccNotApplicable: boolean;
  ccDoc: '' | 'license' | 'camp';
  ccDocExp: string;
  ccDuties: Tri;
  ccAgeYounger: boolean;
  ccAgeOlder: boolean;
  ccResponsibilities: string;

  /* page 5 */
  summary: string;
  monitorSig: string;
  supervisorSig: string;
  supervisorSigTitle: string;
  followUpNeeded: Tri;
  followUpDetail: string;
  directorSig: string;
  directorDate: string;

  /* page 6 */
  interviewMode: string;
  internshipExperience: string;
  interviews: Interview[];

  /** wizard sections the monitor has opened, so the section list can tell
      "not looked at yet" from "nothing missing" */
  sectionsSeen?: string[];
}

export type AssessmentStatus = 'draft' | 'submitted';

export interface Assessment {
  id: string;
  siteId: string;
  week: number;
  status: AssessmentStatus;
  submittedAt: string;
  updatedAt: string;
  form: AssessmentForm;
}

export type AssessmentDefaults = Partial<AssessmentForm> & { savedFromWeek: number; savedOn: string };

/* ---- mileage, notes -------------------------------------------------------- */

export interface Trip {
  id: string;
  date: string;
  startMileage: number | null;
  endMileage: number | null;
  from: string;
  to: string;
  total: number | null;
}

export interface SavedLocation {
  id: string;
  label: string;
  address: string;
  kind: 'home' | 'office' | 'other';
}

export interface Note {
  id: string;
  /** Optional one-line heading, e.g. "Glendale Bakery address correction" */
  subject: string;
  /** The worksite the note is about, if it is about one */
  siteId: string | null;
  text: string;
  pinned: boolean;
  done: boolean;
  createdAt: string;
}

/* ---- action results --------------------------------------------------------- */

export type ActionResult<T = void> =
  | ([T] extends [void] ? { ok: true; data?: undefined } : { ok: true; data: T })
  | { ok: false; error: string; problems?: string[] };
