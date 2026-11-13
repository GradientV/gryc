/* The paperwork, as data. Wording follows the DYCD forms so the app and the
   paper packet say the same thing:
     site        -> DYCD "Worksite Application"
     participant -> YEPS "Worksite Assignments" roster export
     assessment  -> DYCD "SYEP/WLG Worksite Assessment Report"
     visit       -> "Monitoring Log"
     trip        -> "MILEAGE FORM SYEP 2026"                                  */

import { pad } from './format';

/* ---- worksite application vocabulary ---------------------------------- */

export const WORKSITE_TYPES = ['Nonprofit', 'Private/For-Profit', 'Public'] as const;
export const SECTORS = ['Non-Profit', 'Private/For-Profit', 'Public'] as const;
export const IMPLEMENTATION = ['In-Person', 'Remote', 'A Hybrid Model (Both)'] as const;
export const BOROUGHS = ['Queens', 'Brooklyn', 'Manhattan', 'Bronx', 'Staten Island'] as const;
export const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const PARTICIPANT_STATUSES = ['Active', 'Transferred', 'Terminated', 'Never reported'] as const;

/* ---- assessment packet, page by page ----------------------------------- */

export interface CheckItem {
  id: string;
  text: string;
  em?: string;
}

/** p.1 Facility: "check all items as it may apply" */
export const FACILITY_ITEMS: CheckItem[] = [
  { id: 'lighting', text: 'Adequate lighting' },
  { id: 'vent', text: 'Adequate ventilation' },
  { id: 'clean', text: 'Adequately clean facility' },
  { id: 'bathroom', text: 'Adequate bathroom facilities' },
  { id: 'exits', text: 'Accessible emergency exits' },
  { id: 'fire', text: 'Fire extinguishers/sprinkler system' },
];

/** p.2 Recordkeeping: "check if forms are available" */
export const RECORDKEEPING_ITEMS: CheckItem[] = [
  { id: 'enroll', text: 'Participant Enrollment Documentation', em: 'Individually' },
  { id: 'timesheet', text: 'Copy of Weekly Timesheets:', em: 'For Hard Copy ONLY' },
  { id: 'dol', text: 'DOL Permitted Working Hours for Minors Under 18 Years' },
  { id: 'drugfree', text: 'NYS Drug Free Workplace Requirements' },
  { id: 'monlog', text: 'Monitoring Log' },
  { id: 'referral', text: 'Participant Worksite Referral' },
  { id: 'ccletter', text: 'Participant Referral Letter for Childcare Sites' },
  { id: 'evalform', text: 'Participant Evaluation Form' },
  { id: 'roster', text: 'Site Assignment Roster' },
];

export interface Question {
  id: string;
  n: number;
  text: string;
}

/** p.2 Operations (Yes / No / N/A) */
export const OPERATIONS_Q: Question[] = [
  { id: 'op1', n: 1, text: 'Were you able to easily identify and locate participant supervisors?' },
  { id: 'op2', n: 2, text: 'Is there adequate supervision of participants?' },
  { id: 'op3', n: 3, text: 'Are the work activities in compliance with Child Labor Laws?' },
  { id: 'op4', n: 4, text: 'Does the worksite have adequate knowledge of time and attendance procedures?' },
];

/** p.3 Program Activities (Yes / No) */
export const PROGRAM_ACTIVITY_Q: Question[] = [
  { id: 'pa1', n: 1, text: 'In your observation, is the supervisor/participant ratio sufficient for this site?' },
  { id: 'pa2', n: 2, text: 'Were participants fully engaged in work activities?' },
  { id: 'pa3', n: 3, text: 'Are the work activities age-appropriate for youth assigned?' },
  { id: 'pa4', n: 4, text: 'During your observation, was the work activity consistent with the Worksite Application?' },
  {
    id: 'pa5',
    n: 5,
    text: 'Have participants been offered to work the maximum hours allowed according to the site schedule?',
  },
];

/** p.3 Childcare site questions */
export const CHILDCARE_RATIOS = [
  { age: 'Up to age 5', normal: '1:6' },
  { age: 'Ages 6-7', normal: '1:9' },
  { age: '8 and older', normal: '1:12' },
];
export const CHILDCARE_TRIP_RATIO = '1:5 (All Ages)';
export const CHILDCARE_NOTE =
  'SYEP/WLG participants are not allowed to be left alone with the children at any time.';
export const CHILDCARE_DOCS = [
  { id: 'license', text: 'License', em: '(SACC, DOH Center, Homebase)' },
  { id: 'camp', text: 'Camp Permit', em: '' },
] as const;

/** The same "age range of the youth" box, asked about one youth at a time on
    the per-participant questionnaire. min/max let the form pick the band off
    the roster age. */
export const CHILDCARE_AGE_RANGES = [
  { id: 'younger', text: 'Younger Youth', em: '14-15 years old', min: 0, max: 15 },
  { id: 'older', text: 'Older Youth', em: '16+ years old', min: 16, max: 99 },
] as const;

/** p.6 Participant Interviews. Q1 (DOB + last name) and Q2 (type of work)
    are free text; Q3-Q12 are two-option picks. */
export interface InterviewQuestion extends Question {
  opts: [string, string];
  pre?: string;
}

export const INTERVIEW_Q: InterviewQuestion[] = [
  { id: 'q3', n: 3, text: 'Do you find your job interesting?', opts: ['Yes', 'No'] },
  { id: 'q4', n: 4, text: 'Do you have enough tools or supplies to do your job?', opts: ['Yes', 'No'] },
  { id: 'q5', n: 5, text: 'Do you know who your supervisor is?', opts: ['Yes', 'No'] },
  { id: 'q6', n: 6, text: 'How do you complete your sign-in sheet?', opts: ['Paper', 'Online'] },
  {
    id: 'q7',
    n: 7,
    text: 'Do you sign in when you arrive and sign out when you leave?',
    pre: 'For Paper ONLY:',
    opts: ['Yes', 'No'],
  },
  { id: 'q8', n: 8, text: 'Do you receive a lunch break?', opts: ['Yes', 'No'] },
  { id: 'q9', n: 9, text: 'Did you receive your debit card?', opts: ['Yes', 'No'] },
  { id: 'q10', n: 10, text: 'Have you been able to access your money?', opts: ['Yes', 'No'] },
  { id: 'q11', n: 11, text: 'Do you feel safe while working at this site? Are there any concerns?', opts: ['Yes', 'No'] },
  { id: 'q12', n: 12, text: 'Do you have any questions, issues, or concerns?', opts: ['Yes', 'No'] },
];

/** Answers that mean "look into this" rather than "all good". */
export const INTERVIEW_FLAGS: Record<string, string> = {
  q3: 'No',
  q4: 'No',
  q5: 'No',
  q7: 'No',
  q8: 'No',
  q9: 'No',
  q10: 'No',
  q11: 'No',
  q12: 'Yes',
};

export const INTERVIEW_MODES = ['In-Person', 'Phone Interview'] as const;
export const INTERNSHIP_MODES = ['In-Person', 'Virtually', 'A Hybrid Model (Both)'] as const;
export const INTERVIEWS_REQUIRED = 2;

export const ABSENCE_REASONS = [
  'Never reported to work',
  'Terminated',
  'Transferred',
  'Not scheduled to be working',
  'Performing work activities off-site',
  'Attending educational activities',
  'Called out sick',
  'Excused — approved by GRYC',
  'Unexcused — no call',
  'Other',
] as const;

/* ---- monitoring log ------------------------------------------------------ */

export const VISIT_REASONS = [
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'timesheet', label: 'Time-Sheet Pick-Up' },
  { id: 'other', label: 'Other' },
] as const;

export type VisitReason = (typeof VISIT_REASONS)[number]['id'];

/** Quarter hours from 6:00 AM to 9:00 PM — the log is always written in
    :00 / :15 / :30 / :45, so free-typing a time is a trap. */
export const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 21 && m > 0) break;
      out.push(`${pad(h)}:${pad(m)}`);
    }
  }
  return out;
})();
