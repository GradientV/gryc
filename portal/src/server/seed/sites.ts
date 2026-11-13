/* Demo data: the seven worksites from the SYEP 2026 Worksite Applications,
   with every person replaced by a made-up one.

   The worksites, addresses, schedules, duties and licence details are the
   real businesses' public information. Participants and supervisors are
   fictional: names are invented, phone numbers sit in the 555-0100 to
   555-0199 range set aside for fiction, emails use example.org, and
   application IDs and birthdays are generated. Only the shape of each
   roster (size, ages, boroughs, which paperwork is in) follows the real one.
   Do not put real participant data back in here. */

import type { ChildcareAttachment, Job, Schedule } from '@/lib/types';

/** [last, first, borough, age, paperwork in hand, status, note]
    paperwork: R = referral sheet, 3 = week 3 evaluation */
export type RosterRow = [string, string, string, number, string, ('Transferred' | 'Terminated')?, string?];

export interface SupervisorSeed {
  name: string;
  title: string;
  area: string;
  rep?: boolean;
  key?: boolean;
  sign?: boolean;
  fax?: boolean;
}

export interface SiteSeed {
  key: string;
  name: string;
  applicationName?: string;
  dycdId?: string;
  worksiteType: string;
  address: string;
  room?: string;
  borough: string;
  zip: string;
  addressNote?: string;
  crossStreets: string;
  travel: string;
  cityAgency: string;
  agency?: string;
  doeBuilding: string;
  summerRising: string;
  sector: string;
  industry: string;
  cityAffiliate?: string;
  implementation: string;
  description: string;
  website: string;
  childcare: boolean;
  ftEmployees: string;
  supervisingStaff: string;
  supervisors: SupervisorSeed[];
  requested: number;
  ratioSup: string;
  ratioPart: string;
  fullHours: string;
  schedules: Schedule[];
  staggered: string;
  jobs: Job[];
  cc: ChildcareAttachment | null;
  certs: { investigation: string; detail: string; licenseCopy: boolean; assurances: string };
  roster: RosterRow[];
}

const weekdays = (name: string, hours: string): Schedule => ({
  name,
  sun: '',
  mon: hours,
  tue: hours,
  wed: hours,
  thu: hours,
  fri: hours,
  sat: '',
});

const CC_DUTIES =
  'Provide assistance to group leader with children/campers. Support transitions between activities, ' +
  'distribute lunch, monitor campers while on trips, promote safe play. Assists with song, dance, physical ' +
  'activities, arts and crafts, etc.';
const CC_RESTRICT =
  'Participants assigned to these duties must be in compliance with required background screenings and state ' +
  'and local health laws applicable to individuals working in these types of facilities, and worksites are ' +
  'responsible for any fees incurred during this process. Refer to the Worksite Handbook for all guidance and ' +
  'regulations.';
const MTH_DESCRIPTION =
  'Maspeth Town Hall is now a thriving community center providing a variety of services including After School ' +
  'Programs, Summer Camp, Mommy & Me Toddler Groups, Senior Classes in Art, Chair Yoga, Tai Chi and more ' +
  'cultural and recreational activities.';
const HANDBOOK = 'Refer to the Worksite Handbook for all guidance and regulations.';
const CERTS = { investigation: 'No', detail: '', licenseCopy: false, assurances: 'Yes' };

const job = (j: Partial<Job> & Pick<Job, 'category' | 'title' | 'duties'>): Job => ({
  restrictions: HANDBOOK,
  assigned: null,
  must18: '',
  special: '',
  ...j,
});

export const SITES: SiteSeed[] = [
  {
    key: 'ps229',
    name: 'Maspeth Town Hall, Inc. @ PS 229',
    worksiteType: 'Nonprofit',
    address: '67-25 51st Rd',
    borough: 'Queens',
    zip: '11377',
    crossStreets: 'Maurice Ave & 69th Street',
    travel: 'Bus Q18, Q47, Q60\nR train to 69 St or the 7 train to 61 St in Woodside',
    cityAgency: 'No',
    doeBuilding: 'Yes',
    summerRising: 'Yes',
    sector: 'Non-Profit',
    industry: 'Summer Camp',
    implementation: 'In-Person',
    description: MTH_DESCRIPTION,
    website: 'https://www.maspethtownhall.org',
    childcare: true,
    ftEmployees: '350',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Donnelly, Kathleen', title: 'Summer Camp Director', area: 'Summer Camp', rep: true, key: true },
      { name: 'Ruiz, Marisol', title: 'Summer Camp Director', area: 'Summer Camp' },
    ],
    requested: 24,
    ratioSup: '2',
    ratioPart: '24',
    fullHours: 'N',
    schedules: [weekdays('Shift 1', '08:00 AM to 01:00 PM'), weekdays('Shift 2', '01:00 PM to 06:00 PM')],
    staggered: 'Yes',
    jobs: [
      job({
        category: 'Child Care',
        title: 'Counselor/Camp Counselor',
        duties: CC_DUTIES,
        restrictions: CC_RESTRICT,
        assigned: 12,
        special:
          'Assist with the implementation of daily plans and activities, monitor children and participant ' +
          'activities. Maintain program site equipment.',
      }),
      job({
        category: 'Child Care',
        title: 'Counselor/Camp Counselor',
        duties: CC_DUTIES,
        restrictions: CC_RESTRICT,
        assigned: 12,
        special:
          'Provide assistance to Group Leaders with children/campers, transitioning between activities, ' +
          'distributing lunch, monitoring campers while on trips, promote safe play.',
      }),
    ],
    cc: {
      facilityType: 'Other: School Age ChildCare',
      startDate: '2026-07-01',
      endDate: '2026-08-12',
      childrenServed: '535',
      trips: 'No',
      outdoor: 'No',
      screening: 'None of the Above',
      fingerprinted: 'No',
      licenseType: 'SACC License Number',
      licenseNumber: '00074148',
      licenseExp: '2026-08-12',
      outOfCity: 'No',
    },
    certs: { ...CERTS, licenseCopy: true },
    roster: [
      ['Alvarez', 'Camila', 'Queens', 19, 'R'],
      ['Kowalski', 'Ethan', 'Queens', 19, ''],
      ['Osei', 'Kwame', 'Manhattan', 18, 'R'],
      ['Tran', 'Linh', 'Queens', 16, ''],
      ['Herrera', 'Natalia', 'Queens', 18, ''],
      ['Ibrahim', 'Yasmin', 'Queens', 16, ''],
      ["O'Brien", 'Liam', 'Queens', 16, 'R'],
      ['Salazar', 'Mateo', 'Queens', 18, ''],
      ['Gupta', 'Riya', 'Queens', 17, ''],
    ],
  },

  {
    key: 'custodial229',
    name: '229 Custodial',
    applicationName: 'P.S. 229 Emanuel Kaplan',
    worksiteType: 'Public',
    address: '67-25 51st Rd',
    borough: 'Queens',
    zip: '11377',
    crossStreets: 'Maurice Ave / 69th Street',
    travel: 'Q47 and Q18',
    cityAgency: 'Yes',
    agency: 'NYCPS - Custodial/Facilities',
    doeBuilding: 'Yes',
    summerRising: 'Yes',
    sector: 'Public',
    industry: 'Educational Services',
    cityAffiliate: 'NYCPS - Custodial/Facilities',
    implementation: 'In-Person',
    description: 'Public School 229Q - elementary',
    website: '',
    childcare: false,
    ftEmployees: '150',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Nowak, Piotr', title: 'Custodian Engineer', area: 'School', rep: true, key: true },
      { name: 'Brennan, Thomas', title: 'Fireman', area: 'School' },
    ],
    requested: 3,
    ratioSup: '2',
    ratioPart: '3',
    fullHours: 'Y',
    schedules: [weekdays('Day shift', '08:00 AM to 01:00 PM')],
    staggered: 'No',
    jobs: [
      job({
        category: 'Maintenance',
        title: 'Janitor Assistant/Custodian',
        duties:
          'Assist with mopping, sweeping, cleaning dust, and garbage removal. Use of mild cleaning astringents ' +
          'with supervision.',
        restrictions:
          'SYEP participants may not operate motor vehicles and should not be tasked with lifting more than 50 ' +
          'lbs. Participants over the age of 18 must receive proper training before handling hazardous equipment ' +
          'and must be supervised at all times. Participants under the age of 18 may not utilize equipment ' +
          'declared hazardous. Participants under the age of 18 are also prohibited from utilizing power-driven ' +
          'saws and woodworking machines, manufacturing equipment, and/or hazardous chemicals.\n\n' +
          HANDBOOK,
        assigned: 3,
        special: 'Must be willing to assist with summer cleaning/organizing classrooms.',
      }),
    ],
    cc: null,
    certs: CERTS,
    roster: [['Novak', 'Daniel', 'Queens', 17, 'R']],
  },

  {
    key: 'walgreens',
    name: 'Walgreens At 80th Street',
    applicationName: 'Walgreens 09869',
    dycdId: '09869',
    worksiteType: 'Private/For-Profit',
    address: '80-11 Eliot Ave',
    borough: 'Queens',
    zip: '11379',
    crossStreets: '80 St & 81 St',
    travel: 'Q38 bus to the Queens Center Mall subway station',
    cityAgency: 'No',
    doeBuilding: 'No',
    summerRising: 'No',
    sector: 'Private/For-Profit',
    industry: 'Retail',
    implementation: 'In-Person',
    description: 'Drug store chain',
    website: '',
    childcare: false,
    ftEmployees: '28',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Papadakis, Nick', title: 'Store manager', area: 'Sales floor', rep: true, key: true, fax: true },
      { name: 'Thompson, Andre', title: 'Emerging store manager', area: 'Sales floor', key: true, fax: true },
    ],
    requested: 7,
    ratioSup: '2',
    ratioPart: '7',
    fullHours: 'Y',
    schedules: [
      {
        name: 'Customer service associate',
        sun: '08:00 AM to 05:00 PM',
        mon: '07:00 AM to 09:00 PM',
        tue: '07:00 AM to 09:00 PM',
        wed: '07:00 AM to 09:00 PM',
        thu: '07:00 AM to 09:00 PM',
        fri: '07:00 AM to 09:00 PM',
        sat: '07:00 AM to 07:00 PM',
      },
    ],
    staggered: 'Yes',
    jobs: [
      job({
        category: 'Other',
        title: 'Customer service associate',
        duties:
          'Assist customers with opening and closing locked merchandise, helping customers find what they need, ' +
          'checking for outdated merchandise, rotating merchandise (first in, first out), facing items to the ' +
          'correct pricing sticker, packing out warehouse merchandise on the shelves, printing pictures from the ' +
          'digital photo lab, assisting with digital orders and curbside pickups, cleaning, sweeping and mopping.',
        assigned: 7,
        special: 'Must speak fluent English, must like to interact with people',
      }),
    ],
    cc: null,
    certs: CERTS,
    roster: [
      ['Vargas', 'Isaiah', 'Queens', 19, 'R'],
      ['Chen', 'Kevin', 'Queens', 16, ''],
      ['Mendoza', 'Valeria', 'Queens', 16, ''],
      ['Petrov', 'Nikolai', 'Queens', 17, '', 'Transferred', 'Crossed off the roster.'],
      ['Shah', 'Aarav', 'Queens', 18, 'R'],
      ['Delgado', 'Sofia', 'Queens', 16, 'R'],
    ],
  },

  {
    key: 'is73',
    name: 'Maspeth Town Hall, Inc. @ IS 73',
    worksiteType: 'Nonprofit',
    address: '70-02 54th Ave',
    borough: 'Queens',
    zip: '11378',
    crossStreets: '79th Street & 66th Avenue',
    travel: 'Q47, Q54, Q58\nM train to Middle Village–Metropolitan Ave',
    cityAgency: 'No',
    doeBuilding: 'Yes',
    summerRising: 'Yes',
    sector: 'Non-Profit',
    industry: 'Summer Camp',
    implementation: 'In-Person',
    description: MTH_DESCRIPTION,
    website: 'https://www.maspethtownhall.org',
    childcare: true,
    ftEmployees: '350',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Ionescu, Mihai', title: 'Summer Camp Director', area: 'Summer Camp', rep: true, key: true },
      { name: 'Ferraro, Dominic', title: 'Summer Camp Director', area: 'Summer Camp', key: true },
    ],
    requested: 24,
    ratioSup: '2',
    ratioPart: '24',
    fullHours: 'Y',
    schedules: [weekdays('Shift 1', '08:00 AM to 01:00 PM'), weekdays('Shift 2', '01:00 PM to 06:00 PM')],
    staggered: 'Yes',
    jobs: [
      job({
        category: 'Child Care',
        title: 'Counselor/Camp Counselor',
        duties: CC_DUTIES,
        restrictions: CC_RESTRICT,
        assigned: 12,
        special:
          'Assist with the implementation of daily plans and activities, monitor children and participant ' +
          'activities. Maintain program site equipment. Escort the children on field trips.',
      }),
      job({
        category: 'Child Care',
        title: 'Counselor/Camp Counselor',
        duties: CC_DUTIES,
        restrictions: CC_RESTRICT,
        assigned: 12,
        special:
          'Provide assistance to Group Leaders with children/campers, transitioning between activities, ' +
          'distributing lunch, monitoring campers while on trips, promote safe play.',
      }),
    ],
    cc: {
      facilityType: 'Other: School Age ChildCare',
      startDate: '2026-07-01',
      endDate: '2026-08-14',
      childrenServed: '231',
      trips: 'No',
      outdoor: 'No',
      screening: 'None of the Above',
      fingerprinted: 'No',
      licenseType: 'SACC License Number',
      licenseNumber: '00230447',
      licenseExp: '2027-09-14',
      outOfCity: 'No',
    },
    certs: { ...CERTS, licenseCopy: true },
    roster: [
      ['Quintero', 'Ashley', 'Queens', 19, '3'],
      ['Marino', 'Gabriella', 'Queens', 18, '3'],
      ['Espinoza', 'Daniela', 'Queens', 20, 'R3'],
      ['Jackson', 'Imani', 'Brooklyn', 18, 'R'],
      ['Castillo', 'Adrian', 'Queens', 21, 'R'],
      ['Ortega', 'Christopher', 'Queens', 19, 'R3'],
      ['Romano', 'Vincent', 'Queens', 18, 'R', 'Transferred', 'Last name crossed out on the roster.'],
      ['Hodzic', 'Amina', 'Queens', 19, 'R'],
      ['Fitzgerald', 'Megan', 'Queens', 17, 'R3'],
    ],
  },

  {
    key: 'ps106',
    name: 'GRYC @ PS 106',
    worksiteType: 'Nonprofit',
    address: '242 Cooper St',
    borough: 'Brooklyn',
    zip: '11207',
    crossStreets: 'Cooper Street between Wilson and Knickerbocker',
    travel: 'PS 384\n\nSubway: L train (Wilson Av).\nBuses: B20, B26, B60',
    cityAgency: 'No',
    doeBuilding: 'Yes',
    summerRising: 'Yes',
    sector: 'Non-Profit',
    industry: 'Summer Camp',
    implementation: 'In-Person',
    description:
      'The mission of the Greater Ridgewood Youth Council is to improve the quality of life for youths and ' +
      'families in the borough of Queens through service.',
    website: 'https://www.greaterridgewoodyouthcouncil.org',
    /* The application answers ChildCare: No, but it is a Summer Rising camp
       and every job on it is a Child Care job, so it is treated as one: the
       assessment asks the Childcare Site Questions and every participant owes
       a childcare questionnaire. It filed no Attachment 1. */
    childcare: true,
    ftEmployees: '33',
    supervisingStaff: '5',
    supervisors: [
      { name: 'Velasquez, Monica', title: 'Director', area: 'Camp', rep: true, key: true },
      { name: 'Ortiz, Carmen', title: 'Assistant Director/Site Supervisor', area: 'Camp' },
      { name: 'Ramirez, Brianna', title: 'Instructor', area: 'Camp' },
      { name: 'Phillips, Jordan', title: 'Instructor', area: 'Camp' },
      { name: 'Hayes, Connor', title: 'Program Aide', area: 'Camp' },
    ],
    requested: 60,
    ratioSup: '5',
    ratioPart: '60',
    fullHours: 'Y',
    schedules: [
      weekdays('Schedule 1', '08:00 AM to 01:00 PM'),
      weekdays('Schedule 2', '12:00 PM to 05:00 PM'),
      weekdays('Schedule 3', '01:00 PM to 06:00 PM'),
    ],
    staggered: 'Yes',
    jobs: [
      job({
        category: 'Child Care',
        title: 'Counselor/Camp Counselor',
        duties: CC_DUTIES,
        restrictions: CC_RESTRICT,
        assigned: 60,
        special: '18+ must be fingerprinted in PETS.',
      }),
    ],
    cc: null,
    certs: CERTS,
    roster: [
      ['Acosta', 'Darnell', 'Brooklyn', 19, ''],
      ['Bautista', 'Melany', 'Brooklyn', 16, ''],
      ['Clarke', 'Aaliyah', 'Brooklyn', 17, ''],
      ['Fernandez', 'Genesis', 'Brooklyn', 17, 'R'],
      ['Williams', 'Shania', 'Queens', 19, ''],
      ['Joseph', 'Keyana', 'Brooklyn', 19, ''],
      ['Diallo', 'Mariama', 'Queens', 17, 'R'],
      ['Abreu Santana', 'Yanelis', 'Brooklyn', 17, 'R'],
      ['Calderon', 'Jayden', 'Brooklyn', 16, 'R'],
      ['Wong', 'Brandon', 'Queens', 17, ''],
      ['Rivas', 'Melody', 'Brooklyn', 17, ''],
      ['Soto', 'Jazmin', 'Brooklyn', 17, ''],
      ['Pierre', 'Kayla', 'Queens', 17, 'R', undefined, 'Marked "sick" on the roster.'],
      ['Gordon', 'Nyla', 'Brooklyn', 19, ''],
      ['Baptiste', 'Marcus', 'Brooklyn', 22, 'R'],
      ['Khan', 'Ayesha', 'Brooklyn', 17, 'R'],
      ['Valdez', 'Yaritza', 'Brooklyn', 17, ''],
      ['Rosales', 'Julian', 'Brooklyn', 18, 'R'],
      ['Peralta', 'Stephanie', 'Brooklyn', 18, 'R'],
      ['Rahman', 'Tahmid', 'Brooklyn', 18, ''],
      ['Mitchell', 'Jalen', 'Queens', 18, 'R'],
      ['Haddad', 'Leila', 'Brooklyn', 19, ''],
      ['Mansour', 'Nour', 'Staten Island', 17, ''],
      ['Lozano Mejia', 'Karina', 'Brooklyn', 16, 'R'],
      ['Grant', 'Kiara', 'Brooklyn', 17, 'R'],
      ['Morillo', 'Alexa', 'Brooklyn', 17, 'R'],
      ['Edwards', 'Nevaeh', 'Brooklyn', 17, ''],
      ['Wallace', 'Malik', 'Brooklyn', 17, 'R', 'Terminated', 'Marked "stopped coming" on the roster.'],
      ['Mejia Rosario', 'Junior', 'Queens', 17, ''],
      ['Young', 'Jamal', 'Brooklyn', 18, 'R'],
      ['Baker-Williams', 'Zuri', 'Brooklyn', 19, ''],
      ['Lambert', 'Dashawn', 'Brooklyn', 17, ''],
      ['Matos', 'Elijah', 'Brooklyn', 16, ''],
      ['Cordero', 'Leilani', 'Brooklyn', 18, ''],
      ['Hughes', 'Ava', 'Brooklyn', 16, ''],
      ['Ng', 'Noah', 'Brooklyn', 16, ''],
      ['Santiago', 'Alondra', 'Queens', 17, ''],
      ['Charles', 'Naomi', 'Brooklyn', 19, 'R'],
      ['Rosado', 'Luis', 'Brooklyn', 16, ''],
      ['Campbell', 'Shanice', 'Brooklyn', 18, ''],
      ['Batista', 'Yarelis', 'Brooklyn', 16, 'R'],
      ['Moreno', 'Isabella', 'Brooklyn', 18, 'R'],
      ['Torres', 'Aiden', 'Brooklyn', 18, 'R'],
      ['Cabrera', 'Lucas', 'Brooklyn', 16, ''],
      ['Persaud', 'Anjali', 'Brooklyn', 16, ''],
      ['Lucero', 'Andrea', 'Staten Island', 17, 'R'],
      ['Ventura', 'Paola', 'Staten Island', 20, ''],
      ['Suarez', 'Dylan', 'Brooklyn', 18, 'R', undefined, 'Marked "sick" on the roster.'],
      ['Augustin', 'Mackenson', 'Brooklyn', 18, 'R'],
      ['Henry', 'Tiana', 'Queens', 16, 'R'],
      ['Walcott', 'Jaheim', 'Brooklyn', 17, 'R'],
      ['Okafor', 'Chidinma', 'Brooklyn', 19, 'R'],
    ],
  },

  {
    key: 'mimicoco',
    name: 'Mimi & Coco Bakery and Bagel Shop',
    worksiteType: 'Private/For-Profit',
    address: '71-02 Grand Avenue',
    room: 'Ground Floor',
    borough: 'Queens',
    zip: '11378',
    crossStreets: 'Grand Avenue and 71st Street',
    travel: 'Q58, Q59, and R, M trains to Grand Avenue.',
    cityAgency: 'No',
    doeBuilding: 'No',
    summerRising: 'No',
    sector: 'Private/For-Profit',
    industry: 'Retail',
    implementation: 'In-Person',
    description:
      'Mimi & Coco Bakery & Bagels: fresh daily baked goods, original recipes, breakfast, lunch and dinner, ' +
      'bagels, sweet bread, catering and free local delivery.',
    website: 'https://www.mimiandcocobagels.com/',
    childcare: false,
    ftEmployees: '4',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Russo, Antonio', title: 'Owner', area: 'Front of house', rep: true, key: true },
      { name: 'Medrano, Lucia', title: 'Co-owner', area: 'Front of house', key: true, sign: false },
    ],
    requested: 2,
    ratioSup: '2',
    ratioPart: '2',
    fullHours: 'Y',
    schedules: [weekdays('Youth 1', '09:00 AM to 02:00 PM'), weekdays('Youth 2', '01:00 PM to 06:00 PM')],
    staggered: 'Yes',
    jobs: [
      job({
        category: 'Business/Office',
        title: 'Customer Service Representative',
        duties:
          'Provide sales assistance to help build sales. Social and willing to provide advice with regard to ' +
          'purchases.',
        assigned: 1,
        special: 'Willing to learn how to assist customers when purchasing baked goods and handling goods.',
      }),
      job({
        category: 'Business/Office',
        title: 'Cashier',
        duties: 'Maintain cash register and help customers pack purchases. (Must be 18 years old and up.)',
        assigned: 1,
        must18: 'Yes',
        special: 'Assist with cash register transactions, supervised by the manager.',
      }),
    ],
    cc: null,
    certs: CERTS,
    roster: [
      ['Zielinski', 'Kacper', 'Queens', 18, ''],
      ['Nguyen', 'Hannah', 'Queens', 17, ''],
    ],
  },

  {
    key: 'glendale',
    name: 'Mimi and Coco Pastry and Cakes LLC / dba Glendale Bakery',
    worksiteType: 'Private/For-Profit',
    address: '69-25 Grand Ave',
    room: 'Ground Floor',
    borough: 'Queens',
    zip: '11378',
    addressNote: 'The application lists 65-50 Grand Ave. 69-25 Grand Ave is the real address.',
    crossStreets: 'Grand Avenue and 71st Street',
    travel: 'Q58, Q59, and R and M trains to Grand Avenue-Newtown',
    cityAgency: 'No',
    doeBuilding: 'No',
    summerRising: 'No',
    sector: 'Private/For-Profit',
    industry: 'Retail',
    implementation: 'In-Person',
    description:
      'Glendale Bakery makes fresh-baked goods like pies, cakes, cookies, sandwiches, and other dessert products.',
    website: '',
    childcare: false,
    ftEmployees: '4',
    supervisingStaff: '2',
    supervisors: [
      { name: 'Campos, Ernesto', title: 'Owner', area: 'Front of house', rep: true, key: true },
      { name: 'Aquino, Rafael', title: 'Supervisor', area: 'Front of house', sign: false },
    ],
    requested: 2,
    ratioSup: '2',
    ratioPart: '2',
    fullHours: 'Y',
    schedules: [weekdays('Youth 1', '09:00 AM to 02:00 PM'), weekdays('Youth 2', '01:00 PM to 06:00 PM')],
    staggered: 'No',
    jobs: [
      job({
        category: 'Business/Office',
        title: 'Cashier',
        duties: 'Maintain cash register and help customers pack purchases. (Must be 18 years old and up.)',
        assigned: 1,
        must18: 'Yes',
        special: 'Assist with cash register transactions.',
      }),
      job({
        category: 'Business/Office',
        title: 'Customer Service Representative',
        duties:
          'Provide sales assistance to help build sales. Social and willing to provide advice with regard to ' +
          'purchases.',
        assigned: 1,
        special: 'Will assist customers in handling their orders and greeting them.',
      }),
    ],
    cc: null,
    certs: CERTS,
    roster: [
      ['Wojcik', 'Jakub', 'Queens', 16, 'R'],
      ['Guaman', 'Fernanda', 'Queens', 18, 'R'],
    ],
  },
];
